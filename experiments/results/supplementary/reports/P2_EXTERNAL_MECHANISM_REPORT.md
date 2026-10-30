# P2 — External (post-hoc exploratory) mechanism-fidelity inference (Set-C, 100 patients / 200 eyes, patient-clustered)

Hierarchical paired bootstrap, B = 10000 (final mode), draw hash `8abc776525a87449`; units = patients (both eyes kept together); the same draw is applied to CSD, baseline and teacher. Effect = CSD − baseline (negative ShiftL1 / positive CosAgree, BenefitCorr favour CSD).

| contrast         | metric      |   effect_point |   ci_low |   ci_high | interpretation                  |   seeds_favouring_csd | loso_sign_stable   | recordonly_excludes_zero   |   p_holm_9 |
|:-----------------|:------------|---------------:|---------:|----------:|:--------------------------------|----------------------:|:-------------------|:---------------------------|-----------:|
| CSD - NoDistill  | ShiftL1     |        -0.0152 |  -0.0486 |    0.0182 | CI includes 0 -- not conclusive |                     3 | True               | False                      |     0.381  |
| CSD - NoDistill  | CosAgree    |         0.1283 |   0.025  |    0.2505 | CI excludes 0 -- favours CSD    |                     5 | True               | True                       |     0.0009 |
| CSD - NoDistill  | BenefitCorr |         0.1196 |  -0.0278 |    0.2573 | CI includes 0 -- not conclusive |                     5 | True               | False                      |     0.381  |
| CSD - Logit-KD   | ShiftL1     |        -0.0103 |  -0.0435 |    0.0254 | CI includes 0 -- not conclusive |                     2 | True               | False                      |     0.4054 |
| CSD - Logit-KD   | CosAgree    |         0.1608 |   0.0358 |    0.3036 | CI excludes 0 -- favours CSD    |                     5 | True               | True                       |     0.0016 |
| CSD - Logit-KD   | BenefitCorr |         0.1106 |  -0.0105 |    0.256  | CI includes 0 -- not conclusive |                     5 | True               | True                       |     0.2254 |
| CSD - Feature-KD | ShiftL1     |        -0.0069 |  -0.0394 |    0.0284 | CI includes 0 -- not conclusive |                     3 | False              | False                      |     0.4054 |
| CSD - Feature-KD | CosAgree    |         0.0519 |  -0.0294 |    0.132  | CI includes 0 -- not conclusive |                     4 | True               | True                       |     0.2254 |
| CSD - Feature-KD | BenefitCorr |         0.0891 |  -0.0461 |    0.2485 | CI includes 0 -- not conclusive |                     4 | True               | False                      |     0.381  |

- Conclusive in CSD's favour: **2/9**; in a baseline's favour: **0/9**.
- Seed-level direction favouring CSD: 36/45; leave-one-seed-out sign-stable: 8/9.
- Record-only (models fixed) CIs excluding 0: 4/9; conditional permutation p_Holm < 0.05: 2/9. Where these disagree with the hierarchical CI, the remaining uncertainty is driven by seed-to-seed training variation.
- Only five trained models per condition exist; resampling records does not create new models. The 9 CIs are not multiplicity-adjusted; the permutation p-values are Holm-adjusted over the 9 contrasts.
- Full sensitivity table: `tables/table_mechanism_sensitivity.csv`; seed table: `tables/table_mechanism_seed_consistency.csv`.

## Interpretation scenario

**pattern persists: CSD ranks first on all three mechanism metrics on Set-C; mechanism fidelity persists while no external QWK contrast is conclusive (mechanism-prediction dissociation)**.

## Rank changes

| metric              | condition   |   internal_mean |   internal_rank |   external_mean |   external_rank |   rank_change |
|:--------------------|:------------|----------------:|----------------:|----------------:|----------------:|--------------:|
| ShiftL1             | NoDistill   |          0.3759 |               3 |          0.3128 |               4 |             1 |
| ShiftL1             | Logit-KD    |          0.3841 |               4 |          0.3079 |               3 |            -1 |
| ShiftL1             | Feature-KD  |          0.3718 |               2 |          0.3044 |               2 |             0 |
| ShiftL1             | CSD         |          0.3509 |               1 |          0.2975 |               1 |             0 |
| CosAgree            | NoDistill   |          0.3509 |               3 |          0.2548 |               3 |             0 |
| CosAgree            | Logit-KD    |          0.2858 |               4 |          0.2223 |               4 |             0 |
| CosAgree            | Feature-KD  |          0.3815 |               2 |          0.3312 |               2 |             0 |
| CosAgree            | CSD         |          0.4361 |               1 |          0.3831 |               1 |             0 |
| BenefitCorr         | NoDistill   |          0.2193 |               2 |          0.1161 |               4 |             2 |
| BenefitCorr         | Logit-KD    |          0.1795 |               4 |          0.1251 |               3 |            -1 |
| BenefitCorr         | Feature-KD  |          0.1943 |               3 |          0.1466 |               2 |            -1 |
| BenefitCorr         | CSD         |          0.3075 |               1 |          0.2357 |               1 |             0 |
| BenefitCorrSpearman | NoDistill   |          0.3597 |               3 |          0.2054 |               3 |             0 |
| BenefitCorrSpearman | Logit-KD    |          0.2895 |               4 |          0.2042 |               4 |             0 |
| BenefitCorrSpearman | Feature-KD  |          0.3799 |               2 |          0.2542 |               2 |             0 |
| BenefitCorrSpearman | CSD         |          0.4532 |               1 |          0.2964 |               1 |             0 |

## Teacher shift profile

| dataset             |   n_eyes |   teacher_QWK_dual |   teacher_QWK_aux_macula |   teacher_QWK_aux_disc |   teacher_G_aux |   mean_L1_deltaT |   median_L1_deltaT |   mean_benefitT |   frac_benefitT_positive |
|:--------------------|---------:|-------------------:|-------------------------:|-----------------------:|----------------:|-----------------:|-------------------:|----------------:|-------------------------:|
| DRTiD internal test |      550 |             0.7364 |                   0.6864 |                 0.664  |          0.05   |           0.4097 |             0.3699 |          0.0372 |                   0.6691 |
| DeepDRiD Set-C      |      200 |             0.7923 |                   0.7285 |                 0.7849 |          0.0073 |           0.2659 |             0.2248 |          0.067  |                   0.68   |

## Exploratory external QWK (frozen thresholds)

| model      | condition       |   threshold |   n_seeds |   QWK_mean |   QWK_sd | per_seed                               |   MacroF1_mean |   SER_mean |
|:-----------|:----------------|------------:|----------:|-----------:|---------:|:---------------------------------------|---------------:|-----------:|
| Teacher    | teacher         |         0.5 |         1 |     0.7923 | nan      | 0.7923                                 |       nan      |    nan     |
| NoDistill  | dual_no_distill |         0.4 |         5 |     0.6467 |   0.0375 | 0.6867; 0.6226; 0.6493; 0.6779; 0.5969 |         0.3507 |      0.203 |
| Logit-KD   | dual_logitkd    |         0.5 |         5 |     0.6393 |   0.0526 | 0.5661; 0.6334; 0.6171; 0.6859; 0.6942 |         0.3661 |      0.192 |
| Feature-KD | dual_featkd     |         0.5 |         5 |     0.6754 |   0.0266 | 0.7086; 0.6855; 0.6787; 0.6684; 0.6357 |         0.3691 |      0.182 |
| CSD        | dual_csd        |         0.5 |         5 |     0.6688 |   0.0415 | 0.6282; 0.6505; 0.6435; 0.7298; 0.6921 |         0.3439 |      0.174 |

| contrast         |   effect_point |   ci_low |   ci_high | ci_excludes_zero   |
|:-----------------|---------------:|---------:|----------:|:-------------------|
| CSD - NoDistill  |         0.0221 |  -0.042  |    0.0867 | False              |
| CSD - Logit-KD   |         0.0295 |  -0.0118 |    0.0781 | False              |
| CSD - Feature-KD |        -0.0065 |  -0.0733 |    0.059  | False              |

No external winner is selected; the published CSD external QWK and the QAT deployment decision are unchanged.
