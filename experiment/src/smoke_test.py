"""
Wajib lolos sebelum training penuh (technical doc Section 11.4). Runs one real batch of
DRTiD data through teacher + student, all three view_modes, plus a backward pass, plus the
same-head counterfactual path — catches shape/dtype bugs in seconds instead of after a
multi-hour training run fails on the last epoch.

Run from experiment/: python src/smoke_test.py
"""

import sys
from pathlib import Path

import torch
from torch.utils.data import DataLoader

sys.path.insert(0, str(Path(__file__).resolve().parent))

from datasets import DRTiDDualViewDataset, eval_transform  # noqa: E402
from losses import combined_student_loss, get_student_output, ordinal_violation_rate  # noqa: E402
from models import DualViewLightStudent, DualViewResNetTeacher  # noqa: E402
from utils import get_device  # noqa: E402

SPLITS_DIR = Path(__file__).resolve().parents[1] / "data" / "splits"


def smoke_test():
    device = get_device()
    train_csv = SPLITS_DIR / "drtid_train.csv"
    if not train_csv.exists():
        print(f"ERROR: {train_csv} not found. Run scripts/make_splits.py first.")
        sys.exit(1)

    ds = DRTiDDualViewDataset(str(train_csv), transform=eval_transform)
    loader = DataLoader(ds, batch_size=4, shuffle=True)
    batch = next(iter(loader))
    macula, disc, y = batch["macula"].to(device), batch["disc"].to(device), batch["label"].to(device)

    print(f"Batch shapes: macula={tuple(macula.shape)} disc={tuple(disc.shape)} label={tuple(y.shape)}")

    teacher = DualViewResNetTeacher().to(device)
    student = DualViewLightStudent().to(device)

    # --- Teacher forward + monotonicity check ---
    teacher_out = teacher(macula, disc)
    assert teacher_out["p_dual"].shape == (macula.shape[0], 4), (
        f"expected p_dual shape (B, 4), got {teacher_out['p_dual'].shape}"
    )
    ovr = ordinal_violation_rate(teacher_out["p_dual"])
    assert ovr == 0.0, f"CORAL monotonicity FAILED, OrdinalViolationRate={ovr}"
    print(f"Teacher forward OK. p_dual shape={tuple(teacher_out['p_dual'].shape)}, OVR={ovr}")

    # --- Teacher forward_single ---
    single_out = teacher.forward_single(macula, which="macula")
    assert single_out["logit"].shape == (macula.shape[0], 4)
    print("Teacher forward_single OK.")

    # --- Teacher counterfactual forward (judge.md Flag 1/3 fix) ---
    cf_out = teacher.counterfactual_forward(macula, disc)
    for k in ("p_dual", "p_macula_cf", "p_disc_cf"):
        assert cf_out[k].shape == (macula.shape[0], 4), f"counterfactual output '{k}' has wrong shape"
    print("Teacher counterfactual_forward OK.")

    # --- Student: all three view_modes, loss + backward ---
    for view_mode in ["dual", "macula_only", "disc_only"]:
        student_out = get_student_output(student, macula, disc, view_mode)
        loss, log = combined_student_loss(
            teacher_out, student_out, y, view_mode, alpha=0.5, beta=0.5
        )
        loss.backward()
        student.zero_grad()
        print(f"[{view_mode}] OK -- loss={loss.item():.4f}, log={log}")

        if view_mode == "dual":
            ovr_s = ordinal_violation_rate(student_out["p_dual"])
            assert ovr_s == 0.0, f"Student CORAL monotonicity FAILED, OrdinalViolationRate={ovr_s}"

    # --- Student counterfactual CSD path end-to-end ---
    student_cf_out = student.counterfactual_forward(macula, disc)
    student_out_dual = student(macula, disc)
    loss_cf, log_cf = combined_student_loss(
        teacher_out, student_out_dual, y, "dual", alpha=0.5, beta=0.5,
        use_counterfactual_csd=True, teacher_cf_out=cf_out, student_cf_out=student_cf_out,
    )
    loss_cf.backward()
    student.zero_grad()
    print(f"[dual, counterfactual CSD] OK -- loss={loss_cf.item():.4f}, log={log_cf}")

    # --- pos_weight guard sanity (does not run against real data here, just confirms import) ---
    from utils import compute_pos_weights  # noqa: E402
    pw = compute_pos_weights(str(train_csv))
    assert pw.shape == (4,), f"expected pos_weight shape (4,), got {pw.shape}"
    print(f"compute_pos_weights OK: {pw.tolist()}")

    print("\nSMOKE TEST PASSED.")


if __name__ == "__main__":
    smoke_test()
