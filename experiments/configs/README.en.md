# ⚙️ configs/

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

One YAML file per training condition. Each file fixes the architecture, optimiser, schedule and loss weights for a single arm of the experiment, so a condition can be understood without reading the notebook.

| File | Condition |
|---|---|
| [`teacher.yaml`](teacher.yaml) | Dual-view ResNet-50 teacher |
| [`student_dual_csd.yaml`](student_dual_csd.yaml) | **Proposed** — Logit-KD + Complementarity-Shift Distillation |
| [`student_dual_logitkd.yaml`](student_dual_logitkd.yaml) | Baseline — logit distillation only |
| [`student_dual_no_distill.yaml`](student_dual_no_distill.yaml) | Baseline — dual-view, no distillation |
| [`student_macula_only.yaml`](student_macula_only.yaml) | Single-view control, macula field |
| [`student_disc_only.yaml`](student_disc_only.yaml) | Single-view control, optic-disc field |
| [`pretrain_aptos_resnet50.yaml`](pretrain_aptos_resnet50.yaml) | APTOS pre-training for the teacher backbone |
| [`pretrain_aptos_lightweight.yaml`](pretrain_aptos_lightweight.yaml) | APTOS pre-training for the student backbone |

Paths inside the YAMLs (`data/splits/…`, `checkpoints/…`) are relative to the `experiments/` folder.

> [!IMPORTANT]
> These YAMLs **describe** each condition. The values the final run **actually executed** — the outcome of the validation grid search — are locked in [`../results/configs/`](../results/configs/), notably `config.json` and `selected_hyperparameters.json` (α = 0.5 · τ = 2.0 · γ = 2.0 · β = 0.1 · variant `smoothl1_norm`). That is the authoritative record.
