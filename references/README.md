# references/

Academic grounding for DR-VERGE — the work it builds on, compares against, and is judged
beside.

```
references/
├── literature/        reading notes on papers and datasets
├── past-papers/       prior competition submissions
└── large-references/  reference implementations and bibliography
```

---

## literature/

| File | Holds |
|---|---|
| `paper.md` | Notes on the papers forming the research gap |
| `dataset.md` | Dataset survey and the reasoning behind DRTiD / APTOS / DeepDRiD |

The gap argument these support, in short — each row is a paper that has *some* of the pieces,
none has the combination:

| Work | Two-field | KD | Lightweight | Distils complementarity gain | Quantized |
|---|:--:|:--:|:--:|:--:|:--:|
| DeepDRiD (dataset) | ✓ | ✗ | ✗ | ✗ | ✗ |
| CrossFiT (2022) | ✓ | ✗ | ✗ | ✗ | ✗ |
| MVGFDR (2026) | ✓ | ✗ | ✗ | ✗ | ✗ |
| OrthKD / MobileNet-KD DR | ✗ | ✓ | ✓ | ✗ | ✗ |
| Dual-View Thyroid Ultrasound KD | ✓ | ✓ | ✓ | ✗ | ✗ |
| Pink-MVAN (2025, mammography) | ✓ | ✓ | ✓ | ✗ (generic logit KD) | ✓ PTQ |
| **DR-VERGE** | **✓** | **✓** | **✓** | **✓** | **✓ PTQ** |

**CrossFiT is the most important entry.** It established on DRTiD that dual-view beats either
single view (84.21% vs 80.47% / 77.87%) — the empirical premise DR-VERGE rests on. The primary
run re-established that premise independently: the teacher's own dual-view gain is **+0.1143
QWK**. Without it, the entire method would be pointless.

---

## past-papers/

`PINK-MVAN - Juara 1 GemasTIK - KTI 2026.pdf` — the winning GEMASTIK KTI submission.

Kept as a **standard for structure and rigour**, and as an honest comparison point: Pink-MVAN
solved the analogous problem in mammography with dual-view KD + PTQ, but its distillation is
generic logit KD on a single output. DR-VERGE's claim is specifically that the *complementarity
shift* is a distinct and distillable signal. The paper is what that claim must be defensible
against.

---

## large-references/

| Item | Holds |
|---|---|
| `CrossFiT/` | Reference implementation — registration, ResNet variants, utilities |
| `DR-VERGE_Daftar_Referensi.md` | Consolidated bibliography |

`CrossFiT/` is a **read-only reference**. Nothing in `experiments/` imports from it; it is here
to check architectural and preprocessing details against the paper that motivated this work.

---

## Related

- How these shape the design → [`../research/documentation/overview.md`](../research/documentation/overview.md)
- What was found → [`../experiments/results/`](../experiments/results/)
</content>
