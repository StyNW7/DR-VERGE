# DR-VERGE `full_pipeline_notebook.ipynb` — Documentation

What this notebook is, how to run it on Google Colab Pro, what it needs from you, and what to
check once it's done. Written 7 Agustus 2026 alongside a full correctness audit of the notebook
— see **Section 8 (Known limitations)** for what was found and fixed, and what remains an honest
caveat rather than a bug.

---

## 0. Resuming after the Gate 2 fusion fix (7 Agustus 2026)

Your first real Colab run got through Day 2 (APTOS pretraining, both backbones succeeded) and
Day 3–4 (teacher training completed but **Gate 2 failed**: `QWK_dual=0.558` was actually *below*
`QWK_macula=0.572` — see `experiment/notebook-result/result-note.md`). Root cause and fix:

- **The fusion mechanism was architecturally too weak.** The original design concatenated the two
  views and passed them through a single Linear layer + `BatchNorm1d` — no way to represent
  multiplicative or differential interaction between views. This is exactly what `judge.md`'s
  Flag 2 predicted, now confirmed empirically. **Fixed**: `InteractionFusion` (Section 6 of the
  notebook) adds `|z_m − z_d|` and `z_m ⊙ z_d` interaction terms through a small MLP, and replaces
  `BatchNorm1d` with `LayerNorm` (batch-size-8 BatchNorm statistics were a plausible contributor
  to the volatile epoch-to-epoch QWK swings visible in the log even during the frozen-backbone
  phase).
- Teacher training batch size bumped 8 → 16 to further reduce gradient noise on the small
  (800-image) training set.
- The dataset-path resolution now **auto-detects** whether DRTiD is nested as `DRTiD/DRTiD/...` or
  flat as `DRTiD/...` under `dataset/`, rather than assuming one layout — this was found to differ
  between the local repo copy and what may be on your Drive.

**What this means for your Drive state right now:**
- Your two pretrained-backbone checkpoints (`aptos_resnet50_backbone.pt`,
  `aptos_lightweight_backbone.pt`) are **still valid** — only the fusion/head layers changed, not
  the backbones. Re-running will detect them as compatible and skip straight past Day 2's
  training, no wasted compute.
- Your existing `teacher_final.pt` was trained with the *old* fusion architecture and is no longer
  compatible with the model class. **You don't need to delete it manually** — every checkpoint
  load in this notebook now goes through `checkpoint_is_compatible()` (Section 3), which checks
  the saved state's keys/shapes against the current architecture before deciding whether to skip
  training. An incompatible checkpoint prints exactly why, then retrains automatically. Just
  re-run the notebook from the top; Day 3–4 will redo itself with the fixed fusion, and Day 2 will
  be skipped.
- `GATE2_PASSED` is now a global flag, checked (and loudly warned about, not silently ignored) by
  the Gate 3 and CSD-training cells if it's still `False` after a re-run — so if the fix isn't
  enough on its own, you'll see that clearly rather than discovering it only at Gate 4.

## 0.1. A second bug found while re-running: Drive write/read race (7 Agustus 2026, later same day)

The re-run (with the fusion fix above) got through the checkpoint-compatibility check correctly
and started retraining the teacher, but crashed on `FileNotFoundError` reading back
`teacher_final.pt` **immediately after `train_teacher()` had just saved it**, right at the
freeze→finetune handoff. Root cause: Google Drive's mounted filesystem has a short, well-known
sync lag — a file written on one line isn't always visible to a read on the very next line, in the
same running process. The save itself worked fine (the checkpoint was really there); the
*immediate* re-read was the problem.

Two fixes, applied together:
- `train_teacher()` now keeps the best-so-far model weights in memory (a deep-copied state dict)
  and reloads from that in-memory copy when moving from the freeze phase to the finetune phase,
  instead of writing to Drive and reading straight back. Disk save still happens (for
  resumability across sessions) — the in-memory path just removes the race for the handoff that
  happens within the same function call.
- A new `robust_torch_load()` helper (Section 3) wraps every other checkpoint read in the
  notebook with retry + exponential backoff (up to 6 attempts), covering the same class of race
  anywhere else a checkpoint might be read shortly after being written — the Gate 2 check right
  after `train_teacher()` returns, the grid search's reload of a just-trained student, PTQ, final
  evaluation, and the bootstrap.

**What this means for you:** just re-run the notebook again. The freeze phase will redo (the
previous attempt's partial progress wasn't saved anywhere reloadable), but this time the
freeze→finetune handoff won't depend on Drive's write-then-read timing at all.

## 0.2. Gate 2 landed right on the margin across repeated retrains (8 Agustus 2026)

With both fixes above applied, three real `train_teacher()` runs gave: fail (`QWK_dual=0.558`,
gap −0.014), pass (`QWK_dual=0.596`, gap +0.0295), fail again (`QWK_dual=0.628`, gap −0.014). Two
fails landing at nearly the identical gap size is a real signal, not just noise: the fusion fix
helps, but the win isn't reliable yet.

Root cause: `lambda_aux=0.5` gives the auxiliary single-view losses a strong pull on the **shared**
backbone (their gradients flow through it during finetune), competing directly with what's optimal
for the fusion task specifically. The freeze-phase LR (`1e-3`) was also a plausible contributor —
the very first run's freeze-phase val QWK declined for 3 straight epochs right after peaking,
consistent with the small head-only parameter set overshooting on only 800 training images.

**Fixed**: `train_teacher()`'s defaults are now `lambda_aux=0.3` (down from 0.5) and a new
`freeze_lr=3e-4` parameter (down from a hardcoded `1e-3`). Re-run with `train_teacher(force=True)`
to pick these up — remember the "already exists, skipping" behavior means a plain
`train_teacher()` will NOT retrain once *any* checkpoint (passing or failing) is sitting on Drive.

If it still fails after a few retrains at these new defaults, that's a legitimate result worth
documenting, not a bug to keep chasing indefinitely — `docs/roadmap.md` explicitly treats a
negative Gate 2/RQ1 outcome as a valid, reportable finding given a controlled comparison protocol.
Don't burn remaining competition time on unlimited retries; a couple of attempts at the new
defaults (optionally with `seed=123` as a second opinion) is a reasonable amount of chasing before
accepting and writing up whatever the result actually is.

Gate 2 eventually passed comfortably: `QWK_dual=0.626` vs `max(macula=0.560, disc=0.584)`,
`G_internal=+0.042` — the best margin across all attempts, consistent with the `lambda_aux`/
`freeze_lr` tweak genuinely helping rather than the pass being another coin-flip.

## 0.3. Same Drive-lag bug, mirror image: directory create vs file write (8 Agustus 2026)

Day 5–6 (student baselines) hit a related but distinct crash: `train_student_condition()` calls
`os.makedirs(ckpt_dir, exist_ok=True)` at the top (as it always did), which returned successfully,
but `torch.save()` on the first improving epoch then raised `RuntimeError: Parent directory ...
does not exist`. Same underlying cause as Section 0.1's bug (Google Drive's FUSE mount sync lag),
just hitting directory creation instead of file reads this time — `os.makedirs()` returning success
doesn't guarantee the directory is yet visible to the different, lower-level file-open call
`torch.save()`'s C++ writer makes.

**Fixed**: a new `robust_torch_save()` helper (Section 3, alongside `robust_torch_load()`) retries
the `os.makedirs()` + `torch.save()` pair together with exponential backoff, and every checkpoint
write in the notebook (`pretrain_backbone`, `train_teacher`, `train_student_condition`, the PTQ
state_dict fallback) now goes through it instead of a plain `torch.save(...)`.

**What this means for you:** just re-run the `train_student_condition(...)` calls again — no
manual directory creation or workaround needed. If a Drive lag happens again, you'll see
`robust_torch_save: saving to '...' failed (attempt N/6): ... -- retrying in Xs...` printed instead
of a crash, and it'll just proceed once Drive catches up.

---

## 1. What this notebook is

`full_pipeline_notebook.ipynb` is a **single, self-contained** notebook that runs the entire
DR-VERGE experiment end to end: no separate scripts to juggle, no `experiment/src/*.py` imports —
every model, loss, dataset class, training loop, evaluation function, and chart is defined inline
in its own cell, in the order it's needed.

It implements the method described in `docs/overview.md` (Complementarity-Shift Distillation, or
CSD) using the dataset decision in `dataset/reference.md` (DRTiD primary, APTOS pretrain-only),
following the gates and fixes specified in `[USED THIS] Technical Documentation.pdf` (v2) and
`docs/judge.md` (external technical audit — several of its flags are fixed directly in this
notebook's code, not just described as future work). The day-by-day pacing it executes matches
`docs/roadmap.md`.

**One sentence:** it trains a lightweight dual-view diabetic retinopathy grading model that
learns not just to predict from two fundus photos, but specifically to imitate *the pattern of
belief-shift* a bigger teacher model shows when it stops looking at one photo and starts looking
at two — and it proves whether that's actually better than two more standard baselines.

---

## 2. What the notebook actually does, section by section

| # | Section | What happens |
|---|---|---|
| 1 | Setup | GPU check, Drive mount, dataset upload path, dependency install |
| 2 | Global Config | All paths and hyperparameters in one place — **the only cell you must edit** |
| 3 | Reproducibility utils | Seeding, `pos_weight` computation for class imbalance |
| 4 | Gate 1 — Dataset split | Verifies DRTiD's official train/test split, carves train/val, checks no ID overlap, checks every image path exists, reports grade distribution |
| 5 | Datasets & transforms | `DRTiDDualViewDataset`, `APTOSSingleViewDataset`, augmentation (deliberately no horizontal flip) |
| 6 | Models | `CORALHead` (ordinal regression), `DualViewResNetTeacher`, `DualViewLightStudent`, `LightweightBackbone` |
| 7 | Losses | CORAL loss, auxiliary loss, standard logit-KD, and CSD in 3 variants |
| 8 | Smoke test | Runs one real batch through everything before any real training starts |
| 9 | Evaluation helpers | QWK, MAE, severe error rate, sensitivity per grade, dual-view gain, model size, CPU latency |
| 10 | Pretrain APTOS backbones | ResNet-50 (for teacher) and lightweight backbone (for student), separately |
| 11 | Teacher training — **Gate 2** | Two-stage (freeze → fine-tune), checkpointed on best val QWK |
| 12 | Generic student trainer | One function drives every student condition below |
| 13 | Baselines | macula-only, disc-only (1 seed), no-distill, standard KD (3 seeds each) |
| 14 | Gate 3, grid search, final CSD | Checks the teacher shows a real complementarity signal, searches CSD hyperparameters on 1 seed, trains the winning config on 3 seeds, plus a counterfactual-CSD ablation |
| 15 | PTQ INT8 — **Gate 5** | Quantizes the best CSD student's backbone to INT8 |
| 16 | Full evaluation | Every trained condition evaluated once on the untouched official test set |
| 17 | Aggregation + bootstrap | Seed mean±std, clustered bootstrap 95% CIs |
| 18 | Gate 4 | Prints the actual RQ1 verdict |
| 19 | Charts | 9 figure types, all saved as PNG |
| 20 | Final dashboard | Summary table, printed and saved as CSV + Markdown |

### The "Gates"

Five checkpoints borrowed directly from the technical documentation (Section 14). Each one is a
built-in sanity check that prints a clear `PASSED` or `WARNING` — the notebook does **not** halt
execution on a gate failure (that would make an unattended Colab run useless), but it tells you
loudly when something upstream needs attention before you trust what comes after it.

- **Gate 1** — dataset split is clean (no ID overlap, all image paths resolve, all 5 grades present).
- **Gate 2** — teacher's dual-view head actually beats its own single-view auxiliary heads.
- **Gate 3** — teacher shows a non-trivial complementarity shift signal before spending a grid search on it.
- **Gate 4** — the actual RQ1 answer: does CSD beat no-distillation and stay competitive with standard KD?
- **Gate 5** — the PTQ-converted model is genuinely INT8, not silently still FP32 underneath.

---

## 3. Requirements

### Colab Pro settings
- **Runtime → Change runtime type → GPU.** A T4 works; more VRAM (A100/L4, if your Colab Pro tier offers it) will meaningfully speed up teacher (ResNet-50) training.
- **High-RAM runtime** recommended if available — the DataLoader workers plus model checkpoints in memory add up.
- Expect the full top-to-bottom run to take **several hours**, dominated by: APTOS pretraining (2 runs), teacher training (up to 20 epochs), and 3-seed training for 3 core student conditions + grid search. Colab Pro's longer session limits matter here — a free-tier Colab session is very likely to disconnect mid-run.

### Google Drive
Everything persists to a folder you choose in Drive (`DRIVE_BASE` in the Config cell), **not**
Colab's local disk — this is what makes the run resumable across disconnects. You need:
- A Google Drive with enough free space for: the dataset (DRTiD + APTOS, a few GB), all checkpoints (teacher + 2 pretrained backbones + ~9 student checkpoints × up to 3 seeds each), metric CSVs, and figures. Budget **at least 5–10 GB** free.

### Dataset
The notebook does **not** download DRTiD or APTOS for you — you must get them onto Drive yourself, matching this exact folder structure under `DRIVE_BASE/dataset/`:

```
dataset/
├── DRTiD/
│   ├── Ground Truths/DR_grade/a. DR_grade_Training.csv
│   ├── Ground Truths/DR_grade/b. DR_grade_Testing.csv
│   └── Original Images/          (all .jpg files, named <ID>_1.jpg / <ID>_2.jpg)
└── APTOS/
    ├── train_1.csv
    ├── valid.csv
    ├── train_images/train_images/   (.png files)
    └── val_images/val_images/       (.png files)
```

Section 1 of the notebook gives two ways to get this onto Drive:
- **Already synced**: if you've already put `dataset/` in your Drive folder (e.g. by copying it there via the Drive desktop app or web UI), skip straight past the upload cell.
- **First time / no local sync**: zip your local `dataset/` folder and use the provided upload cell (`RUN_UPLOAD_CELL = True`) to upload and extract it directly into Drive from the notebook.

The Drive-web-UI upload (outside the notebook, dragging the folder in directly) is almost always
faster than uploading a zip through the browser from inside Colab, if your dataset is more than a
few hundred MB.

### Python dependencies
Colab already ships a CUDA-enabled `torch`/`torchvision` — **the notebook deliberately does not
reinstall them**, to avoid replacing a working GPU build with a mismatched one. It installs only
`albumentations`, `scikit-learn==1.9.0`, `pandas`, `tqdm`, `pyyaml` on top of what Colab provides.

---

## 4. How to run it

1. Upload `experiment/full_pipeline_notebook.ipynb` to Colab (File → Upload notebook), or open it directly from Drive if you've placed the whole repo there.
2. **Runtime → Change runtime type → GPU** (and High-RAM if available). Connect.
3. Run **Section 1** cells in order: GPU check → Drive mount → (dataset upload, if needed) → dependency install.
4. In **Section 2 (Global Config)**, edit the one line:
   ```python
   DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
   ```
   to wherever you put (or want to put) the dataset and outputs in your Drive.
5. Run the rest of the notebook top to bottom (`Runtime → Run all`, or cell by cell if you want to watch each Gate's output before continuing).
6. If the runtime disconnects partway through: just reconnect and **run the notebook again from the top**. Every training function checks whether its output checkpoint already exists on Drive first and skips straight past completed work (`already exists, skipping`) — you won't lose progress or redo finished training, but you do need to re-run the earlier setup cells (config, dataset classes, model/loss definitions) since those live only in the runtime's memory, not on disk.

### What to watch for while it runs
- After **Gate 1**: grade distribution per split should show all 5 grades in train/val/test (it does, verified — see Section 7 below).
- After **Gate 2**: teacher's dual-view QWK should clearly beat its own macula-only/disc-only auxiliary heads. If it doesn't, the notebook prints a loud warning — don't trust anything trained after this point until it's resolved (check `lambda_aux`, epoch count, or a data leak).
- After **Gate 3**: if the printed mean `|Δᵀ|` L1 norm is near zero, the teacher isn't showing a complementarity signal worth distilling — go back and check Gate 2 rather than proceeding to the CSD grid search.
- After **Gate 5**: confirms the INT8 model is real, not a silently-still-FP32 model wrapped in stubs.
- **Section 18's Gate 4 printout is the actual answer to RQ1.** Read it before writing anything in the paper's Results section — it explicitly says whether CSD beat the two baselines, whether the bootstrap CI on that difference excludes zero, and reminds you that a "no" here is still a valid, reportable finding, not a failed run.

---

## 5. Outputs — where everything lands

All under `DRIVE_BASE`:

```
checkpoints/
  pretrained_backbones/aptos_resnet50_backbone.pt
  pretrained_backbones/aptos_lightweight_backbone.pt
  teacher/teacher_final.pt
  student/<condition>/best_seed<N>.pt          (one per condition × seed)
  student/dual_csd/int8_seed<N>.pt              (INT8 TorchScript, or a _statedict.pt fallback)
results/
  metrics/all_conditions_raw.csv                (every condition × seed, every metric)
  metrics/all_conditions_aggregated.csv         (mean ± std per condition)
  metrics/csd_grid_search.csv                   (the 4-combo grid search results)
  metrics/bootstrap_qwk_diffs.csv               (clustered bootstrap CIs)
  metrics/final_summary_table.csv / .md         (the paper-ready table)
  figures/*.png                                 (9 figures, listed in Section 19 above)
  logs/*_history.csv                            (per-epoch val QWK + loss logs, for the training-curve figure and your own sanity-checking)
splits/
  drtid_train.csv / drtid_val.csv / drtid_test.csv
```

---

## 6. Terminology and framing to carry into the paper

Straight from `docs/judge.md` Section I — use these, not the "unsafe" version, when writing the
KTI:

| Don't write | Write instead |
|---|---|
| "CSD proves the model understands anatomical complementarity" | "CSD transfers the teacher's cumulative ordinal decision-boundary shift between learned dual-view fusion and non-interactive single-view aggregation" |
| "Model is ready for use in a Puskesmas" | "Reduced model size and CPU latency indicate potential suitability for resource-constrained deployment, pending device-specific and prospective clinical validation" |
| "DR-VERGE is SOTA" | "Under the controlled DRTiD protocol, DR-VERGE was compared against no-distillation and standard logit-distillation baselines" |
| "Δ is the true complementarity value" | "Δ is an operational proxy for the decision change associated with learned dual-view fusion" |
| "Patient-wise split" (see Section 8 below) | "Split by DRTiD's per-eye record ID (no separate patient identifier is exposed in the public metadata)" |

---

## 7. Verification performed on this notebook (7 Agustus 2026)

Before writing this documentation, the notebook was audited, not just re-read. What was actually
checked:

- **Syntax**: every one of the 35 code cells is compiled (`compile(..., "exec")`) as part of the
  build process — a cell with a syntax error cannot end up in the shipped notebook.
- **Executed locally against the real DRTiD/APTOS data** (Sections 1–9: config, Gate 1 split,
  dataset classes, models, losses, smoke test, and every evaluation-helper function) — not just
  imported, actually run, with real predictions and real metric numbers produced. This caught and
  fixed a real bug: `fuse_model()` requires eval mode (PyTorch's own `fuse_conv_bn_eval`
  assertion), and the smoke test was calling it in train mode.
- **PTQ (Section 15) was specifically stress-tested**, since quantization code is exactly the kind
  of thing that looks plausible but breaks at runtime. Direct local testing found the *original*
  design (wrapping the entire student model between one `QuantStub`/`DeQuantStub` pair) genuinely
  fails: `torch.cat`, a standalone `BatchNorm1d`, and `CORALHead`'s custom cumsum/softplus/sigmoid
  math have no quantized-kernel equivalents in PyTorch's eager-mode static quantization, so a
  quantized tensor reaching `fusion_bn` crashes with
  `Could not run 'aten::native_batch_norm' with arguments from the 'QuantizedCPU' backend`.
  **Fixed** by quantizing only the CNN backbone (the actual compute/parameter-heavy part) and
  keeping the fusion + CORALHeads in FP32 — verified this fixed version actually runs end to end
  (prepare → calibrate → convert → correct forward output).
- **A second real bug in the Gate 5 check itself** was found in the process: it checked
  `type(module).__name__` for the substring `"Quantized"`, but PyTorch's fused quantized modules
  (e.g. a fused Conv-ReLU) have class name `ConvReLU2d` — no "Quantized" in the name at all; the
  designation lives in the module's *path* (`torch.ao.nn.intrinsic.quantized.modules.conv_relu`).
  The original check would have silently reported "not quantized" on a model that quantized
  correctly. **Fixed** to check the full module path instead.
- **A path-desync bug**: the evaluation cell independently reconstructed the INT8 model's file
  path instead of reading it from the PTQ cell, so a TorchScript-vs-fallback branch there could
  silently report the wrong file size. **Fixed** by exposing one `INT8_MODEL_PATH` variable that
  both cells read.
- Sections 10–14 and 16–20 (the actual training loops, full evaluation loop, bootstrap, charts)
  are syntax-verified and code-reviewed against the same building blocks that *were* executed —
  not independently executed end to end here, since that requires real GPU hours this local
  environment doesn't have. The first full Colab run is still the genuine first end-to-end test of
  those sections specifically.

---

## 8. Known limitations (read before writing the paper's Limitations section)

Beyond the standard DR-VERGE limitations already documented in `docs/judge.md` Section H (no
clinical validation, single dataset, CSD as a proxy not causal evidence, fixed single teacher
checkpoint, weighted-BCE outputs not calibrated probabilities), this notebook's own audit
surfaced one specific, previously-unstated limitation:

**DRTiD's `ID` is a per-eye identifier, not a patient identifier.** Checked directly against both
official ground-truth CSVs: all 1550 `ID` values are unique, and none has both an `L` and an `R`
row. There is no field in DRTiD's released metadata linking two eyes back to the same real
patient. Every split (`make_drtid_splits`), overlap check (Gate 1), and clustered bootstrap
(Section 17) in this notebook groups by `ID` — which is the finest-grained key the released data
provides, and the correct choice given that constraint — but this is **not the same as a verified
patient-wise split**. It's possible that both eyes of the same real person land in different
splits, and nothing in DRTiD's public metadata rules that out.

This doesn't require a code change (there's no better key available), but it does require an
honest sentence in the paper: report splits and bootstrap clustering as grouped by DRTiD's
per-eye record ID, not by patient, unless DRTiD's own paper documents an eye-to-patient mapping
this notebook doesn't have access to.

**PTQ quantizes only the backbone, not the whole model.** This is a deliberate, verified design
choice (Section 7 above), not a shortcut — but it does mean the reported INT8 model size and
latency reflect a *hybrid* FP32-head / INT8-backbone model, not a fully INT8 model. State this
precisely in the paper rather than implying the entire model is quantized.
