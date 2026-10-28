# 🧱 src/

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

A **modular** version of the DR-VERGE pipeline components. The final notebook carries its own complete implementation so it can run self-contained on Colab; the modules here present the same components as separate Python files that are easy to read, reuse and test.

| File | Main contents |
|---|---|
| [`models.py`](models.py) | `CORALHead` (ordered biases), `DualViewResNetTeacher`, `DepthwiseSeparableBlock`, `LightweightBackbone`, `DualViewLightStudent` |
| [`losses.py`](losses.py) | `coral_loss`, `aux_loss`, `logit_kd_loss`, `csd_loss` (with ablation variants), `ordinal_violation_rate`, `combined_student_loss` |
| [`datasets.py`](datasets.py) | `DRTiDDualViewDataset` (macula + optic-disc pairs), `APTOSSingleViewDataset`, augmentation transforms |
| [`pretrain_aptos.py`](pretrain_aptos.py) | Backbone pre-training on APTOS 2019 from a YAML file in [`../configs/`](../configs/) |
| [`utils.py`](utils.py) | Seeding, deterministic generators, config loader, per-threshold positive weights |
| [`smoke_test.py`](smoke_test.py) | A quick check that models, losses and data can be assembled and run |

## ▶️ Usage

Run from the `experiments/` folder, after building the local split with [`../scripts/make_splits.py`](../scripts/make_splits.py):

```bash
python scripts/make_splits.py                     # writes experiments/data/splits/ (local, not committed)
python src/smoke_test.py
python src/pretrain_aptos.py configs/pretrain_aptos_lightweight.yaml
```

> [!NOTE]
> The values actually used by the final run (384 resolution, β = 0.1, calibrated thresholds, etc.) are recorded in [`../results/configs/`](../results/configs/). Where this module and the notebook differ, **the notebook and `results/configs/` win**.
