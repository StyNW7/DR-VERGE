# DR-VERGE — Project Roadmap & To-Do List

**Deadline:** 14 Agustus 2026 (submission) · **Today:** 6 Agustus 2026 · **Time left:** ~8 days
**Team:** 3 orang ("Sunib et al.") · **Sources:** `overview.md`, `[USED THIS] Technical Documentation.pdf` (v2), `judge.md` (external technical audit)

> This roadmap merges three documents that don't fully agree with each other yet. Where they conflict, this file states the conflict explicitly instead of silently picking one side — resolve those first, before writing training code.

**Execution vehicle (added 6 Agustus 2026):** `full_pipeline_notebook.ipynb` at repo root is now a
**complete, self-contained, Colab-Pro-ready notebook** covering the entire experiment end to end —
setup, all model/loss/dataset code inline, Gate 1–5 checks, backbone pretraining, teacher training,
every student condition (baselines, no-distill, standard KD, CSD grid search + final 3-seed training,
counterfactual-CSD ablation), PTQ INT8, full evaluation, seed aggregation, clustered bootstrap CIs, and
chart generation — with every checkpoint/metric/figure saved to Google Drive as it's produced. Sections
1–9 (setup through evaluation helpers) were run locally against the real DRTiD/APTOS data and verified
correct before handoff; the rest are syntax-verified and structurally match the already-validated
`experiment/src/*.py` code. **Running this notebook top-to-bottom on Colab Pro is now how Day 2 through
Day 8 actually get executed** — the day-by-day breakdown below still applies as the plan/checkpoints to
watch for, but the "how" is this notebook, not manually running the separate scripts under `experiment/`.

---

## 0. Read this first — the plan has changed from what the docs assume

The technical doc's Section 15 timeline is written for **10 days**. You have **8**. Two changes follow from that:

1. **No separate "validation sprint."** `judge.md` recommends a 6–12h sprint *before* full training to fix Δ's definition, CSD gradient scale, and same-head counterfactual formulation. There's no slack for that as a separate phase — its fixes are folded directly into **Day 1** below, before the smoke test.
2. **RQ2 (PTQ/INT8) is explicitly the first thing to cut** if you fall behind. The doc already says this ("Gate 5 optional, laporkan sebagai future work jika gagal") — treat Day 7 evening as the real go/no-go checkpoint for whether RQ2 is attempted at all.

**One-sentence goal (keep this pinned somewhere the whole team can see):**
*"DR-VERGE proves that CSD transfers the teacher's cumulative ordinal decision-boundary shift to a lightweight dual-view student, beating no-distillation and standard logit-KD baselines under a controlled protocol — nothing more, nothing less."*

---

## Decision Point #0 — RESOLVED (6 Agustus 2026): DRTiD is primary

Verified directly against the raw dataset files (not just the source repos' docs) — see
`dataset/reference.md` for the full detail. Summary:

- **DRTiD → primary training + evaluation.** It ships an explicit macula/optic-disc pairing per
  patient-eye (`ID, Grade, Macula, Optic disc, LR`) and an **official** train/test split
  (`a. DR_grade_Training.csv` = 1000 rows, `b. DR_grade_Testing.csv` = 550 rows, all 5 grades present in
  both). Use that split as-is — **do not** run a custom `train_test_split` on it, which is what fully
  resolves Gate 1's "resmi vs custom split" concern for this project. DRTiD is also the dataset behind
  CrossFiT (2022), the paper `overview.md` already cites for the 80.47%/77.87%/84.21% motivating numbers
  — training on it means your own single-view/dual-view numbers are directly comparable to that
  benchmark, not just citing it secondhand.
- **APTOS → backbone pretraining only**, unchanged from every document.
- **DeepDRiD → dropped from the core plan.** Its CSV has no column indicating which image field
  (`_l1`/`_l2`/`_r1`/`_r2`) is macula- vs disc-centered, and its one labeled-as-"evaluation" subset has
  empty ground truth. Only reconsider it as an optional bonus generalization check if someone confirms
  the field-type mapping cheaply from DeepDRiD's own paper/Readme and there's spare time later in the
  week — never let it block the core DRTiD pipeline.

**Remaining Day 1 actions from this decision:**
- [ ] Write the dataset loader against DRTiD's verified schema (`Original Images/<ID>_1.jpg` = Macula,
  `<ID>_2.jpg` = Optic disc per the CSV) — confirm the `_1`/`_2` = Macula/Optic-disc mapping holds by
  spot-checking a few rows before trusting it for all 1550.
- [ ] Point `make_splits.py`/loader config at the two official CSVs directly; skip writing any custom
  split-generation logic for DRTiD.
- [ ] Update `overview.md` Section 5 (Dataset) and Section 9 (Feasibility) to describe DRTiD as primary
  with the verified counts above — the paper's dataset section must match what the code actually
  trains/evaluates on, not the DeepDRiD-primary framing currently in that file.
- [ ] Note the class imbalance now (Grade 0 ≈ 48%, Grade 4 ≈ 4% of training rows) — this is exactly what
  `pos_weight` per-threshold (technical doc Section 2.4) exists to handle; confirms that step isn't
  optional.

---

## Decision Point #1 — RESOLVED (6 Agustus 2026): fix scope locked in as originally recommended

`judge.md` lists 18 flags + 10 code issues. You cannot fix all of them in 8 days. The doc itself sorts them into P0/P1/P2 — use that, but with one adjustment: given your timeline, some P1 items should be downgraded to "state as a written limitation in the paper" rather than fixed in code. Split below is now **the actual implemented scope**, not just a recommendation:

**Must fix in code (non-negotiable — these invalidate RQ1 if skipped):**
- Flag 1 + Flag 3 (Δ conflates complementarity with head discrepancy; student can game CSD via auxiliary heads) → **DONE** — `experiment/src/models.py`'s `counterfactual_forward()` (same `main_head` for dual/macula-only/disc-only) plus `experiment/src/losses.py`'s `csd_loss_no_aux_gradient` (Flag 3's detach mitigation), wired into `combined_student_loss` via `use_counterfactual_csd`. Verified in `smoke_test.py`.
- Code issue 1 (CPU latency evaluator measuring GPU) — not yet applicable, `evaluate.py` doesn't exist yet (Day 8 script). Flag stays open, revisit when writing it.
- Code issue 2 (INT8 evaluator is a placeholder) — same, not applicable until `quantize.py`/`run_final_evaluation.py` exist (Day 8).
- Flag 6 (CSD loss scale vs task loss) — `combined_student_loss` already logs every component (`L_task`, `L_aux`, `L_logit_KD`, `L_CSD`, `L_total`) per call; confirmed in the smoke test output (e.g. `L_CSD=0.06` vs `L_task=0.92` on an untrained model — worth watching once real training starts, per the doc's original concern about CSD's gradient contribution being negligible). `train_student.py` (Day 6-7) needs to persist these logs per-epoch, not just print them.

**Fix if time allows (P1, do after RQ1 is answered):**
- Flag 8 (internal vs external dual-view gain) — report both if possible, otherwise clearly label which one you're reporting.
- Flag 11 (clustered per-patient bootstrap for the 3-seed comparison).
- Flag 14 (stratified group split) — partially addressed already: `make_splits.py` verifies (doesn't yet stratify) grade distribution per split, confirmed all 5 grades present in train/val/test (see Day 1 log below). True stratified splitting is P1, not done.

**State as explicit written limitations (don't try to fix in code, per judge.md Section H):**
- No clinical validation, single dataset, CSD as proxy not causal evidence, fixed single teacher checkpoint, image-quality confounding unexamined, weighted-BCE outputs not calibrated probabilities.
- Use the judge's exact "safe sentences" from Section I of `judge.md` in the actual paper — they're already calibrated to not overclaim.

---

## Phase Overview

```
Day 1  (Aug 6)                 → Setup + Gate 0 fixes + Gate 1 (dataset) — DONE
Day 2  (Aug 7)                 → Pretrain APTOS backbones (resnet50 + lightweight)
Day 3–4 (Aug 8–9)              → Teacher training + Gate 2
Day 5  (Aug 10)                → Smoke test + single-view baselines
Day 6  (Aug 11)                → dual_no_distill + dual_logitkd (3 seeds, parallel)
Day 7  (Aug 12)                → CSD implementation + Gate 3 + grid search + RQ2 go/no-go
Day 8  (Aug 13)                → PTQ (if go) + full evaluation + Gate 4/5 + bootstrap stats
Day 8.5–9 (Aug 13 night–14 AM) → Paper writing, figures, buffer
Aug 14                         → Submission
```

This is the technical doc's Section 15 plan compressed from 10 slots to 8, with the validation-sprint fixes absorbed into Day 1 and the paper-writing day shortened. **The single biggest risk in this compression is Day 3–4 (teacher training) slipping** — it has no buffer before it. If teacher training isn't converging by mid-Day 4, that's your signal to cut RQ2 immediately rather than waiting until Day 7.

---

## Day 1 (Aug 6) — DONE

**Goal:** repo is in a state where training *could* start tomorrow with no unresolved ambiguity. Achieved — see `experiment/` for the actual code.

- [x] Decision Point #0 (dataset) resolved — DRTiD primary. `_1` = Macula / `_2` = Optic disc confirmed both from `reference/CrossFiT/CrossFiT/dataset.py` (the CrossFiT authors' own loader reads it this way) and by the team directly.
- [x] Environment fixed and pinned: local numpy/scikit-learn ABI mismatch resolved (scikit-learn upgraded to 1.9.0, numpy 2.2.6), `experiment/requirements.txt` written with exact pins. Note: local torch is a **CPU-only build** (2.10.0+cpu) despite a GPU being present — fine for the dev/smoke-test work done today, but Day 3–4's real teacher training needs either a CUDA-enabled torch install or to run on Colab/Kaggle (the technical doc's own Section 1.1 note already anticipated running the full pipeline there). Decide this before Day 2 ends.
- [x] `experiment/scripts/make_splits.py` — reads DRTiD's official `a. DR_grade_Training.csv` (1000 rows) / `b. DR_grade_Testing.csv` (550 rows) as-is, carves a patient-wise train/val split out of the training rows only (800/200), verifies no patient overlap anywhere, verifies every image path resolves, reports grade distribution. **Run and passing** — Gate 1 output:
  - train (800): Grade 0=394, 1=72, 2=194, 3=109, 4=31
  - val (200): Grade 0=88, 1=18, 2=66, 3=21, 4=7
  - test/official (550): Grade 0=265, 1=50, 2=146, 3=69, 4=20
  - All 5 grades present in every split. No overlap. **Gate 1: PASSED.**
- [x] `experiment/src/models.py` — `CORALHead` with ordered-bias parameterization (monotonic by construction, bias steps initialized at -3.0 per judge.md Flag 16), `DualViewResNetTeacher`/`DualViewLightStudent` both with `forward_single()`, and a `counterfactual_forward()` on both (same `main_head` used for dual/macula-only/disc-only via zeroed branches) implementing the judge.md Flag 1/3 fix.
- [x] `experiment/src/losses.py` — `coral_loss`, `aux_loss`, `logit_kd_loss`, `csd_loss` (all 3 variants: `smoothl1` default, `direction_magnitude`, `kl_softmax` ablation-only), plus `csd_loss_no_aux_gradient` (Flag 3 mitigation: detaches student aux outputs so CSD can't be gamed by drifting auxiliary heads), `get_student_output` (the one place view_mode selects the forward path), `combined_student_loss` (supports both the default head-based Delta and the counterfactual Delta via a flag), `ordinal_violation_rate`.
- [x] `experiment/src/utils.py` — `compute_pos_weights` with the zero-positive/zero-negative guard (raises instead of a silent nonsense weight), `set_seed`, `seed_worker` + `make_generator` for DataLoader reproducibility, `get_device`, `ensure_dir`.
- [x] `experiment/src/smoke_test.py` — runs a real DRTiD batch through teacher + student, all three `view_mode`s, the counterfactual CSD path, backward pass, and `compute_pos_weights`. **Run and passing.**
- [x] Horizontal flip: **left out of the augmentation pipeline entirely** (`experiment/src/datasets.py`), not just defaulted off — confirmed the CrossFiT reference implementation itself has flip code present but commented out, i.e. the DRTiD benchmark's own authors made the same call.
- [x] `ensure_dir`/`os.makedirs(..., exist_ok=True)` pattern in place, used by scripts that write checkpoints/splits.
- [x] Configs for teacher + all 5 student conditions + both pretrain runs written under `experiment/configs/`.

**Bug caught and fixed today (would otherwise have surfaced on Day 8):** eager-mode `torch.ao.quantization.fuse_modules` has no fuser method for Conv-BN-**ReLU6** — reproduced directly against `LightweightBackbone`, matching judge.md Code issue 4's prediction exactly. Fixed by switching the student backbone's activations from `ReLU6` to `ReLU` (natively supported by the default fuser list), avoiding a forced fallback to FX-graph-mode quantization for something this cheap to sidestep. `fuse_model()` now runs clean.

**Resolved same day (still Aug 6, ahead of schedule):**
- [x] **Local vs Colab/Kaggle for training: Colab/Kaggle wins.** Local GPU is 4GB VRAM on a driver capped at CUDA 11.6; modern torch wheels bundle CUDA 12.1+, so a working local CUDA install would cost hours fighting driver/wheel compatibility with no guarantee of success. Local stays CPU-only for dev/smoke-testing (where it's already proven itself today); real training moves to Colab/Kaggle's free GPUs.
- [x] Decision Point #1 (judge.md fix scope) locked in as originally recommended — see above, now marked as actually-implemented, not just planned.
- [x] `experiment/src/pretrain_aptos.py` written — pretrains resnet50 (teacher) and lightweight (student) backbones separately via `build_backbone()`, saves on best val QWK. **Dry-run verified** against real APTOS data (2930 training images) locally on CPU — one training step, forward + backward, confirmed working before handing off to Colab/Kaggle for the real 20/30-epoch runs.
- [x] `full_pipeline_notebook.ipynb` written at repo root — Colab/Kaggle-runnable, covers dataset upload/mount, dependency install (keeps the platform's own CUDA-enabled torch rather than reinstalling), Gate 1 split check, smoke test, and both pretrain runs. Cells for Day 3+ scripts are stubbed with a note to fill in as those scripts get written.

**Still open, carry into Day 2:**
- [ ] Actually execute the notebook on Colab/Kaggle — needs the dataset uploaded there (notebook has both a Drive-mount and a Kaggle-dataset-attach path; pick one per team member's setup).
- [ ] `train_teacher.py`, `train_student.py`, `evaluate.py`, `quantize.py`, `run_final_evaluation.py`, `aggregate_seeds.py` are not written yet — Day 3+ work per the original schedule.

**Gate 1 (Dataset): PASSED.**

---

## Day 2 (Aug 7) — Backbone pretraining

**Goal:** two pretrained backbone checkpoints ready (ResNet-50 for teacher, lightweight depthwise-separable backbone for student). These are hard prerequisites for Day 3 and Day 6 — DeepDRiD/DRTiD alone is too small to train a backbone from scratch.

- [ ] Run `pretrain_aptos.py` with `backbone_type: resnet50` config → `aptos_resnet50_backbone.pt`.
- [ ] Run `pretrain_aptos.py` with `backbone_type: lightweight` config → `aptos_lightweight_backbone.pt`.
- [ ] Commit both checkpoints' metadata (val QWK, epoch, date) — not just the binary — so it's traceable which run produced which checkpoint (Section 12).
- [ ] Sanity-check: pretraining val QWK should clearly beat a majority-class baseline. If it doesn't, don't proceed to Day 3 with a broken backbone — debug now.

**Parallelizable:** with 3 people, one person can run both pretrain jobs sequentially (they're on different data/config, not truly independent GPU jobs unless you have 2 GPUs) while the other two start drafting the paper's Background/Related Work sections (Bagian 1–3 of `overview.md` are already close to final prose — this is genuinely free time to bank).

---

## Day 3–4 (Aug 8–9) — Teacher training

**Goal:** `teacher_final.pt` passes Gate 2.

- [ ] Load the APTOS ResNet-50 backbone checkpoint into the teacher.
- [ ] Two-stage training: freeze backbone + train heads (5 epochs), then unfreeze + fine-tune everything (15 epochs), per Section 6 config (`freeze_epochs: 5`, `finetune_epochs: 15`, `patience: 5`).
- [ ] Checkpoint on **best val QWK**, not final epoch (already fixed in v2 — just don't regress this when adapting the script to your actual dataset).
- [ ] Instrument the gradient-norm logging now (judge.md Flag 6 prep) even though CSD doesn't exist yet — you'll want the ordinal-loss and aux-loss gradient norms as a baseline comparison point once CSD is added on Day 7.

**Gate 2 check before moving to Day 5:**
- [ ] `QWK_dual(teacher) > max(QWK_macula(teacher), QWK_disc(teacher))`
- [ ] Both auxiliary heads (macula, disc) clearly beat majority-class/random performance.
- [ ] **If Gate 2 fails:** do not proceed to student training. Likely causes: `lambda_aux` too small, insufficient epochs, or data leakage making single-view "too easy" (re-check patient-wise split). This is the highest-risk gate given the 8-day compression — if you're still debugging Gate 2 by end of Day 4, immediately downgrade RQ2 to "not attempted" and reallocate that day to protect RQ1.

---

## Day 5 (Aug 10) — Smoke test re-run + single-view baselines

- [ ] Re-run `smoke_test.py` against the real teacher checkpoint (not just synthetic data) — confirms nothing changed shape-wise since Day 1.
- [ ] Train `macula_only` and `disc_only` student baselines (1 seed each — these aren't part of the core RQ1 comparison, so 1 seed is acceptable per Section 8.2).
- [ ] Confirm these single-view students are genuinely trained via `forward_single()` (i.e., backbone only ever sees one image) — check this explicitly, since this exact bug (single-view baseline secretly training the dual head) was Critical Issue #1 in v1 of the technical doc.

---

## Day 6 (Aug 11) — Core baselines: no-distill and standard KD

**Goal:** `dual_no_distill` and `dual_logitkd`, each × 3 seeds (42, 123, 2026).

- [ ] Run `dual_no_distill` × 3 seeds.
- [ ] Run `dual_logitkd` × 3 seeds.
- [ ] With 3 people: split by condition × seed rather than by script — e.g., each person owns one full condition (all 3 seeds) so results are self-contained per person and easy to merge.
- [ ] **Commit config + split files to the shared repo before running anything in parallel** (Section 15.1's explicit warning) — the fastest way to lose a day on this timeline is three people training against three subtly different local splits.

---

## Day 7 (Aug 12) — CSD implementation, Gate 3, grid search, RQ2 go/no-go

This is the highest-density day. Sequence matters.

- [ ] Implement `csd_loss()` with all three variants: `smoothl1` (default), `direction_magnitude`, `kl_softmax` (ablation only) — per Section 5.4.2.
- [ ] Also implement the **same-head counterfactual CSD** as a distinct condition (judge.md's strongest recommendation) — this doesn't have to be part of the main grid, but at minimum run it once at default hyperparameters as evidence for or against Flag 1's concern.
- [ ] **Gate 3 check** (on one validation batch, before full training):
  - [ ] Mean L1 norm of `Δ^T` is not ≈0 (if it is, teacher isn't showing complementarity signal — go back to Gate 2, don't burn Day 8 on CSD training that has nothing to learn from).
  - [ ] `Δ^T` isn't concentrated entirely on one threshold (would suggest an artifact rather than genuine complementarity).
- [ ] Grid search `csd_variant` × α × β on **1 seed only** against Set B (per Section 8.6 table — 4 combinations listed). **Fix the search space now and don't add combinations after seeing results** (judge.md Flag 13 — validation-set overfitting risk is real with this few seeds).
- [ ] Pick the winning combination, then run `dual_csd` × 3 seeds (42, 123, 2026) at that fixed config.
- [ ] Log gradient norms for `L_ordinal`, `L_KD`, `L_CSD` during this run (Flag 6) — if CSD's gradient contribution is negligible relative to task loss, that's a finding to report/adjust now, not something to discover after all seeds finish.
- [ ] **End-of-day RQ2 go/no-go decision:** if Day 3–4 or Day 7 slipped at all, explicitly decide as a team to skip PTQ and mark it future work in the paper (per the doc's own Section 15.1 "Aturan Emas"). RQ1 fully answered beats RQ1 + RQ2 half-answered.

---

## Day 8 (Aug 13) — PTQ (if greenlit), final evaluation, gates, stats

- [ ] **If RQ2 is a go:** run `fuse_model()` → `prepare()` → calibrate → `convert()` (eager mode, Section 10.1). If it fails or produces implausible results, fall back to FX Graph mode (Section 10.2) — don't spend more than ~2 hours total debugging eager mode before switching.
- [ ] Verify INT8 conversion actually happened: `print(quantized_model)` should show `QuantizedConv2d`, not `Conv2d` (Gate 5).
- [ ] Verify model size via TorchScript save, not just `state_dict()` size (judge.md Flag on Section 10.3) — compare both numbers, report the discrepancy if large.
- [ ] Run `run_final_evaluation.py` across **all** conditions (teacher, macula_only, disc_only, dual_no_distill×3, dual_logitkd×3, dual_csd×3, dual_csd_int8 if applicable) → `all_conditions_raw.csv`.
- [ ] Run `aggregate_seeds.py` → mean±std per condition.
- [ ] **Gate 4 check (RQ1):** does `dual_csd` beat `dual_no_distill`, stay competitive with/beat `dual_logitkd`, preserve dual-view gain closer to the teacher's, and not increase severe error rate? If not — that's still a reportable, honest negative result per the doc's own philosophy. Don't force a positive framing that the numbers don't support.
- [ ] Compute clustered (per-patient) bootstrap 95% CIs for the QWK differences between `dual_csd` and the two baselines (judge.md Flag 11) — "higher" isn't a claim until the CI excludes zero.
- [ ] Only touch the test set (Set C / whatever your final holdout is) **once**, today, across all conditions simultaneously — never peek at it during the Day 7 grid search.

---

## Day 8.5 – Day 9 (Aug 13 evening – Aug 14 morning) — Writing & buffer

- [ ] Fill in Results tables/figures from `all_conditions_aggregated.csv`.
- [ ] Write the Limitations section using judge.md Section H almost verbatim — it's already calibrated language a judge won't push back on.
- [ ] Replace any draft sentence matching judge.md Section I's "Hindari" column with its "Gunakan" alternative (e.g., never say "CSD proves the model understands anatomical complementarity" — say it's "an operational proxy for the decision change associated with learned dual-view fusion").
- [ ] Explicitly state whichever P1 items from Decision Point #1 you didn't get to as limitations, not omissions.
- [ ] Final read-through against the judge's rubric implied by `judge.md` — someone on the team who *didn't* write the results section should be the one to check the claims against the actual numbers.
- [ ] Submit with margin before the deadline, not at the deadline.

---

## Standing rules (apply every day, not just once)

- **Gates are hard stops.** Section 14 of the technical doc defines 5 gates; don't move to the next phase on a red gate hoping it'll sort itself out later — every past issue in this project's own revision log (v1→v2) was exactly this pattern.
- **Commit shared state before parallel work.** Config files and split CSVs go into the repo before anyone launches a training job that depends on them.
- **3-seed protocol is only for the three core RQ1 conditions** (`dual_no_distill`, `dual_logitkd`, `dual_csd`). Everything else (teacher, single-view baselines, INT8) is 1 seed — don't burn time seed-averaging things that don't need it.
- **Track gradient-norm logs from Day 3 onward**, not just at the end — retrofitting instrumentation after training completes means re-running jobs you don't have time for.
- **When in doubt about time, cut scope, not rigor.** The order to cut, if the schedule slips: (1) RQ2/PTQ first, (2) P1 judge.md fixes second (downgrade to written limitations), (3) never cut Gate 1/2/3 checks or the 3-seed protocol on the three core conditions — those are what make RQ1's answer credible at all.
