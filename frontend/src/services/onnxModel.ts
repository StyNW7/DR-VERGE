import * as ort from "onnxruntime-web/wasm";
import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";

/**
 * In-browser DR-VERGE inference.
 *
 * ========================== WHY THIS EXISTS ==========================
 * The demo runs the real exported network on the visitor's own device. No image
 * ever leaves the browser, which is both the strongest privacy story available
 * and the honest one: there is no server that could retain an upload.
 *
 * ====================== WHAT MUST NOT DRIFT ==========================
 * Preprocessing here has to match training EXACTLY or the grade is silently
 * wrong — no exception, no warning, just a different number. The four values
 * that matter (input size, mean, std, decision threshold) are therefore READ
 * FROM `metadata.json` written by the notebook, never hardcoded, so swapping in
 * a different export cannot leave the frontend quietly out of sync.
 *
 * Two properties of the training transform are easy to get wrong and are called
 * out at their call sites below:
 *   1. the resize does NOT preserve aspect ratio (`A.Resize(384, 384)`);
 *   2. the grade is the COUNT of thresholds passed, never an argmax.
 * =====================================================================
 */

/* -------------------------------------------------------------------------- */
/* Runtime configuration                                                       */
/* -------------------------------------------------------------------------- */

// Point ORT at the wasm binary Vite emits, rather than a CDN. A demo that needs
// a third-party host to boot is a demo that can fail while it is being judged.
ort.env.wasm.wasmPaths = { wasm: wasmUrl };
// Single-threaded: cross-origin isolation (COOP/COEP) is not available on most
// static hosts, and without it multi-threaded wasm silently fails to start.
ort.env.wasm.numThreads = 1;
ort.env.logLevel = "error";

const NUM_GRADES = 5;
const NUM_THRESHOLDS = NUM_GRADES - 1;

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

export interface ModelMetadata {
  modelName: string;
  inputSize: number;
  mean: readonly [number, number, number];
  std: readonly [number, number, number];
  decisionThreshold: number;
  onnxMaxAbsDiff: number | null;
  torchVersion: string | null;
}

interface RawMetadata {
  model_name?: unknown;
  input_size?: unknown;
  normalization_mean?: unknown;
  normalization_std?: unknown;
  decision_threshold?: unknown;
  torch_version?: unknown;
  artifacts?: { onnx_max_abs_diff?: unknown };
}

export class ModelLoadError extends Error {
  detail?: string;
  constructor(message: string, detail?: string) {
    super(message);
    this.name = "ModelLoadError";
    this.detail = detail;
  }
}

function triple(v: unknown, field: string): [number, number, number] {
  if (!Array.isArray(v) || v.length !== 3 || !v.every((n) => typeof n === "number" && Number.isFinite(n))) {
    throw new ModelLoadError(
      "The bundled model metadata is incomplete, so the demo cannot run safely.",
      `metadata.${field} must be three finite numbers`,
    );
  }
  return [v[0], v[1], v[2]];
}

function parseMetadata(raw: RawMetadata): ModelMetadata {
  const size = Array.isArray(raw.input_size) ? raw.input_size[0] : undefined;
  if (typeof size !== "number" || !Number.isInteger(size) || size < 32 || size > 2048) {
    throw new ModelLoadError(
      "The bundled model metadata is incomplete, so the demo cannot run safely.",
      "metadata.input_size is missing or out of range",
    );
  }
  const threshold = raw.decision_threshold;
  if (typeof threshold !== "number" || !(threshold > 0 && threshold < 1)) {
    throw new ModelLoadError(
      "The bundled model metadata is incomplete, so the demo cannot run safely.",
      "metadata.decision_threshold must be strictly between 0 and 1",
    );
  }
  return {
    modelName: typeof raw.model_name === "string" ? raw.model_name : "best_student_fp32",
    inputSize: size,
    mean: triple(raw.normalization_mean, "normalization_mean"),
    std: triple(raw.normalization_std, "normalization_std"),
    decisionThreshold: threshold,
    onnxMaxAbsDiff:
      typeof raw.artifacts?.onnx_max_abs_diff === "number" ? raw.artifacts.onnx_max_abs_diff : null,
    torchVersion: typeof raw.torch_version === "string" ? raw.torch_version : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Session                                                                     */
/* -------------------------------------------------------------------------- */

interface LoadedModel {
  session: ort.InferenceSession;
  meta: ModelMetadata;
}

let loadPromise: Promise<LoadedModel> | null = null;

async function fetchOrThrow(url: string, what: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new ModelLoadError(
      "The DR-VERGE model could not be downloaded. Please check your connection and reload.",
      `${what}: ${err instanceof Error ? err.message : "network error"}`,
    );
  }
  if (!res.ok) {
    // A missing weights file is the one failure mode worth naming precisely: the
    // ONNX graph is tiny and loads fine on its own, so without this the demo
    // would fail deep inside the runtime with an unreadable error.
    throw new ModelLoadError(
      res.status === 404
        ? "A DR-VERGE model file is missing from this deployment, so the demo cannot run."
        : "The DR-VERGE model could not be downloaded.",
      `${what}: HTTP ${res.status} at ${url}`,
    );
  }
  return res;
}

async function load(baseUrl: string): Promise<LoadedModel> {
  const base = baseUrl.replace(/\/+$/, "");

  const metaRes = await fetchOrThrow(`${base}/metadata.json`, "metadata.json");
  let meta: ModelMetadata;
  try {
    meta = parseMetadata((await metaRes.json()) as RawMetadata);
  } catch (err) {
    if (err instanceof ModelLoadError) throw err;
    throw new ModelLoadError(
      "The bundled model metadata could not be read, so the demo cannot run safely.",
      err instanceof Error ? err.message : undefined,
    );
  }

  // torch.onnx.export wrote the weights to a sidecar file; `model.onnx` holds
  // only the graph. Both must be present.
  const [modelBuf, dataBuf] = await Promise.all([
    fetchOrThrow(`${base}/model.onnx`, "model.onnx").then((r) => r.arrayBuffer()),
    fetchOrThrow(`${base}/model.onnx.data`, "model.onnx.data (model weights)").then((r) =>
      r.arrayBuffer(),
    ),
  ]);

  let session: ort.InferenceSession;
  try {
    session = await ort.InferenceSession.create(new Uint8Array(modelBuf), {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
      externalData: [{ path: "model.onnx.data", data: new Uint8Array(dataBuf) }],
    });
  } catch (err) {
    throw new ModelLoadError(
      "The DR-VERGE model could not be initialised in this browser.",
      err instanceof Error ? err.message : undefined,
    );
  }

  for (const name of ["macula", "disc"]) {
    if (!session.inputNames.includes(name)) {
      throw new ModelLoadError(
        "The bundled model does not expose the expected dual-view inputs.",
        `expected input "${name}", found [${session.inputNames.join(", ")}]`,
      );
    }
  }

  return { session, meta };
}

/** Loads once and reuses. Concurrent callers share the same in-flight promise. */
export function loadModel(baseUrl: string): Promise<LoadedModel> {
  if (!loadPromise) {
    loadPromise = load(baseUrl).catch((err) => {
      loadPromise = null; // let a later attempt retry rather than cache the failure
      throw err;
    });
  }
  return loadPromise;
}

/** True once the weights are resident, so the UI can say "ready" honestly. */
export function isModelLoaded(): boolean {
  return loadPromise !== null;
}

/* -------------------------------------------------------------------------- */
/* Preprocessing                                                               */
/* -------------------------------------------------------------------------- */

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to the <img> path */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image could not be decoded"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Produces the NCHW float tensor the network expects.
 *
 * The resize deliberately does NOT preserve aspect ratio: training used
 * `A.Resize(384, 384)`, which squashes a non-square photograph to a square.
 * "Fixing" that here by letterboxing would put the model out of distribution.
 */
async function toTensor(file: Blob, meta: ModelMetadata): Promise<ort.Tensor> {
  const size = meta.inputSize;
  const source = await decode(file);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new ModelLoadError("This browser does not support the canvas APIs the demo needs.");
  ctx.drawImage(source, 0, 0, size, size);
  if ("close" in source && typeof source.close === "function") source.close();

  const { data } = ctx.getImageData(0, 0, size, size);
  const pixels = size * size;
  const out = new Float32Array(3 * pixels);
  const [mR, mG, mB] = meta.mean;
  const [sR, sG, sB] = meta.std;

  for (let i = 0; i < pixels; i += 1) {
    const p = i * 4;
    out[i] = (data[p] / 255 - mR) / sR;
    out[pixels + i] = (data[p + 1] / 255 - mG) / sG;
    out[2 * pixels + i] = (data[p + 2] / 255 - mB) / sB;
  }
  return new ort.Tensor("float32", out, [1, 3, size, size]);
}

/* -------------------------------------------------------------------------- */
/* Inference                                                                   */
/* -------------------------------------------------------------------------- */

export interface LocalPrediction {
  grade: number;
  ordinalScores: number[];
  gradeScores: number[];
  uncalibratedScore: number;
  latencyMs: number;
  modelName: string;
  onnxMaxAbsDiff: number | null;
}

/**
 * Runs one dual-view pair.
 *
 * `macula` and `disc` are not interchangeable. `Gate2a_CORAL` recorded that
 * fusion is view-order sensitive, so feeding the pair the wrong way round
 * produces a wrong grade with no error at all.
 */
export async function runLocalInference(
  baseUrl: string,
  maculaFile: Blob,
  discFile: Blob,
): Promise<LocalPrediction> {
  const { session, meta } = await loadModel(baseUrl);
  const [macula, disc] = await Promise.all([toTensor(maculaFile, meta), toTensor(discFile, meta)]);

  const startedAt = performance.now();
  const output = await session.run({ macula, disc });
  const latencyMs = performance.now() - startedAt;

  const tensor = output.p_cumulative ?? output[session.outputNames[0]];
  if (!tensor) {
    throw new ModelLoadError("The model returned no output.", "missing p_cumulative");
  }

  const cumulative = Array.from(tensor.data as Float32Array).slice(0, NUM_THRESHOLDS);
  if (cumulative.length !== NUM_THRESHOLDS || !cumulative.every(Number.isFinite)) {
    throw new ModelLoadError(
      "The model returned an unreadable result.",
      `expected ${NUM_THRESHOLDS} finite cumulative scores, got ${cumulative.length}`,
    );
  }

  // CORAL: the grade is how many ordinal thresholds were passed. An argmax over
  // these values would be a different — and wrong — model.
  const grade = cumulative.filter((p) => p > meta.decisionThreshold).length;

  // Per-grade scores are successive differences of the cumulative vector, which
  // mirrors `predict_dr()` in the notebook.
  const padded = [1, ...cumulative, 0];
  const diffs = Array.from({ length: NUM_GRADES }, (_, g) => Math.max(padded[g] - padded[g + 1], 0));
  const total = diffs.reduce((a, b) => a + b, 0);
  const gradeScores = diffs.map((v) => v / Math.max(total, 1e-9));

  return {
    grade,
    ordinalScores: cumulative,
    gradeScores,
    uncalibratedScore: gradeScores[grade],
    latencyMs,
    modelName: meta.modelName,
    onnxMaxAbsDiff: meta.onnxMaxAbsDiff,
  };
}
