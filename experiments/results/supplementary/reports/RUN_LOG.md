# Run log

## P0 — Preflight and smoke reproduction

- original artifacts `/content/drive/MyDrive/DR-VERGE/artifacts_enhanced_v1_20260811` (read-only); outputs `/content/drive/MyDrive/DR-VERGE/artifacts_enhanced_supplementary_v2_20261029`
- device cuda; torch 2.11.0+cu130; albumentations 1.4.21; mode final
- 21 checkpoints hashed and strict-loaded; locked thresholds/hparams/M* verified
- teacher + CSD seed 42 reproduce the source run (logs/smoke_reproduction.csv)

## P1 — Internal reproduction and mechanism inference

- teacher QWK 0.7364; 156 reproduction checks, max |diff| 1.2e-04
- 9 contrasts, B=10000: 4/9 CIs favour CSD, 0/9 favour a baseline
- sanity G16-G21 passed; report reports/P1_INTERNAL_MECHANISM_REPORT.md

## P2 — External mechanism generalisation (exploratory)

- Set-C 100/200/400; teacher QWK 0.7923, CSD mean 0.6688 reproduced
- 2/9 CIs favour CSD, 0/9 favour a baseline; scenario: pattern persists: CSD ranks first on all three mechanism metrics on Set-C; mechanism fidelity persists while no external QWK contrast is conclusive (mechanism-prediction dissociation)

## P3 — Decomposition

- identity residual 0.0e+00
- subgroups and teacher-shift bins written

## P4 — Per-grade errors

- Grade-1 recall: teacher 0.000, CSD 0.068

## P5 — Sensitivity

- Pearson/Spearman ordering and calibration tables written

## FINAL — Completion

- SUPPLEMENTARY_RUN_COMPLETE.txt written
- spec gates 25/25
- paper_ready/ generated

## Runtime profile (seconds)

```
phase                                  stage  seconds                                  note
   P0                environment + preflight    69.04 21 checkpoints hashed + strict-loaded
   P0                     smoke reproduction     4.80                                      
   P1       internal inference (20 students)    35.91                   {'imported_v1': 21}
   P1                          P1 statistics     6.93                               B=10000
   P2        external inference + statistics    54.51            teacher 0.7923; CSD 0.6688
   P3 decomposition + subgroups + shift bins     3.18                                      
   P4                       per-grade errors     2.11                                      
   P5         Pearson/Spearman + calibration     0.18                                      
FINAL     gates + claim ledger + paper_ready     1.46                                      
FINAL              overview + audit + marker     0.09                                      
```
