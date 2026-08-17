# outputs/ — final run artifacts

Everything produced by `artifacts_enhanced_v1_20260811`, the run every paper number comes from.

```
outputs/
├── FINAL_RUN_COMPLETE.txt   written only if every blocking gate passed
├── configs/                 what was locked before the run
├── splits/                  the exact eye-level partition used
└── results/
    ├── tables/       34 CSVs — the numbers behind every claim
    ├── figures/      14 figures × 5 files each
    ├── metrics/      confusion matrices and per-condition diagnostics
    ├── predictions/  per-sample predictions (test · validation · deepdrid)
    └── logs/         execution logs
```

## Where to look first

| Question | File |
|---|---|
| Headline performance of every condition | `results/tables/table_predictive_performance.csv` |
| RQ1 statistics (CIs, permutation, Holm) | `results/tables/table_statistics_primary.csv` |
| CSD mechanism metrics | `results/tables/table_csd_mechanism.csv` |
| Efficiency and latency | `results/tables/table_efficiency.csv` |
| External confirmatory results | `results/tables/table_external_summary.csv` |
| Which model was selected, and why | `results/tables/table_method_selection.csv`, `table_deployment_eligibility.csv` |
| Did the run verify itself | `results/tables/table_gate_report.csv` — 36/36 |

## Figures are auditable

Each figure ships as `.png` + `.svg` + `.pdf` + `_caption.txt` + `_data.csv`. The CSV holds the
exact numbers plotted, so any figure can be checked without re-running the notebook. A figure
whose underlying CSV is present can be audited; one without it can only be trusted.

## Reproducibility record

`configs/requirements_exact.txt` pins the exact package versions used.
`configs/split_manifest.json` records the partition. `configs/quantization_info.json` and
`quantized_modules_by_seed.json` record the operator scope, verified identical across
PTQ / QAT / FT-PTQ for all five seeds.

**Nothing here is regenerated in place.** These are historical artifacts of one execution.
