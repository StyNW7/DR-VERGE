import { siteConfig } from "@/config/siteConfig";
import { getGrade } from "@/data/drGrades";

/**
 * DR-VERGE inference client.
 *
 * ============================ THE RULE ============================
 * A mock result must NEVER be presentable as a real one. Every result carries
 * `isMock`, and the UI is required to surface it. Mock mode exists so the demo
 * page can be exercised before the model is deployed — not so the site can look
 * finished. `source` is intentionally part of the result rather than component
 * state, because component state can drift out of sync with the data it labels.
 * ==================================================================
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface InferenceRequest {
  maculaFile: File;
  opticDiscFile: File;
}

export interface ModelInfo {
  name: string;
  version: string | null;
  variant: string | null;
  quantization: string | null;
}

export interface InferenceResult {
  /** True when this came from the local mock generator, not a real model. */
  isMock: boolean;
  source: "model-api" | "mock";
  grade: number;
  gradeName: string;
  /** Four cumulative ordinal threshold scores, P(Y>0..3). May be empty. */
  ordinalScores: number[];
  /** Five relative per-grade scores. May be empty if the API omits them. */
  gradeScores: number[];
  uncalibratedScore: number | null;
  model: ModelInfo;
  latencyMs: number | null;
  /** Round-trip time measured by the browser, always available. */
  clientElapsedMs: number;
  disclaimer: string | null;
  receivedAt: string;
}

export type InferenceErrorKind =
  | "network"
  | "timeout"
  | "server"
  | "malformed"
  | "not-configured"
  | "unknown";

/** Carries a message already safe to show a user — never a stack trace. */
export class InferenceError extends Error {
  kind: InferenceErrorKind;
  detail?: string;

  constructor(kind: InferenceErrorKind, message: string, detail?: string) {
    super(message);
    this.name = "InferenceError";
    this.kind = kind;
    this.detail = detail;
  }
}

/* -------------------------------------------------------------------------- */
/* Response normalisation                                                      */
/* -------------------------------------------------------------------------- */

const NUM_GRADES = 5;

function toFiniteNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

/** Coerces to a numeric array, dropping anything non-finite. */
function toScoreArray(v: unknown, expectedLength?: number): number[] {
  if (!Array.isArray(v)) return [];
  const out = v.map(toFiniteNumber).filter((n): n is number => n !== null);
  if (expectedLength !== undefined && out.length !== expectedLength) {
    // A wrong-length vector is more likely a contract mismatch than a partial
    // result, so it is dropped rather than rendered as a misaligned chart.
    return out.length === 0 ? [] : out;
  }
  return out;
}

function toTrimmedString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

/**
 * Turns whatever the API returned into an InferenceResult, tolerating missing
 * optional fields. Only `prediction.grade` is genuinely required — without a
 * grade there is no result to show.
 */
export function normalizeResponse(
  raw: unknown,
  clientElapsedMs: number,
  source: "model-api" | "mock",
): InferenceResult {
  if (typeof raw !== "object" || raw === null) {
    throw new InferenceError(
      "malformed",
      "The DR-VERGE service returned a response we could not read.",
    );
  }

  const body = raw as Record<string, unknown>;

  if (body.success === false) {
    const msg =
      toTrimmedString(body.error) ??
      toTrimmedString(body.message) ??
      "The DR-VERGE service reported that inference did not succeed.";
    throw new InferenceError("server", msg);
  }

  const prediction = (body.prediction ?? {}) as Record<string, unknown>;
  const grade = toFiniteNumber(prediction.grade);

  if (grade === null || grade < 0 || grade > NUM_GRADES - 1) {
    throw new InferenceError(
      "malformed",
      "The DR-VERGE service returned a result without a valid grade.",
    );
  }

  const roundedGrade = Math.round(grade);
  const known = getGrade(roundedGrade);
  const modelRaw = (body.model ?? {}) as Record<string, unknown>;
  const runtimeRaw = (body.runtime ?? {}) as Record<string, unknown>;

  return {
    isMock: source === "mock",
    source,
    grade: roundedGrade,
    gradeName:
      toTrimmedString(prediction.grade_name) ?? known?.name ?? `Grade ${roundedGrade}`,
    ordinalScores: toScoreArray(body.ordinal_scores, NUM_GRADES - 1),
    gradeScores: toScoreArray(body.grade_scores, NUM_GRADES),
    uncalibratedScore: toFiniteNumber(body.uncalibrated_score),
    model: {
      name: toTrimmedString(modelRaw.name) ?? "DR-VERGE",
      version: toTrimmedString(modelRaw.version),
      variant: toTrimmedString(modelRaw.variant),
      quantization: toTrimmedString(modelRaw.quantization),
    },
    latencyMs: toFiniteNumber(runtimeRaw.latency_ms),
    clientElapsedMs,
    disclaimer: toTrimmedString(body.disclaimer),
    receivedAt: new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/* Mock generator                                                              */
/* -------------------------------------------------------------------------- */

/** Deterministic 32-bit hash, so the same pair yields the same mock result. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Builds a structurally valid mock response.
 *
 * "Structurally valid" is the point: the ordinal vector is monotone
 * non-increasing and the grade is the count of thresholds above 0.5, exactly as
 * a real CORAL head behaves. That way the demo UI is exercised against the
 * shape of real output. The numbers themselves mean nothing whatsoever, and the
 * interface says so on every screen where they appear.
 */
function buildMockResponse(req: InferenceRequest): unknown {
  const seed = hashString(
    `${req.maculaFile.name}:${req.maculaFile.size}:${req.opticDiscFile.name}:${req.opticDiscFile.size}`,
  );

  // A base severity in [0,1] derived from the seed.
  const severity = ((seed % 1000) / 1000) * 0.95 + 0.02;

  // Monotone non-increasing cumulative scores, as CORAL guarantees.
  const ordinal: number[] = [];
  let current = Math.min(0.98, 0.35 + severity * 0.62);
  for (let k = 0; k < NUM_GRADES - 1; k += 1) {
    ordinal.push(Number(current.toFixed(4)));
    const decay = 0.18 + ((seed >> (k * 3)) % 40) / 100;
    current = Math.max(0.01, current - decay);
  }

  const grade = ordinal.filter((p) => p > 0.5).length;

  // Per-grade scores as differences of consecutive cumulative scores, which is
  // how a CORAL head's grade scores actually relate to its thresholds.
  const padded = [1, ...ordinal, 0];
  const gradeScores: number[] = [];
  for (let g = 0; g < NUM_GRADES; g += 1) {
    gradeScores.push(Math.max(0.001, padded[g] - padded[g + 1]));
  }
  const total = gradeScores.reduce((a, b) => a + b, 0);
  const normalized = gradeScores.map((v) => Number((v / total).toFixed(4)));

  return {
    success: true,
    prediction: { grade, grade_name: getGrade(grade)?.name ?? `Grade ${grade}` },
    ordinal_scores: ordinal,
    grade_scores: normalized,
    uncalibrated_score: normalized[grade],
    model: {
      name: "DR-VERGE",
      version: "1.0-mock",
      variant: "FT-PTQ INT8 (simulated)",
      quantization: "INT8",
    },
    runtime: { latency_ms: 6.22 },
    disclaimer:
      "Simulated output. No DR-VERGE model was executed; these numbers are generated locally for interface demonstration only.",
  };
}

/* -------------------------------------------------------------------------- */
/* Public entry point                                                          */
/* -------------------------------------------------------------------------- */

const MOCK_DELAY_MS = 2100;

/**
 * Runs DR-VERGE inference on a dual-view pair.
 *
 * Uploaded files are sent and then forgotten — nothing is cached, persisted, or
 * re-sent, and no copy is retained after the request resolves.
 */
export async function runDRVergeInference(
  req: InferenceRequest,
  options: { signal?: AbortSignal } = {},
): Promise<InferenceResult> {
  const startedAt = performance.now();

  /* ---- mock path ---- */
  if (siteConfig.useMockModel) {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(resolve, MOCK_DELAY_MS);
      options.signal?.addEventListener("abort", () => {
        window.clearTimeout(timer);
        reject(new InferenceError("unknown", "Analysis was cancelled."));
      });
    });
    return normalizeResponse(
      buildMockResponse(req),
      performance.now() - startedAt,
      "mock",
    );
  }

  /* ---- real path ---- */
  if (!siteConfig.modelApiUrl) {
    throw new InferenceError(
      "not-configured",
      "The DR-VERGE inference endpoint has not been configured for this deployment.",
    );
  }

  const form = new FormData();
  form.append("macula", req.maculaFile);
  form.append("optic_disc", req.opticDiscFile);
  form.append("return_scores", "true");

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    siteConfig.requestTimeoutMs,
  );
  // Let a caller-supplied signal also cancel the request.
  options.signal?.addEventListener("abort", () => controller.abort());

  let response: Response;
  try {
    response = await fetch(siteConfig.modelApiUrl, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    window.clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      throw new InferenceError(
        "timeout",
        `The DR-VERGE service did not respond within ${Math.round(
          siteConfig.requestTimeoutMs / 1000,
        )} seconds. It may be starting up — please try again in a moment.`,
      );
    }
    throw new InferenceError(
      "network",
      "We couldn't reach the DR-VERGE inference service. Please check your connection and try again in a moment.",
      err instanceof Error ? err.message : undefined,
    );
  }
  window.clearTimeout(timeoutId);

  if (!response.ok) {
    const message =
      response.status >= 500
        ? "The DR-VERGE inference service is currently unavailable. Please try again shortly."
        : response.status === 413
          ? "The uploaded images were rejected as too large by the inference service."
          : response.status === 429
            ? "Too many requests have been sent to the DR-VERGE service. Please wait a moment and try again."
            : "The DR-VERGE service could not process this request.";
    throw new InferenceError("server", message, `HTTP ${response.status}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new InferenceError(
      "malformed",
      "The DR-VERGE service returned a response we could not read.",
    );
  }

  return normalizeResponse(payload, performance.now() - startedAt, "model-api");
}

/** Whether the demo is currently running against simulated output. */
export function isMockMode(): boolean {
  return siteConfig.useMockModel;
}
