# Which Model Files Do You Need to Serve Predictions?

Short answer for a web app:

> **You need `checkpoint.pt` (the weights) + the model class code + the preprocessing constants.**
> Optionally `model.onnx` instead, which removes the PyTorch dependency — but **only the FP32 models
> can be exported to ONNX**, and in the efficient run the ONNX export failed entirely.

---

## 1. Why there is no `.pkl` or `.joblib` here

`.pkl` / `.joblib` are the scikit-learn world: the whole fitted estimator is pickled and
`joblib.load()` gives you something with `.predict()`.

PyTorch deliberately does **not** work that way. Pickling a whole `nn.Module` embeds file paths and
class references from the machine that saved it, and breaks on any refactor. The supported pattern
is to save **only the learned tensors** (`state_dict`) and rebuild the architecture from code.

So the equivalent of "the model file" is a **pair**:

```
checkpoint.pt   (the learned weights)   +   the Python class that defines the architecture
```

There is one important consequence: **`checkpoint.pt` alone is not enough.** You must ship the model
definition code with it.

---

## 2. The four formats these notebooks can produce

| File | What it is | Needs PyTorch? | Needs your class code? | Works for INT8? |
|---|---|---|---|---|
| `checkpoint.pt` | `state_dict` — a dict of tensors | yes | **yes** | **yes** |
| `model.pt2` | `torch.export` graph | yes | no | **no** |
| `model.onnx` | framework-independent graph | no (needs `onnxruntime`) | no | **no** |
| `metadata.json` | preprocessing, grade map, versions | — | — | — |

**ONNX is normally the best choice for a website** — no PyTorch install, small runtime, fast on CPU,
and it runs from Node, Python, C#, or even in-browser via `onnxruntime-web`.

**But there is a catch specific to this project**, explained next.

---

## 3. What each run ACTUALLY produced

### Efficient notebook (`experiment-result/`) — the completed run

| Model | `checkpoint.pt` | `model.pt2` | `model.onnx` |
|---|:--:|:--:|:--:|
| `teacher_fp32` | ✅ | ✅ | ❌ |
| `best_student_fp32` (M\*) | ✅ | ✅ | ❌ |
| `best_csd_fp32` | ✅ | ✅ | ❌ |
| `best_student_ptq_int8` | ✅ | ❌ | ❌ |
| `best_student_qat_int8` | ✅ | ❌ | ❌ |

**Every ONNX export failed:**

```
[best_student_fp32] ONNX export FAILED: ModuleNotFoundError("No module named 'onnxscript'")
```

The notebook installs `onnx` and `onnxruntime` but **not `onnxscript`**, which the modern
`dynamo=True` exporter requires. Nothing is wrong with the models — the exporter simply could not
run. `Gate8_Export` still passed because it requires `state_dict`, which all five have.

**Fix for a re-run:** add `onnxscript` to the pip line in cell 4. Or export ONNX offline from
`checkpoint.pt` without re-training (§6).

The two INT8 failures are **expected and not a bug**: eager-mode quantized modules hold packed
weights (`Conv2dPackedParamsBase`) that neither `torch.export` nor ONNX can trace. This is why the
protocol always described the INT8 path as *quantized skeleton + `state_dict`*.

### Simple notebook (`experiment/`)

Installs `onnxscript`, so its FP32 ONNX exports should succeed. It exports `teacher_fp32`,
`best_student_fp32`, `best_csd_fp32`, plus the INT8 variants (`state_dict` only), and additionally
publishes a **`selected_deployment/`** folder containing whichever model the deployment rule chose —
that folder is the one to hand to a web app.

---

## 4. The awkward part: your deployment model is INT8

The pre-registered rule selected **`qat_int8`** (100.6% QWK retention, 8.65 ms latency). But INT8
**cannot be exported to ONNX or `.pt2`**. So for the INT8 model your only option is:

```
quantized skeleton (rebuilt in code)  +  checkpoint.pt
```

which means your web backend **must be Python + PyTorch**. You cannot serve the INT8 model from
Node.js or the browser.

**This is a real decision point:**

| Choice | Latency | Serving options | Accuracy |
|---|---|---|---|
| **INT8 (`qat_int8`)** | 8.65 ms | Python + PyTorch only | 100.6% of FP32 |
| **FP32 (`best_student_fp32`)** | 12.7 ms | **anything**, via ONNX | baseline |

The INT8 model is **4 ms faster per eye**. For a web app where network latency is 50–200 ms, that
difference is invisible to the user. **Unless you specifically need INT8 for the paper's deployment
claim, serve the FP32 model via ONNX** — it is dramatically easier to deploy and the speed
difference is irrelevant at web scale.

---

## 5. What your API must do (this is not a normal single-image classifier)

Two things will surprise you if you treat this like a typical image classifier.

**It takes TWO images per prediction.** One macula-centred and one optic-disc-centred fundus
photograph of the *same eye*. The model signature is `forward(macula, disc)`. Your upload form needs
two files, and getting the order wrong degrades the result.

**The output is 4 cumulative ordinal scores, not 5 class probabilities.**

```python
p_cumulative  # shape (batch, 4) = [P(y>0), P(y>1), P(y>2), P(y>3)]
grade = (p_cumulative > 0.5).sum()      # 0..4 — this is the CORAL rule
```

Do **not** use `argmax`. The grade is the *count of thresholds passed*.

### Preprocessing must match training exactly

From `PREPROCESSING` in the notebook:

```python
input_size  = [224, 224]
mean        = [0.372487, 0.217266, 0.119367]     # DRTiD-specific, NOT ImageNet
std         = [0.281526, 0.179457, 0.109162]
horizontal_flip = False
decision_threshold = 0.5
```

Order: RGB → resize 224×224 → normalize → CHW tensor. **Using ImageNet mean/std here would silently
degrade every prediction** — those constants belong to the APTOS pretraining stage only.

---

## 6. Getting ONNX without re-training

You do not need to re-run anything. `checkpoint.pt` has the weights; rebuild and export:

```python
import torch
# from the notebook: the Student class + InferenceWrapper
student = Student(init=INIT_TH)
student.load_state_dict(torch.load("models/best_student_fp32/checkpoint.pt", map_location="cpu"))
student.eval()

class InferenceWrapper(torch.nn.Module):
    def __init__(self, m): super().__init__(); self.model = m
    def forward(self, macula, disc): return self.model(macula, disc)["p_dual"]

wrap = InferenceWrapper(student).eval()
ex = (torch.randn(1, 3, 224, 224), torch.randn(1, 3, 224, 224))
torch.onnx.export(wrap, ex, "model.onnx",
                  input_names=["macula", "disc"], output_names=["p_cumulative"],
                  dynamic_axes={"macula": {0: "batch"}, "disc": {0: "batch"},
                                "p_cumulative": {0: "batch"}},
                  dynamo=True)          # pip install onnxscript first
```

**Always verify parity** before trusting the export — compare PyTorch and `onnxruntime` outputs on
the same batch and require `max|diff| < 1e-4` **and identical predicted grades**. Both notebooks do
this as a gate; do the same offline.

---

## 7. Recommended setup

**For a demo or competition submission — simplest path:**

```
model.onnx                 exported from best_student_fp32 (§6)
metadata.json              preprocessing + grade names + version
→ serve with onnxruntime (Python FastAPI, or Node, or in-browser)
```

**If you need the INT8 deployment model** (because the paper's headline is the 8.65 ms figure):

```
checkpoint.pt              from best_student_qat_int8
+ notebook model code      Student, LightBackbone, CORALHead, InteractionFusion,
                           QuantizableBackbone, and the qat_skeleton() rebuild
+ torch, torchvision
→ Python backend only
```

### Files to copy out of the artifacts folder

```
models/<chosen_model>/checkpoint.pt      the weights
models/<chosen_model>/metadata.json      preprocessing, grade map, torch version, SHA-256
configs/config_locked.json               the protocol that produced it
```

Plus, from the notebook, the class definitions: `LightBackbone`, `DWSepBlock`, `CORALHead`,
`InteractionFusion`, `DualViewBase`, `Student` — and `QuantizableBackbone` + the skeleton rebuild if
you go INT8.

---

## 8. Response contract

The notebook's `predict_dr()` already defines a sensible API response — reuse it:

```json
{
  "grade": 2,
  "grade_name": "Moderate NPDR",
  "ordinal_scores": [0.91, 0.73, 0.44, 0.12],
  "grade_scores":   [0.09, 0.18, 0.29, 0.32, 0.12],
  "uncalibrated_score": 0.32,
  "model_version": "qat_int8_seed2026_QAT_INT8",
  "quantization": "QAT_INT8",
  "latency_ms": 8.65,
  "disclaimer": "Research prototype; not a standalone clinical diagnosis."
}
```

**Do not present these as probabilities.** Training used weighted BCE, which distorts the sigmoid
outputs — they are *uncalibrated ordinal scores*. Saying "93% confident this is Grade 2" would be a
claim the model does not support. The field is deliberately named `uncalibrated_score`, and the
disclaimer is not optional for a medical-imaging demo.

---

## 9. Summary

| Question | Answer |
|---|---|
| `.pkl` / `.joblib`? | No — PyTorch uses `state_dict` + model code |
| Minimum to predict | `checkpoint.pt` + the model class + preprocessing constants |
| Best for a website | `model.onnx` + `onnxruntime` (FP32 models only) |
| Did the efficient run produce ONNX? | **No** — `onnxscript` was missing; `.pt2` and `state_dict` are fine |
| Can the INT8 model be ONNX? | **No** — eager quantized ops cannot be traced; Python backend required |
| Inputs | **two** images per eye (macula + optic disc), 224×224, DRTiD normalization |
| Output | 4 cumulative scores; `grade = (p > 0.5).sum()`, never `argmax` |
| Pragmatic recommendation | Serve **FP32 via ONNX**; the 4 ms INT8 gain is invisible over a network |
