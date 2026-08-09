# DR-VERGE — FINAL PROTOCOL (locked)

**Notebook:** `experiment/full_pipeline_notebook_final.ipynb` (84 cells: 58 code, 26 markdown)
**Supersedes:** `full_pipeline_notebook_rev3.ipynb`
**Implements:** `revision/dr-verge-rev.md` (all 64 sections) + `revision/rev-final.md` audit (all 23 P0 + 12 P1 items), on top of the validated rev3 core
**Locked:** 8 Agustus 2026

> **Freeze rule.** After the first full Run-All: genuine bugs may be fixed and documented. Poor
> results are **not** grounds to change the method, the losses, the seeds, or the selection rule.
> A weak CSD result, a weak DeepDRiD result, or PTQ beating QAT all get reported as measured.
> That constraint is what makes the experiment credible.

---

## 1. Research questions

**RQ1 — Knowledge transfer.** *To what extent can Complementarity-Shift Distillation transfer the
dual-view decision benefit of a two-field teacher to a lightweight student, compared with no
distillation, standard logit distillation, and feature distillation?*

Evaluated on two independent axes so the result is informative either way:
- **Predictive:** QWK (primary), Accuracy, Macro-F1, MAE, Severe-Error Rate
- **Mechanistic:** ShiftL1 / ShiftMAE, CosAgree, BenefitCorr (Pearson + Spearman), internal & external dual-view gain

*QWK(CSD) ≈ QWK(KD) with ShiftFidelity(CSD) > ShiftFidelity(KD)* is a finding. *CSD failing on both*
is also a valid answer. **CSD is not to be called successful on mechanism metrics alone.**

**RQ2 — Quantization / deployment.** *To what extent can INT8 PTQ and QAT reduce model size and CPU
latency while preserving categorical and ordinal grading performance of the best lightweight
dual-view model?* Compares `M*_FP32` vs `M*_PTQ-INT8` vs `M*_QAT-INT8`.

## 2. Hypotheses

- **H1a** CSD > no-distillation on QWK. **H1b** CSD ≥ logit-KD. **H1c** CSD ≥ feature-KD.
- **H1d** CSD achieves lower ShiftL1 / higher CosAgree / higher BenefitCorr than non-CSD conditions.
- **H2a** PTQ retains ≥95% of FP32 QWK. **H2b** QAT ≥ PTQ on QWK retention. **H2c** Both reduce size
  and CPU latency materially.

*None of these are assumed. All may be refuted.*

## 3. Datasets

| Role | Dataset | Use |
|---|---|---|
| Primary development | **DRTiD** | training, hyperparameter selection, ablations, internal test |
| Backbone pretraining | **APTOS 2019** | single-view pretraining only |
| External confirmatory | **DeepDRiD** | frozen evaluation only — no tuning, no selection, evaluated last |

Verified split: train 800 / val 200 / test 550 eyes; all 5 grades present in every split; zero ID
overlap; every image path resolves.

**Two documented caveats, neither hidden:**
1. DRTiD's `ID` is a per-**eye** identifier — every ID appears exactly once and none carries both an
   `L` and `R` row. Splits and bootstrap clustering group by `ID` because it is the finest key the
   public data provides. Report as *"clustered by record ID"*, **not** *"patient-wise"*.
2. DeepDRiD's CSVs contain no column stating which of `_1`/`_2` is macula- vs disc-centred. A
   **primary ordering is pre-registered** (`_1=macula`, matching DRTiD's documented convention); the
   reverse is evaluated and reported as a labelled **sensitivity** analysis. The higher-scoring
   ordering must not be promoted to the headline after the fact. Pairs are built from the CSV's
   actual `image_id`/`image_path`, not a guessed filename pattern. Verified: **797 eyes / 399
   patients, 0 unresolved paths**, all 5 grades, under both orderings.

## 4. Metrics

**Primary:** QWK — single, declared in advance. Everything else is secondary/supplementary; the
paper must not present all metrics as primary.

- *Ordinal*: QWK, MAE, Severe-Error Rate, Ordinal Violation Rate
- *Categorical*: Accuracy, Balanced Accuracy, macro/weighted Precision·Recall·F1
- *Per grade*: Precision, Recall (sensitivity), F1, Specificity (one-vs-rest), Support, Predicted count
- *Calibration*: `OrdinalThreshold_Brier`, `OrdinalThreshold_ECE`, per-threshold ECE, reliability curves
  (named precisely — these pool the K−1 cumulative thresholds and are not conventional multiclass ECE)
- *Mechanism*: `ShiftL1` (mean L1 norm) and `ShiftMAE` (per-threshold), CosAgree,
  BenefitCorr (Pearson) + BenefitCorrSpearman, G_internal, G_external
- *Efficiency*: params, serialized size, compression ratio, size reduction %, mean/median/SD/p95/p99
  latency, throughput, speedup, memory
- *Retention*: `m_INT8/m_FP32 × 100%` for score metrics; **Δ** (not ratio) for error metrics

`fast_qwk` was verified to match `sklearn.cohen_kappa_score(weights="quadratic")` exactly.

## 5. Seeds (locked before running)

- **Core conditions** (no-distill, logit-KD, feature-KD, CSD): `42, 123, 2026, 3407, 8888` (5)
- **Baselines / ablations**: `42, 123, 2026` (3)
- **QAT + FP32-FT control**: `42, 123, 2026` (3) — `qat_training_seed` is recorded separately from
  the base model's seed, so a QAT run is never mislabelled with the FP32 model's seed
- **Inferential seed** (used where a single seed must be named): `42`, fixed in advance — never the
  best-performing one

Seeds are fixed in advance and never chosen based on results. `set_seed()` runs **before** every
model construction, so random initialization is genuinely controlled.

## 6. Experimental matrix

| Condition | Seeds | Purpose |
|---|---|---|
| Teacher FP32 | 1 | upper bound |
| macula_only / disc_only | 3 each | single-field baselines + **external gain reference** |
| dual_no_distill | 5 | lightweight baseline |
| dual_logitkd | 5 | standard KD |
| dual_featkd | 5 | representation-level KD control |
| **dual_csd** | 5 | **proposed method** |
| abl_csd_raw_smoothl1 | 3 | rev2 formulation ablation |
| abl_csd_kl_softmax | 3 | v1 formulation negative control |
| abl_csd_counterfactual | 1 | same-head Δ (judge.md Flag 1/3) |
| best_fp32 → PTQ INT8 | 1 | compression |
| best_fp32 → QAT INT8 | 3 | QAT robustness |
| **fp32_ft_control** | 3 | **isolates extra fine-tuning from quantization-aware adaptation** |

## 7. Hyperparameter space

**Every distillation method gets a matched, pre-registered grid** — selected on the inferential seed,
validation only, then the winner runs across all core seeds. Giving CSD a grid while fixing the
baselines' hyperparameters would make any CSD win attributable to tuning budget.

| Method | Grid |
|---|---|
| logit-KD | α ∈ {0.25, 0.5, 1.0} × τ ∈ {2, 4} (4 pre-registered points) |
| feature-KD | γ ∈ {0.1, 0.5, 1.0, 2.0} |
| CSD | variant × (α, β) — table below |

**CSD grid (fixed before any result seen, validation-only selection):**

| variant | α | β |
|---|---|---|
| smoothl1_norm | 0.5 | 0.1 |
| smoothl1_norm | 0.5 | 0.2 |
| smoothl1_norm | 0.5 | 0.5 |
| smoothl1_norm | 0.25 | 0.2 |
| magnitude_weighted_direction | 0.5 | 0.2 |

β range is set from a **measured** gradient ratio, not guessed: with the normalized loss, β=1.0 puts
the CSD gradient several times above the task gradient, so the grid brackets clearly-subordinate
through balanced. (rev2's grid, β∈{0.5,0.7} on the un-normalized loss, produced <1% of the objective
at every point and could not have found a working setting.)

**QAT:** start from best FP32 weights, fake quantization on, LR 3e-5, ≤10 epochs, patience 4,
validation-selected, then convert.

## 8. Model selection rule

```
M* = argmax QWK_val  over {dual_no_distill, dual_logitkd, dual_featkd, dual_csd}
tie (|ΔQWK| < 0.005) → higher Macro-F1 → lower Severe-Error → lower MAE → simpler method
```

**The test set is never consulted for selection.** The best CSD artifact is tracked separately so
RQ1's mechanism analysis has its model even if `M*` is not CSD.

## 9. Statistical analysis

- **Hierarchical paired cluster bootstrap over MATCHED seeds**, B = 10,000, percentile 95% CI. Each
  replicate resamples **clusters and seeds** with replacement and averages the per-seed paired
  difference — so seed-to-seed variance is propagated, and CSD's best seed is never compared against
  a baseline's first seed (which would also import selection bias).
- **p-values from a paired cluster permutation test** (method labels exchanged within cluster), not
  from a bootstrap sign proportion. Two-sided with the +1 correction, so p is never exactly 0.
- **Holm–Bonferroni** across the pre-registered primary QWK comparisons only.
- **Effect sizes with CIs** are the reported result — not bare p-values. A difference whose CI
  includes zero is **not** a claim.
- Clustering level is stated explicitly: DRTiD = **record/eye**, DeepDRiD = **patient**.

**Pre-registered comparisons only:**
- RQ1: CSD vs no-distill; CSD vs logit-KD; CSD vs feature-KD
- RQ2: PTQ vs FP32; QAT vs FP32; QAT vs PTQ; **QAT vs FP32-FT control**

## 10. Benchmark protocol (standardized, recorded with every measurement)

```
batch_size = 1     warmup = 50     runs = 500     threads = 1     device = CPU
```
(PREFLIGHT uses warmup=3, runs=10 to keep the rehearsal cheap while exercising the same code path.)

Latency is always measured on a **CPU copy** — no code path can time a CUDA model and label it CPU.
Size comparisons use **equivalent artifacts** (FP32 export vs INT8 export), never an FP32 training
checkpoint against an INT8 state_dict. CPU model, thread count, torch version and backend are
recorded in `environment.json`.

## 11. Gates

| Gate | Checks |
|---|---|
| 0 Environment | versions locked, backend + git commit recorded, `pip_freeze.txt` saved |
| 1 Dataset | pairing, labels, leakage, distribution, missing images, split SHA-256 |
| 2 Teacher | `QWK_dual > max(QWK_aux_macula, QWK_aux_disc)` (**blocking**) |
| 3 Student viability | all grades predicted, intermediate recall not collapsed, threshold spread valid |
| 4 CSD signal | Δᵀ non-trivial, gradient contribution adequate (**blocking**) |
| RQ completeness | no all-NaN required column for RQ1/RQ2 conditions (**blocking**) |
| 5 RQ1 comparison | predictive **and** mechanistic verdict |
| 6 PTQ integrity | INT8 operators genuinely present (checked by module **path**, not class name) |
| 7 QAT integrity | fake quantization active during training, final model genuinely converted |
| 8 Export | `torch.export` succeeds, ONNX succeeds, numerical parity checked |
| 9 External validation | DeepDRiD evaluated only after everything is frozen |

**Failures are reported, not silently downgraded.** A fallback path is always named explicitly.
Gates marked **blocking** raise `GateFailure` and stop the run in the real (non-preflight) mode — a
gate that only prints a warning is a log line, not a gate.

## 12. Outputs (everything is saved)

```
artifacts/
├── model_registry.csv
├── configs/         environment.json, pip_freeze.txt, config_locked.json,
│                    split_manifest.json (+SHA-256), per-run config JSONs
├── checkpoints/     pretrained backbones, teacher, every student run
├── models/          <name>/{checkpoint.pt, model.pt2, model.onnx, metadata.json}
└── results/
    ├── figures/     fig_01..fig_10 as .png (400dpi) + .pdf + .svg + _data.csv + _caption.txt
    ├── tables/      diagnostic / efficiency / quantization / csd_mechanism / statistical_tests
    │                / gate_report / headlines / external_validation / validation_scores
    ├── metrics/     all_conditions_raw.csv, all_conditions_aggregated.csv,
    │                confusion_matrix_{raw,normalized}_*.csv, prediction_collapse_warnings.csv
    ├── predictions/ per-sample CSVs (patient_id, true, pred, p_threshold_0..3, condition, seed,
    │                quantization) — any new metric can be recomputed without re-running inference
    ├── logs/        per-epoch history + gradient_contributions_<condition>_<seed>.csv
    ├── run_summary.json, rq1_verdict.json, deployment_verification.json
```

**Every figure has a companion CSV.** No number lives only inside an image.

## 13. Verified before locking

Executed against the real DRTiD data, not assumed:

- All 52 code cells compile.
- Gate 1 reproduces: 800/200/550, all grades, no overlap.
- CORAL unit tests: threshold spread **3.241 logits**, monotone, reproduces empirical marginals.
- Student **329,484** params (backbone 124,736) vs teacher 40,322,124 → **122×** compression.
- `fast_qwk` matches sklearn **exactly**.
- 49 metrics computed; collapse detector fires correctly on a constructed collapsed input.
- CSD gradient: `smoothl1_norm` grad-norm **186.96** vs rev2's `smoothl1` **0.86** (~216×).
- Paired cluster bootstrap: correct direction, CI excludes zero on constructed data.
- Holm correction: [0.001, 0.04, 0.6] → [0.003, 0.08, 0.6]. *(A real bug was found and fixed here
  during validation — the original used `m` before assignment.)*
- **PTQ**: 15 quantized modules; quantized `forward_single` works (needed for INT8 dual-view gain).
- **QAT**: 27 fake-quant observers active, forward+backward OK, converts to 15 quantized modules.
- `torch.export` save/load parity: **max|diff| = 0.00**.
- DeepDRiD loader: **792 eyes / 396 patients**, all 5 grades, both field orders.

## 14. Things not to do (from `revision/dr-verge-rev.md` §62)

- Do not drop QWK in favour of accuracy.
- Do not select models on the test set.
- Do not change hyperparameters after seeing DeepDRiD.
- Do not change the loss after this protocol is locked.
- Do not chase extreme compression with an unusable student.
- Do not claim QAT > PTQ before measuring it.
- Do not call CSD successful if only ShiftMAE improves.
- Do not call the model deployment-ready on the basis of size alone.
- Do not claim SOTA without a comparable protocol.
- Do not compare CrossFiT **accuracy** directly against DR-VERGE **QWK** — different quantities.
  Directional consistency (macula > disc; dual > either) is the defensible claim.
- Do not label every metric "primary".
- Do not ship a figure without its CSV.

## 15. Expected runtime

~39 student training runs (5 seeds × 4 core conditions, 3 × 2 single-view, 5 grid, 7 ablation) plus
2 backbone pretrainings, teacher training, QAT fine-tuning, PTQ, full evaluation with 500-run
latency benchmarks per condition, B=10,000 bootstraps, and 10 figures.

On a Colab Pro GPU expect **roughly 10–16 hours** end to end. All rev2/rev3 checkpoints are
architecturally incompatible and will be detected and retrained automatically; both APTOS backbones
re-pretrain because the student width changed.

## 15a. Output location & resumability

The notebook writes **only** into `{DRIVE_BASE}/artifacts/`. Earlier rev2/rev3 runs wrote to
`{DRIVE_BASE}/{checkpoints,results,splits}/`, which this notebook never reads or modifies — so old
results can be kept as a record of the defects that motivated these fixes, with no risk of stale
checkpoints being picked up. Only `{DRIVE_BASE}/dataset/` is shared and reused.

**Resumable after a Colab disconnect** (re-run from the top; completed work is skipped):

| Stage | Resumable | Mechanism |
|---|---|---|
| APTOS backbone pretraining | yes | `checkpoint_is_compatible()` |
| Teacher training | yes | `checkpoint_is_compatible()` |
| All ~39 student runs | yes | `checkpoint_is_compatible()` |
| QAT fine-tuning | yes | pre-conversion weights cached to `checkpoints/student/qat/` |
| PTQ | no (cheap, ~2 min: calibration only) | — |
| Evaluation / bootstrap / figures | no (~30–60 min) | recomputed from saved checkpoints |

That covers ~95% of the runtime. QAT resume was verified to reload, convert to the same 15
quantized modules, and produce numerically identical output (max\|diff\| = 0.0) versus a fresh run.

## 15b. Response to the `rev-final.md` audit

All 23 P0 and 12 P1 items were implemented and verified on real data. The consequential ones:

| Item | Fix |
|---|---|
| P0-1 fresh namespace | Artifacts go to `artifacts_{RUN_TAG}`; a new tag makes reusing a rev3 checkpoint impossible (`checkpoint_is_compatible` only checks key/shape) |
| P0-2 DRTiD `ID` ≠ patient | Renamed `record_id`; predictions carry `cluster_id` + `cluster_level`. DRTiD = `record_eye`, DeepDRiD = `patient` (documented there). Never called patient-clustered for DRTiD |
| P0-3 stratified split | `stratify=Grade`. Verified: max class-proportion deviation train↔val **0.0025** (was ~0.07) |
| P0-4 seed pairing | Hierarchical paired bootstrap over **matched** seeds, resampling clusters *and* seeds. No more best-CSD-seed vs baseline-seed-42 |
| P0-5 p-values | Paired **cluster permutation test** replaces the bootstrap sign proportion; Holm on primary QWK only |
| P0-6 CSD scale | Fixed **global** `s = E_train[abs(delta_T)]` from the frozen teacher, computed once and saved — no per-batch reweighting |
| P0-7 feature-KD | Projector now maps **student → teacher** against a detached (fixed) target |
| P0-8 fairness | Pre-registered validation grids for logit-KD (α, τ) and feature-KD (γ), matching CSD's budget |
| P0-9/10 PT2E | Real PT2E attempted (dynamic-batch export) with eager fallback; the path actually used is printed and stored. `quantization_coverage` works for both eager modules and PT2E graph nodes |
| P0-11/12 INT8 size/params | INT8 `state_dict` is serialized so size is a real number; `ParamCount` reports the **architectural** FP32 count |
| P0-13 INT8 dual-view gain | Computed on CPU for quantized models — the RQ2 sub-question is now answered |
| P0-14/16 QAT | `qat_training_seed` recorded separately from base-model seed; fake-quant modules asserted **before** fine-tuning, not inferred after conversion; QAT runs on 3 seeds |
| P0-15 QAT control | `fp32_ft_control`: identical LR/epochs/augmentation/early-stopping with fake quantization off, and `qat_int8 vs fp32_ft_control` is a pre-registered comparison |
| P0-17 gates | `record_gate(..., blocking=True)` raises `GateFailure`. Gate 2, Gate 4 and RQ-completeness block the real run |
| P0-18 APTOS thresholds | `APTOS_INIT_THRESHOLDS` from APTOS marginals (verified different from DRTiD's) |
| P0-19 seeding | `set_seed()` moved **before** every model construction |
| P0-20 deployment gate | Rebuilds a fresh object, loads `checkpoint.pt` **from disk**, and checks parity — not the live RAM object |
| P0-21 test wording | "not used for selection **within this locked run**; earlier development runs were inspected" |
| P0-22/23 DeepDRiD | Primary field ordering pre-registered; reverse is labelled `sensitivity`. Pairs built from actual `image_id`/`image_path`, with unresolved records counted |
| P1-24/25/26 | `ShiftL1` vs `ShiftMAE` named correctly; scipy Pearson **and** Spearman; `OrdinalThreshold_ECE/Brier` + per-threshold ECE |
| P1-27/28/29/30 | Memory benchmark wired in; Figure 2 (workflow) and Figure 11 (external generalization) added; Figure 4 retitled |
| P1-32 paired augmentation | `PairedDualViewTransform` replays the **same geometry** on both fields (verified), photometric jitter stays independent |
| P1-33/34/35 | Exact pinned versions; `predict_dr` loads once via `get_inference_model()` and returns `uncalibrated_confidence`; pre-registered deployment selection rule |

**PREFLIGHT mode (new).** `PREFLIGHT = True` runs the entire pipeline end-to-end at tiny scale
(1 seed, 1–2 epochs, small bootstrap, reduced benchmark) into `artifacts_preflight_v1`. It exercises
every stage — including PTQ, QAT, export, statistics, figures and the RQ-completeness gate — so a
structural failure shows up in ~1 hour instead of 12. **Run preflight first, confirm the gate report
is clean, then set `PREFLIGHT = False` and run the real thing.**

**Verified on real data during this revision:** stratification deviation 0.0025; blocking gates raise;
APTOS≠DRTiD thresholds; shared geometry replays identically while photometric stays independent;
global CSD scale is an explicit fixed input; feature-KD projects 224→2048 against a detached target;
matched-seed bootstrap reports `seeds 2v2` with a correct-direction CI; permutation p never exactly 0;
Holm [0.001,0.04,0.6]→[0.003,0.08,0.6]; PTQ coverage 88% (15/17 eligible ops) with the fallback
correctly reported; INT8 `state_dict` 0.957 MB (previously NaN); quantized `forward_single` works;
DeepDRiD 797 eyes / 399 patients with **0 unresolved paths** under both orderings.

## 15c. Response to the `rev-final-2.md` audit

Static audit **20/20**, runtime verification on real data **17/17**, cross-cell name resolution
**clean**, 58/58 code cells compile.

### P0 — had to be fixed before any run

| Item | What was wrong | Fix |
|---|---|---|
| sec.2 `_vl` blocker | `_vl` was built inside the teacher cell and `del`-eted at the end of it; `run_grid()` still referenced it, so Run All would have died with `NameError` at the **first grid point** | One persistent `VAL_LOADER` (+ `VAL_DS`) built next to the dataset definitions and never deleted. Gate 2, Gate 4, `run_grid`, `collect_val_scores` all use it |
| sec.3 scope mismatch | PT2E PTQ (global graph) vs eager QAT (backbone-only) — RQ2 would have confounded "PTQ vs QAT" with "different operator set" | **Both** RQ2 paths are eager backbone-only: same wrapper, same fused set, same qconfig family. `Gate6c_QuantScopeMatched` compares the two converted operator counts and reports any mismatch |
| sec.4 narrative ≠ code | Header claimed "PT2E/torchao primary" while `run_qat` was eager | PT2E is now explicitly the **supplementary** path (`ptq_int8_pt2e`, `used_in_RQ2: False`), stated that way in the header, the section markdown and `quantization_info.json`. `prepare_qat_pt2e` carries a comment saying it is an availability probe only |
| sec.5 `forward_single` | An exported GraphModule has no `forward_single`, so the internal dual-view gain would have crashed exactly when PT2E succeeded | `_predict_cpu_all()` reads `p_dual`/`p_macula`/`p_disc` from the dict `forward()` already returns — export-safe and 3× cheaper. Verified: the exported GraphModule returns the dict and has no `forward_single` |
| sec.6 `QAT_OK` precedence | `A and B or C` binds as `(A and B) or C`, so a cached run could pass the gate with an **unquantized** tree, and 1-of-3 seeds counted as success | `len(QAT_MODELS) == len(SEEDS_QAT)` **and** all quantized **and** all evidenced by fake-quant-during-training or a resume record. Gate 6 and Gate 7 now `blocking=not PREFLIGHT` |
| sec.7 RQ2 completeness | The condition list was derived from `RAW`, so a total PTQ failure removed PTQ from the question and the gate still passed | `EXPECTED_RQ2_CONDITIONS = [best_fp32, fp32_ft_control, ptq_int8, qat_int8]` — missing **conditions** fail the gate, not just missing columns |
| sec.8 unpaired bootstrap | `ia`/`ib` were drawn independently, so a "paired" replicate could contrast CSD seed 42 against logit-KD seed 8888 | `_seed_pairs()` pairs seed *s* with seed *s*; replicates resample **pairs**. Genuinely disjoint seed lists fall back to positional pairing and every affected row is stamped `matched_seeds=False` with a note |
| sec.9 size comparison | FP32 reported a *training checkpoint* (epoch, config, val_qwk); INT8 reported a pure `state_dict` | `serialized_state_dict_size_mb()` for **every** condition and precision. `TrainingCheckpointSize_MB` kept separately; `deployment_artifact_size_mb` in the registry |
| sec.10 quantized deployment | `builder=None` → `reloaded_from_disk=False`, so PTQ/QAT were never shown to be deployable | INT8 gets a real builder: rebuild the quantized **skeleton** (fuse → prepare → convert), then load `checkpoint.pt` into it. Verified bit-exact (`max abs diff = 0.0`). `Gate8b_ArtifactReload` reports `deployment_verified` per model |

### P1

| Item | Fix |
|---|---|
| sec.11 QAT deploy seed | `QAT_DEPLOY_SEED = argmax(validation QWK)`, used for the export, DeepDRiD row, Figure 10 and the registry. Previously seed `sorted()[0]` was exported but labelled `BEST_SEED` |
| sec.12 Figure 10 | Resolves the prediction file from `PRED_STORE`'s own keys, so the QAT curve cannot silently vanish when `BEST_SEED ∉ SEEDS_QAT` |
| sec.13 QAT control | `fp32_ft_control` is now the **same fused, QAT-prepared graph** with `disable_fake_quant` + `disable_observer` (asserted 27 → 0 active). Ordinary FP32 fine-tuning kept as `fp32_ft_plain`, secondary |
| sec.14 ECE naming | `ECE_threshold{k}` (which was mean\|p−y\|) → `Threshold{k}_MAEProb`, plus a genuine binned `Threshold{k}_ECE` |
| sec.15 throughput | `Throughput_pairs_per_s` (one inference = one eye = one pair) and `Throughput_images_per_s` = 2× |
| sec.16 method naming | `METHOD_LABELS` + `table_condition_labels.csv`; the ladder is *no distillation → logit-KD → logit-KD + feature-KD → logit-KD + CSD*, and the header says to write "CSD augmentation … over a standard logit-KD baseline" |
| sec.17 DeepDRiD | Training / validation / pooled evaluated separately; primary = **validation partition**; `Gate9b_DeepDRiD_PartitionDisjoint` checks patient overlap before pooling is trusted. Verified locally: 597 eyes/299 patients vs 200 eyes/100 patients, **overlap 0** |
| sec.18 coverage % | Demoted to an integrity check in code, markdown and `quantization_info.json`; gates require `quantized_ops > 0` only |
| sec.19 Δ wording | "**operational proxy of the dual-view decision shift**", not pure anatomical complementarity, in the header and the loss section |
| sec.20 run tag | `RUN_TAG = "final_locked_v1"` when `PREFLIGHT = False`, so the preflight namespace is never reused |

### Found by us, beyond the audit

* **Whole-module pickling of an eager-quantized model does not round-trip.** `torch.save(model)`
  succeeds but reloading raises `AttributeError: 'ConvReLU2d' object has no attribute '_modules'`.
  That is why the quantized reload rebuilds the skeleton and loads the `state_dict`; the pickled
  `model_object.pt` is kept only as a labelled fallback, and only for INT8 models.
* **A cross-cell name-resolution checker** (`nameorder_check.py`) was written and reproduces the
  sec.2 blocker on the pre-fix notebook, confirming the current one is clean.

### Known and accepted

* **INT8 compression is modest (~1.4× on the student `state_dict`), by design.** Only the CNN
  backbone is quantized (`torch.cat`, LayerNorm and CORAL's cumsum/softplus have no eager INT8
  kernels), and the backbone is ~125K of the student's ~330K parameters. The large compression story
  is teacher → student; the INT8 story is latency and mixed-precision deployability. Report it that
  way — do not widen the scope after seeing the number.
* **PT2E may fall back on some runtimes.** On a machine with only the `onednn` engine it converted
  0 ops; it is supplementary and non-blocking, and whichever happened is printed and stored.

## 16. Reading order when writing the paper

1. `tables/table_gate_report.csv` — did anything fail?
2. Gate 5 output / `rq1_verdict.json` — RQ1 on both axes.
3. `tables/table_quantization.csv` — RQ2 three-way comparison.
4. `tables/table_05_statistical_tests.csv` — effect sizes with CIs.
5. `tables/table_06_external_validation_deepdrid.csv` — external generalization.

Use `docs/judge.md` Section I safe phrasing throughout.
