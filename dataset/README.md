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
into **800 train / 200 validation**; the 550 test rows were untouched until final
evaluation. Prepared splits are committed at
[`../experiments/pipeline/data/splits/`](../experiments/pipeline/data/splits/) and regenerated
by `scripts/make_splits.py`.

**Why DRTiD and not something larger:** it is the dataset used by **CrossFiT (2022)**, the
source of the 80.47% / 77.87% / 84.21% macula-only / disc-only / dual-view figures that motivate
this work. Training on it makes DR-VERGE's numbers *directly comparable* to that benchmark
rather than merely adjacent to it.

### Field order and laterality — verified, not assumed

The `Macula` and `Optic disc` columns name the two files per eye, and the suffix convention is
**`_1` = macula-centred, `_2` = disc-centred**. Checked against
`Ground Truths/Optic_Macula_Localization/op_ma_localization.csv` across all 3,100 images: in
`_1` the macula sits nearer the frame centre than the disc in **99.4%** of cases, and the
reverse holds in `_2` for **99.3%**. The `LR` column is likewise consistent with image geometry
on **1,550 of 1,550** records.

**DRTiD carries no patient identifier.** Every ID belongs to exactly one eye (1,550 IDs for
1,550 eyes), and consecutive IDs pair as opposite eyes only **50.2%** of the time — chance.
Patient grouping cannot be recovered, so internal splits are **eye-disjoint** and the internal
bootstrap clusters on eyes. This is a property of the source data and applies equally to every
study using DRTiD. Worked examples:
[`../research/knowledge/drtid-laterality-examples/`](../research/knowledge/drtid-laterality-examples/).

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

> **Field order runs opposite to DRTiD.** Visual inspection of DeepDRiD pairs shows `_1` is
> **disc**-centred and `_2` is **macula**-centred — the reverse of DRTiD's convention. No
> localization file ships with DeepDRiD, so this cannot be verified automatically at scale: a
> brightness-based disc detector calibrated against DRTiD's ground truth reached only **81%**
> pairwise accuracy, which is enough to shortlist candidates but not to label anything
> authoritatively. Reporting both field orderings is what makes the external result safe
> regardless.

**What DeepDRiD does provide that DRTiD does not:** a `patient_id` column, with separate DR
grades for the left and right eye. External confidence intervals therefore cluster on
**patients** — the stricter standard — while internal ones cluster on eyes. The two datasets
cover each other's gap.

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
