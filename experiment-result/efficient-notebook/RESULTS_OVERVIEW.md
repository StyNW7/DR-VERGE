# DR-VERGE — Results Overview

**Source:** `experiment-result/full_pipeline_notebook_final_last_efficient.ipynb`
**Run:** `artifacts_final_efficient_20260810` · torch 2.11.0+cu128 · torchao 0.10.0
**Status:** completed — 59/60 code cells executed, **0 execution errors**, 16/17 gates passed

---

## 1. Verdict

**The run is sound and the results are usable.** Nothing failed that affects a reported number.

The headline is not the one the method was hoping for, and that is the most interesting thing about
it:

> **CSD transfers the teacher's decision-shift structure better than every baseline — clearly and
> on all four mechanism metrics — but that transfer does not convert into a predictive gain on the
> internal test set. It *does* appear as a consistent advantage under domain shift.**

That dissociation is a publishable finding, and the protocol pre-registered it as one ("*QWK(CSD) ≈
QWK(KD) with ShiftFidelity(CSD) > ShiftFidelity(KD) is a finding*"). It must be reported as
measured, not re-tuned.

**RQ2 is a clean, unambiguous positive** and is the safest result in the paper.

---

## 2. Run integrity

| Check | Result |
|---|---|
| Code cells executed | 59 / 60, **no error outputs** |
| Gates passed | **16 / 17** |
| Only failure | `Gate6b_PT2E_Supplementary` — **supplementary, non-blocking, never enters RQ2** |
| Dataset | 800 / 200 / 550 eyes; no ID overlap; all grades present; all images resolve |
| CORAL head | monotone, 3.315-logit spread, matches empirical marginals |
| Teacher dual-view advantage | **PASS** — QWK_dual 0.6600 vs max(aux) 0.5738, G = **+0.0863** |
| CSD signal present | mean │Δ│ = 0.3404, 97% of samples above 0.02 |
| PTQ / QAT scope matched | **15 ops each, identical operator sets** — RQ2 is apples-to-apples |
| Artifacts reload from disk | verified for FP32 and INT8 |

The one FAIL is an import-path issue: PT2E moved from `torch.ao` to `torchao`, and the probe only
checked the old location. It has since been fixed in `experiment/`. **It changed nothing** — RQ2
uses the eager path, which passed.

**Teacher sanity is the precondition for everything downstream, and it holds.** Without a teacher
dual-view advantage, Δ would be meaningless and no CSD result would be interpretable.

---

## 3. RQ1 — Knowledge transfer

### 3a. Predictive axis: null, and one credible loss

DRTiD test, 5 seeds per condition, paired cluster bootstrap + permutation test:

| Comparison | ΔQWK | 95% CI | p (perm) | Verdict |
|---|---:|---|---:|---|
| CSD vs no-distillation | −0.0082 | [−0.0491, +0.0322] | 0.513 | **null** |
| CSD vs logit-KD | +0.0019 | [−0.0370, +0.0405] | 0.866 | **null** |
| CSD vs feature-KD | **−0.0382** | **[−0.0772, −0.0007]** | **0.005** | **CSD credibly worse** |

Mean test QWK: feature-KD **0.5190** > no-distill 0.4890 > CSD 0.4809 > logit-KD 0.4790.

**Do not soften this.** On the primary metric, CSD did not beat its baselines, and feature-KD beat
it. The selected deployment model M\* is `dual_featkd` (seed 123), not CSD.

### 3b. Mechanism axis: CSD wins on all four metrics

| Condition | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr *r* ↑ | Spearman ρ ↑ |
|---|---:|---:|---:|---:|
| no-distillation | 0.3534 | +0.2634 | +0.1408 | +0.2376 |
| logit-KD | 0.3875 | +0.1881 | +0.0954 | +0.1506 |
| feature-KD | 0.3469 | +0.2785 | +0.1652 | +0.2600 |
| **CSD (proposed)** | **0.3218** | **+0.3621** | **+0.3101** | **+0.4134** |

CSD is best on every one. **BenefitCorr is ~1.9× the next best** — the student gains from dual-view
input on the *same eyes* the teacher does, far more than any baseline achieves. `fig_08` shows the
BenefitCorr error bars barely overlapping.

The `abl_csd_counterfactual` ablation collapses BenefitCorr to ≈0.02, which is a useful negative
control: the effect depends on the actual Δ formulation, not on distillation in general.

### 3c. External: CSD is best on every partition

DeepDRiD, frozen models, both field orderings:

| Partition / order | best CSD | M\* (feature-KD) | CSD advantage |
|---|---:|---:|---:|
| validation `_1=macula` *(primary)* | **0.5537** | 0.4955 | **+0.058** |
| validation `_1=disc` | **0.5702** | 0.4881 | **+0.082** |
| training `_1=macula` | **0.5135** | 0.4973 | +0.016 |
| training `_1=disc` | **0.5266** | 0.4711 | **+0.056** |
| pooled `_1=macula` | **0.5229** | 0.4968 | +0.026 |
| pooled `_1=disc` | **0.5367** | 0.4752 | **+0.062** |

**6 out of 6**, in the same direction, under both field orderings.

⚠ **This is suggestive, not established.** It compares **one** CSD model against **one** feature-KD
model, so method and seed are confounded, and there is no paired confidence interval on the external
set. The six cells are also not independent (pooled contains the other two). Report it as a
*consistent pattern worth investigating*, never as a significant external win.

### 3d. How to frame RQ1

> CSD reproduces the teacher's dual-view decision-shift structure substantially more faithfully than
> logit-KD, feature-KD or no distillation (lowest ShiftL1, highest cosine agreement, and ~1.9× the
> benefit correlation of the next best method). This mechanistic transfer did **not** translate into
> higher in-domain QWK — feature-KD was credibly better on DRTiD (ΔQWK −0.038, *p* = 0.005) — but
> the CSD model was the strongest student on **every** external DeepDRiD partition under both field
> orderings. Taken together: what CSD transfers is real and measurable, and its benefit appears
> under distribution shift rather than in-domain.

That is an honest, interesting, defensible claim. A reviewer will respect it far more than a
stretched positive.

---

## 4. RQ2 — Quantization (the strongest result)

| Comparison | ΔQWK | 95% CI | p (perm) | Reading |
|---|---:|---|---:|---|
| PTQ INT8 vs FP32 | +0.0011 | [−0.0230, +0.0239] | 0.933 | no measurable loss |
| QAT INT8 vs FP32 | +0.0008 | [−0.0329, +0.0329] | 0.963 | no measurable loss |
| QAT vs PTQ | −0.0003 | [−0.0384, +0.0370] | 0.995 | indistinguishable |
| QAT vs FP32-FT control | −0.0021 | [−0.0272, +0.0207] | 0.848 | **not just extra fine-tuning** |

| Metric | Result |
|---|---|
| QWK retention | **PTQ 100.2%, QAT 100.6%** |
| CPU speed-up | 1.45× / 1.47× |
| Artifact size | 1.36× smaller (1.30 MB → 0.96 MB) |
| Deployment model | `qat_int8`, **8.65 ms** median CPU latency |

**Say "no measurable degradation", not "INT8 is better".** Retention above 100% is noise, and
claiming an improvement from quantization would be an obvious over-read.

The **FP32-FT control is what makes this result strong**: QAT is indistinguishable from a matched
fine-tune with fake quantization disabled, so the retention is genuinely attributable to
quantization-aware training rather than to the extra epochs.

### Teacher → student compression

| | Teacher | Student | Ratio |
|---|---:|---:|---:|
| Parameters | 40,322,124 | 329,484 | **122×** |
| Artifact | 154.1 MB | 1.30 MB | **118×** |
| CPU latency | 244.1 ms | 12.7 ms | **19.2×** |
| Test QWK | 0.6610 | 0.4990 | 75.5% retained |

---

## 5. What to put in the paper

**Lead with RQ2** — it is clean, statistically supported, and practically meaningful: a 329K-parameter
dual-view model at **8.65 ms** on CPU with **no measurable QWK loss** from INT8 quantization, and
122× fewer parameters than the teacher.

**Then RQ1 as the scientific contribution**, framed as the dissociation in §3d. The three pieces:

1. **`fig_08` — the mechanism figure.** This is your strongest single exhibit. CSD best on all three
   panels, with the counterfactual ablation as a negative control.
2. **The statistics table** — report ΔQWK with CI *and* permutation *p* for all three RQ1
   comparisons, including the one CSD loses.
3. **`fig_11` / external table** — the 6/6 external pattern, explicitly labelled as suggestive.

**Also worth reporting:** the teacher's own dual-view gain (+0.0863) validates the premise that
two-field input carries complementary information at all.

---

## 6. Weaknesses a reviewer will find

Address these in Limitations before someone else does.

| Issue | Detail |
|---|---|
| **Grade 1 is essentially never predicted** | recall ≈ 0.04 for mild NPDR across almost every model and partition |
| **Macro-F1 is low** | ~0.35 for students, 0.376 teacher — the ordinal metric looks much better than the per-class picture |
| **Severe-error rate ~0.27** | roughly one in four eyes is off by ≥2 grades |
| **Absolute QWK is modest** | students ~0.48–0.52; teacher 0.66 |
| **RQ2 comparisons are thin on seeds** | `ptq vs fp32` is **1 seed vs 1 seed**; `qat vs fp32` is 3 vs 1. The CIs come from resampling eyes, not models |
| **Grids tuned on a single seed** | a configuration can win on luck |
| **External is DeepDRiD train/validation, not Set-C** | this notebook does not load the challenge's held-out Set-C |
| **External CSD advantage is n = 1 vs n = 1** | method and seed confounded |

The first four are properties of the task and data at this resolution; the last four are properties
of *this notebook*, and `full_pipeline_notebook_simple.ipynb` addresses all four (5 matched RQ2
seeds, 3-seed grid selection, Set-C, and per-seed external evaluation).

---

## 7. Two figure defects to fix before submission

1. **`fig_11` is missing the internal bar for `best_csd_fp32`.** The data CSV has an empty
   `internal_DRTiD` cell, but the value exists — test QWK **0.4930** in the model registry. As it
   stands the figure silently omits the internal/external contrast for the very model the external
   story is about.
2. **`fig_08`'s caption says "ShiftMAE" while the panel plots "ShiftL1".** They are different
   quantities (ShiftMAE = ShiftL1 / 4). Fix the caption to match the axis.

Neither affects a computed result — both are presentation, and both are in the figures you would
most want to show.

---

## 8. Reproducibility

Everything needed to re-derive these numbers without re-running inference:

```
artifacts_final_efficient_20260810/
├── configs/     config_locked · environment · pip_freeze · split_manifest (SHA-256)
│                selected_hyperparameters · model_selection · quantization_info
├── results/
│   ├── tables/       12 CSVs incl. gate report, statistics, external validation
│   ├── figures/      11 × (png + pdf + svg + _data.csv + _caption.txt)
│   ├── predictions/  per-sample: validation, test, DeepDRiD
│   ├── metrics/      confusion matrices, raw per-condition metrics
│   └── logs/         per-job training histories
└── models/      teacher_fp32 · best_student_fp32 · best_csd_fp32
                 best_student_ptq_int8 · best_student_qat_int8
```

Selection discipline held: M\* was chosen on **validation only** (`dual_featkd`, seed 123, val QWK
0.5633, chosen through the tie-break chain), and the deployment model was picked by the
pre-registered rule (`qat_int8`, 100.6% retention, lowest latency) before test or external numbers
were read.
