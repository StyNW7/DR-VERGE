# dataset/

Three datasets back DR-VERGE. **None are committed to git** — they are large and carry their
own licences. This file documents the expected layout and where to obtain each.

```
dataset/
├── DRTiD/           primary — training and internal test
├── APTOS/           backbone pre-training
├── DeepDRiD-master/ external validation
└── reference.md     source notes
```

`.gitignore` excludes `DRTiD/`, `APTOS/`, `DeepDRiD/` and `DeepDRiD-master/` by basename, so
they stay untracked wherever they sit.

---

## DRTiD — primary

**1,550 patient-eyes · 3,100 images · grades 0–4 · genuinely dual-view.**

Each eye contributes two photographs — one macula-centred, one optic-disc-centred. This
pairing *is* the research object; without it there is no complementarity to distil.

```
DRTiD/
├── Original Images/
└── Ground Truths/
    └── DR_grade/
        ├── a. DR_grade_Training.csv    1,000 rows
        └── b. DR_grade_Testing.csv       550 rows
```

The official train/test division is used **as provided**. The 1,000 training rows are split
patient-wise into **800 train / 200 validation**; the 550 test rows were untouched until final
evaluation. Prepared splits are committed at
[`../experiments/pipeline/data/splits/`](../experiments/pipeline/data/splits/) and regenerated
by `scripts/make_splits.py`.

**Why DRTiD and not something larger:** it is the dataset used by **CrossFiT (2022)**, the
source of the 80.47% / 77.87% / 84.21% macula-only / disc-only / dual-view figures that motivate
this work. Training on it makes DR-VERGE's numbers *directly comparable* to that benchmark
rather than merely adjacent to it.

---

## APTOS 2019 — pre-training

**3,662 single-view fundus images** (Kaggle), split 2,930 train / 366 validation.

Used only to give the backbone a strong retinal representation before dual-view fine-tuning.
DRTiD alone is far too small to train a backbone from scratch. APTOS is single-view and never
used for dual-view evaluation.

---

## DeepDRiD — external validation

Held out entirely from training; used to test generalisation under distribution shift.

Partitioned into **Set-A / Set-B / Set-C**, with **Set-C pre-registered as the confirmatory
partition** (100 patients · 200 eyes · 400 images, 0 exclusions, partitions disjoint). Set-A and
Set-B are supplementary.

> **Why it is not training data.** DeepDRiD's public CSV does not label which field (`_l1` /
> `_l2` per eye) is macula- vs disc-centred — the exact distinction DR-VERGE depends on — and
> its "evaluation" subset ships with empty labels for an online challenge. Both facts are
> disqualifying for training, neither for held-out evaluation under a stated field ordering.
> External results are reported **under both field orderings**, since the mapping is inferred.

---

## Obtaining the data

| Dataset | Source |
|---|---|
| DRTiD | Public research release — see `reference.md` |
| APTOS 2019 | Kaggle: *APTOS 2019 Blindness Detection* |
| DeepDRiD | Public challenge release — see `reference.md` |

Each retains its original licence. **Nothing is redistributed through this repository.**

---

## Notebooks do not read from here

The pipeline runs on Google Colab and resolves data through Google Drive:

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
```

DRTiD is then found by search (`_find_drtid`). This directory is the **local working copy**;
moving or renaming it cannot break the notebooks.
</content>
