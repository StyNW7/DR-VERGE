# DR-VERGE Dataset

**Decision (confirmed 6 Agustus 2026, resolves `docs/roadmap.md` Decision Point #0):**
DRTiD is primary training/eval. APTOS is pretraining-only. DeepDRiD is dropped from the core plan.
Verified directly against the raw files in `dataset/` — not just assumed from the source repos' READMEs.

---

## DRTiD — PRIMARY training + evaluation dataset
https://github.com/fdu-vts/drtid

**This is the same dataset used by CrossFiT (2022)** — the paper `overview.md` cites for the
80.47% (macula-only) / 77.87% (disc-only) / 84.21% (dual-view) benchmark numbers. Training on DRTiD
means DR-VERGE's own macula-only/disc-only/dual-view results are directly comparable to that
benchmark, not just citing it as motivation.

- **Verified structure:** `Ground Truths/DR_grade/a. DR_grade_Training.csv` and `b. DR_grade_Testing.csv`,
  columns: `ID, Grade, Macula, Optic disc, LR`. Each row is one eye-record with the macula and optic-disc
  image IDs already paired — no macula/disc field-type guessing needed (unlike DeepDRiD, see below).
- **This IS the official split** — use `a.`/`b.` as-is. Do **not** re-run `train_test_split` on this
  dataset; that would throw away the one dataset here that actually resolves Gate 1's "resmi vs custom
  split" ambiguity cleanly.
- **Verified 7 Agustus 2026: `ID` is a per-eye identifier, not a patient identifier.** Checked every row
  across both official CSVs directly — all 1550 `ID` values are unique, and none appears with both an
  `L` and `R` row. DRTiD's public ground truth exposes no field linking two eyes back to the same real
  patient. Any split, "patient overlap" check, or bootstrap grouped by `ID` (as the pipeline does,
  since it's the finest key the data provides) is therefore **eye-wise, not verified patient-wise** —
  it's possible both eyes of one real person land in different splits, and nothing in the released
  metadata rules that out. State this explicitly as a limitation in the paper; don't claim "patient-wise
  split" without the caveat.
- **Counts (verified 2026-08-06):** Training = 1000 rows (2000 images), Testing = 550 rows (1100 images).
  Total 1550 eye-records / 3100 images.
- **Grade distribution (verified):**

  | Grade | Train | Test |
  |---|---|---|
  | 0 | 482 | 265 |
  | 1 | 90 | 50 |
  | 2 | 260 | 146 |
  | 3 | 130 | 69 |
  | 4 | 38 | 20 |

  All 5 grades present in both splits — no missing-class risk. Imbalanced (Grade 0 ≈ 48%, Grade 4 ≈ 4%),
  confirming `pos_weight` per-threshold handling (technical doc Section 2.4) is necessary.
- **Bonus asset:** `Ground Truths/Optic_Macula_Localization/op_ma_localization.csv` gives bounding boxes
  for both fields per image — usable for a Flag-15-style confounding check (does Δ correlate with lesion
  location / image quality) without extra annotation work.
- **Path convention:** images are flat files in `Original Images/<ID>_1.jpg` (macula) and `<ID>_2.jpg`
  (optic disc) per the CSV's `Macula`/`Optic disc` columns — confirm this `_1`=Macula / `_2`=Optic disc
  mapping against a few rows before writing the dataset loader, don't assume it holds for every ID.

## APTOS 2019 — pretraining backbone only (unchanged)
https://www.kaggle.com/datasets/mariaherrerot/aptos2019

- Single-view (`id_code, diagnosis`), no dual-view pairing — never used for teacher/student task training,
  only for the two backbone-pretraining runs (Section 7 of the technical doc).
- **Verified counts:** train_1.csv = 2929 rows, valid.csv = 365 rows, test.csv = 868 rows.

## DeepDRiD — dropped from core plan
https://github.com/deepdrdoc/DeepDRiD

Checked directly and it does **not** cleanly support the dual-view pipeline the way DRTiD does:

- CSV columns are `patient_id, image_id, image_path, ..., left_eye_DR_Level, right_eye_DR_Level, ...`
  with images named `<patient>_l1/_l2/_r1/_r2`. There is **no column indicating which of `_1`/`_2` is
  macula-centered vs optic-disc-centered** — this must come from the dataset's own paper or
  `Readme.docx` (not yet checked), not assumed.
- The one subset that's actually labeled "evaluation" (`Online-Challenge1&2-Evaluation`, 400 images) has
  **empty DR_Level labels** in `Challenge1_upload.csv` — it's a blind competition test set with no ground
  truth available here, so it can't be used for any metric you'd report.
- Usable labeled data is smaller than DRTiD regardless: ~400 patients (1200 train + 400 val images) vs
  DRTiD's 1550 eye-records / 3100 images.

**Only reconsider DeepDRiD if** someone confirms the `_1`/`_2` field-type mapping cheaply (check the
dataset's own paper/Readme.docx) and there's spare time after the core DRTiD pipeline is done — treat it
as an optional generalization check, not a dependency for RQ1/RQ2.
