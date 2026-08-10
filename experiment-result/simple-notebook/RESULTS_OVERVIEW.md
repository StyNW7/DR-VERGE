# DR-VERGE — Results Overview (Simple Notebook)

**Source:** `experiment-result/simple-notebook/full_pipeline_notebook_simple.ipynb`
**Run:** `artifacts_final_locked_simple_last_20260810` · GPU: NVIDIA L4 · quant engine: x86
**Status:** completed — 50/50 code cells executed, **0 errors**, **32/32 gates PASSED**

---

## 1. Verdict

**This is a clean run and these are the results to use.** Every gate passed, including the four the
efficient run could not offer: Set-C confirmatory external evaluation, 5-seed matched RQ2,
3-seed hyperparameter selection, and a verified published deployment artifact.

Two headline findings:

> **RQ1 — CSD is statistically indistinguishable from all three baselines on internal QWK, while
> transferring the teacher's decision-shift structure better than any of them. On the pre-registered
> confirmatory external set it posts the highest student QWK (0.735 vs 0.644), though the intervals
> overlap.**

> **RQ2 — INT8 costs a small, mostly non-credible amount of in-domain QWK, but on the confirmatory
> external set the fine-tuned INT8 variants are *credibly better* than FP32. The gain tracks
> fine-tuning, not quantization.**

Both are honest, defensible, and more interesting than a simple win would have been.

---

## 2. Run integrity — 32/32

| Area | Evidence |
|---|---|
| Data | 800/200/550 eyes; schema, uniqueness, image existence, split disjointness all verified |
| APTOS | 2,930 train / 366 val; ids unique and disjoint |
| Metric correctness | `fast_qwk` vs sklearn: **max diff 1.11e-16** over 105 cases |
| Ordinal head | monotone, matches marginals, 3.32-logit spread; **violation rate 0.00e+00** |
| Teacher premise | **QWK_dual 0.6433 vs max(aux) 0.5290 → G = +0.1143** |
| CSD signal | mean │Δ│ = 0.4893; 99.5% of samples above 0.02 |
| Grid completeness | **4/4 candidates × 3 tuning seeds** for all three grids |
| Core seeds | **5/5 for every core condition** |
| RQ2 completeness | **5/5 seeds for all five variants** |
| Quantization scope | operator sets **identical across PTQ/QAT/FT-PTQ for all 5 seeds** |
| Statistics | 45 comparisons, B = P = 10,000, Holm **within** family |
| External | Set-C 100 patients / 200 eyes / 400 images, **0 exclusions**; partitions disjoint |
| Export | ONNX succeeded for all 3 FP32 models; all artifacts reload from disk |
| Deployment | `ft_ptq_int8` verified and published to `selected_deployment/` |
| **Collapse warnings** | **0 conditions flagged** (the efficient run flagged 10) |

Nothing was skipped, nothing failed, and no result rests on a partial computation.

---

## 3. RQ1 — Knowledge transfer

### 3a. Predictive: all three comparisons are null

DRTiD test, 5 seeds, paired cluster bootstrap + 10,000 permutations, Holm within the RQ1 family:

| Comparison | ΔQWK | 95% CI | p | Verdict |
|---|---:|---|---:|---|
| CSD vs no-distillation | +0.0171 | [−0.0276, +0.0648] | 0.112 | null |
| CSD vs logit-KD | −0.0250 | [−0.0781, +0.0254] | 0.085 | null |
| CSD vs feature-KD | −0.0189 | [−0.0639, +0.0263] | 0.093 | null |

**Every interval crosses zero.** CSD neither beats nor is beaten by any baseline in-domain.

Mean test QWK: logit-KD **0.5546** > feature-KD 0.5484 > CSD 0.5296 > no-distillation 0.5124.
M\* selected on validation = **`dual_logitkd`** (mean val QWK 0.5670, seed 8888).

> Worth noting against the efficient run: there CSD was *credibly worse* than feature-KD
> (p = 0.005). Here, with hyperparameters selected over 3 seeds instead of 1, that difference
> disappears. The stronger selection protocol produced the more conservative — and more defensible —
> answer.

### 3b. Mechanism: CSD is best on all three metrics

| Condition | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---:|---:|---:|
| no-distillation | 0.4605 | +0.3180 | +0.1850 |
| logit-KD | 0.4524 | +0.3468 | +0.2161 |
| feature-KD | 0.4489 | +0.3721 | +0.2330 |
| **CSD (proposed)** | **0.4320** | **+0.4257** | **+0.2902** |

A clean monotone ordering, with CSD best on every axis. **This is the result that replicates**: the
efficient run produced the same ranking on the same three metrics from an independent training run
with a different hyperparameter-selection regime. Two independent runs agreeing on the mechanism
ordering is much stronger evidence than either alone.

### 3c. External: strongest student on Set-C, but not on Set-B/A

DeepDRiD Set-C (pre-registered confirmatory partition), patient-clustered bootstrap, 100 patients:

| Model | Set-C QWK | 95% CI |
|---|---:|---|
| Teacher | 0.7788 | [0.7006, 0.8402] |
| **Best CSD (FP32)** | **0.7346** | [0.6366, 0.8091] |
| FT-PTQ INT8 | 0.7208 | [0.6186, 0.7982] |
| QAT INT8 | 0.7179 | [0.6118, 0.8001] |
| PTQ INT8 | 0.6607 | [0.5372, 0.7580] |
| M\* (FP32, logit-KD) | 0.6442 | [0.5257, 0.7395] |

CSD is the **best student on Set-C under both field orderings** (+0.090 macula, +0.091 disc).

⚠ **Three caveats, all of which belong in the paper.**

1. **The intervals overlap substantially** (CSD [0.637, 0.809] vs M\* [0.526, 0.740]). No paired
   CSD-vs-M\* test was computed, so this is *not* a statistically established advantage.
2. **It does not hold on the supplementary partitions.** On Set-B, CSD is *worse* than M\*
   (0.661 vs 0.688 macula; 0.646 vs 0.694 disc). On Set-A it is roughly level. The advantage is
   specific to Set-C.
3. **On Set-C, CSD has the *lowest* Macro-F1 of any model (0.318).** It wins on ordinal agreement
   while losing on per-class balance — consistent with the mechanism story (it transfers the ordinal
   decision shift, not per-class discrimination), but it must be reported alongside the QWK number.

### 3d. How to state RQ1

> Complementarity-Shift Distillation reproduced the teacher's dual-view decision-shift structure more
> faithfully than logit-KD, feature-KD or no distillation, ranking best on all three mechanism
> metrics (ShiftL1 0.432, CosAgree +0.426, BenefitCorr +0.290) — an ordering that replicated across
> two independent runs. This did not translate into an in-domain predictive difference: all three
> pre-registered comparisons were null (│ΔQWK│ ≤ 0.025, all intervals crossing zero). On the
> pre-registered confirmatory external partition CSD achieved the highest student QWK (0.735 vs
> 0.644), though with overlapping intervals and not replicated on the supplementary partitions.

---

## 4. RQ2 — Quantization

### 4a. Internal: small cost, mixed evidence

| Comparison | ΔQWK | 95% CI | p | Reading |
|---|---:|---|---:|---|
| PTQ vs FP32 | −0.0093 | [−0.0300, +0.0107] | 0.209 | no credible loss |
| QAT vs FP32 | −0.0293 | [−0.0683, +0.0042] | **0.001** | **see note** |
| QAT vs PTQ | −0.0200 | [−0.0567, +0.0110] | 0.065 | null |
| *(control)* QAT vs FP32-FT | −0.0268 | [−0.0604, +0.0026] | 0.002 | see note |
| *(control)* FP32-FT vs FP32 | −0.0024 | [−0.0232, +0.0176] | 0.701 | fine-tuning alone does nothing in-domain |

**Note the disagreement on QAT.** The bootstrap CI includes zero while the permutation test gives
p = 0.001. These are different procedures — the CI is on the mean paired difference, the permutation
test on label exchangeability within clusters — and they can disagree when an effect is small but
consistent in sign. By the notebook's own stated rule (*"a difference whose CI includes zero is NOT
a claim"*), **this is not a claim**. Report both numbers and say so; do not pick the convenient one.

Retention: **PTQ 98.3%, FT-PTQ 97.5%, QAT 94.7%**, all with **~2.47× CPU speed-up** and 1.36×
smaller artifacts.

### 4b. External: INT8 is *credibly better* on Set-C

| Comparison (Set-C, patient-clustered) | ΔQWK | 95% CI | Credible? |
|---|---:|---|---|
| QAT vs FP32 | **+0.0738** | **[+0.0069, +0.1468]** | **yes** |
| FT-PTQ vs FP32 | **+0.0766** | **[+0.0137, +0.1452]** | **yes** |
| PTQ vs FP32 | +0.0165 | [−0.0672, +0.0960] | no |
| QAT vs PTQ | +0.0573 | [−0.0062, +0.1276] | no |

This is the most interesting RQ2 result and it needs careful reading. **The two variants that
improve credibly are exactly the two that involve fine-tuning** (QAT, and FP32-fine-tune→PTQ). Plain
PTQ — quantization with no fine-tuning — does **not** improve credibly.

So the honest interpretation is: **the external gain tracks the extra fine-tuning, not the
quantization itself.** Do not write "INT8 improves generalization". The internal control supports
this too — `fp32_ft_control vs best_fp32` is flat in-domain (p = 0.701), so the fine-tuning is not
buying in-domain accuracy; it appears to help only under distribution shift.

*(Limitation: `fp32_ft_control` was not evaluated externally, so fine-tuning and quantization cannot
be fully separated on Set-C. State this.)*

### 4c. Compression

| | Teacher | Student | Ratio |
|---|---:|---:|---:|
| Parameters | 40,313,932 | 328,588 | **123×** |
| Artifact | — | — | **119× smaller** |
| CPU latency | — | — | **18.0× faster** |
| Test QWK | 0.6544 | — | **84.7% retained** |

Deployment model: **`ft_ptq_int8`** (seed 2026) — 99.7% validation retention, severe error not
credibly worse, lowest CPU latency **6.22 ms**. Chosen by the pre-registered rule on validation
only, then frozen.

---

## 5. What to put in the paper

**Lead RQ2 with the deployment result:** a 328K-parameter dual-view model at **6.22 ms** on CPU,
**123× fewer parameters** than the teacher, retaining **84.7%** of its QWK, with INT8 costing ≤2%
in-domain. That is a clean, practical, defensible contribution.

**Lead RQ1 with the dissociation**, and make the replication explicit — the mechanism ordering held
across two independent runs. Three exhibits:

1. **`fig_07_csd_mechanism`** — the strongest single figure. CSD best on all three panels.
2. **`fig_12_forest`** — all pre-registered comparisons with CIs, showing the RQ1 nulls honestly.
3. **`fig_13_external_setc`** — the Set-C result, captioned with the overlap caveat.

**Also report:** the teacher's own dual-view gain (**+0.1143**) validates that two-field input
carries complementary information at all — without it, the entire premise fails.

**A genuinely novel angle worth a paragraph:** CSD wins on QWK but has the *lowest* Macro-F1 on
Set-C. Ordinal agreement and per-class balance came apart. That is a real observation about what
shift-distillation transfers, and it is the kind of detail reviewers find credible.

---

## 6. Weaknesses to state

| Issue | Detail |
|---|---|
| Macro-F1 is low | ~0.34 internal, ~0.35 external; the ordinal metric flatters the per-class picture |
| Severe-error rate ~0.26 | roughly one eye in four is off by ≥2 grades |
| Absolute QWK modest | students 0.51–0.55 internal; teacher 0.654 |
| RQ1 is null in-domain | no predictive advantage for the proposed method |
| Set-C advantage not established | intervals overlap; no paired CSD-vs-M\* test |
| External result not replicated | CSD is worse on Set-B, level on Set-A |
| CSD ↔ Macro-F1 trade-off | best QWK, worst Macro-F1 on Set-C |
| FT vs quantization not separable externally | `fp32_ft_control` was not run on Set-C |
| QAT CI/permutation disagree | report both, claim neither |

The first three are properties of this task at 224×224 resolution. The rest are honest limits of the
present design and are all straightforward to state.

---

## 7. Housekeeping

**Three stray figures** are sitting in `figures-simple-notebook/` that this notebook never produced:
`fig_01_architecture`, `fig_02_experimental_workflow`, `fig_13_qwk_vs_size`. They belong to the
efficient run. This notebook writes exactly 14 figures, `fig_01_dataset` … `fig_14_internal_vs_external`.
Delete the strays before building the paper, or you risk citing a figure from the wrong experiment —
note in particular that **two different `fig_13`s** are now in one folder.

**Artifacts** live in `artifacts_final_locked_simple_last_20260810/` on Drive: 24 tables, 14 figures
(×5 files each), per-sample predictions for validation/test/DeepDRiD, per-job training histories,
6 model exports with working ONNX, and `selected_deployment/`. Confirm `FINAL_RUN_COMPLETE.txt`
exists, then pull the folder down before it is overwritten.

---

## 8. Simple vs Efficient — what agrees

| | Simple | Efficient | Agree? |
|---|---|---|---|
| Mechanism ranking (CSD best on all metrics) | ✅ | ✅ | **yes — replicated** |
| Teacher dual-view gain | +0.1143 | +0.0863 | yes |
| RQ1 in-domain predictive advantage for CSD | none | none | yes |
| CSD credibly *worse* than feature-KD | no | yes | **no** |
| CSD best external | Set-C only | all 6 partitions | partly |
| M\* selected | logit-KD | feature-KD | no |
| INT8 in-domain retention | 94.7–98.3% | 100.2–100.6% | no |

**The mechanism finding replicates; the predictive rankings do not.** That instability across
selection regimes is itself informative and supports the conservative RQ1 framing above. Use Simple
as primary (per `experiment/comparison.md`) and cite Efficient as a robustness check — and if you do,
report the disagreement, not just the agreement.
