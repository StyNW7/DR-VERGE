/**
 * Contract tests for the inference client.
 *
 * The build proves the code compiles. These prove it behaves — specifically that
 * a malformed or partial API response degrades gracefully instead of crashing
 * the demo page, and that mock results are always flagged as mock.
 *
 * Run with:  node scripts/verify-inference.mjs
 * (Imports the built ES module output so no extra toolchain is needed.)
 */
import { build } from "vite";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";
import os from "node:os";

// Minimal browser globals. The client uses window timers and AbortSignal; Node
// has neither `window` nor a DOM, so the few members it touches are stubbed
// rather than pulling in a full jsdom for four functions.
globalThis.window = {
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (id) => clearInterval(id),
};

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "drverge-verify-"));

// Bundle just the module under test, with the browser globals it touches stubbed.
await build({
  root,
  logLevel: "error",
  resolve: { alias: { "@": path.resolve(root, "src") } },
  define: {
    "import.meta.env.VITE_MODEL_API_URL": '""',
    "import.meta.env.VITE_USE_MOCK_MODEL": '"true"',
    "import.meta.env.VITE_SAMPLE_DATASET_URL": '""',
    "import.meta.env.VITE_PAPER_URL": '""',
    "import.meta.env.VITE_GITHUB_URL": '""',
    "import.meta.env.VITE_INSTITUTION": '""',
    "import.meta.env.VITE_REQUEST_TIMEOUT_MS": '""',
  },
  // publicDir off: this build only needs the module, not the site's assets.
  publicDir: false,
  build: {
    outDir,
    emptyOutDir: true,
    lib: {
      entry: path.resolve(root, "src/services/inferenceApi.ts"),
      formats: ["es"],
      fileName: "inference",
    },
    // Override the site's manualChunks — vendor splitting in lib mode just
    // produces empty sibling chunks that confuse the output lookup below.
    rollupOptions: { external: [], output: { manualChunks: undefined } },
  },
});

// Vite picks the extension (.js/.mjs) from the package type, so match on the
// entry name rather than assuming one.
const built = fs
  .readdirSync(outDir)
  .find((f) => f.startsWith("inference") && /\.(m?js)$/.test(f));
if (!built) {
  throw new Error(`no inference bundle in ${outDir} (found: ${fs.readdirSync(outDir).join(", ")})`);
}
const mod = await import(pathToFileURL(path.join(outDir, built)).href);
const { normalizeResponse, runDRVergeInference, InferenceError, isMockMode } = mod;

let pass = 0;
const failures = [];
function check(name, fn) {
  try {
    fn();
    pass += 1;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures.push(`${name} — ${err.message}`);
    console.log(`  FAIL  ${name} — ${err.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg ?? "assertion failed");
}
function throws(fn, kind) {
  try {
    fn();
  } catch (err) {
    assert(err instanceof InferenceError, `expected InferenceError, got ${err?.name}`);
    if (kind) assert(err.kind === kind, `expected kind "${kind}", got "${err.kind}"`);
    assert(
      typeof err.message === "string" && err.message.length > 12,
      "error message must be human readable",
    );
    // A user-facing message must never leak internals.
    assert(!/undefined|\[object|at .*\.ts:/i.test(err.message), "message leaks internals");
    return;
  }
  throw new Error("expected a throw, but none occurred");
}

const FULL = {
  success: true,
  prediction: { grade: 2, grade_name: "Moderate NPDR" },
  ordinal_scores: [0.91, 0.76, 0.32, 0.08],
  grade_scores: [0.09, 0.15, 0.44, 0.24, 0.08],
  uncalibrated_score: 0.44,
  model: { name: "DR-VERGE", version: "1.0", variant: "FT-PTQ INT8", quantization: "INT8" },
  runtime: { latency_ms: 6.22 },
  disclaimer: "Research prototype; not a standalone clinical diagnosis.",
};

console.log("=".repeat(76));
console.log("DR-VERGE inference contract");
console.log("=".repeat(76));

/* ---------------------------------------------------- the documented contract */
check("parses the documented response shape", () => {
  const r = normalizeResponse(FULL, 120, "model-api");
  assert(r.grade === 2, "grade");
  assert(r.gradeName === "Moderate NPDR", "grade name");
  assert(r.ordinalScores.length === 4, "four ordinal scores");
  assert(r.gradeScores.length === 5, "five grade scores");
  assert(r.latencyMs === 6.22, "latency");
  assert(r.model.variant === "FT-PTQ INT8", "variant");
  assert(r.isMock === false, "a model-api result must not be flagged mock");
  assert(r.source === "model-api", "source");
});

/* ---------------------------------------------------- missing optional fields */
check("survives a response with only a grade", () => {
  const r = normalizeResponse({ prediction: { grade: 0 } }, 10, "model-api");
  assert(r.grade === 0, "grade");
  assert(r.gradeName === "No DR", "falls back to the known grade name");
  assert(r.ordinalScores.length === 0, "absent scores become an empty array");
  assert(r.gradeScores.length === 0, "absent grade scores become an empty array");
  assert(r.latencyMs === null, "absent latency is null, not NaN");
  assert(r.model.name === "DR-VERGE", "model name falls back");
  assert(r.model.variant === null, "absent variant is null");
});

check("drops non-finite values out of score arrays", () => {
  const r = normalizeResponse(
    { prediction: { grade: 1 }, ordinal_scores: [0.9, null, "x", 0.3] },
    10,
    "model-api",
  );
  assert(r.ordinalScores.every(Number.isFinite), "every surviving score is finite");
});

check("accepts numeric strings", () => {
  const r = normalizeResponse({ prediction: { grade: "3" } }, 10, "model-api");
  assert(r.grade === 3, "string grade coerced");
});

check("rounds a fractional grade", () => {
  const r = normalizeResponse({ prediction: { grade: 2.4 } }, 10, "model-api");
  assert(r.grade === 2, `expected 2, got ${r.grade}`);
});

/* ---------------------------------------------------- malformed input */
check("rejects a null body", () => throws(() => normalizeResponse(null, 0, "model-api"), "malformed"));
check("rejects a string body", () => throws(() => normalizeResponse("nope", 0, "model-api"), "malformed"));
check("rejects a missing grade", () =>
  throws(() => normalizeResponse({ prediction: {} }, 0, "model-api"), "malformed"));
check("rejects an out-of-range grade", () =>
  throws(() => normalizeResponse({ prediction: { grade: 9 } }, 0, "model-api"), "malformed"));
check("rejects a negative grade", () =>
  throws(() => normalizeResponse({ prediction: { grade: -1 } }, 0, "model-api"), "malformed"));
check("rejects NaN", () =>
  throws(() => normalizeResponse({ prediction: { grade: "abc" } }, 0, "model-api"), "malformed"));
check("honours success:false", () =>
  throws(
    () => normalizeResponse({ success: false, error: "Model is warming up" }, 0, "model-api"),
    "server",
  ));

/* ---------------------------------------------------- mock mode */
check("mock mode is active with no API URL configured", () => {
  assert(isMockMode() === true, "expected mock mode on");
});

const fakeFile = (name, size) => ({ name, size, type: "image/jpeg" });

const mockResult = await runDRVergeInference({
  maculaFile: fakeFile("macula.jpg", 123456),
  opticDiscFile: fakeFile("disc.jpg", 234567),
});

check("mock results are ALWAYS flagged as mock", () => {
  assert(mockResult.isMock === true, "isMock must be true");
  assert(mockResult.source === "mock", 'source must be "mock"');
});

check("mock disclaimer states no model ran", () => {
  assert(/simulated/i.test(mockResult.disclaimer ?? ""), "disclaimer must say simulated");
  assert(
    /no dr-verge model was executed/i.test(mockResult.disclaimer ?? ""),
    "disclaimer must say no model was executed",
  );
});

check("mock variant is visibly marked", () => {
  assert(/mock|simulated/i.test(mockResult.model.version ?? ""), "version marked");
  assert(/simulated/i.test(mockResult.model.variant ?? ""), "variant marked");
});

check("mock ordinal scores are monotone non-increasing, as CORAL guarantees", () => {
  const s = mockResult.ordinalScores;
  assert(s.length === 4, `expected 4 scores, got ${s.length}`);
  for (let i = 1; i < s.length; i += 1) {
    assert(s[i] <= s[i - 1], `score ${i} (${s[i]}) exceeds score ${i - 1} (${s[i - 1]})`);
  }
  assert(s.every((v) => v >= 0 && v <= 1), "scores lie in [0,1]");
});

check("mock grade equals the count of thresholds passed at 0.5", () => {
  const expected = mockResult.ordinalScores.filter((p) => p > 0.5).length;
  assert(
    mockResult.grade === expected,
    `grade ${mockResult.grade} != threshold count ${expected}`,
  );
});

check("mock grade scores sum to about 1", () => {
  const total = mockResult.gradeScores.reduce((a, b) => a + b, 0);
  assert(Math.abs(total - 1) < 0.02, `sum was ${total}`);
});

const repeat = await runDRVergeInference({
  maculaFile: fakeFile("macula.jpg", 123456),
  opticDiscFile: fakeFile("disc.jpg", 234567),
});
check("the same pair yields the same mock result", () => {
  assert(repeat.grade === mockResult.grade, "grade differs between identical runs");
  assert(
    JSON.stringify(repeat.ordinalScores) === JSON.stringify(mockResult.ordinalScores),
    "scores differ between identical runs",
  );
});

const different = await runDRVergeInference({
  maculaFile: fakeFile("other.jpg", 999),
  opticDiscFile: fakeFile("other2.jpg", 888),
});
check("a different pair yields a different mock result", () => {
  assert(
    JSON.stringify(different.ordinalScores) !== JSON.stringify(mockResult.ordinalScores),
    "different inputs produced identical scores",
  );
});

console.log("=".repeat(76));
console.log(`${pass}/${pass + failures.length} passed`);
fs.rmSync(outDir, { recursive: true, force: true });
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
