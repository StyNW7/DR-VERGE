/**
 * Proves the bundled ONNX model actually loads and produces a usable result.
 *
 * The build only proves the code compiles; it says nothing about whether the
 * weights are present or whether the graph runs. This does:
 *
 *   1. all three model files exist and are plausibly sized
 *   2. metadata carries the four values preprocessing depends on
 *   3. the graph loads WITH its external weights
 *   4. a forward pass returns four finite, monotone non-increasing scores
 *
 * Step 3 is the one that matters most in practice. `torch.onnx.export` writes
 * the weights to a sidecar `model.onnx.data`; `model.onnx` alone is only the
 * graph and is roughly 190 KB, so it looks deceptively complete while being
 * unable to run.
 *
 * Run with:  node scripts/verify-model.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as ort from "onnxruntime-web/wasm";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const MODEL_DIR = process.env.MODEL_DIR
  ? path.resolve(root, process.env.MODEL_DIR)
  : path.join(root, "public", "models", "best_student_fp32");

const NUM_THRESHOLDS = 4;
let failures = 0;

function ok(name, detail = "") {
  console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  failures += 1;
  console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

console.log(`\nVerifying model in ${path.relative(root, MODEL_DIR)}\n`);

/* ---- 1. files present ---- */
const files = {
  "model.onnx": { min: 50_000 },
  "model.onnx.data": { min: 500_000 },
  "metadata.json": { min: 100 },
};
let allPresent = true;
for (const [name, { min }] of Object.entries(files)) {
  const p = path.join(MODEL_DIR, name);
  if (!fs.existsSync(p)) {
    allPresent = false;
    fail(
      `${name} exists`,
      name === "model.onnx.data"
        ? "MISSING. This is the weights file written alongside model.onnx by " +
          "torch.onnx.export. Copy it from the same Drive folder as model.onnx."
        : "missing",
    );
    continue;
  }
  const { size } = fs.statSync(p);
  if (size < min) fail(`${name} size`, `${size} bytes, expected at least ${min}`);
  else ok(`${name} present`, `${(size / 1024).toFixed(0)} KB`);
}

if (!allPresent) {
  console.error(`\n${failures} check(s) failed — cannot continue without every model file.\n`);
  process.exit(1);
}

/* ---- 2. metadata ---- */
let meta;
try {
  meta = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, "metadata.json"), "utf8"));
} catch (err) {
  fail("metadata.json parses", err.message);
  process.exit(1);
}

const size = Array.isArray(meta.input_size) ? meta.input_size[0] : null;
if (!Number.isInteger(size) || size < 32) fail("metadata.input_size", String(size));
else ok("metadata.input_size", `${size}x${size}`);

for (const key of ["normalization_mean", "normalization_std"]) {
  const v = meta[key];
  if (!Array.isArray(v) || v.length !== 3 || !v.every(Number.isFinite)) {
    fail(`metadata.${key}`, "expected three finite numbers");
  } else {
    ok(`metadata.${key}`, v.map((n) => n.toFixed(4)).join(", "));
  }
}

const threshold = meta.decision_threshold;
if (!(typeof threshold === "number" && threshold > 0 && threshold < 1)) {
  fail("metadata.decision_threshold", String(threshold));
} else {
  ok("metadata.decision_threshold", String(threshold));
}

/* ---- 3. load with external weights ---- */
ort.env.wasm.numThreads = 1;
ort.env.logLevel = "error";

let session;
try {
  session = await ort.InferenceSession.create(
    new Uint8Array(fs.readFileSync(path.join(MODEL_DIR, "model.onnx"))),
    {
      executionProviders: ["wasm"],
      externalData: [
        {
          path: "model.onnx.data",
          data: new Uint8Array(fs.readFileSync(path.join(MODEL_DIR, "model.onnx.data"))),
        },
      ],
    },
  );
  ok("session loads with external weights");
} catch (err) {
  fail("session loads with external weights", err.message);
  console.error(`\n${failures} check(s) failed.\n`);
  process.exit(1);
}

for (const name of ["macula", "disc"]) {
  if (session.inputNames.includes(name)) ok(`input "${name}" present`);
  else fail(`input "${name}" present`, `found [${session.inputNames.join(", ")}]`);
}

/* ---- 4. forward pass ---- */
const makeTensor = () =>
  new ort.Tensor("float32", new Float32Array(3 * size * size).fill(0.1), [1, 3, size, size]);

try {
  const out = await session.run({ macula: makeTensor(), disc: makeTensor() });
  const tensor = out.p_cumulative ?? out[session.outputNames[0]];
  const scores = Array.from(tensor.data).slice(0, NUM_THRESHOLDS);

  if (scores.length !== NUM_THRESHOLDS) {
    fail("output length", `got ${scores.length}, expected ${NUM_THRESHOLDS}`);
  } else if (!scores.every(Number.isFinite)) {
    fail("output finite", scores.join(", "));
  } else {
    ok("forward pass", scores.map((s) => s.toFixed(4)).join(", "));
  }

  // CORAL guarantees P(Y>0) >= P(Y>1) >= ... — a violation means the head was
  // exported wrong, and every grade computed from it would be untrustworthy.
  const monotone = scores.every((v, i) => i === 0 || v <= scores[i - 1] + 1e-6);
  if (monotone) ok("ordinal monotonicity");
  else fail("ordinal monotonicity", scores.join(" > "));

  if (scores.every((s) => s >= 0 && s <= 1)) ok("scores within [0,1]");
  else fail("scores within [0,1]", scores.join(", "));

  const grade = scores.filter((p) => p > threshold).length;
  ok("grade derivable", `count(score > ${threshold}) = ${grade}`);
} catch (err) {
  fail("forward pass", err.message);
}

console.log(
  failures === 0
    ? "\nAll model checks passed — the demo will serve real predictions.\n"
    : `\n${failures} check(s) failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
