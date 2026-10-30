# P1 — Internal mechanism-fidelity inference (DRTiD test, 550 records)

Hierarchical paired bootstrap, B = 10000 (final mode), draw hash `db661eeaeb1dfb64`; units = examined-eye records; the same draw is applied to CSD, baseline and teacher. Effect = CSD − baseline (negative ShiftL1 / positive CosAgree, BenefitCorr favour CSD).

| contrast         | metric      |   effect_point |   ci_low |   ci_high | interpretation                  |   seeds_favouring_csd | loso_sign_stable   | recordonly_excludes_zero   |   p_holm_9 |
|:-----------------|:------------|---------------:|---------:|----------:|:--------------------------------|----------------------:|:-------------------|:---------------------------|-----------:|
| CSD - NoDistill  | ShiftL1     |        -0.0249 |  -0.0477 |   -0.0043 | CI excludes 0 -- favours CSD    |                     5 | True               | True                       |     0.0009 |
| CSD - NoDistill  | CosAgree    |         0.0852 |  -0.0134 |    0.187  | CI includes 0 -- not conclusive |                     3 | True               | True                       |     0.0009 |
| CSD - NoDistill  | BenefitCorr |         0.0882 |  -0.0342 |    0.2329 | CI includes 0 -- not conclusive |                     3 | True               | True                       |     0.0034 |
| CSD - Logit-KD   | ShiftL1     |        -0.0331 |  -0.0567 |   -0.0103 | CI excludes 0 -- favours CSD    |                     4 | True               | True                       |     0.0009 |
| CSD - Logit-KD   | CosAgree    |         0.1503 |   0.0263 |    0.3011 | CI excludes 0 -- favours CSD    |                     4 | True               | True                       |     0.0009 |
| CSD - Logit-KD   | BenefitCorr |         0.128  |  -0.0038 |    0.2643 | CI includes 0 -- not conclusive |                     4 | True               | True                       |     0.0009 |
| CSD - Feature-KD | ShiftL1     |        -0.0209 |  -0.0408 |   -0.0012 | CI excludes 0 -- favours CSD    |                     4 | True               | True                       |     0.0009 |
| CSD - Feature-KD | CosAgree    |         0.0546 |  -0.0225 |    0.1407 | CI includes 0 -- not conclusive |                     4 | True               | True                       |     0.0034 |
| CSD - Feature-KD | BenefitCorr |         0.1132 |  -0.039  |    0.2662 | CI includes 0 -- not conclusive |                     3 | True               | True                       |     0.0024 |

- Conclusive in CSD's favour: **4/9**; in a baseline's favour: **0/9**.
- Seed-level direction favouring CSD: 34/45; leave-one-seed-out sign-stable: 9/9.
- Record-only (models fixed) CIs excluding 0: 9/9; conditional permutation p_Holm < 0.05: 9/9. Where these disagree with the hierarchical CI, the remaining uncertainty is driven by seed-to-seed training variation.
- Only five trained models per condition exist; resampling records does not create new models. The 9 CIs are not multiplicity-adjusted; the permutation p-values are Holm-adjusted over the 9 contrasts.
- Full sensitivity table: `tables/table_mechanism_sensitivity.csv`; seed table: `tables/table_mechanism_seed_consistency.csv`.
