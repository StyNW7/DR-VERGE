"""
Backbone pretraining on APTOS 2019 (technical doc Section 7).

Two separate runs, two separate configs -- resnet50 (for the teacher) and lightweight
(for the student). The two backbones are architecturally different and their checkpoints
are NEVER interchangeable (technical doc Critical Issue 10) -- build_backbone() below is
the one place that decides which architecture a config produces, so there's no way to
accidentally load a lightweight checkpoint into the teacher or vice versa.

Run from experiment/:
    python src/pretrain_aptos.py configs/pretrain_aptos_resnet50.yaml
    python src/pretrain_aptos.py configs/pretrain_aptos_lightweight.yaml
"""

import sys
from pathlib import Path

import torch
import torch.nn as nn
from sklearn.metrics import cohen_kappa_score
from torch.utils.data import DataLoader
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).resolve().parent))

from datasets import APTOSSingleViewDataset, aptos_eval_transform, aptos_train_transform  # noqa: E402
from losses import coral_loss  # noqa: E402
from models import CORALHead, LightweightBackbone  # noqa: E402
import torchvision.models as tv  # noqa: E402
from utils import compute_pos_weights, ensure_dir, get_device, load_config, make_generator, seed_worker, set_seed  # noqa: E402


def build_backbone(backbone_type: str):
    if backbone_type == "resnet50":
        m = tv.resnet50(weights=tv.ResNet50_Weights.IMAGENET1K_V2)
        m.fc = nn.Identity()
        return m, 2048
    elif backbone_type == "lightweight":
        m = LightweightBackbone()
        return m, m.out_dim
    raise ValueError(f"unknown backbone_type: {backbone_type}")


@torch.no_grad()
def _validate(model, loader, device):
    model["backbone"].eval()
    model["head"].eval()
    preds, targets = [], []
    for batch in loader:
        img, y = batch["image"].to(device), batch["label"]
        z = model["backbone"](img)
        _, p = model["head"](z)
        grade_pred = (p > 0.5).sum(dim=1)
        preds.extend(grade_pred.cpu().tolist())
        targets.extend(y.tolist())
    return cohen_kappa_score(targets, preds, weights="quadratic")


def pretrain_backbone(config_path: str):
    cfg = load_config(config_path)
    set_seed(cfg["seed"])
    device = get_device()
    print(f"Device: {device}")

    pos_weight = compute_pos_weights(cfg["train_csv"], grade_col="diagnosis").to(device)

    train_ds = APTOSSingleViewDataset(cfg["train_csv"], cfg["train_root_dir"], aptos_train_transform)
    val_ds = APTOSSingleViewDataset(cfg["val_csv"], cfg["val_root_dir"], aptos_eval_transform)

    g = make_generator(cfg["seed"])
    train_loader = DataLoader(
        train_ds, batch_size=cfg["batch_size"], shuffle=True,
        num_workers=cfg.get("num_workers", 4), worker_init_fn=seed_worker, generator=g,
    )
    val_loader = DataLoader(val_ds, batch_size=cfg["batch_size"], shuffle=False, num_workers=cfg.get("num_workers", 4))

    backbone, feat_dim = build_backbone(cfg["backbone_type"])
    head = CORALHead(feat_dim, num_classes=5)
    model = {"backbone": backbone.to(device), "head": head.to(device)}

    opt = torch.optim.Adam(
        list(model["backbone"].parameters()) + list(model["head"].parameters()), lr=cfg["lr"]
    )

    best_qwk = -1.0
    ensure_dir(cfg["output_backbone_ckpt"])

    for epoch in range(cfg["epochs"]):
        model["backbone"].train()
        model["head"].train()
        for batch in tqdm(train_loader, desc=f"[pretrain-{cfg['backbone_type']}] epoch {epoch}"):
            img, y = batch["image"].to(device), batch["label"].to(device)
            z = model["backbone"](img)
            logit, _ = model["head"](z)
            loss = coral_loss(logit, y, pos_weight=pos_weight)

            opt.zero_grad()
            loss.backward()
            opt.step()

        val_qwk = _validate(model, val_loader, device)
        print(f"epoch {epoch}: val_QWK={val_qwk:.4f}")
        if val_qwk > best_qwk:
            best_qwk = val_qwk
            torch.save(model["backbone"].state_dict(), cfg["output_backbone_ckpt"])  # backbone-ONLY
            print(f"  -> new best, saved to {cfg['output_backbone_ckpt']}")

    print(f"Pretraining {cfg['backbone_type']} selesai. Best val QWK = {best_qwk:.4f}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python src/pretrain_aptos.py <config_path>")
        sys.exit(1)
    pretrain_backbone(sys.argv[1])
