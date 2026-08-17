# configs/

One YAML per training condition. Each file fixes the architecture, optimiser, schedule, and
loss weights for a single arm of the experiment, so a condition can be reproduced without
reading the notebook.

| File | Condition |
|---|---|
| `teacher.yaml` | Dual-view ResNet-50 teacher |
| `student_dual_csd.yaml` | **Proposed** — Logit-KD + Complementarity-Shift Distillation |
| `student_dual_logitkd.yaml` | Baseline — logit distillation only |
| `student_dual_no_distill.yaml` | Baseline — dual-view, no distillation |
| `student_macula_only.yaml` | Single-view control, macula field |
| `student_disc_only.yaml` | Single-view control, optic-disc field |
| `pretrain_aptos_resnet50.yaml` | APTOS pre-training for the teacher backbone |
| `pretrain_aptos_lightweight.yaml` | APTOS pre-training for the student backbone |

The values actually used by the final run are frozen in
`../../results/enhanced-notebook/outputs/configs/`, which is the authoritative record. These
YAMLs describe the conditions; that directory records what was executed.
