# 🔬 results/supplementary/

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

Outputs of the DR-VERGE **v2 supplementary analysis** (`artifacts_enhanced_supplementary_v2_20261029`), produced by [`../../notebooks/DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb`](../../notebooks/DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb).

```text
SUPPLEMENTARY_RUN_COMPLETE
completed_at      : 2026-10-29T17:54:13
phase_status      : P0–P6 PASSED · FINAL PASSED
gates             : 56/56 passed
spec gates        : 25/25 covered
source_unchanged  : True   (21 checkpoints + 59 source files, SHA-256 identical before/after)
B_FINAL           : 10000
```

> [!IMPORTANT]
> **Inference-only and exploratory.** This analysis only **reads** the frozen models of the main run [`enhanced_v1_20260811`](../). Nothing is trained, tuned, re-quantized, re-thresholded or re-selected. Because it was designed **after** the main results were known, every result is labelled **exploratory post-hoc**. The main-run numbers (paper Tables I–III, RQ2, the deployment decision) are **unchanged**.

---

## 🎯 Questions answered

| # | Question | Short answer |
|---|---|---|
| 1 | Is CSD's mechanism-fidelity advantage supported **inferentially**, not just descriptively? | **Yes for ShiftL1** — the 95% CI excludes zero against all three baselines. CosAgree is conclusive vs Logit-KD. BenefitCorr points the same way but is not conclusive |
| 2 | Does the pattern **hold** on DeepDRiD Set-C? | CSD **ranks first on all three metrics**; CosAgree is conclusive vs NoDistill and Logit-KD |
| 3 | **Why** does better fidelity not raise QWK? | An exact identity: output gap = base-aggregation gap + shift gap. CSD only targets the second term |
| 4 | **When** does CSD help most? | When the teacher's shift is **large** (top quartile) and **correct** (teacher right) |
| 5 | Are the results **stable** to the metric choice? | CSD stays first on BenefitCorr under Pearson and Spearman; calibration is on par with the other students |

---

## 📌 Core results

**Mechanism-fidelity inference — DRTiD internal** (550 examined-eye records, 5 matched seeds, hierarchical paired bootstrap B = 10,000). Δ = CSD − baseline.

| Baseline | ΔShiftL1 ↓ | ΔCosAgree ↑ | ΔBenefitCorr ↑ |
|---|---|---|---|
| NoDistill | **−0.0249\*** [−0.0477; −0.0043] | +0.0852 [−0.0134; +0.1870] | +0.0882 [−0.0342; +0.2329] |
| Logit-KD | **−0.0331\*** [−0.0567; −0.0103] | **+0.1503\*** [+0.0263; +0.3011] | +0.1280 [−0.0038; +0.2643] |
| Feature-KD | **−0.0209\*** [−0.0408; −0.0012] | +0.0546 [−0.0225; +0.1407] | +0.1132 [−0.0390; +0.2662] |

<sub>\* 95% CI excludes zero and favours CSD. **4/9** contrasts conclusive, **0/9** favour a baseline, **34/45** seed-contrast pairs favour CSD, and the direction of all nine contrasts is stable under leave-one-seed-out. Holding the models fixed (record-only bootstrap / permutation + Holm), **9/9** contrasts separate from zero (p<sub>Holm</sub> ≤ 0.0034) — the remaining uncertainty comes from the number of seeds, not the size of the test set.</sub>

**Decomposition identity** (numerical residual 0):

$$
p^{S}_{\text{dual}} - p^{T}_{\text{dual}} \;=\; \big(\bar p^{S} - \bar p^{T}\big) \;+\; \big(\Delta^{S} - \Delta^{T}\big), \qquad \bar p = \tfrac{1}{2}\,(p_{\text{mac}} + p_{\text{disc}})
$$

CSD has the smallest shift gap (0.3509), but its base-aggregation gap (0.4361) is larger than Feature-KD's (0.4217) and NoDistill's (0.4269); grade agreement with the teacher is 65.5% vs 66.1% (Feature-KD). Across the 20 student models, QWK tracks the base-aggregation gap (ρ = −0.52) more than ShiftL1 (ρ = −0.35).

Full summary: [`reports/SUPPLEMENTARY_RESULTS_OVERVIEW.md`](reports/SUPPLEMENTARY_RESULTS_OVERVIEW.md).

---

## 🗂️ Layout

```text
supplementary/
├── SUPPLEMENTARY_RUN_COMPLETE.txt   completion marker — written only when every gate passes
├── tables/        27 CSVs — statistics, decomposition, shift quartiles, subgroups, per-grade, calibration
├── figures/       4 figures × 3 files (.png · _caption.txt · _data.csv)
├── paper_tables/  Indonesian-formatted tables for the paper (Table IV, Set-C, diagnostics)
├── reports/       per-phase reports P1–P5, overview, reproducibility audit, claim ledger
└── logs/          gate report, reproduction checks, checkpoint manifest, environment, run manifest
```

---

## 🔎 Where to start

| Question | File |
|---|---|
| Did the run verify itself? | [`logs/gate_report.csv`](logs/gate_report.csv) — 56/56 passed · [`SUPPLEMENTARY_RUN_COMPLETE.txt`](SUPPLEMENTARY_RUN_COMPLETE.txt) |
| Were the original results reproduced? | [`logs/reproduction_checks.csv`](logs/reproduction_checks.csv) — 156/156 matched (max diff 1.2 × 10⁻⁴) · [`logs/reproduction_checks_external.csv`](logs/reproduction_checks_external.csv) |
| Were the models left untouched? | [`logs/checkpoint_manifest.csv`](logs/checkpoint_manifest.csv) — SHA-256 of 21 checkpoints |
| Internal mechanism inference (9 contrasts) | [`tables/table_mechanism_internal_stats.csv`](tables/table_mechanism_internal_stats.csv) · [`paper_tables/TABEL_INFERENSI_FIDELITAS_INTERNAL.csv`](paper_tables/TABEL_INFERENSI_FIDELITAS_INTERNAL.csv) |
| Mechanism generalisation on Set-C | [`tables/table_mechanism_external_stats.csv`](tables/table_mechanism_external_stats.csv) · [`tables/table_mechanism_rank_internal_vs_external.csv`](tables/table_mechanism_rank_internal_vs_external.csv) |
| Per-seed consistency & leave-one-seed-out | [`tables/table_mechanism_seed_consistency.csv`](tables/table_mechanism_seed_consistency.csv) · [`tables/table_mechanism_sensitivity.csv`](tables/table_mechanism_sensitivity.csv) |
| Mechanism–prediction decomposition | [`tables/table_mechanism_decomposition.csv`](tables/table_mechanism_decomposition.csv) · [`tables/table_mechanism_performance_association.csv`](tables/table_mechanism_performance_association.csv) |
| When CSD helps most | [`tables/table_teacher_shift_bins.csv`](tables/table_teacher_shift_bins.csv) · [`tables/table_teacher_correctness_subgroups.csv`](tables/table_teacher_correctness_subgroups.csv) |
| Per-grade errors & Grade 1 | [`tables/table_grade1_confusions.csv`](tables/table_grade1_confusions.csv) · [`tables/table_error_by_grade.csv`](tables/table_error_by_grade.csv) |
| Pearson vs Spearman, calibration | [`tables/table_benefitcorr_sensitivity.csv`](tables/table_benefitcorr_sensitivity.csv) · [`tables/table_ordinal_calibration_summary.csv`](tables/table_ordinal_calibration_summary.csv) |
| Allowed / prohibited claims | [`reports/CLAIM_LEDGER.csv`](reports/CLAIM_LEDGER.csv) |

---

## 🖼️ Figures

| Figure | Shows |
|---|---|
| [`fig_mechanism_effect_forest`](figures/fig_mechanism_effect_forest.png) | CSD − baseline fidelity differences with 95% CIs (internal) |
| [`fig_internal_external_mechanism`](figures/fig_internal_external_mechanism.png) | Internal DRTiD vs DeepDRiD Set-C in one panel — paper **Figure 9** |
| [`fig_mechanism_decomposition`](figures/fig_mechanism_decomposition.png) | Shift gap vs base-aggregation gap vs joint-output gap |
| [`fig_confusion_core_models`](figures/fig_confusion_core_models.png) | Row-normalised confusion matrices: teacher and the four core conditions |

As in the main run, only `.png` is included; the `.pdf`/`.svg` versions are format duplicates.

---

## 🧪 Statistical design in brief

- **Resampling unit** — DRTiD: examined-eye record (DRTiD has no patient ID). Set-C: **patient** (both eyes always move together).
- **Each replicate** resamples units **and** the five seeds jointly, with the same draw for CSD, the baseline and the teacher; every metric (including the Pearson correlation inside BenefitCorr) is recomputed. Invalid replicates: 0.
- **Supporting layers** — record-only bootstrap, leave-one-seed-out, per-seed direction, conditional permutation (P = 10,000) + Holm over 9 contrasts, Spearman BenefitCorr.
- **Metric definitions** copied verbatim from the main notebook; frozen thresholds (NoDistill 0.40; others 0.50).
- `RNG_SEED = 20261029`; bootstrap draw hashes are recorded in [`logs/run_manifest.json`](logs/run_manifest.json). The statistics were recomputed in two separate executions with identical results.

---

## ⚖️ Claim boundaries

| ✅ Allowed | ❌ Do not write |
|---|---|
| "CSD's ShiftL1 is lower than all three baselines, 95% CI excludes zero (exploratory)" | "CSD is significant on all three mechanism metrics" |
| "BenefitCorr points toward CSD, but the CI includes zero" | "CSD's BenefitCorr is significant" |
| "The fidelity pattern is also observed on Set-C (exploratory)" | "CSD improves QWK / accuracy" |
| "Internal resampling unit: examined-eye record" | "Internal bootstrap clustered by patient" |

---

## 📝 Naming notes

- `table_VI_paper_internal.csv` and the "Tabel VI" reference in `reports/SUPPLEMENTARY_RESULTS_OVERVIEW.md` use the notebook's **working number**. In the final paper this table is **Table IV** (see [`paper_tables/`](paper_tables/)). Result files are deliberately left unedited so they stay byte-identical to the run output.
- The `paper_ready/` folder and the inference cache (`*.parquet`) are not included: their content can be re-derived from the tables here or by running the notebook.
