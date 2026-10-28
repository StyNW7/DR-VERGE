# 🗃️ dataset/

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

DR-VERGE uses three public datasets. **None are committed to git** — they are large and each carries its own licence. This document describes the expected layout and where to obtain each dataset.

```text
dataset/
├── DRTiD/              primary — training, validation and internal test
├── APTOS/              backbone pre-training
└── DeepDRiD-master/    external confirmatory evaluation
```

`.gitignore` excludes `DRTiD/`, `APTOS/`, `DeepDRiD/` and `DeepDRiD-master/` by folder name, so they stay untracked wherever they sit.

| Dataset | Role | Size | Source |
|---|---|---|---|
| **DRTiD** | Primary | 1,550 examined-eye records · 3,100 images · grades 0–4 | [github.com/fdu-vts/drtid](https://github.com/fdu-vts/drtid) |
| **APTOS 2019** | Backbone pre-training | 3,662 single-view images | [Kaggle — APTOS 2019 Blindness Detection](https://www.kaggle.com/competitions/aptos2019-blindness-detection) |
| **DeepDRiD** | External evaluation | Set-C: 100 patients · 200 eyes · 400 images | [github.com/deepdrdoc/DeepDRiD](https://github.com/deepdrdoc/DeepDRiD) |

---

## 👁️ DRTiD — primary dataset

**1,550 eyes · 3,100 images · grades 0–4 · genuinely dual-view.** Every eye has two photographs — one macula-centred, one optic-disc-centred. This pairing is the research object; without it there is no complementarity to distil.

```text
DRTiD/
├── Original Images/
└── Ground Truths/
    ├── DR_grade/
    │   ├── a. DR_grade_Training.csv    1,000 rows
    │   └── b. DR_grade_Testing.csv       550 rows
    └── Optic_Macula_Localization/
```

The official partition is used **as provided**. The 1,000 training rows are split, stratified by grade, into **800 train / 200 validation** (seed 42); the 550 test rows stay untouched until final evaluation. The exact partition used by the final run is in [`../experiments/results/splits/`](../experiments/results/splits/).

**Why DRTiD:** it is also the dataset used by **CrossFiT (2022)**, so DR-VERGE's macula-only / disc-only / dual-view results are directly comparable to that benchmark.

### Field order and laterality — verified, not assumed

The `Macula` and `Optic disc` columns name the two files per eye, with the suffix convention **`_1` = macula-centred, `_2` = optic-disc-centred**. Checked against `op_ma_localization.csv` across all 3,100 images: in `_1` the macula sits nearer the frame centre than the disc in **99.4%** of cases, and the reverse holds in `_2` for **99.3%**. The `LR` column is consistent with image geometry on **1,550 of 1,550** records.

**DRTiD carries no patient identifier.** Every ID belongs to exactly one eye (1,550 IDs for 1,550 eyes), and consecutive IDs pair as opposite eyes only **50.2%** of the time — chance level. Patient grouping cannot be recovered, so internal splits are **eye-disjoint** and the internal bootstrap clusters on eyes. Worked examples: [`../research/knowledge/drtid-laterality-examples/`](../research/knowledge/drtid-laterality-examples/).

---

## 🧠 APTOS 2019 — pre-training

**3,662 single-view fundus images**, split 2,930 train / 366 validation. Used only to give the backbone a strong retinal representation before dual-view fine-tuning — DRTiD is too small to train a backbone from scratch. APTOS is never used for dual-view evaluation.

---

## 🌍 DeepDRiD — external evaluation

Held out entirely from training; used to test generalisation under distribution shift. Partitioned into **Set-A / Set-B / Set-C**, with **Set-C fixed in advance as the confirmatory partition** (100 patients · 200 eyes · 400 images, disjoint partitions). Set-A and Set-B are supplementary.

- **Not training data.** DeepDRiD's public CSV does not mark which field (`_1`/`_2`) is macula- or disc-centred — the very distinction DR-VERGE depends on. Because the mapping is inferred, external results are reported under **both field orderings**, with `_1 = macula` as the primary ordering.
- **Has a `patient_id`.** External confidence intervals therefore cluster on **patients** — the stricter standard — while internal ones cluster on eyes. The two datasets cover each other's gap.

---

## ☁️ The notebook does not read from this folder

The pipeline runs on Google Colab and reads data from Google Drive:

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"   # datasets go in DRIVE_BASE/dataset/
```

DRTiD and DeepDRiD are located automatically. The `dataset/` folder in this repository is a **local working copy** for [`../experiments/scripts/make_splits.py`](../experiments/scripts/make_splits.py) and the [`../experiments/src/`](../experiments/src/) modules; moving or renaming it cannot break the notebook.

> [!IMPORTANT]
> **No data is redistributed through this repository.** Access to each dataset must be obtained directly from its provider under its terms of use.
