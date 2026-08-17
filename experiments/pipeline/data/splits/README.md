# data/splits/

The committed train / validation / test partition of DRTiD, at **eye level**.

| File | Eyes |
|---|---|
| `drtid_train.csv` | 800 |
| `drtid_val.csv` | 200 |
| `drtid_test.csv` | 550 |

DRTiD's official train/test division is used as provided: its 1,000 training rows are split into
800 train / 200 validation, and its 550 test rows are held out untouched until final evaluation.

Regenerate with [`../../scripts/make_splits.py`](../../scripts/make_splits.py). The split is
deterministic, so regenerating reproduces these exact files.

> **Clustering is at eye level, not patient level.** DRTiD provides no patient identifier, so
> patient-disjoint splitting is not possible from this data — see
> [`../../../../dataset/README.md`](../../../../dataset/README.md). The internal bootstrap
> therefore clusters on eyes; the external DeepDRiD analysis clusters on patients, which that
> dataset does support.
