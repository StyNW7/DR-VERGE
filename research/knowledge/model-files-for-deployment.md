# Which Model Files Do You Need to Serve Predictions?

Short answer for a web app:

> **For the FP32 student: `model.onnx` + `model.onnx.data` + `metadata.json`.** No PyTorch needed.
> **For the INT8 deployment model: `checkpoint.pt` + the model class code + a quantized skeleton** —
> INT8 cannot be exported to ONNX, so it needs a Python + PyTorch backend.

All facts below refer to the final run, `artifacts_enhanced_v1_20260811` (384 × 384, standard
sampling). The practical step-by-step guide is in [`deployment-guide.md`](deployment-guide.md).

---

## 1. Why there is no `.pkl` or `.joblib` here

`.pkl` / `.joblib` are the scikit-learn world: the whole fitted estimator is pickled and
`joblib.load()` gives you something with `.predict()`.

PyTorch deliberately does **not** work that way. Pickling a whole `nn.Module` embeds file paths and
class references from the machine that saved it, and breaks on any refactor. The supported pattern
is to save **only the learned tensors** (`state_dict`) and rebuild the architecture from code.

So the PyTorch equivalent of "the model file" is a **pair**:

```
checkpoint.pt   (the learned weights)   +   the Python class that defines the architecture
```

`checkpoint.pt` alone is not enough: you must ship the model definition code with it.

---

## 2. The formats the notebook produces

| File | What it is | Needs PyTorch? | Needs your class code? | Works for INT8? |
|---|---|---|---|---|
| `checkpoint.pt` | `state_dict` — a dict of tensors | yes | **yes** | **yes** |
| `model.pt2` | `torch.export` graph | yes | no | **no** |
| `model.onnx` + `model.onnx.data` | framework-independent graph + its weights | no (needs `onnxruntime`) | no | **no** |
| `metadata.json` | preprocessing, grade map, versions, export parity | — | — | — |

**ONNX is the best choice for a website** — no PyTorch install, small runtime, fast on CPU, and it
runs from Python, Node, C#, or directly in the browser via `onnxruntime-web`.

> `torch.onnx.export` writes the weights to a **sidecar file**, `model.onnx.data`. The graph file
> `model.onnx` is only ~190 KB and looks complete, but cannot be loaded without the sidecar.

---

## 3. What the final run actually produced

| Model | `checkpoint.pt` | `model.pt2` | `model.onnx` | Notes |
|---|:--:|:--:|:--:|---|
| `teacher_fp32` | ✅ | ✅ | ✅ | parity max\|diff\| 1.7 × 10⁻⁶, same grades |
| `best_student_fp32` (M\*, `dual_csd` seed 3407) | ✅ | ✅ | ✅ | parity max\|diff\| 7.2 × 10⁻⁷, same grades |
| `best_student_ptq_int8` | ✅ | ❌ | ❌ | eager quantized modules cannot be traced |
| `best_student_ft_ptq_int8` | ✅ | ❌ | ❌ | same |
| `best_student_qat_int8` (deployment, seed 42) | ✅ | ❌ | ❌ | same |

The INT8 failures are **expected, not a bug**: eager-mode quantized modules hold packed weights
(`Conv2dPackedParamsBase`) that neither `torch.export` nor the ONNX exporter can trace. That is why
the protocol describes the INT8 path as *quantized skeleton + `state_dict`*. All four student
artifacts passed the reload check in
[`deployment_verification.json`](../../experiments/results/deployment_verification.json)
(reloaded from disk, parity 0.0, stable across runs).

---

## 4. The decision point: the deployment model is INT8

The pre-registered rule selected **`qat_int8` (seed 42)**: 99.0% validation QWK retention and the
lowest median single-thread CPU latency among eligible candidates, **11.35 ms**
([`deployment_choice.json`](../../experiments/results/deployment_choice.json)). Because INT8 cannot
be exported to ONNX, serving that exact artifact requires

```
quantized skeleton (rebuilt in code)  +  checkpoint.pt
```

and therefore a **Python + PyTorch** backend on an x86 CPU.

| Choice | Size | Single-thread CPU latency | Serving options | QWK (internal test) |
|---|---|---|---|---|
| **INT8 (`qat_int8`, seed 42)** | 0.95 MB | 11.35 ms | Python + PyTorch only | 98.96% of FP32 |
| **FP32 (`best_student_fp32`, seed 3407)** | 1.29 MB | 32.49 ms | **anything**, via ONNX | reference |

For a web demo, the ~21 ms difference per eye is invisible next to network and image-decoding time.
The DR-VERGE web prototype therefore runs **`best_student_fp32` via ONNX in the browser** and says so
on the demo page: it is the same method (`dual_csd`) but **not** the artifact reported as the paper's
deployment model.

---

## 5. What the model expects (this is not a normal single-image classifier)

**It takes TWO images per prediction** — one macula-centred and one optic-disc-centred fundus
photograph of the *same eye*. The signature is `forward(macula, disc)`; getting the order wrong
degrades the result.

**The output is 4 cumulative ordinal scores, not 5 class probabilities.**

```python
p_cumulative  # shape (batch, 4) = [P(y>0), P(y>1), P(y>2), P(y>3)]
grade = (p_cumulative > 0.5).sum()      # 0..4 — the CORAL rule; 0.5 is t* for dual_csd
```

Do **not** use `argmax`. The grade is the *count of thresholds passed*. The decision threshold is
per condition and was chosen on validation only (`dual_csd`: 0.50, see
[`threshold_calibration.json`](../../experiments/results/configs/threshold_calibration.json)).

### Preprocessing must match training exactly

From `metadata.json`:

```python
input_size  = [384, 384]
mean        = [0.372487, 0.217266, 0.119367]     # DRTiD-specific, NOT ImageNet
std         = [0.281526, 0.179457, 0.109162]
horizontal_flip = False
```

Order: RGB → resize 384 × 384 → scale to [0, 1] → normalise → CHW tensor. **Using ImageNet mean/std
here would silently degrade every prediction** — those constants belong to the APTOS pre-training
stage only.

---

## 6. Re-exporting ONNX without re-training

You do not need to re-run anything — `checkpoint.pt` has the weights:

```python
import torch
# `Student` and `INIT_TH` as defined in the final notebook (§7 Models)
student = Student(init=INIT_TH)
student.load_state_dict(torch.load("models/best_student_fp32/checkpoint.pt", map_location="cpu"))
student.eval()

class InferenceWrapper(torch.nn.Module):
    def __init__(self, m): super().__init__(); self.model = m
    def forward(self, macula, disc): return self.model(macula, disc)["p_dual"]

wrap = InferenceWrapper(student).eval()
ex = (torch.randn(1, 3, 384, 384), torch.randn(1, 3, 384, 384))
torch.onnx.export(wrap, ex, "model.onnx",
                  input_names=["macula", "disc"], output_names=["p_cumulative"],
                  dynamic_axes={"macula": {0: "batch"}, "disc": {0: "batch"},
                                "p_cumulative": {0: "batch"}},
                  dynamo=True)          # requires onnxscript
```

**Always verify parity** before trusting an export — compare PyTorch and `onnxruntime` outputs on the
same batch and require `max|diff| < 1e-4` **and identical predicted grades**. The notebook does this as
a gate; `npm run verify:model` in `frontend/` repeats a forward-pass check on the shipped files.

---

## 7. Response contract

The notebook's `predict_dr()` defines a sensible response shape:

```json
{
  "grade": 2,
  "grade_name": "Moderate NPDR",
  "ordinal_scores": [0.91, 0.73, 0.44, 0.12],
  "grade_scores":   [0.09, 0.18, 0.29, 0.32, 0.12],
  "uncalibrated_score": 0.32,
  "model_version": "qat_int8_seed42_QAT_INT8",
  "quantization": "QAT_INT8",
  "latency_ms": 11.35,
  "disclaimer": "Research prototype; not a standalone clinical diagnosis."
}
```

(Values above are illustrative.) **Do not present these as probabilities.** Training used weighted
BCE, which distorts the sigmoid outputs — they are *ordinal threshold scores*. The supplementary
analysis measured their calibration only as a diagnostic (CSD ECE 0.056), not as clinical risk. The
disclaimer is not optional for a medical-imaging demo.

---

## 8. Summary

| Question | Answer |
|---|---|
| `.pkl` / `.joblib`? | No — PyTorch uses `state_dict` + model code |
| Best for a website | `model.onnx` + `model.onnx.data` via `onnxruntime-web` (FP32 only) |
| Did the final run produce ONNX? | **Yes** for `teacher_fp32` and `best_student_fp32`, with verified parity |
| Can the INT8 model be ONNX? | **No** — eager quantized ops cannot be traced; Python backend required |
| Inputs | **two** images per eye (macula + optic disc), 384 × 384, DRTiD normalisation |
| Output | 4 cumulative scores; `grade = (p > t*).sum()`, never `argmax` |
| What the web prototype runs | `best_student_fp32` (seed 3407) in the browser, clearly labelled |
