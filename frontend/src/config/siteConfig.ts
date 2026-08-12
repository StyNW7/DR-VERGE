/**
 * Every externally-configurable value lives here.
 *
 * Nothing in this file may be a secret. Vite inlines every `VITE_*` variable
 * into the browser bundle at build time, so anything placed here is public the
 * moment the site is deployed. The inference endpoint must therefore be a public
 * endpoint protected on the server side (rate limiting / gateway), never one
 * guarded by a key shipped to the client.
 */

const env = import.meta.env;

/** Reads an env var, falling back when it is absent or an empty string. */
function readEnv(value: string | undefined, fallback = ""): string {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : fallback;
}

/** Env vars arrive as strings; "false"/"0"/"" are all false. */
function readBool(value: string | undefined, fallback: boolean): boolean {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "") return fallback;
  return v === "true" || v === "1" || v === "yes";
}

const modelApiUrl = readEnv(env.VITE_MODEL_API_URL);

/**
 * In-browser model.
 *
 * When enabled, the exported ONNX network runs on the visitor's own device and
 * no image is transmitted anywhere. This is the preferred path: it is the only
 * configuration in which the privacy claim on the demo page is literally true.
 */
const localModelUrl = readEnv(env.VITE_LOCAL_MODEL_URL, "/models/best_student_fp32");
const useLocalModel = readBool(env.VITE_USE_LOCAL_MODEL, true);

/**
 * Mock mode.
 *
 * Defaults to ON only when there is no real inference path at all — otherwise
 * the demo page would be a dead end for every visitor. An explicit
 * `VITE_USE_MOCK_MODEL` always wins over that inference.
 *
 * Whenever this is true the UI must say so, prominently and every time. A
 * fabricated result presented as a real one would be the single worst thing this
 * site could do, so `isMock` is carried on the result object itself rather than
 * being tracked separately in component state where it could drift.
 */
const useMockModel = readBool(
  env.VITE_USE_MOCK_MODEL,
  modelApiUrl === "" && !useLocalModel,
);

export const siteConfig = {
  projectName: "DR-VERGE",
  fullName: "View-Evidence Relational Grading Engine",
  tagline: "Seeing More. Grading Smarter.",
  description:
    "DR-VERGE is a lightweight dual-view AI research framework for ordinal diabetic retinopathy grading using Complementarity-Shift Distillation and INT8 quantization.",
  competition: "GEMASTIK XIX",
  category: "Karya Tulis Ilmiah TIK",
  institution: readEnv(env.VITE_INSTITUTION, "BINUS University"),
  year: 2026,

  // External links, all overridable per deployment.
  sampleDatasetUrl: readEnv(env.VITE_SAMPLE_DATASET_URL),
  paperUrl: readEnv(env.VITE_PAPER_URL),
  githubUrl: readEnv(env.VITE_GITHUB_URL),
  modelApiUrl,

  // Inference behaviour.
  useLocalModel,
  localModelUrl,
  useMockModel,

  /**
   * The demo runs `best_student_fp32` (seed 3407). The paper's deployment model
   * is `qat_int8` (seed 42) — the same method (dual_csd), a different artifact
   * and a different seed. INT8 exports cannot be run in a browser at all, since
   * `torch.export` does not support eager-mode quantized modules. The UI states
   * this rather than letting a visitor assume the paper's numbers came from the
   * model they just ran.
   */
  localModelVariant: "FP32 (seed 3407)",
  paperDeploymentVariant: "QAT INT8 (seed 42)",
  requestTimeoutMs: Number(readEnv(env.VITE_REQUEST_TIMEOUT_MS, "45000")),
  maxUploadBytes: 12 * 1024 * 1024, // 12 MB per image
  acceptedMimeTypes: ["image/jpeg", "image/jpg", "image/png"] as const,
  acceptedExtensions: [".jpg", ".jpeg", ".png"] as const,
} as const;

/** True when a link was never configured, so the UI can disable it honestly. */
export function isLinkConfigured(url: string): boolean {
  return typeof url === "string" && url.trim().length > 0;
}

export type SiteConfig = typeof siteConfig;
