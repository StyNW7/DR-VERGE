"""
Gate 1 (Dataset) verification + split generation for DRTiD.

DRTiD already ships an OFFICIAL train/test split — 'a. DR_grade_Training.csv' (1000 rows)
and 'b. DR_grade_Testing.csv' (550 rows). We use that split as-is for the outer
train/test boundary (never re-shuffled), and only carve our OWN patient-wise train/val
split out of the 1000 official training rows, since DRTiD gives no val set. This is the
whole point of Decision Point #0 in docs/roadmap.md: use the one dataset here that
actually resolves the "resmi vs custom split" ambiguity cleanly, rather than reintroducing
a custom split where an official one already exists.

Output: experiment/data/splits/{drtid_train.csv, drtid_val.csv, drtid_test.csv}
Columns: patient_id, macula_path, disc_path, grade
(standardized column names — decoupled from DRTiD's own 'ID, Grade, Macula, Optic disc, LR'
naming so downstream code in datasets.py doesn't need to know DRTiD's raw schema.)
"""

import sys
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

REPO_ROOT = Path(__file__).resolve().parents[2]
DRTID_ROOT = REPO_ROOT / "dataset" / "DRTiD" / "DRTiD"
IMAGES_DIR = DRTID_ROOT / "Original Images"
OFFICIAL_TRAIN_CSV = DRTID_ROOT / "Ground Truths" / "DR_grade" / "a. DR_grade_Training.csv"
OFFICIAL_TEST_CSV = DRTID_ROOT / "Ground Truths" / "DR_grade" / "b. DR_grade_Testing.csv"

SPLITS_DIR = Path(__file__).resolve().parents[1] / "data" / "splits"

SEED = 42
VAL_FRACTION = 0.2  # carved out of the official 1000 training rows, patient-wise


def _standardize(df: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame(
        {
            "patient_id": df["ID"],
            "macula_path": df["Macula"].apply(lambda s: str(IMAGES_DIR / f"{s}.jpg")),
            "disc_path": df["Optic disc"].apply(lambda s: str(IMAGES_DIR / f"{s}.jpg")),
            "grade": df["Grade"],
        }
    )
    return out


def _verify_paths_exist(df: pd.DataFrame, name: str):
    missing = []
    for col in ("macula_path", "disc_path"):
        for p in df[col]:
            if not Path(p).exists():
                missing.append(p)
    if missing:
        raise FileNotFoundError(
            f"[{name}] {len(missing)} image path(s) referenced in the split CSV do not "
            f"exist on disk. First few missing: {missing[:5]}"
        )


def _report_grade_distribution(df: pd.DataFrame, name: str):
    dist = df["grade"].value_counts().sort_index()
    print(f"[{name}] n={len(df)}  grade distribution:")
    for grade, count in dist.items():
        print(f"    Grade {grade}: {count} ({100 * count / len(df):.1f}%)")
    missing_grades = set(range(5)) - set(dist.index)
    if missing_grades:
        print(f"    WARNING: grades {sorted(missing_grades)} are entirely absent from {name}.")


def main():
    if not OFFICIAL_TRAIN_CSV.exists() or not OFFICIAL_TEST_CSV.exists():
        print(f"ERROR: expected DRTiD official split CSVs not found under {DRTID_ROOT}")
        print(f"  looked for: {OFFICIAL_TRAIN_CSV}")
        print(f"  looked for: {OFFICIAL_TEST_CSV}")
        sys.exit(1)

    raw_train = pd.read_csv(OFFICIAL_TRAIN_CSV)
    raw_test = pd.read_csv(OFFICIAL_TEST_CSV)

    # Gate 1 — no patient overlap between official train and test (should hold by
    # construction since this is the dataset's own split, but confirm rather than assume).
    overlap = set(raw_train["ID"]) & set(raw_test["ID"])
    if overlap:
        raise ValueError(
            f"Gate 1 FAILED: {len(overlap)} patient ID(s) appear in BOTH the official "
            f"train and test CSVs: {sorted(overlap)[:10]}"
        )
    print(f"Gate 1 check: no patient overlap between official train ({len(raw_train)}) "
          f"and test ({len(raw_test)}) — OK.")

    # Carve our own patient-wise train/val split out of the 1000 official training rows.
    train_ids, val_ids = train_test_split(
        raw_train["ID"].values, test_size=VAL_FRACTION, random_state=SEED
    )
    train_df = _standardize(raw_train[raw_train["ID"].isin(train_ids)])
    val_df = _standardize(raw_train[raw_train["ID"].isin(val_ids)])
    test_df = _standardize(raw_test)

    # Gate 1 — no patient overlap between our train/val carve-out and the official test set.
    val_test_overlap = set(val_df["patient_id"]) & set(test_df["patient_id"])
    train_val_overlap = set(train_df["patient_id"]) & set(val_df["patient_id"])
    if val_test_overlap or train_val_overlap:
        raise ValueError(
            f"Gate 1 FAILED: patient overlap after split — "
            f"train/val={len(train_val_overlap)}, val/test={len(val_test_overlap)}"
        )

    _verify_paths_exist(train_df, "train")
    _verify_paths_exist(val_df, "val")
    _verify_paths_exist(test_df, "test")
    print("Gate 1 check: every macula/disc image path resolves to a real file — OK.")

    _report_grade_distribution(train_df, "train")
    _report_grade_distribution(val_df, "val")
    _report_grade_distribution(test_df, "test (official)")

    SPLITS_DIR.mkdir(parents=True, exist_ok=True)
    train_df.to_csv(SPLITS_DIR / "drtid_train.csv", index=False)
    val_df.to_csv(SPLITS_DIR / "drtid_val.csv", index=False)
    test_df.to_csv(SPLITS_DIR / "drtid_test.csv", index=False)

    print(f"\nWrote splits to {SPLITS_DIR}")
    print(f"  drtid_train.csv: {len(train_df)} rows")
    print(f"  drtid_val.csv:   {len(val_df)} rows")
    print(f"  drtid_test.csv:  {len(test_df)} rows (official test set — touch ONLY at final evaluation)")
    print("\nGate 1: PASSED.")


if __name__ == "__main__":
    main()
