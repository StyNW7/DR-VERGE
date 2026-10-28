# 📊 results/

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

Every output of the **final DR-VERGE run** (`enhanced_v1_20260811`), produced by [`../notebooks/full_pipeline_notebook_enhanced.ipynb`](../notebooks/full_pipeline_notebook_enhanced.ipynb). Every number in the paper can be traced back to a file in this folder.

```text
DR-VERGE final run completed successfully.
run_tag        : enhanced_v1_20260811
mode           : FULL RUN
gates          : 36/36 passed (30 blocking, all passed)
method M*      : dual_csd (seed 3407)
deployment     : qat_int8 (seed 42, QAT_INT8), verified=True
evaluated runs : 70
```

> [!IMPORTANT]
> This folder is a **historical artifact of a single execution** and is never regenerated in place. Its contents are curated: only the artifacts needed to verify and reproduce every number (see [Deliberately not included](#-deliberately-not-included)). The ONNX models for the demo live in [`../../frontend/public/models/`](../../frontend/public/models/).

---

## 🗂️ Structure

```text
results/
├── FINAL_RUN_COMPLETE.txt        completion marker — written only if every blocking gate passed
├── run_summary.json              a summary of the whole run in one file
├── rq1_verdict.json              the RQ1 verdict (CSD vs the three baselines)
├── deployment_choice.json        the selected deployment variant with its rule and reason
├── deployment_verification.json  reload verification of the deployment artifact
│
├── tables/        34 CSVs — the numbers behind every claim
├── figures/       14 figures × 3 files (.png · _caption.txt · _data.csv)
├── metrics/       5 diagnostic files (raw per-run metrics, collapse warnings, CSD gradient, ...)
├── predictions/   per-sample predictions: test/ (70 files) · validation/ (30 files)
├── configs/       configuration locked before the run + environment record
└── splits/        the exact eye-level partition used (train 800 · val 200 · test 550)
```

---

## 🔎 Where to start

| Question | File |
|---|---|
| Did the run verify itself? | [`tables/table_gate_report.csv`](tables/table_gate_report.csv) — 36/36 passed |
| Are the headline numbers consistent with the raw predictions? | [`tables/table_results_audit.csv`](tables/table_results_audit.csv) — 265/265 matched |
| Performance of every condition (QWK, Macro-F1, MAE, SER, etc.) | [`tables/table_predictive_performance.csv`](tables/table_predictive_performance.csv) |
| RQ1 statistics (CIs, permutation, Holm) | [`tables/table_statistics_primary.csv`](tables/table_statistics_primary.csv) |
| CSD mechanism metrics (ShiftL1, CosAgree, BenefitCorr) | [`tables/table_csd_mechanism.csv`](tables/table_csd_mechanism.csv) |
| Size, latency and throughput | [`tables/table_efficiency.csv`](tables/table_efficiency.csv) |
| QWK retention after quantization | [`tables/table_retention_main.csv`](tables/table_retention_main.csv) |
| Basis of the deployment decision (validation) | [`tables/table_deployment_eligibility.csv`](tables/table_deployment_eligibility.csv) · [`deployment_choice.json`](deployment_choice.json) |
| DeepDRiD external results | [`tables/table_external_summary.csv`](tables/table_external_summary.csv) · [`tables/table_external_ci.csv`](tables/table_external_ci.csv) |
| Method and hyperparameter selection | [`tables/table_method_selection.csv`](tables/table_method_selection.csv) · [`configs/selected_hyperparameters.json`](configs/selected_hyperparameters.json) |
| Stage A (resolution & sampling) | [`tables/table_stage_a_recipe_selection.csv`](tables/table_stage_a_recipe_selection.csv) |
| When the CI and the permutation test disagree | [`tables/table_ci_permutation_disagreement.csv`](tables/table_ci_permutation_disagreement.csv) |
| Official label of every condition | [`tables/table_condition_labels.csv`](tables/table_condition_labels.csv) |

---

## 🖼️ Figures

Every figure ships as **`.png` (400 dpi)**, together with `_caption.txt` and `_data.csv` holding the exact numbers plotted — so any figure can be audited without re-running the notebook.

| Figure | Shows |
|---|---|
| [`fig_01_dataset`](figures/fig_01_dataset.png) | DRTiD eye counts per partition and grade |
| [`fig_02_performance`](figures/fig_02_performance.png) | Performance of every condition on the internal test (mean ± SD across seeds) |
| [`fig_03_ordinal_safety`](figures/fig_03_ordinal_safety.png) | Severe error (off by ≥ 2 grades) — the most clinically consequential mistake |
| [`fig_04_per_grade_recall`](figures/fig_04_per_grade_recall.png) | Per-grade recall |
| [`fig_05_confusion`](figures/fig_05_confusion.png) | Row-normalised confusion matrices |
| [`fig_06_dual_view_gain`](figures/fig_06_dual_view_gain.png) | **Premise** — dual-view gain over the auxiliary heads and over independent single-view models |
| [`fig_07_csd_mechanism`](figures/fig_07_csd_mechanism.png) | **RQ1 mechanism** — CSD best on all three shift-fidelity metrics |
| [`fig_08_csd_gradient`](figures/fig_08_csd_gradient.png) | CSD/task gradient ratio — evidence that CSD actually influences learning |
| [`fig_09_retention`](figures/fig_09_retention.png) | QWK retention after quantization (95% line = engineering criterion) |
| [`fig_10_efficiency`](figures/fig_10_efficiency.png) | Artifact size and single-thread CPU latency |
| [`fig_11_pareto`](figures/fig_11_pareto.png) | **RQ2** — QWK vs CPU latency trade-off |
| [`fig_12_forest`](figures/fig_12_forest.png) | **RQ1 predictive** — every pre-registered comparison with its CI |
| [`fig_13_external_setc`](figures/fig_13_external_setc.png) | Confirmatory external evaluation on DeepDRiD Set-C |
| [`fig_14_internal_vs_external`](figures/fig_14_internal_vs_external.png) | Internal vs external — cross-domain generalisation |

---

## 🏷️ Naming conventions

| Pattern | Example | Meaning |
|---|---|---|
| `predictions/<split>/DRTiD_<split>_<condition>_seed<s>_<precision>.csv` | `DRTiD_test_dual_csd_seed42_FP32.csv` | One row per eye: true grade, predicted grade, cumulative scores |
| `metrics/all_conditions_raw.csv` | — | Every metric for each condition × seed × precision (70 runs) |
| `metrics/csd_gradient_diagnostic.json` | — | Evidence that CSD contributes gradient to the backbone |
| `metrics/teacher_delta_distribution.csv` | — | Distribution of the teacher's Δ (basis of the scale _s_) |
| `metrics/deepdrid_exclusion_audit.csv` | — | DeepDRiD image exclusion audit |

**Main conditions:** `macula_only`, `disc_only`, `dual_no_distill`, `dual_logitkd`, `dual_featkd`, `dual_csd`. **Ablations:** `abl_csd_raw_smoothl1`, `abl_csd_kl_softmax`, `abl_csd_counterfactual`. **RQ2 variants:** `best_fp32`, `ptq_int8`, `qat_int8`, `ft_ptq_int8`, `fp32_ft_control`, `fp32_ft_plain`.

---

## ⚙️ Reproducibility record

| File | Contents |
|---|---|
| [`configs/config.json`](configs/config.json) | The full locked configuration (resolution, seeds, grids, B, P, quantization engine) |
| [`configs/environment.json`](configs/environment.json) | Python, PyTorch, CUDA, GPU and quantization-engine versions |
| [`configs/requirements_exact.txt`](configs/requirements_exact.txt) | Exact package versions |
| [`configs/split_manifest.json`](configs/split_manifest.json) | DRTiD partition manifest |
| [`configs/csd_scale.json`](configs/csd_scale.json) | Global CSD scale _s_ = 0.1073 |
| [`configs/threshold_calibration.json`](configs/threshold_calibration.json) | Selected decision threshold per condition |
| [`configs/quantization_info.json`](configs/quantization_info.json) · [`quantized_modules_by_seed.json`](configs/quantized_modules_by_seed.json) | Quantized operator scope — identical for PTQ/QAT/FT-PTQ across all five seeds |

---

## 🧹 Deliberately not included

The repository holds only artifacts that **cannot be re-derived** from other files. The following are kept locally only, with the reason:

| Not included | Reason |
|---|---|
| Model weights (`*.pt`, `*.pth`, `*.pt2`) | Large; the ONNX models for the demo are in `frontend/public/models/` |
| Per-run confusion matrices | Computable directly from `predictions/` (see below) |
| Per-epoch training history | Not needed to reproduce any number; the CSD gradient summary is in `metrics/` and `fig_08` |
| `.svg` / `.pdf` figure versions | Format duplicates of the same `.png` |
| Per-sample DeepDRiD predictions | External results are available as tables (`table_external_*.csv`) and figures `fig_13`/`fig_14` |

Example: recomputing a confusion matrix and QWK from the per-sample predictions:

```python
import pandas as pd
from sklearn.metrics import cohen_kappa_score, confusion_matrix

d = pd.read_csv("predictions/test/DRTiD_test_dual_csd_seed42_FP32.csv")
print(confusion_matrix(d.true_grade, d.pred_grade, labels=range(5)))
print(cohen_kappa_score(d.true_grade, d.pred_grade, weights="quadratic", labels=range(5)))
```
