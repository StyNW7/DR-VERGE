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

## 15d. Response to the `rev-fix.md` audit (post-preflight)

The first pre-flight ran end-to-end (**15/17 gates**). The two failures were PT2E (a moved import)
and student viability (deliberately undertrained 2-epoch models). Everything below is what the
successful run *revealed* — validity, statistics and hygiene problems that no gate could have caught
without real outputs.

**Verification of this revision:** rev-fix static audit **43/43**, rev-final-2 **20/20**, rev-final
**37/37**, runtime checks on real data **22/22**, cross-cell name resolution **clean**, 63/63 code
cells compile.

### P0 — required before the final run

| # | What was wrong | Fix |
|---|---|---|
| 1 | `choose_deployment_model()` read `RAW`, i.e. **DRTiD test** results — the test set was a selection set | New section 29b computes `RQ2_VALIDATION_RESULTS` and decides on validation, then sets `DEPLOY_CHOICE_FROZEN`; the test-side cell only *asserts* that flag |
| 2 | The `severe_error_must_not_credibly_worsen` clause consulted the **QWK** CI | `SevereErrorRate` is a bootstrap metric; the rule rejects a candidate when the 95% CI of ΔSER lies entirely above zero |
| 3 | `best_fp32`/PTQ on 1 seed vs QAT on 3 — `QAT_s ↔ FP32_s` was impossible | Every variant derives from `FP32_s` on all 5 core seeds: `FP32_s → {PTQ_s, QAT_s, FP32FT_s, FP32FT-plain_s → FT-PTQ_s}` |
| 4 | `M*` = the best single `(method, seed)` row out of 20 — a seed lottery with winner's curse | Two-stage: **method** by mean validation QWK, then a **checkpoint** within that method |
| 5 | Hyperparameters chosen on seed 42 alone | Grids scored as mean validation QWK over `SEEDS_TUNING = [42, 123, 2026]`, with a per-seed CSV |
| 6 | PTQ calibrated on a **shuffled 512-eye subset** — non-reproducible INT8 | `shuffle=False`, the full 800-eye training split, `ptq_calibration_manifest.csv` + SHA-256 |
| 7 | `PTQ ops == QAT ops == 15` treated as proof of identical scope | Sorted quantized **module paths** must match exactly; `Gate6c` is blocking. Verified: 15 modules, identical sets |
| 8 | `gnorm_aux = 0.0` — the probe used `fusion + main_head`, which the aux heads bypass | Two probe groups; the **shared backbone** is the apples-to-apples one. Measured: aux gnorm **0.4884** on the backbone vs **0.0000** on fusion+head |
| 9 | `float(tensor_requiring_grad)` warned on every batch | `.detach().item()` everywhere. Verified: **0** warnings |
| 10 | The CSD/task gradient ratio was measured before the teacher and the global scale existed | **Gate 4b** re-measures it with the frozen teacher, the real `CSD_GLOBAL_SCALE`, an APTOS-pretrained student and a β sweep |
| 11 | 210 `can only test a child process` DataLoader assertions | `DEFAULT_NUM_WORKERS = 0` everywhere; input data staged to local SSD, artifacts still on Drive |
| 12 | Determinism was opt-in per call | `FINAL_DETERMINISTIC = True` drives `set_seed`; cuDNN benchmark off, deterministic algorithms on (`warn_only`), `CUBLAS_WORKSPACE_CONFIG` set |
| 13 | `record_gate("Gate0_Environment", True, …)` — any environment passed | Validates torch/torchvision/numpy/sklearn/python versions, CUDA presence and a usable quant engine; blocking on the final run |
| 14 | Unresolved pip conflicts | `pip check` runs and is recorded. Conflicts are split: load-bearing packages block, unrelated pre-installed ones (tensorflow/streamlit) are reported via `Gate0b` |
| 15 | `No module named torch.ao.quantization.quantize_pt2e` (torch 2.11 moved it) | Imports from `torchao.quantization.pt2e` first, then the legacy path; still **supplementary**, never in RQ2. Verified working via torchao |
| 16 | Every ONNX export failed (`onnxscript` missing) | `onnxscript` installed; FP32 ONNX + ONNX Runtime parity is its own gate |
| 17 | One `Gate8_Export` hid ONNX and `.pt2` failures | Split: **8a** mandatory artifacts, **8b** FP32 ONNX + parity, **8c** optional `.pt2`, **8d** reload |
| 18 | The artifact-reload gate was advisory | `Gate8d_ArtifactReload` blocks on the final run |
| 19 | `predict_dr()` always served the FP32 student | Serves `DEPLOY_CHOICE`, rebuilt from its **exported artifact on disk** (INT8 via the quantized skeleton) |
| 20 | Gate 3 failed the whole study when any ablation missed a rare grade (15 flagged in preflight) | **3A** core dual-view students + `best_fp32`, incl. finiteness and ≥3 distinct grades → blocking; **3B** baselines/ablations/INT8 → reported |
| 21 | The primary metric had no reference test | `fast_qwk` checked against `cohen_kappa_score(weights="quadratic", labels=0..4)` on 105 cases. Max deviation **1.11e-16** |

### B — DeepDRiD

| # | Fix |
|---|---|
| 22 | `deepdrid_exclusion_audit.csv` names every dropped eye. Cause found: patients **77** and **164** have `left_eye_DR_Level`/`right_eye_DR_Level` **swapped** relative to image laterality, and 164's left eye has one field. A fourth anomaly surfaced that nobody had noticed — 164's right eye has **three** images — and is recorded as *kept* (`excluded=False`) rather than mislabelled as dropped |
| 23 | **Set-C** (`Online-Challenge1&2-Evaluation`) is now the PRIMARY confirmatory external test: 100 patients / 200 eyes, all five grades, 0 exclusions, labels in `Challenge1_labels.xlsx`. Patient IDs confirm zero overlap with Set-A (1–330) or Set-B (265–433). Set-B becomes *external validation* — honest, since its aggregate performance was already seen in the preflight |
| 24 | `_1=macula` stays primary. The preflight scored slightly better under the reverse ordering; switching on that basis would be post-hoc selection, so the reverse remains a sensitivity analysis |
| 25 | Patient-clustered bootstrap (B=10,000) on the primary partition for QWK/Accuracy/Macro-F1/MAE/SER, plus paired PTQ−FP32, QAT−FP32, FT-PTQ−FP32, QAT−PTQ |
| 39 | `Gate9_ExternalValidation` and `Gate9c_DeepDRiD_ExclusionAudit` block on the final run |

### C–E — statistics, CSD, QAT

| # | Fix |
|---|---|
| 26–27 | RQ1's matched-seed bootstrap is unchanged. With the per-seed RQ2 design every comparison has common seeds, so the positional fallback is unreachable; if it ever fires it prints a warning and stamps `matched_seeds=False` |
| 28 | Holm is applied **within** each pre-registered family (RQ1: 3 hypotheses, RQ2: 5). Verified: p=0.01 → 0.0300 within RQ1 vs 0.0700 if all 8 were pooled |
| 29 | Effect sizes with CIs remain the headline; p-values secondary |
| 30 | `compute_shift_fidelity(..., counterfactual=True)` scores every dual-view student in same-head space too, so the counterfactual ablation is judged in the objective it was trained on. Verified: ShiftL1 0.9461 (three-head) vs CF_ShiftL1 0.7024 |
| 31–32 | Δ stays an *operational proxy*; "student variability is conditional on a fixed teacher checkpoint" is stated in the loss section |
| 33 | QAT learning rate chosen from `{1e-5, 3e-5, 1e-4}` on validation over the tuning seeds; the FP32 control inherits the identical setting |
| 34 | `ft_ptq_int8` answers "is adapting to quantization noise better than fine-tuning *then* quantizing?" |

### F–G — hygiene and deployment

| # | Fix |
|---|---|
| 35 | `RUN_TAG = "final_locked_v2_20260809"`; preflight uses `preflight_v2`. No old namespace is reused |
| 36 | `PROTOCOL_HASH` = SHA-256 over the locked config + the three split files, stamped onto every dict checkpoint |
| 37 | `RESUME_EXACT=False` ignores all checkpoints; `True` reuses only hash-matching ones. This also covers the two prepared-graph caches (`run_qat`, `run_fp32_ft_control`), which previously resumed on `os.path.exists` alone |
| 38 | `CONFIG_SNAPSHOT` now carries teacher/student/QAT/PTQ configs, all seed lists, the pre-registered comparisons, the selection rule, determinism flags and the DeepDRiD protocol |
| 40 | `PeakRSS_MB` (a final sample) → `RSS_AfterInference_MB`, `ModelLoadRSSDelta_MB`, and a genuinely polled `PeakRSS_during_inference_MB`; the process-level scope is named in the output |
| 41 | Latency is the **median-of-medians** over 5 independent 500-inference blocks, with the between-block IQR reported |
| 42 | `models/selected_deployment/` holds the chosen artifact plus provenance: method, seed, quantization, validation/test/Set-C metrics, preprocessing, grade mapping, torch version, quant engine, protocol hash |
| 43 | `predict_dr()` returns `grade`, `grade_name`, `ordinal_scores`, `uncalibrated_score` (never "confidence"), `model_version`, `latency_ms` and a clinical `disclaimer` |

### Found by us, beyond the audit

* **The FT→PTQ control was silently broken when first written.** Mapping a QAT-prepared `state_dict`
  back onto a plain student transferred only **27 of 95** tensors — Conv-BN fusion renames every
  BatchNorm parameter, so they all kept their pre-fine-tuning values. The control would have been a
  hybrid. The remap was deleted; `FT-PTQ_s` is now built from an ordinary FP32 fine-tune of the plain
  student, verified to carry **95/95** tensors.
* **The cross-cell checker was upgraded** to catch module-level forward references *and* the harder
  case where a cell defines a helper and calls it in the same cell (validated on a synthetic case).
  Moving the deployment decision earlier had introduced exactly that, which it caught.
* **`fix_escapes.py`** normalises single-backslash escapes inside the build script's cell strings —
  the recurring cause of "unterminated string literal" at build time.

### Practical note: the final run is long

The locked protocol trains ≈ **99 models** (5 core seeds, 3 tuning seeds per grid point, 5-seed RQ2,
QAT LR grid). That will not finish inside one Colab session. The intended workflow is:

```
session 1:  PREFLIGHT=False, RESUME_EXACT=False   # fresh, artifacts_final_locked_v2_20260809
session N:  PREFLIGHT=False, RESUME_EXACT=True    # same RUN_TAG; finished models are skipped
```

Because reuse is gated on `PROTOCOL_HASH`, resuming can never mix protocols — if anything about the
configuration or the splits changed, every checkpoint is rejected and retrained.

## 15e. Response to `last-revision.md` — protocol **DR_VERGE_FINAL_V3**

Static audit **69/69**, runtime verification on real data **18/18** (plus 22/22 and 19/19 on the two
earlier suites, re-run against V3), cross-cell name resolution **clean**, 66/66 code cells compile,
**32 gates** of which **26 block** the final run.

### The bug that would have stopped the run

`robust_torch_save()` injected `protocol_hash` and `run_tag` into **any** dict it was handed. A raw
`model.state_dict()` is a dict, and the APTOS backbones and every deployment `checkpoint.pt` were
saved that way — so `load_state_dict()` would have raised
`RuntimeError: Unexpected key(s) in state_dict: "protocol_hash", "run_tag"` at the first student
training and again at the deployment reload gate. It never surfaced in the preflight because that run
predates the change. **Verified fixed:** a saved deployment artifact now contains 95 tensors and no
metadata keys, and loads cleanly.

### P0 — checkpoint and protocol integrity

| Item | Fix |
|---|---|
| P0-1 | `robust_torch_save` is side-effect-free; `save_training_checkpoint` writes an explicit envelope; `save_deployment_state_dict` writes a pure state_dict; `load_model_state` accepts either |
| P0-2 | APTOS backbones are proper training checkpoints; every load unwraps through one function |
| P0-5 | Every checkpoint carries `completed`. A run interrupted at epoch 8/40 is **retrained**, never skipped — verified |
| P0-6 | Atomic writes: `<path>.tmp` → `os.replace`, so a truncated file never takes the final name |
| P0-7 | `best = -np.inf` everywhere (QWK legitimately reaches −1) |
| P0-3 | `PROTOCOL_CONFIG` (scientific) is hashed; `RUNTIME_CONFIG` (preflight/run tag/resume) is not. **Verified**: identical hash with `RESUME_EXACT` False and True, so session 2 can reuse session 1 |
| P0-4 | Every grid, recipe, engine and rule is defined **before** `compute_protocol_hash()`. **Verified**: changing a CSD β moves the hash |
| P0-8 | One source of truth. `TEACHER_CFG` now says `finetune_lr=1e-5, patience=8` and `STUDENT_CFG` batch 16 — the values the trainers actually used — and every trainer is called with `**CFG` |
| P0-9 | Backbone freeze documented honestly: weights frozen, **BatchNorm statistics still adapt**. The paper says "backbone weights were frozen while BatchNorm running statistics were allowed to adapt", not "frozen backbone" |

### P0 — data

| Item | Fix |
|---|---|
| P0-10 | Gate 1 is blocking and checks schema, nulls, grade/laterality domains, duplicate IDs, duplicate image assignment, official train/test overlap, per-split disjointness, image existence, and the expected **800/200/550** |
| P0-12 | Split CSVs store `macula_filename`/`disc_filename`; the dataset joins `DRTID_IMAGE_ROOT` at runtime. **Verified**: the same protocol hashes identically from two different artifact namespaces |
| P0-13 | Split reuse verifies a recorded policy (seed, fraction, source hashes, split hashes) and rebuilds on any mismatch |
| P0-14 | New blocking `Gate1b_APTOS`: schema, unique `id_code`, train/val disjoint, grades 0–4 present, all images resolve, manifest + SHA-256 |
| P0-15 | The SSD cache is verified against a source file manifest every session; a mismatch deletes and re-copies, and the copy lands in a temp dir before being renamed into place |

### P0 — experiment control

| Item | Fix |
|---|---|
| P0-16 | The CSD grid searches **β and the variant only** — `alpha` and `tau` are inherited from the logit-KD winner, so "logit-KD" and "logit-KD + CSD" differ by exactly one term. **Verified**: `GRID_CSD` keys are `{beta, csd_variant}` |
| P0-17 | Every CSD ablation runs at the selected `alpha`/`tau`/`β`; only the formulation changes |
| P0-19 | Gate 4b reads the **actual** candidate βs and the real `alpha`/`tau`; new **Gate 4c** checks the selected configuration itself |
| P0-20 | Gate 4's threshold is labelled a numerical sanity criterion, never evidence of complementarity |
| P0-21 | `Gate3A_ValidationViability` runs on **validation, before the test set is opened**; `Gate3B_TestDiagnostics` is reported and never blocking |
| P0-22 | Single-view baselines on all 5 core seeds, so `G_independent` is formed within a seed |
| P0-23 | `G_aux` (own auxiliary heads) and `G_independent` (independently trained single-view) replace the ambiguous `G_external` |
| P0-24–27 | Blocking completeness: 3/3 tuning seeds per grid candidate (an incomplete candidate is INVALID, not partially credited), 5/5 core seeds, 5/5 RQ2 base, 5/5 for every RQ2 variant |

### P0 — statistics and quantization

| Item | Fix |
|---|---|
| P0-28 | Primary paired comparisons **raise** on unequal seed sets. Positional pairing survives only in `_seed_pairs_exploratory` — verified |
| P0-29 | The point estimate is the **observed** paired difference; `bootstrap_mean_diff` and `bootstrap_bias` are reported alongside |
| P0-30/32 | Permutations 10,000; the deployment-safety bootstrap 10,000 |
| P0-33 | Deployment selection is **fail-closed**: a missing severe-error row, a non-finite CI, an unmeasured latency, failed integrity or an incomplete seed set all reject. Previously a missing row read as "not worse" |
| P0-34 | 95% retention is described as a *pre-specified engineering retention criterion*, never a clinical margin |
| P0-35 | One symmetric rule picks every variant's representative seed on validation (QWK ↑ → Macro-F1 ↑ → SER ↓ → MAE ↓) |
| P0-36 | A QAT learning rate is valid only with 3/3 tuning seeds |
| AL | QAT early stopping, best checkpoint and LR grid are decided on the **converted INT8** model — the artifact that ships |
| AM | The QAT objective is task-supervised only; no KD/CSD continues into quantization, and the FP32 control uses the identical loss |
| AO | Backend resolved once (`x86` → `fbgemm` → `onednn`) and recorded in `PROTOCOL_CONFIG` |
| P0-38 | Coverage is measured against the **backbone** scope, with intended/actual/missing/unexpected paths. **Verified**: 13 eligible in the backbone vs 17 model-wide, so a correct run no longer looks partial |
| P0-39 | Operator-set equality is checked for **every seed** across PTQ/QAT/FT-PTQ |

### P0 — environment, external data, deployment

| Item | Fix |
|---|---|
| P0-42 | `CUBLAS_WORKSPACE_CONFIG` is set in the **first cell**, before `import torch` |
| P0-43 | `use_deterministic_algorithms(True, warn_only=False)` on the final run; `warn_only=True` only in rehearsal |
| P0-44/41 | Hardware provenance (GPU, CUDA, cuDNN, CPU, RAM, OS) recorded per session and stamped into every checkpoint; `requirements_final_exact.txt` written for later sessions |
| P0-48 | `RUN_CONFIRMATORY_SETC = not PREFLIGHT` — a rehearsal exercises the external pipeline on Set-B and **never opens Set-C** |
| P0-49 | Blocking `Gate9c_SetCCompleteness`: 100 patients / 200 eyes / 400 images. **Verified**: exactly that, 0 exclusions |
| P0-50 | `sample_id` is the eye (`347_l`), `cluster_id` is the patient (`347`) — verified |
| P0-51 | Set-C pairing requires exactly fields `{1, 2}`; anything else is audited under `MISSING_FIELD` / `DUPLICATE_FIELD` / `UNEXPECTED_FIELD_COUNT` |
| BN/BO/BP | FT-PTQ joins the reload gate and the registry; `deployable` requires `deployment_verified` |
| BQ/BR | `_deployment_builder(choice)` takes its argument; `STRICT_DEPLOYMENT` **raises** instead of silently serving FP32 under another model's name |
| BS/BT | `selected_deployment/` is populated only after reload + parity + stability pass, with protocol hash, metrics, preprocessing, artifact SHA-256s and hardware |
| BK/BL | The FP32 ONNX gate judges FP32 models only, over a fixed batch of 16 validation eyes, requiring identical predicted grades |
| P0-65 | `record_gate()` writes the report on **every** call, so it survives a blocking raise — observed working when Gate 0 correctly aborted a CPU-only test run |

### Documentation and figures

Figure 8's caption now matches what it plots (ShiftL1). Three figures added: **12** effect forest plot
with 95% CIs, **13** QWK-vs-size Pareto, **14** Set-C confirmatory comparison. The reading order names
**Set-C** as the confirmatory headline, and the grid description says 3 tuning seeds. A limitations
block is embedded in the notebook.

### Locked run configuration

```python
PROTOCOL_VERSION = "DR_VERGE_FINAL_V3"
PREFLIGHT             = False
RESUME_EXACT          = False        # True only to continue an interrupted session
RUN_TAG               = "final_locked_v3_20260809"
FINAL_DETERMINISTIC   = True
DEFAULT_NUM_WORKERS   = 0
RUN_CONFIRMATORY_SETC = not PREFLIGHT   # True on the final run
RUN_PT2E_SUPPLEMENTARY = False
STRICT_DEPLOYMENT     = not PREFLIGHT
```

A fresh run refuses to start inside a populated namespace: if checkpoints already exist under
`artifacts_final_locked_v3_20260809` and `RESUME_EXACT=False`, the notebook raises rather than mixing
old and new results.

### Stopping rules

Before the DRTiD test set is opened, a failed blocking gate means **stop**; fix the technical or
methodological error, increment `PROTOCOL_VERSION`, and use a new `RUN_TAG`. After the test set is
opened, nothing may change because of performance. After Set-C is opened there is no fine-tuning, no
threshold change, no field-order switch, no seed choice and no re-tuning — it is evaluation only.

## 16. Reading order when writing the paper

1. `tables/table_gate_report.csv` — did anything fail?
2. Gate 5 output / `rq1_verdict.json` — RQ1 on both axes.
3. `tables/table_quantization.csv` — RQ2 three-way comparison.
4. `tables/table_05_statistical_tests.csv` — effect sizes with CIs.
5. `tables/table_06_external_validation_deepdrid.csv` — external generalization.

Use `docs/judge.md` Section I safe phrasing throughout.
