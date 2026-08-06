# DR-VERGE — Project Roadmap & To-Do List

**Deadline:** 14 Agustus 2026 (submission) · **Today:** 6 Agustus 2026 · **Time left:** ~8 days
**Team:** 3 orang ("Sunib et al.") · **Sources:** `overview.md`, `[USED THIS] Technical Documentation.pdf` (v2), `judge.md` (external technical audit)

> This roadmap merges three documents that don't fully agree with each other yet. Where they conflict, this file states the conflict explicitly instead of silently picking one side — resolve those first, before writing training code.

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

## Decision Point #1 — Which judge.md flags get fixed vs. become stated limitations

`judge.md` lists 18 flags + 10 code issues. You cannot fix all of them in 8 days. The doc itself sorts them into P0/P1/P2 — use that, but with one adjustment: given your timeline, some P1 items should be downgraded to "state as a written limitation in the paper" rather than fixed in code. Recommended split:

**Must fix in code (non-negotiable — these invalidate RQ1 if skipped):**
- Flag 1 + Flag 3 (Δ conflates complementarity with head discrepancy; student can game CSD via auxiliary heads) → implement the **same-head counterfactual formulation** as at least one ablation condition. This is the single most important fix in the whole review.
- Code issue 1 (CPU latency evaluator measuring GPU) — one-line fix, no excuse to skip.
- Code issue 2 (INT8 evaluator is a placeholder) — must be completed if RQ2 is attempted at all.
- Flag 6 (CSD loss scale vs task loss) — log gradient norms per component from Day 1's smoke test onward; this is cheap to instrument and expensive to discover missing on Day 8.

**Fix if time allows (P1, do after RQ1 is answered):**
- Flag 8 (internal vs external dual-view gain) — report both if possible, otherwise clearly label which one you're reporting.
- Flag 11 (clustered per-patient bootstrap for the 3-seed comparison).
- Flag 14 (stratified group split — verify grade distribution per split, don't just trust `train_test_split`).

**State as explicit written limitations (don't try to fix in code, per judge.md Section H):**
- No clinical validation, single dataset, CSD as proxy not causal evidence, fixed single teacher checkpoint, image-quality confounding unexamined, weighted-BCE outputs not calibrated probabilities.
- Use the judge's exact "safe sentences" from Section I of `judge.md` in the actual paper — they're already calibrated to not overclaim.

---

## Phase Overview

```
Day 1  (Aug 6, rest of today)  → Setup + Gate 0 fixes + Gate 1 (dataset)
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

## Day 1 (today, Aug 6) — Setup, dataset resolution, P0 code fixes

**Goal:** repo is in a state where training *could* start tomorrow with no unresolved ambiguity.

- [ ] Decision Point #0 (dataset) is resolved — DRTiD primary, see above. Decide Decision Point #1 (which judge.md fixes) now and write it down.
- [ ] Set up environment: pin exact versions (`torch==2.x.y`, `torchvision==0.x.y`), save `pip freeze > environment-lock.txt` (judge.md Code issue 3 — don't skip this, quantization API stability depends on it).
- [ ] Build the DRTiD loader against its **verified real schema** (`dataset/reference.md`), using the official `a.`/`b.` split CSVs directly. Verify:
  - [ ] No `ID` appears in both `a. DR_grade_Training.csv` and `b. DR_grade_Testing.csv` (should be true by construction since it's the official split, but confirm rather than assume).
  - [ ] Spot-check ~10 rows that `<ID>_1.jpg` visually looks macula-centered and `<ID>_2.jpg` looks optic-disc-centered (fovea vs optic nerve head visible) — confirms the column mapping before it's baked into every downstream script.
  - [ ] Every `Macula`/`Optic disc` image ID in both CSVs resolves to a real file in `Original Images/`.
  - [ ] You still need your own **train/val split carved out of the official training 1000 rows** (patient-wise) since DRTiD only gives train/test, not train/val/test — do this split yourself and confirm no patient overlap between your val carve-out and the official test set.
- [ ] Implement `CORALHead` with **ordered-bias parameterization** (technical doc Section 3.1) — this guarantees monotonicity by construction, don't skip in favor of the free-bias version.
- [ ] Implement `forward_single()` on both teacher and student (Section 3.2/4.2) — required so single-view baselines actually only see one image, not a dual model with one input silently zeroed.
- [ ] Implement the **same-head counterfactual CSD variant** as a real code path now (judge.md Flag 1/3 fix) — even if you don't use it as the default, it needs to exist as an ablation before Day 7, and it's much cheaper to build alongside the main head-based version than to retrofit later.
- [ ] `compute_pos_weights()` for class imbalance (Section 2.4) — with judge.md's guard: raise an error (not a silently huge weight) if any threshold has zero positives.
- [ ] Write `smoke_test.py` (Section 11.4) covering model + loss + backward pass for all three `view_mode`s, and assert `OrdinalViolationRate == 0`. **Run it today**, not Day 5 — catching a shape bug now costs 10 minutes; catching it after a 2-hour training run costs half a day you don't have.
- [ ] Decide the horizontal-flip question (judge.md Flag under Section 2.3): does flipping change clinical meaning of macula/disc laterality for your chosen dataset? If unsure, **disable `HorizontalFlip` by default** until confirmed — safer default given the time pressure.
- [ ] `os.makedirs(..., exist_ok=True)` before every checkpoint/log/CSV write (judge.md Code issue 7) — cheap insurance, do it once now across all scripts rather than debugging a crash on Day 8.

**Gate 1 (Dataset) must be green before Day 2 starts.**

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
