# DR-VERGE — Simple Notebook, Final Version

Reference for `experiment/full_pipeline_notebook_simple.ipynb`.

Same experiment, same results, same outputs as `full_pipeline_notebook_final.ipynb` — without the
multi-session protocol machinery. Revised against every numbered item in
`revision/rev-simple.md` (80 items) and locked for the final run.

| | |
|---|---|
| Notebook | `experiment/full_pipeline_notebook_simple.ipynb` |
| Size | 69 cells (45 code, 24 markdown), 2,941 non-blank code lines |
| Protocol | identical to `DR_VERGE_FINAL_V3` in scientific content |
| Gates | 29 named + 1 parametric → **32 results in a full run** |
| Expected runtime | ≈ 4.9 h on a T4, one session (see `resource.md` §11) |

---

## 1. Before you Run All

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
RUN_TAG    = "final_locked_simple_v1_20260809"   # change for every NEW final run
QUICK      = False    # True = 1 seed, few epochs, Set-B external — a rehearsal
RESUME     = True     # continue an interrupted run in the same RUN_TAG
USE_AMP    = False    # mixed precision changes numerics; off for the locked run
```

**Recommended sequence.** Run once with `QUICK = True` on a throwaway `RUN_TAG` to prove every
stage executes (~15 min). Then set `QUICK = False`, choose a fresh `RUN_TAG`, and Run All.

`RESUME = True` is the default and is what makes an interrupted Colab session recoverable: reopen
the notebook, keep the same `RUN_TAG`, and Run All again. Everything already finished is reused.

---

## 2. Nothing is ever retrained from zero

Every training stage writes a checkpoint when it finishes and reuses it on the next run.

| Stage | Jobs | Checkpoint |
|---|---:|---|
| APTOS ResNet-50 pretraining | 1 | `checkpoints/backbone_resnet50.pt` |
| APTOS lightweight pretraining | 1 | `checkpoints/backbone_lightweight.pt` |
| Teacher | 1 | `checkpoints/teacher.pt` |
| Students (baselines, grids, core, ablations) | 75 | `checkpoints/student/<condition>/seed<seed>.pt` |
| QAT learning-rate grid | 9 | `checkpoints/finetune/QAT_s<seed>_lr<lr>.pt` |
| QAT final | 5 | `checkpoints/finetune/QAT_s<seed>.pt` |
| FP32 fine-tune control | 5 | `checkpoints/finetune/FP32FT_s<seed>.pt` |
| FP32 fine-tune (plain) | 5 | `checkpoints/student/fp32_ft_plain/seed<seed>.pt` |
| **Total** | **102** | |

The QAT and control stages previously retrained unconditionally — 24 fine-tune jobs, ~240 epochs,
redone on every restart. They now cache like everything else.

**Reuse is verified, not assumed.** `reusable_checkpoint()` reads the file back and loads it into a
freshly constructed model before accepting it. Three outcomes:

| Situation | What happens |
|---|---|
| Checkpoint loads and the condition matches | reused; recorded in `run_summary.json` under `checkpoints_reused_from_disk` |
| File truncated by a disconnect mid-write | deleted, stage retrained — instead of an exception 40 minutes later |
| Checkpoint belongs to a different condition | rejected, never silently inherited |

Splits and the image cache behave the same way: split CSVs are reused when present (so the split is
identical across sessions), and the cache is rebuilt in RAM each session, which costs a few minutes
and nothing scientifically.

### What `RESUME = False` is for

It refuses to write into an artifact directory that already exists. That is the one guarantee the
complex notebook's `PROTOCOL_HASH` was really buying: two different protocols can never end up
interleaved in one artifact tree. Use it when you intend a genuinely fresh `RUN_TAG` and want the
notebook to catch you if you forget to change it.

---

## 3. Everything the run saves

```
artifacts_<RUN_TAG>/
├── FINAL_RUN_COMPLETE.txt          written ONLY if every blocking gate passed
├── configs/
│   ├── config.json                 the full locked protocol
│   ├── environment.json            python/torch/CUDA/GPU/quant engine
│   ├── requirements_exact.txt      pip freeze
│   ├── split_manifest.json         SHA-256 per split file
│   ├── pretrain_{resnet50,lightweight}.json
│   ├── csd_scale.json              the fixed global CSD scale
│   ├── selected_hyperparameters.json
│   ├── model_selection.json
│   ├── ptq_calibration_manifest.csv + SHA-256
│   ├── quantization_info.json
│   └── quantized_modules_by_seed.json
├── splits/            drtid_train.csv (800) / drtid_val.csv (200) / drtid_test.csv (550)
├── checkpoints/       backbones, teacher, student/<condition>/, finetune/, size_probe/
├── models/
│   ├── teacher_fp32/  best_student_fp32/  best_csd_fp32/
│   ├── best_student_ptq_int8/  best_student_qat_int8/  best_student_ft_ptq_int8/
│   │      each: checkpoint.pt (bare state_dict) + model.onnx + model.pt2 + metadata.json
│   └── selected_deployment/   populated ONLY after artifact verification
└── results/
    ├── run_summary.json      one file that answers "what happened?"
    ├── deployment_choice.json, deployment_verification.json, rq1_verdict.json
    ├── tables/     24 CSVs (§6)
    ├── figures/    14 figures × (png + pdf + svg + _data.csv + _caption.txt)
    ├── metrics/    per-condition confusion matrices, raw metrics, delta distribution, audits
    ├── predictions/{validation,test,deepdrid}/    one row per sample
    └── logs/       per-job *_history.csv, pip_check.txt
```

### Checkpoints carry their own provenance

One envelope for every trainer:

```python
{"model_state": ..., "condition": ..., "seed": ..., "best_epoch": ...,
 "best_val_qwk": ..., "config": {...}, "run_tag": ..., "epochs_run": ...}
```

Deployment artifacts are the opposite — a bare `state_dict` under `models/*/checkpoint.pt`, so
anything can load them. The two are never confused, which also means model-size comparisons measure
the same kind of file for FP32 and INT8.

### Training histories

`logs/<condition>_seed<seed>_history.csv`, one row per epoch:

`epoch`, `train_total_loss`, `L_task`, `L_aux`, `L_logit_KD`, `L_CSD`, `L_feat_KD`,
the **weighted** contributions (`weighted_aux`, `weighted_logit_KD`, `weighted_CSD`,
`weighted_feat_KD`), `gradient_ratio_CSD_task`, `val_QWK`, `learning_rate`.

Terms a condition does not use are simply absent. The weighted columns are what the optimiser
actually saw — the raw CSD term alone does not show whether CSD mattered.

### Raw predictions

`results/predictions/{validation,test,deepdrid}/`, one row per sample:

`dataset`, `split`, `sample_id`, `cluster_id`, `cluster_level`, `true_grade`, `pred_grade`,
`condition`, `seed`, `quantization`, `p_gt0` … `p_gt3`.

Exactly the columns rev-simple item 11 requires, and the same columns for every model — FP32 and
INT8 rows are directly comparable. Any metric, bootstrap or interval can be recomputed from these
without re-running inference.

`sample_id` is the dataset's own identifier — the DRTiD record, or DeepDRiD `patient_eye` — never a
row position, which would renumber silently if a loader order ever changed. Both prediction paths
(`predict` on GPU, `predict_cpu` for quantized models) return it explicitly.

**Validation predictions are saved too.** Validation is what chose the hyperparameters, the method,
the checkpoint, the QAT learning rate and the deployment artifact; keeping those predictions only in
RAM would leave the entire selection chain unauditable after a kernel restart.

### Did the run actually finish?

`FINAL_RUN_COMPLETE.txt` exists **only** if execution reached the last cell with every blocking gate
passed. Its absence is unambiguous. `results/run_summary.json` holds `run_tag`, `completed_at`, the
full config and environment, the selection and deployment decision, RQ1 and RQ2 summaries, DRTiD
test and DeepDRiD headlines, all gate results, the reuse ledger, and every artifact path.

---

## 4. What changed in this revision

22 of the 80 rev-simple items required a code change. The rest were "keep this exactly as it is" —
they are checked just as strictly, because an audit that only looks at the deltas cannot notice a
LOCK being broken.

### Run integrity (items 8, 74, 75)

| Change | Why |
|---|---|
| Dated `RUN_TAG` + `RESUME` switch | a fresh namespace per final run, without losing the ability to resume |
| `reusable_checkpoint()` replaces bare `os.path.exists` | a truncated file is no longer mistaken for a finished job |
| `FINAL_RUN_COMPLETE.txt` | the cheapest possible "the run truly ended" signal |

### Provenance (items 3, 7, 10, 61, 63, 64)

| Change | Why |
|---|---|
| One `save_checkpoint()` envelope across all 4 trainers | weights without their condition, seed and config are not a checkpoint |
| `configs/environment.json` | reconstruct the environment without a lock framework |
| `configs/requirements_exact.txt` (`pip freeze`) | exact package versions |
| `logs/pip_check.txt` — **warning, never a gate** | Colab ships conflicts between packages this pipeline never imports |
| Pretraining histories gain train loss; all histories renamed `*_history.csv` | the objective is plottable afterwards |
| Weighted loss columns + `gradient_ratio_CSD_task` | shows whether CSD actually contributed |

### Predictions (items 11, 12, 46)

| Change | Why |
|---|---|
| Validation predictions written to disk | the whole selection chain becomes auditable |
| `predictions/{validation,test,deepdrid}/` | one folder per split |
| Real `sample_id`, returned explicitly by both prediction paths | the old external path used a row index |

### RQ2 framing and statistics (items 37, 40, 41)

RQ2's headline is **FP32 vs PTQ vs QAT**. The FP32 fine-tune controls answer a different question
(was it the quantization, or just the extra fine-tuning?) and now form their own supplementary
family, with Holm applied **within** each family.

Measured effect: a comparison at *p* = 0.01 adjusts to **0.030** in the primary family of 3, but
would have been **0.060** with the controls pooled in — the headline was paying a multiplicity
price for its own controls. `table_statistics_primary.csv` and `table_retention_main.csv` hold the
headline; the controls are marked `role = supplementary`.

### Gates and thresholds (items 56, 59, 71)

| Change | Before | After |
|---|---|---|
| ONNX parity | 1 sample, `< 1e-3` | **8–16 samples**, finite check, identical grades, **`< 1e-4`** |
| Selected deployment artifact | warning if unpublished | **blocking** `Gate12d_SelectedDeploymentPublished` — no silent FP32 fallback |
| Required-metric NaN guard | `isna().all()` | **`isna().any()`** — one seed missing QWK now fails instead of being averaged away |

### Rehearsal safety (items 66, 67)

`QUICK` now exercises the external pipeline on **Set-B**; Set-C is not even constructed, so the
confirmatory partition stays untouched until the final run. And a 1-epoch rehearsal only has to
produce a *finite* APTOS QWK — the full run still requires better than a majority baseline.

### Metrics (item 48)

`WeightedPrecision` and `WeightedRecall` were genuinely missing from `all_metrics` and are now
computed and reported. The suite is 43 metrics.

### Corrections

Two f-strings escaped their braces where they should have interpolated, so the log printed the
source text of a dict comprehension instead of its values — one in the student epoch line, one in
the `Gate11b_PartitionsDisjoint` detail. Both fixed. Figure 11's caption said "Accuracy against CPU
latency" while the figure plots QWK; corrected per item 54.

### Deliberately not added (item 78)

Protocol hashes, exact multi-session resume, PT2E, optimizer-state resume, Docker, Hydra, MLflow /
W&B, Ray Tune, distributed training, extra student architectures, pruning, INT4, TensorRT, new
datasets, additional CSD losses, another RQ, a calibration model, lesion segmentation,
interpretability. Each would lengthen the notebook without answering an RQ better.

---

## 5. Gates

29 named gates plus `Gate5_Grid_{tag}`, which fires once per hyperparameter grid — **32 results in a
full run**. **25 of the 29 names are blocking** when `QUICK = False` (`BLOCK = not QUICK`), so a
rehearsal reports problems instead of halting.

The four non-blocking ones, and why:

| Gate | Why it does not block |
|---|---|
| `Gate2a_CORAL`, `Gate2c_Smoke` | reported *after* hard `assert`s inside `test_coral()` / `smoke_test()` have already run — the assertion is the enforcement, the gate is the record |
| `Gate9_TestDiagnostics` | test-set findings are **diagnostic**; viability was already gated on validation, and blocking here would let test performance decide whether the experiment may continue |
| `Gate11b_PartitionsDisjoint`, `Gate11c_ExternalCIs` | reported for the record; Set-C structural completeness (`Gate11a`) and the external run itself (`Gate11_External`) are the blocking checks |

`Gate10_Statistics` was made blocking in this revision — an empty statistics table would otherwise
let the RQ1 verdict print "n/a" for every comparison and still finish, which reads like a null
result rather than a run that produced no evidence at all.

| Stage | Gates |
|---|---|
| Environment | `Gate0_Environment` |
| Data | `Gate1_DRTiD`, `Gate1b_APTOS` |
| Correctness | `Gate2a_CORAL`, `Gate2b_QWK_Reference`, `Gate2c_Smoke` |
| Teacher & CSD signal | `Gate3_TeacherDualView`, `Gate4a_CSD_Signal`, `Gate4b_SelectedCSD_Gradient` |
| Grids | `Gate5_Grid_{logitkd,featkd,csd}`, `Gate5_Grid_qat_lr` |
| Selection | `Gate6a_CoreSeedCompleteness`, `Gate6b_ValidationViability`, `Gate6c_OrdinalMonotonicity`, `Gate6d_RQ2BaseCompleteness` |
| Quantization | `Gate7a_RQ2Completeness`, `Gate7b_QuantScopeMatched`, `Gate7c_PTQ_Integrity`, `Gate7d_QAT_Integrity` |
| Results | `Gate8_RQ_Completeness`, `Gate9_TestDiagnostics`, `Gate10_Statistics` |
| External | `Gate11_External`, `Gate11a_SetC_Completeness`, `Gate11b_PartitionsDisjoint`, `Gate11c_ExternalCIs` |
| Deployment | `Gate12a_Artifacts`, `Gate12b_FP32_ONNX`, `Gate12c_ArtifactReload`, `Gate12d_SelectedDeploymentPublished` |

`table_gate_report.csv` is rewritten on **every** gate call, so a crash at gate 20 still leaves
gates 1–19 on disk.

---

## 6. Tables

| File | Contents |
|---|---|
| `table_gate_report.csv` | every gate, pass/fail, blocking, detail |
| `table_dataset_statistics.csv` | DRTiD eyes and grade counts per split |
| `table_grid_{logitkd,featkd,csd}.csv` + `_per_seed` | hyperparameter search, mean over 3 tuning seeds |
| `table_grid_qat.csv` | QAT learning-rate search |
| `table_validation_scores.csv` | per condition × seed validation metrics |
| `table_method_selection.csv` | stage-1 method selection |
| `table_predictive_performance.csv` | **main results table** (mean ± SD across seeds) |
| `table_csd_mechanism.csv` | ShiftL1, CosAgree, BenefitCorr, both dual-view gains |
| `table_statistics.csv` / `table_statistics_primary.csv` | Δ, 95% CI, permutation *p*, Holm *p* |
| `table_rq2_validation.csv`, `table_rq2_validation_per_seed.csv`, `table_rq2_validation_deltas.csv` | the validation evidence behind the deployment choice |
| `table_deployment_eligibility.csv` | why each INT8 candidate was accepted or rejected |
| `table_retention_main.csv` / `table_retention.csv` | RQ2 headline / with controls |
| `table_efficiency.csv` | params, size, latency percentiles, throughput, speed-up |
| `table_external_deepdrid.csv`, `table_external_ci.csv`, `table_external_paired.csv`, `table_external_partition_counts.csv` | DeepDRiD |
| `table_headlines.csv`, `table_condition_labels.csv` | quotable summary lines; paper labels |

---

## 7. Verification performed

| Check | Result |
|---|---|
| All code cells compile | **45/45** |
| Definition-before-use scan (A/B/C) | **clean** |
| Science parity vs the complex notebook | **67/67** load-bearing elements retained |
| rev-simple static compliance (80 items) | **79/79** verifiable items |
| rev-simple runtime dry-run on the real datasets | **24/24** |
| Original runtime dry-run (regression) | **18/18** |

Item 80 is the reviewer's own scoring table and has nothing to check.

Notable individual results:

- **Resume works and is safe.** A valid checkpoint reloads into a fresh model; a checkpoint from
  another condition is rejected; a file truncated mid-write is deleted and retrained
  (`UnpicklingError('could not find MARK')` → retrain, not crash).
- **The fresh-run guard fires.** `RESUME = False` against an existing directory raises with the
  remedy in the message.
- **Predictions are complete and identical in shape across paths.** `sample_id = DRTiD_3` matching
  `record_id`, all unique; `predict` and `predict_cpu` return the same ids.
- **Holm family split is measurable**: *p* = 0.01 → 0.030 (family of 3) vs 0.060 (pooled 6).
- **Set-C untouched in QUICK**: not constructed at all; `QUICK = False` restores it.
- Image cache **byte-identical** to `Resize(224)`; 0.000 ms/hit vs ~32 ms decoding.
- QWK vs `sklearn.cohen_kappa_score`: max difference **1.11e-16** over 105 cases.
- CORAL monotone, matches empirical marginals, 3.32-logit spread.
- One-pass dual-view gain **identical to 1e-12** to the three-pass version, on non-degenerate
  predictions (5/5/5 distinct grades per head).
- DeepDRiD Set-C: 100 patients / 200 eyes / 400 images, 0 exclusions.

### What has *not* been verified

No end-to-end GPU run. Everything above is static analysis plus runtime execution of the data,
model, loss, metric, checkpoint and prediction layers on CPU with the real datasets. The training
loops themselves have been exercised only in `QUICK` shape. The ~4.9 h T4 estimate is derived from
measured I/O timings and an estimated GPU cost — not a measured end-to-end figure.

---

## 8. Reading order for the paper

0. `FINAL_RUN_COMPLETE.txt` — if missing, the run did not finish; quote nothing.
   `results/run_summary.json` then answers "what happened?" in one file.
1. `table_gate_report.csv` — did anything fail? Report failures honestly.
2. `rq1_verdict.json` — both axes, predictive *and* mechanistic.
3. `table_predictive_performance.csv` + `table_statistics_primary.csv` — effect sizes with CIs. A
   difference whose CI includes zero is not a claim.
4. `table_rq2_validation.csv` + `deployment_choice.json` — the deployment decision and the
   *validation* evidence it rests on. The test set played no part in it.
5. `table_retention_main.csv` + `table_efficiency.csv` — RQ2.
6. `table_external_deepdrid.csv` + `table_external_ci.csv` — the Set-C rows under `_1=macula`.
7. `table_condition_labels.csv` — the exact label for every condition.

### Wording that must not drift

- CSD transfers **an operational proxy of the dual-view ordinal decision shift** — not "anatomical
  complementarity".
- Set-C is **external confirmation** on a partition held out until the final run.
- DRTiD statistics are **eye/record-clustered**; DeepDRiD statistics are **patient-clustered**.
- Threshold outputs are **cumulative ordinal scores**, not calibrated probabilities.
- 95% retention is a **pre-specified engineering criterion**, not a clinical margin.
- RQ2's headline is FP32 vs PTQ vs QAT; the fine-tune controls are supplementary.
- INT8 quantizes the **backbone only** — the deployed model is mixed precision. The compression
  story is teacher → student; the INT8 story is latency.
