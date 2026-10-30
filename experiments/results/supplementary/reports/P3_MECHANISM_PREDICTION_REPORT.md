# P3 — Mechanism–prediction decomposition

Identity `pS_dual − pT_dual = (pS_agg − pT_agg) + (ΔS − ΔT)` verified on every record and threshold (max residual 0.0e+00; triangle-inequality violations 0).

| dataset             | condition   |   base_discrepancy_L1_mean |   base_discrepancy_L1_std |   dual_discrepancy_L1_mean |   dual_discrepancy_L1_std |   ShiftL1_mean |   ShiftL1_std |   grade_agreement_with_teacher_mean |   grade_agreement_with_teacher_std |   QWK_mean |   QWK_std |   MacroF1_mean |   MacroF1_std |   identity_max_residual |
|:--------------------|:------------|---------------------------:|--------------------------:|---------------------------:|--------------------------:|---------------:|--------------:|------------------------------------:|-----------------------------------:|-----------:|----------:|---------------:|--------------:|------------------------:|
| DRTiD internal test | NoDistill   |                     0.4269 |                    0.0194 |                     0.545  |                    0.0242 |         0.3759 |        0.0115 |                              0.6135 |                             0.0323 |     0.6042 |    0.0166 |         0.3355 |        0.0119 |                       0 |
| DRTiD internal test | Logit-KD    |                     0.4483 |                    0.0513 |                     0.5871 |                    0.0967 |         0.3841 |        0.0236 |                              0.6476 |                             0.0476 |     0.5942 |    0.029  |         0.3589 |        0.0278 |                       0 |
| DRTiD internal test | Feature-KD  |                     0.4217 |                    0.0213 |                     0.569  |                    0.0467 |         0.3718 |        0.0125 |                              0.6611 |                             0.0273 |     0.6161 |    0.0101 |         0.3435 |        0.0113 |                       0 |
| DRTiD internal test | CSD         |                     0.4361 |                    0.018  |                     0.5579 |                    0.0346 |         0.3509 |        0.0124 |                              0.6553 |                             0.0228 |     0.6018 |    0.0149 |         0.3362 |        0.0152 |                       0 |
| DeepDRiD Set-C      | NoDistill   |                     0.5329 |                    0.025  |                     0.6287 |                    0.0458 |         0.3128 |        0.0172 |                              0.604  |                             0.0416 |     0.6467 |    0.0375 |         0.3507 |        0.0258 |                       0 |
| DeepDRiD Set-C      | Logit-KD    |                     0.5486 |                    0.1042 |                     0.6414 |                    0.088  |         0.3079 |        0.0191 |                              0.638  |                             0.037  |     0.6393 |    0.0526 |         0.3661 |        0.016  |                       0 |
| DeepDRiD Set-C      | Feature-KD  |                     0.5431 |                    0.0841 |                     0.6248 |                    0.1011 |         0.3044 |        0.0212 |                              0.65   |                             0.0562 |     0.6754 |    0.0266 |         0.3691 |        0.0395 |                       0 |
| DeepDRiD Set-C      | CSD         |                     0.5522 |                    0.0631 |                     0.5965 |                    0.076  |         0.2975 |        0.018  |                              0.644  |                             0.0457 |     0.6688 |    0.0415 |         0.3439 |        0.0158 |                       0 |

## Association across the 20 internal student models (descriptive)

| x                   | y   |   spearman_rho_20_models | note                                                             |
|:--------------------|:----|-------------------------:|:-----------------------------------------------------------------|
| ShiftL1             | QWK |                   -0.353 | descriptive; 20 models share data and teacher -- not independent |
| base_discrepancy_L1 | QWK |                   -0.523 | descriptive; 20 models share data and teacher -- not independent |
| dual_discrepancy_L1 | QWK |                   -0.522 | descriptive; 20 models share data and teacher -- not independent |

## Teacher-correctness subgroups (internal: 325 correct / 225 incorrect)

| dataset             | subgroup          |   n_eyes | contrast         | metric      |   effect_point |   ci_low |   ci_high | ci_excludes_zero   |
|:--------------------|:------------------|---------:|:-----------------|:------------|---------------:|---------:|----------:|:-------------------|
| DRTiD internal test | teacher_correct   |      325 | CSD - NoDistill  | ShiftL1     |        -0.0303 |  -0.0663 |    0.0055 | False              |
| DRTiD internal test | teacher_correct   |      325 | CSD - Logit-KD   | ShiftL1     |        -0.0448 |  -0.0801 |   -0.0128 | True               |
| DRTiD internal test | teacher_correct   |      325 | CSD - Feature-KD | ShiftL1     |        -0.0236 |  -0.056  |    0.0076 | False              |
| DRTiD internal test | teacher_correct   |      325 | CSD - NoDistill  | CosAgree    |         0.1129 |  -0.0433 |    0.2665 | False              |
| DRTiD internal test | teacher_correct   |      325 | CSD - Logit-KD   | CosAgree    |         0.2074 |   0.0321 |    0.4203 | True               |
| DRTiD internal test | teacher_correct   |      325 | CSD - Feature-KD | CosAgree    |         0.0748 |  -0.028  |    0.185  | False              |
| DRTiD internal test | teacher_correct   |      325 | CSD - NoDistill  | BenefitCorr |         0.1084 |  -0.028  |    0.2374 | False              |
| DRTiD internal test | teacher_correct   |      325 | CSD - Logit-KD   | BenefitCorr |         0.117  |   0.0122 |    0.2199 | True               |
| DRTiD internal test | teacher_correct   |      325 | CSD - Feature-KD | BenefitCorr |         0.103  |  -0.0773 |    0.2772 | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - NoDistill  | ShiftL1     |        -0.0171 |  -0.0407 |    0.007  | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - Logit-KD   | ShiftL1     |        -0.0163 |  -0.0417 |    0.0087 | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - Feature-KD | ShiftL1     |        -0.017  |  -0.0386 |    0.0047 | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - NoDistill  | CosAgree    |         0.0451 |  -0.031  |    0.1236 | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - Logit-KD   | CosAgree    |         0.0678 |  -0.0254 |    0.1737 | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - Feature-KD | CosAgree    |         0.0253 |  -0.0599 |    0.1165 | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - NoDistill  | BenefitCorr |         0.0473 |  -0.0797 |    0.1865 | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - Logit-KD   | BenefitCorr |         0.1095 |  -0.0537 |    0.2649 | False              |
| DRTiD internal test | teacher_incorrect |      225 | CSD - Feature-KD | BenefitCorr |         0.1278 |  -0.0592 |    0.2989 | False              |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - NoDistill  | ShiftL1     |        -0.0117 |  -0.0499 |    0.0282 | False              |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - Logit-KD   | ShiftL1     |        -0.0179 |  -0.0465 |    0.0141 | False              |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - Feature-KD | ShiftL1     |        -0.0007 |  -0.041  |    0.039  | False              |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - NoDistill  | CosAgree    |         0.1902 |   0.0376 |    0.3721 | True               |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - Logit-KD   | CosAgree    |         0.2321 |   0.0559 |    0.4429 | True               |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - Feature-KD | CosAgree    |         0.0827 |  -0.0086 |    0.171  | False              |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - NoDistill  | BenefitCorr |        -0.014  |  -0.2051 |    0.173  | False              |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - Logit-KD   | BenefitCorr |         0.0309 |  -0.2249 |    0.3027 | False              |
| DeepDRiD Set-C      | teacher_correct   |      122 | CSD - Feature-KD | BenefitCorr |         0.0481 |  -0.1753 |    0.2811 | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - NoDistill  | ShiftL1     |        -0.0207 |  -0.0767 |    0.0313 | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - Logit-KD   | ShiftL1     |         0.0014 |  -0.0553 |    0.054  | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - Feature-KD | ShiftL1     |        -0.0166 |  -0.0551 |    0.0303 | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - NoDistill  | CosAgree    |         0.0314 |  -0.0926 |    0.1577 | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - Logit-KD   | CosAgree    |         0.0493 |  -0.0961 |    0.1786 | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - Feature-KD | CosAgree    |         0.0037 |  -0.12   |    0.1361 | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - NoDistill  | BenefitCorr |         0.1115 |  -0.1136 |    0.2935 | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - Logit-KD   | BenefitCorr |         0.0783 |  -0.0881 |    0.2182 | False              |
| DeepDRiD Set-C      | teacher_incorrect |       78 | CSD - Feature-KD | BenefitCorr |         0.0528 |  -0.1451 |    0.2227 | False              |

## Teacher-shift magnitude quartiles

| dataset             | bin   |   n_eyes |   teacher_L1_mean | condition   |   ShiftL1_mean |   relative_ShiftL1 |   CosAgree_mean |
|:--------------------|:------|---------:|------------------:|:------------|---------------:|-------------------:|----------------:|
| DRTiD internal test | Q1    |      138 |            0.1026 | NoDistill   |         0.2437 |             2.3761 |          0.1391 |
| DRTiD internal test | Q1    |      138 |            0.1026 | Logit-KD    |         0.2298 |             2.2412 |          0.0939 |
| DRTiD internal test | Q1    |      138 |            0.1026 | Feature-KD  |         0.2361 |             2.3025 |          0.1771 |
| DRTiD internal test | Q1    |      138 |            0.1026 | CSD         |         0.2333 |             2.275  |          0.2664 |
| DRTiD internal test | Q2    |      137 |            0.2745 | NoDistill   |         0.2669 |             0.9725 |          0.3538 |
| DRTiD internal test | Q2    |      137 |            0.2745 | Logit-KD    |         0.2658 |             0.9684 |          0.2774 |
| DRTiD internal test | Q2    |      137 |            0.2745 | Feature-KD  |         0.2592 |             0.9443 |          0.3893 |
| DRTiD internal test | Q2    |      137 |            0.2745 | CSD         |         0.2545 |             0.9273 |          0.418  |
| DRTiD internal test | Q3    |      137 |            0.4606 | NoDistill   |         0.3555 |             0.7718 |          0.449  |
| DRTiD internal test | Q3    |      137 |            0.4606 | Logit-KD    |         0.3747 |             0.8135 |          0.3742 |
| DRTiD internal test | Q3    |      137 |            0.4606 | Feature-KD  |         0.3572 |             0.7755 |          0.475  |
| DRTiD internal test | Q3    |      137 |            0.4606 | CSD         |         0.3343 |             0.7258 |          0.4962 |
| DRTiD internal test | Q4    |      138 |            0.8006 | NoDistill   |         0.6364 |             0.7949 |          0.4626 |
| DRTiD internal test | Q4    |      138 |            0.8006 | Logit-KD    |         0.6649 |             0.8305 |          0.3981 |
| DRTiD internal test | Q4    |      138 |            0.8006 | Feature-KD  |         0.6339 |             0.7918 |          0.4853 |
| DRTiD internal test | Q4    |      138 |            0.8006 | CSD         |         0.5807 |             0.7254 |          0.564  |
| DeepDRiD Set-C      | Q1    |       50 |            0.0417 | NoDistill   |         0.2013 |             4.832  |          0.2791 |
| DeepDRiD Set-C      | Q1    |       50 |            0.0417 | Logit-KD    |         0.2003 |             4.808  |          0.2929 |
| DeepDRiD Set-C      | Q1    |       50 |            0.0417 | Feature-KD  |         0.2314 |             5.5546 |          0.3318 |
| DeepDRiD Set-C      | Q1    |       50 |            0.0417 | CSD         |         0.2287 |             5.4889 |          0.3591 |
| DeepDRiD Set-C      | Q2    |       50 |            0.1408 | NoDistill   |         0.2092 |             1.4862 |          0.2196 |
| DeepDRiD Set-C      | Q2    |       50 |            0.1408 | Logit-KD    |         0.1941 |             1.3789 |          0.207  |
| DeepDRiD Set-C      | Q2    |       50 |            0.1408 | Feature-KD  |         0.2047 |             1.4541 |          0.3351 |
| DeepDRiD Set-C      | Q2    |       50 |            0.1408 | CSD         |         0.2043 |             1.4515 |          0.4142 |
| DeepDRiD Set-C      | Q3    |       50 |            0.2845 | NoDistill   |         0.2776 |             0.9756 |          0.3627 |
| DeepDRiD Set-C      | Q3    |       50 |            0.2845 | Logit-KD    |         0.283  |             0.9948 |          0.2473 |
| DeepDRiD Set-C      | Q3    |       50 |            0.2845 | Feature-KD  |         0.2667 |             0.9374 |          0.357  |
| DeepDRiD Set-C      | Q3    |       50 |            0.2845 | CSD         |         0.2562 |             0.9003 |          0.4473 |
| DeepDRiD Set-C      | Q4    |       50 |            0.5965 | NoDistill   |         0.5629 |             0.9436 |          0.158  |
| DeepDRiD Set-C      | Q4    |       50 |            0.5965 | Logit-KD    |         0.554  |             0.9288 |          0.142  |
| DeepDRiD Set-C      | Q4    |       50 |            0.5965 | Feature-KD  |         0.5149 |             0.8632 |          0.301  |
| DeepDRiD Set-C      | Q4    |       50 |            0.5965 | CSD         |         0.5009 |             0.8398 |          0.3119 |

| dataset             | bin   | condition        | metric   |   effect_point |   ci_low |   ci_high | ci_excludes_zero   |
|:--------------------|:------|:-----------------|:---------|---------------:|---------:|----------:|:-------------------|
| DRTiD internal test | Q1    | CSD - NoDistill  | ShiftL1  |        -0.0104 |  -0.0519 |    0.0257 | False              |
| DRTiD internal test | Q1    | CSD - Logit-KD   | ShiftL1  |         0.0035 |  -0.0331 |    0.0421 | False              |
| DRTiD internal test | Q1    | CSD - Feature-KD | ShiftL1  |        -0.0028 |  -0.0392 |    0.035  | False              |
| DRTiD internal test | Q1    | CSD - NoDistill  | CosAgree |         0.1273 |  -0.0375 |    0.3048 | False              |
| DRTiD internal test | Q1    | CSD - Logit-KD   | CosAgree |         0.1725 |   0.0041 |    0.3672 | True               |
| DRTiD internal test | Q1    | CSD - Feature-KD | CosAgree |         0.0893 |  -0.0201 |    0.2082 | False              |
| DRTiD internal test | Q2    | CSD - NoDistill  | ShiftL1  |        -0.0124 |  -0.0396 |    0.0129 | False              |
| DRTiD internal test | Q2    | CSD - Logit-KD   | ShiftL1  |        -0.0113 |  -0.0441 |    0.022  | False              |
| DRTiD internal test | Q2    | CSD - Feature-KD | ShiftL1  |        -0.0046 |  -0.0292 |    0.0208 | False              |
| DRTiD internal test | Q2    | CSD - NoDistill  | CosAgree |         0.0641 |  -0.0754 |    0.2331 | False              |
| DRTiD internal test | Q2    | CSD - Logit-KD   | CosAgree |         0.1406 |  -0.0318 |    0.343  | False              |
| DRTiD internal test | Q2    | CSD - Feature-KD | CosAgree |         0.0287 |  -0.0755 |    0.1415 | False              |
| DRTiD internal test | Q3    | CSD - NoDistill  | ShiftL1  |        -0.0212 |  -0.0785 |    0.0387 | False              |
| DRTiD internal test | Q3    | CSD - Logit-KD   | ShiftL1  |        -0.0404 |  -0.0896 |    0.0033 | False              |
| DRTiD internal test | Q3    | CSD - Feature-KD | ShiftL1  |        -0.0229 |  -0.0663 |    0.0254 | False              |
| DRTiD internal test | Q3    | CSD - NoDistill  | CosAgree |         0.0472 |  -0.0989 |    0.1918 | False              |
| DRTiD internal test | Q3    | CSD - Logit-KD   | CosAgree |         0.122  |  -0.0383 |    0.3141 | False              |
| DRTiD internal test | Q3    | CSD - Feature-KD | CosAgree |         0.0212 |  -0.0905 |    0.1346 | False              |
| DRTiD internal test | Q4    | CSD - NoDistill  | ShiftL1  |        -0.0557 |  -0.1042 |   -0.0093 | True               |
| DRTiD internal test | Q4    | CSD - Logit-KD   | ShiftL1  |        -0.0842 |  -0.136  |   -0.0416 | True               |
| DRTiD internal test | Q4    | CSD - Feature-KD | ShiftL1  |        -0.0532 |  -0.1228 |    0.0077 | False              |
| DRTiD internal test | Q4    | CSD - NoDistill  | CosAgree |         0.1014 |   0.0057 |    0.1943 | True               |
| DRTiD internal test | Q4    | CSD - Logit-KD   | CosAgree |         0.166  |   0.0412 |    0.3138 | True               |
| DRTiD internal test | Q4    | CSD - Feature-KD | CosAgree |         0.0787 |  -0.0569 |    0.2425 | False              |
| DeepDRiD Set-C      | Q1    | CSD - NoDistill  | ShiftL1  |         0.0274 |  -0.0496 |    0.1036 | False              |
| DeepDRiD Set-C      | Q1    | CSD - Logit-KD   | ShiftL1  |         0.0284 |  -0.063  |    0.1216 | False              |
| DeepDRiD Set-C      | Q1    | CSD - Feature-KD | ShiftL1  |        -0.0027 |  -0.0681 |    0.0751 | False              |
| DeepDRiD Set-C      | Q1    | CSD - NoDistill  | CosAgree |         0.08   |  -0.1044 |    0.2686 | False              |
| DeepDRiD Set-C      | Q1    | CSD - Logit-KD   | CosAgree |         0.0662 |  -0.0838 |    0.2262 | False              |
| DeepDRiD Set-C      | Q1    | CSD - Feature-KD | CosAgree |         0.0273 |  -0.0857 |    0.1526 | False              |
| DeepDRiD Set-C      | Q2    | CSD - NoDistill  | ShiftL1  |        -0.0049 |  -0.0608 |    0.0494 | False              |
| DeepDRiD Set-C      | Q2    | CSD - Logit-KD   | ShiftL1  |         0.0102 |  -0.036  |    0.0568 | False              |
| DeepDRiD Set-C      | Q2    | CSD - Feature-KD | ShiftL1  |        -0.0004 |  -0.0451 |    0.0486 | False              |
| DeepDRiD Set-C      | Q2    | CSD - NoDistill  | CosAgree |         0.1946 |  -0.0181 |    0.4263 | False              |
| DeepDRiD Set-C      | Q2    | CSD - Logit-KD   | CosAgree |         0.2073 |  -0.0876 |    0.5287 | False              |
| DeepDRiD Set-C      | Q2    | CSD - Feature-KD | CosAgree |         0.0791 |  -0.1011 |    0.2616 | False              |
| DeepDRiD Set-C      | Q3    | CSD - NoDistill  | ShiftL1  |        -0.0214 |  -0.0615 |    0.0184 | False              |
| DeepDRiD Set-C      | Q3    | CSD - Logit-KD   | ShiftL1  |        -0.0269 |  -0.0693 |    0.0161 | False              |
| DeepDRiD Set-C      | Q3    | CSD - Feature-KD | ShiftL1  |        -0.0106 |  -0.0454 |    0.0267 | False              |
| DeepDRiD Set-C      | Q3    | CSD - NoDistill  | CosAgree |         0.0846 |  -0.0485 |    0.2357 | False              |
| DeepDRiD Set-C      | Q3    | CSD - Logit-KD   | CosAgree |         0.2    |   0.0354 |    0.3979 | True               |
| DeepDRiD Set-C      | Q3    | CSD - Feature-KD | CosAgree |         0.0903 |  -0.0329 |    0.2201 | False              |
| DeepDRiD Set-C      | Q4    | CSD - NoDistill  | ShiftL1  |        -0.062  |  -0.1113 |   -0.0083 | True               |
| DeepDRiD Set-C      | Q4    | CSD - Logit-KD   | ShiftL1  |        -0.0531 |  -0.1085 |    0.0028 | False              |
| DeepDRiD Set-C      | Q4    | CSD - Feature-KD | ShiftL1  |        -0.014  |  -0.0761 |    0.0477 | False              |
| DeepDRiD Set-C      | Q4    | CSD - NoDistill  | CosAgree |         0.1539 |  -0.0334 |    0.3512 | False              |
| DeepDRiD Set-C      | Q4    | CSD - Logit-KD   | CosAgree |         0.1699 |  -0.0029 |    0.3326 | False              |
| DeepDRiD Set-C      | Q4    | CSD - Feature-KD | CosAgree |         0.0109 |  -0.1985 |    0.2145 | False              |

All subgroup/bin analyses are exploratory; no causal claim is made.
