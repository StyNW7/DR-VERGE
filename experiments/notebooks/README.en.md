# 📓 notebooks/

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

| File | Role |
|---|---|
| [`full_pipeline_notebook_enhanced.ipynb`](full_pipeline_notebook_enhanced.ipynb) | **The final DR-VERGE notebook** — the executed version with all cell outputs. Every main-run number (Tables I–III, RQ2, deployment) comes from this notebook. |
| [`DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb`](DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb) | **Supplementary analysis v2** — inference-only over the frozen models of the notebook above; executed version (56/56 gates). Source of the inferential mechanism evidence, Set-C generalisation and decomposition. Outputs: [`../results/supplementary/`](../results/supplementary/). |
| [`DRVERGE_Enhanced_Supplementary_Analysis.ipynb`](DRVERGE_Enhanced_Supplementary_Analysis.ipynb) | Supplementary analysis v1 — **superseded by v2**. Kept for provenance: v2 can reuse the v1 inference cache once all its hashes validate. |

The notebook is **self-contained**: data, models, losses, metrics, statistics, quantization, export, figures and tables are all implemented inside it. The outputs it writes are stored in [`../results/`](../results/).

---

## 🧭 Notebook contents

| Section | Contents | Gate |
|---|---|---|
| §1 Environment | Google Drive mount, dependencies, cuBLAS determinism | Gate 0 |
| §2 Configuration | `DRIVE_BASE`, `RUN_TAG`, `QUICK`, `RESUME`, `USE_AMP`; the locked protocol (seeds, grids, B, P) | — |
| §3 Utilities & gates | The gate mechanism: checks that stop the run when they fail | — |
| §4 DRTiD splits | Official partition + stratified train/validation split; field-order and laterality verification | Gate 1 |
| §5 APTOS integrity | APTOS duplicate and leakage checks | Gate 1b |
| §6 Image cache | Cache of resized images and augmentation transforms | — |
| §7 Models | Backbones, InteractionFusion, CORAL head with ordered biases, unit tests | Gate 2a |
| §8 Losses | CORAL, auxiliary, Logit-KD, Feature-KD, **CSD** | — |
| §9 Metrics | QWK (checked against `sklearn`), Macro-F1, MAE, SER, shift-fidelity metrics | Gate 2b |
| §10 Smoke test | All components assembled and run briefly | Gate 2c |
| §13a Stage A | Resolution & sampling selection on validation | Gate 4c |
| §11 · §13b | APTOS pre-training and the ResNet-50 teacher at the selected recipe | Gate 3 |
| §12–13 | Students, single-view baselines, Logit-KD / Feature-KD / CSD grids, CSD formulation ablations | Gate 4a · 4b · 5 |
| §13c | Decision-threshold calibration (validation only) | Gate 6e |
| §14 | Two-stage method selection (validation only) | Gate 6a–6d |
| §15–16 | PTQ / QAT / FT-PTQ quantization with matched scope; deployment decision frozen | Gate 7a–7d |
| §17 | DRTiD internal test evaluation; per-sample predictions saved | Gate 8 · 9 |
| §18 | Statistics: clustered bootstrap, permutation, Holm | Gate 10 |
| §19 | DeepDRiD Set-C external validation (frozen models) | Gate 11 |
| §20 | Export of `checkpoint.pt`, `model.pt2`, `model.onnx`, `metadata.json` + reload verification | Gate 12a–12d |
| §21–22 | 14 figures, 34 tables, final report | — |
| §21b | **Self-audit** — 265 headline values recomputed from per-sample predictions | Gate 12b · 12c |

---

## ▶️ How to run

1. Open the notebook in **Google Colab** with a GPU (the final run used an A100).
2. Place the datasets in `MyDrive/DR-VERGE/dataset/` — DRTiD and DeepDRiD are located automatically.
3. Set the _Configuration_ cell:

   ```python
   DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
   RUN_TAG    = "enhanced_v1_YYYYMMDD"   # a fresh tag for every new run
   QUICK      = False                    # True = short rehearsal: 1 seed, few epochs, Set-B
   RESUME     = True                     # continue an interrupted run under the same RUN_TAG
   USE_AMP    = False                    # mixed precision; changes numerics slightly
   ```

4. **Run All.** If Colab disconnects, reopen with the same `RUN_TAG` and Run All again; existing checkpoints are verified and reused.
5. All artifacts are written to `MyDrive/DR-VERGE/artifacts_<RUN_TAG>/`. `FINAL_RUN_COMPLETE.txt` appears only if every blocking gate passed.

> [!TIP]
> `QUICK = True` exercises the external pipeline on **Set-B** so that **Set-C** — the confirmatory partition — stays untouched until the real run. Always use a throwaway `RUN_TAG` for rehearsals.

Before a full run, the notebook can be checked statically with the scripts in [`../scripts/verification/`](../scripts/).

---

## 📖 Reading order for the outputs

1. `FINAL_RUN_COMPLETE.txt` — if it is missing, the run did not finish and no number may be quoted.
2. `tables/table_gate_report.csv` — did any gate fail?
3. `rq1_verdict.json` — the RQ1 verdict on both axes: predictive and mechanistic.
4. `tables/table_predictive_performance.csv` and `tables/table_statistics.csv` — effect sizes with CIs.
5. `tables/table_rq2_validation.csv` + `deployment_choice.json` — the basis of the deployment decision.
6. `tables/table_retention_main.csv` and `tables/table_efficiency.csv` — the core of RQ2.
7. `tables/table_external_deepdrid.csv` + `tables/table_external_ci.csv` — external Set-C results.

The full map is in [`../results/README.en.md`](../results/README.en.md).

---

## 🔬 The v2 supplementary-analysis notebook

This notebook **trains nothing**. It strict-loads the 21 frozen checkpoints from `artifacts_enhanced_v1_20260811/`, reproduces the original results, and only then computes new statistics. Every output goes to a new folder; the original artifacts are SHA-256-checked before and after.

| Phase | Content | Stop rule |
|---|---|---|
| P0 | Inventory, SHA-256 hashes, strict load of 21 checkpoints, config/threshold/M\* verification, smoke reproduction | Fail → stop |
| P1 | 3-head inference for 20 students + teacher, full reproduction, 9 internal contrasts + sensitivity | Reproduction fails → stop |
| P2 | DeepDRiD Set-C: 100/200/400 integrity, external QWK reproduction, patient-clustered statistics | Fail → only P2 stops |
| P3 | Decomposition identity, teacher-correctness subgroups, teacher-shift-magnitude quartiles | Identity fails → stop |
| P4 | Per-grade precision/recall/F1, direction of Grade-1 errors | Diagnostic |
| P5 | Pearson vs Spearman, ordinal threshold-score calibration | Fail → only P5 stops |
| P6 | Summary of the original deployment benchmark (re-read, not re-measured) | — |

**Running it:** open in Colab with a GPU, make sure `MyDrive/DR-VERGE/artifacts_enhanced_v1_20260811/` and the datasets are available, then Run All. Set `STAT_MODE = "debug"` (B = 500, **never reported**) for a rehearsal, then `STAT_MODE = "final"` (B = 10,000) for any number you quote. The run is complete only if `SUPPLEMENTARY_RUN_COMPLETE.txt` is written. `RNG_SEED = 20261029`.
