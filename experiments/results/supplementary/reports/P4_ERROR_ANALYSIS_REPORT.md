# P4 — Per-grade error analysis (frozen thresholds, cached predictions)

## Model summary

| dataset             | model      |   n_seeds |    QWK |   ExactAccuracy |   AdjacentAccuracy |   SevereErrorRate |    MAE |   MacroF1 |   BalancedAccuracy |
|:--------------------|:-----------|----------:|-------:|----------------:|-------------------:|------------------:|-------:|----------:|-------------------:|
| DRTiD internal test | Teacher    |         1 | 0.7364 |          0.5909 |             0.8236 |            0.1764 | 0.5909 |    0.3887 |             0.4609 |
| DRTiD internal test | NoDistill  |         5 | 0.6042 |          0.4793 |             0.7495 |            0.2505 | 0.8105 |    0.3355 |             0.3954 |
| DRTiD internal test | Logit-KD   |         5 | 0.5942 |          0.5062 |             0.7513 |            0.2487 | 0.7775 |    0.3589 |             0.4021 |
| DRTiD internal test | Feature-KD |         5 | 0.6161 |          0.5098 |             0.7604 |            0.2396 | 0.7702 |    0.3435 |             0.3992 |
| DRTiD internal test | CSD        |         5 | 0.6018 |          0.5033 |             0.7418 |            0.2582 | 0.7902 |    0.3362 |             0.3894 |
| DeepDRiD Set-C      | Teacher    |         1 | 0.7923 |          0.61   |             0.895  |            0.105  | 0.52   |    0.3875 |             0.4302 |
| DeepDRiD Set-C      | NoDistill  |         5 | 0.6467 |          0.511  |             0.797  |            0.203  | 0.768  |    0.3507 |             0.404  |
| DeepDRiD Set-C      | Logit-KD   |         5 | 0.6393 |          0.546  |             0.808  |            0.192  | 0.723  |    0.3661 |             0.3906 |
| DeepDRiD Set-C      | Feature-KD |         5 | 0.6754 |          0.545  |             0.818  |            0.182  | 0.705  |    0.3691 |             0.4063 |
| DeepDRiD Set-C      | CSD        |         5 | 0.6688 |          0.538  |             0.826  |            0.174  | 0.711  |    0.3439 |             0.3844 |

## Grade 1 — where do the errors go?

| dataset             | model      |   support_grade1 |   to_grade0_rate |   to_grade1_rate |   to_grade2_rate |   to_grade3_rate |   to_grade4_rate |
|:--------------------|:-----------|-----------------:|-----------------:|-----------------:|-----------------:|-----------------:|-----------------:|
| DRTiD internal test | Teacher    |               50 |            0.72  |            0     |            0.14  |            0.1   |            0.04  |
| DRTiD internal test | NoDistill  |               50 |            0.58  |            0.084 |            0.18  |            0.12  |            0.036 |
| DRTiD internal test | Logit-KD   |               50 |            0.648 |            0.08  |            0.144 |            0.108 |            0.02  |
| DRTiD internal test | Feature-KD |               50 |            0.64  |            0.08  |            0.148 |            0.112 |            0.02  |
| DRTiD internal test | CSD        |               50 |            0.652 |            0.068 |            0.148 |            0.1   |            0.032 |
| DeepDRiD Set-C      | Teacher    |               18 |            0.889 |            0     |            0.056 |            0.056 |            0     |
| DeepDRiD Set-C      | NoDistill  |               18 |            0.611 |            0.133 |            0.178 |            0.044 |            0.033 |
| DeepDRiD Set-C      | Logit-KD   |               18 |            0.667 |            0.133 |            0.133 |            0.056 |            0.011 |
| DeepDRiD Set-C      | Feature-KD |               18 |            0.622 |            0.1   |            0.156 |            0.1   |            0.022 |
| DeepDRiD Set-C      | CSD        |               18 |            0.589 |            0.044 |            0.289 |            0.044 |            0.033 |

## Per-grade precision / recall / F1 (mean over seeds)

| dataset             | model      |   grade |   support |   Precision_mean |   Recall_mean |   F1_mean |
|:--------------------|:-----------|--------:|----------:|-----------------:|--------------:|----------:|
| DRTiD internal test | Teacher    |       0 |       265 |            0.702 |         0.932 |     0.801 |
| DRTiD internal test | Teacher    |       1 |        50 |            0     |         0     |     0     |
| DRTiD internal test | Teacher    |       2 |       146 |            0.535 |         0.26  |     0.35  |
| DRTiD internal test | Teacher    |       3 |        69 |            0.403 |         0.362 |     0.382 |
| DRTiD internal test | Teacher    |       4 |        20 |            0.283 |         0.75  |     0.411 |
| DRTiD internal test | NoDistill  |       0 |       265 |            0.666 |         0.727 |     0.694 |
| DRTiD internal test | NoDistill  |       1 |        50 |            0.094 |         0.084 |     0.088 |
| DRTiD internal test | NoDistill  |       2 |       146 |            0.383 |         0.223 |     0.281 |
| DRTiD internal test | NoDistill  |       3 |        69 |            0.33  |         0.313 |     0.319 |
| DRTiD internal test | NoDistill  |       4 |        20 |            0.193 |         0.63  |     0.295 |
| DRTiD internal test | Logit-KD   |       0 |       265 |            0.643 |         0.783 |     0.704 |
| DRTiD internal test | Logit-KD   |       1 |        50 |            0.096 |         0.08  |     0.085 |
| DRTiD internal test | Logit-KD   |       2 |       146 |            0.376 |         0.196 |     0.256 |
| DRTiD internal test | Logit-KD   |       3 |        69 |            0.419 |         0.391 |     0.404 |
| DRTiD internal test | Logit-KD   |       4 |        20 |            0.253 |         0.56  |     0.345 |
| DRTiD internal test | Feature-KD |       0 |       265 |            0.667 |         0.808 |     0.73  |
| DRTiD internal test | Feature-KD |       1 |        50 |            0.124 |         0.08  |     0.096 |
| DRTiD internal test | Feature-KD |       2 |       146 |            0.399 |         0.186 |     0.252 |
| DRTiD internal test | Feature-KD |       3 |        69 |            0.329 |         0.342 |     0.335 |
| DRTiD internal test | Feature-KD |       4 |        20 |            0.207 |         0.58  |     0.304 |
| DRTiD internal test | CSD        |       0 |       265 |            0.652 |         0.803 |     0.719 |
| DRTiD internal test | CSD        |       1 |        50 |            0.122 |         0.068 |     0.087 |
| DRTiD internal test | CSD        |       2 |       146 |            0.365 |         0.192 |     0.249 |
| DRTiD internal test | CSD        |       3 |        69 |            0.351 |         0.304 |     0.323 |
| DRTiD internal test | CSD        |       4 |        20 |            0.206 |         0.58  |     0.302 |
| DeepDRiD Set-C      | Teacher    |       0 |       100 |            0.752 |         0.94  |     0.836 |
| DeepDRiD Set-C      | Teacher    |       1 |        18 |            0     |         0     |     0     |
| DeepDRiD Set-C      | Teacher    |       2 |        36 |            0.48  |         0.333 |     0.393 |
| DeepDRiD Set-C      | Teacher    |       3 |        36 |            0.417 |         0.278 |     0.333 |
| DeepDRiD Set-C      | Teacher    |       4 |        10 |            0.273 |         0.6   |     0.375 |
| DeepDRiD Set-C      | NoDistill  |       0 |       100 |            0.746 |         0.758 |     0.751 |
| DeepDRiD Set-C      | NoDistill  |       1 |        18 |            0.185 |         0.133 |     0.154 |
| DeepDRiD Set-C      | NoDistill  |       2 |        36 |            0.353 |         0.311 |     0.327 |
| DeepDRiD Set-C      | NoDistill  |       3 |        36 |            0.316 |         0.178 |     0.225 |
| DeepDRiD Set-C      | NoDistill  |       4 |        10 |            0.195 |         0.64  |     0.297 |
| DeepDRiD Set-C      | Logit-KD   |       0 |       100 |            0.715 |         0.832 |     0.767 |
| DeepDRiD Set-C      | Logit-KD   |       1 |        18 |            0.175 |         0.133 |     0.149 |
| DeepDRiD Set-C      | Logit-KD   |       2 |        36 |            0.442 |         0.289 |     0.343 |
| DeepDRiD Set-C      | Logit-KD   |       3 |        36 |            0.431 |         0.239 |     0.305 |
| DeepDRiD Set-C      | Logit-KD   |       4 |        10 |            0.189 |         0.46  |     0.266 |
| DeepDRiD Set-C      | Feature-KD |       0 |       100 |            0.745 |         0.808 |     0.772 |
| DeepDRiD Set-C      | Feature-KD |       1 |        18 |            0.195 |         0.1   |     0.13  |
| DeepDRiD Set-C      | Feature-KD |       2 |        36 |            0.467 |         0.356 |     0.396 |
| DeepDRiD Set-C      | Feature-KD |       3 |        36 |            0.356 |         0.228 |     0.277 |
| DeepDRiD Set-C      | Feature-KD |       4 |        10 |            0.182 |         0.54  |     0.271 |
| DeepDRiD Set-C      | CSD        |       0 |       100 |            0.747 |         0.824 |     0.782 |
| DeepDRiD Set-C      | CSD        |       1 |        18 |            0.059 |         0.044 |     0.051 |
| DeepDRiD Set-C      | CSD        |       2 |        36 |            0.421 |         0.339 |     0.374 |
| DeepDRiD Set-C      | CSD        |       3 |        36 |            0.378 |         0.194 |     0.252 |
| DeepDRiD Set-C      | CSD        |       4 |        10 |            0.175 |         0.52  |     0.261 |

Diagnostic only; not a clinical claim.
