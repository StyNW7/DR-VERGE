# DR-VERGE — Results Summary & Research Validity Assessment

Written 8 Agustus 2026 from the completed run recorded in `experiment/full_pipeline_notebook_rev2.ipynb`
(the notebook copy with saved cell outputs — this document is built directly from those outputs,
not from memory or assumption). Read alongside `docs/overview.md` (the method), `docs/judge.md`
(the pre-registered technical audit), and `docs/roadmap.md` (the plan this run followed).

---

## 0. One-paragraph verdict

The pipeline ran correctly, end to end, with proper scientific controls (3-seed protocol,
untouched-until-final test set, clustered bootstrap CIs, a pre-registered grid search, an
ablation). **RQ1's answer, honestly, is "no" under this protocol**: `dual_csd` (mean QWK 0.406)
did not beat `dual_no_distill` (0.447) or `dual_logitkd` (0.415) on the held-out test set, and
neither difference is statistically credible (both bootstrap 95% CIs include zero). This is a
**valid, reportable negative result**, not a broken experiment — and critically, the run itself
produced direct evidence for *why* it came out this way: the CSD loss term's magnitude was
numerically negligible (under 1% of total training loss) relative to the task and auxiliary
losses, even at the grid-search-selected weight. That's a mechanistic, fixable explanation, not a
refutation of the underlying idea. Section 5 below is the most important thing to read before
writing the paper's Results/Discussion sections.

---

## 1. Pipeline execution integrity — what actually ran

| Gate | Result | Evidence |
|---|---|---|
| Gate 1 (dataset) | ✅ PASSED | 800/200/550 split, all 5 grades present everywhere, zero patient-ID overlap |
| Gate 2 (teacher dual-view gain) | ✅ PASSED | `QWK_dual=0.621` on test set vs `QWK_macula=0.546`, `QWK_disc=0.523` — internal gain +0.075 |
| Gate 3 (CSD signal present) | ✅ PASSED | mean `\|Δᵀ\|₁ = 0.341` on validation, **median 0.327 on the full set**, virtually the entire distribution sits above the 0.02 reference threshold (see chart) |
| Gate 4 (RQ1 verdict) | ❌ Hypothesis not supported | see Section 3 |
| Gate 5 (PTQ genuinely INT8) | ✅ PASSED (with a caveat) | backbone confirmed quantized via module-path check; `torch.jit.script` failed on a real bug (Section 6.1) and fell back to a state_dict save, which still worked |

No crashes, no silently-skipped steps, no stale/incompatible checkpoints slipping through — every
safety mechanism added during debugging (`checkpoint_is_compatible`, `robust_torch_save`/`load`,
`GATE2_PASSED` propagation) did its job over the course of this run. The full experiment matrix
from `docs/roadmap.md` was executed: 2 single-view baselines, 2 core dual-view baselines × 3 seeds,
a 4-way CSD grid search, final CSD × 3 seeds, a counterfactual-CSD ablation, and PTQ.

---

## 2. Full results table (test set / Set C, 550 images, touched once)

| Condition | n seeds | QWK | MAE | Severe Error Rate | Internal Dual-View Gain |
|---|---|---|---|---|---|
| **teacher** (ResNet-50, upper bound) | 1 | **0.6214** | 0.884 | 0.304 | +0.0752 |
| macula_only (student) | 1 | 0.3784 | 1.118 | 0.378 | — |
| disc_only (student) | 1 | 0.3135 | 1.364 | 0.447 | — |
| **dual_no_distill** | 3 | **0.4469 ± 0.0449** | 1.095 ± 0.127 | 0.372 ± 0.033 | +0.0371 ± 0.017 |
| **dual_logitkd** | 3 | **0.4154 ± 0.0675** | 1.217 ± 0.168 | 0.406 ± 0.042 | **+0.0781 ± 0.031** |
| **dual_csd (DR-VERGE)** | 3 | **0.4058 ± 0.0386** | 1.173 ± 0.105 | 0.392 ± 0.024 | +0.0204 ± 0.027 |
| dual_csd_counterfactual (ablation) | 1 | 0.3789 | 1.247 | 0.415 | +0.0401 |
| dual_csd_int8_ptq | 1 (seed123 base) | 0.4025 | 1.247 | 0.416 | not computed |

Model size / speed (from the same evaluation pass): teacher 218 MB / 57.1M params / 272 ms CPU
latency; every lightweight-student condition ≈**0.16 MB / 34,284 params / 7–9 ms** CPU latency.
That's roughly a **1,660× parameter reduction** and **30–40× latency reduction**, for a model that
retains ~65–72% of the teacher's QWK. This ratio, on its own, is a legitimately strong efficiency
result — see Section 7.

---

## 3. Gate 4 — the actual RQ1 answer

```
dual_csd        mean QWK = 0.4058
dual_no_distill mean QWK = 0.4469   (CSD beats it: False)
dual_logitkd    mean QWK = 0.4154   (CSD competitive/better: False)
dual_csd severe error = 0.3915 vs dual_no_distill = 0.3715 (CSD does not worsen severe error: False)
Bootstrap CI vs no_distill excludes zero: False  (mean_diff=-0.0299, 95% CI=[-0.0903, 0.0266])
Bootstrap CI vs logitkd excludes zero:    False  (mean_diff=-0.0315, 95% CI=[-0.0912, 0.0262])
```

Read this precisely, because the precise wording matters for how you can honestly frame it in the
paper:

- CSD's point estimate is *below* both baselines, but **the 95% CI on both differences includes
  zero** — meaning the data does not support claiming CSD is credibly worse, either. The correct
  statement is **"no evidence that CSD improves over standard KD or no-distillation under this
  protocol,"** not "CSD is worse than the baselines" (that would overclaim in the opposite
  direction from what you'd want, but it's still overclaiming).
- This satisfies `docs/roadmap.md`'s own explicit standard for what a negative result needs to look
  like to be reportable: baselines run under the identical protocol, 3 seeds, bootstrap CIs, no
  peeking at the test set before this point. This is exactly what a defensible null result looks
  like.

---

## 4. What's already good

1. **Methodological rigor exceeds what a single competition run typically produces.** Three
   properly controlled baselines, a fixed-before-looking grid search space, a dedicated ablation
   (counterfactual CSD, directly testing `judge.md`'s Flag 1/3 concern), a clustered bootstrap
   instead of a naive seed mean±std, and a test set touched exactly once, at the end. Most KTI
   submissions do not have this level of statistical discipline.
2. **Every gate that's about pipeline/data correctness passed cleanly** (1, 2, 3, 5). The
   architecture, the dataset handling, the teacher's own dual-view advantage, and the quantization
   pathway are all independently verified as working correctly — the null result at Gate 4 is
   isolated specifically to whether *this distillation mechanism* helps, not contaminated by an
   upstream bug.
3. **The efficiency numbers are strong and clean**, regardless of how Gate 4 landed: ~1,660×
   smaller, ~30–40× faster, at a real, non-degenerate diagnostic accuracy level (QWK ≈ 0.40–0.45,
   "moderate" agreement on the Landis–Koch scale, clearly above chance/majority-class).
4. **Gate 3's evidence is a genuinely strong, reusable result on its own**: the teacher's
   complementarity shift (Δᵀ) is real and substantial (median L1 norm 0.327, essentially the
   entire distribution well above the reference threshold). This confirms the *premise* DR-VERGE is
   built on — that dual-view fusion produces a detectable, learnable shift pattern — independent of
   whether the current CSD loss formulation successfully transfers it.
5. **The counterfactual-CSD ablation ran and is informative**: `dual_csd_counterfactual` (0.379)
   scored below even `dual_csd` (0.406), suggesting the same-head reformulation from `judge.md`
   Flag 1/3 doesn't rescue performance either — narrows down where the problem is *not*.

---

## 5. Why CSD underperformed — the mechanistic finding (read this before writing Discussion)

This is the most important analytical finding from this run, and it wasn't something the pipeline
prints automatically — it required reading the per-epoch loss logs directly.

**The CSD loss term is numerically tiny relative to everything else it's added to.** From the
final `dual_csd` training logs (β=0.7, the grid-search winner):

```
epoch 3: L_task=0.816, L_aux=1.728, L_logit_KD=0.657, L_CSD=0.0138, L_total=2.019
```

At β=0.7, the CSD term contributes `0.7 × 0.0138 ≈ 0.0097` to the total loss of ~2.02 —
**under 0.5%**. Compare to `λ_aux × L_aux ≈ 0.5 × 1.73 = 0.86` (43% of total) and
`α × L_logit_KD ≈ 0.5 × 0.657 = 0.33` (16% of total). The auxiliary and standard-KD terms are
getting 40–90× more gradient weight than CSD, even though the *architecture* is treating all three
as co-equal loss components.

This is exactly the risk `docs/judge.md` Flag 6 warned about before any training happened
("CSD loss scale vs task loss... walaupun β=0.5, kontribusi gradient CSD mungkin hampir nol") — and
it's now empirically confirmed, not hypothetical. The reason: Δ lives in cumulative-probability
space, where per-dimension values are bounded in a narrow numeric range, so even a fairly
meaningful mismatch between the teacher's and student's shift pattern produces a small raw
SmoothL1 value.

**A second, independent confirmation from the grid search**: the `kl_softmax` variant showed
`L_CSD ≈ 0.0` (rounds to exactly zero) for **all 16 epochs**, not just small — a complete loss of
signal. This matches the exact concern already documented in the notebook's own code comments
(softmax-normalization discards magnitude information, so if the teacher's and student's Δ vectors
happen to share a similar dominant-index "shape," KL collapses toward zero regardless of whether
the magnitudes actually match). This is why `kl_softmax` is explicitly kept as an ablation-only
variant, not the default — this run is direct evidence that call was correct.

**What this means for the paper:** you have a legitimate, evidence-backed distinction to draw:

> *"CSD's core premise — that the teacher exhibits a learnable complementarity-shift signal — is
> supported (Gate 3). However, the current loss weighting causes this signal to contribute
> negligible gradient relative to the auxiliary and standard-KD terms, which is the most plausible
> mechanistic explanation for the null result at Gate 4, rather than a failure of the underlying
> concept."*

This is a much stronger, more scientifically honest, and more *interesting* thing to write than
either "CSD doesn't work" or forcing a positive spin. It also directly motivates a concrete next
step (Section 8).

---

## 6. RQ2 (PTQ) — partially answered

**What's answered:** PTQ INT8 quantization of the backbone works (Gate 5 passed), the quantized
model's QWK (0.4025) is a modest ~10% relative drop from its FP32 seed123 counterpart's test QWK
(0.446), and the size/latency figures for FP32 vs INT8 are recorded.

**What's NOT answered, and should be flagged as a gap rather than silently left out:** the
evaluation cell doesn't compute `DualViewGain_G_internal` for the INT8 condition (it's `NaN` in
the raw table) — meaning the specific RQ2 sub-question *"does PTQ preserve the dual-view gain, or
does quantization erode it disproportionately?"* was never actually measured, only the overall QWK
drop was. This is a real gap in the current evaluation code, not a limitation of the method itself
— straightforward to add (the INT8 evaluation branch would need macula-only/disc-only forward
passes through the quantized model too, mirroring `compute_dual_view_gain`).

### 6.1 A real code bug found in this run (non-blocking, has a working fallback)

`torch.jit.script()` on the quantized model failed with:
```
Module 'InteractionFusion' has no attribute 'norm'
```
Cause: `InteractionFusion.forward()` has an `if self.fusion_type == "linear": return self.norm(...)`
branch, but `self.norm` is only created in `__init__` when `fusion_type == "linear"` — since the
actual fusion_type used everywhere is `"interaction_mlp"`, `self.norm` never exists. TorchScript
statically analyzes *both* branches of every `if`, regardless of which one ever executes at
runtime, and errors on the reference to a conditionally-nonexistent attribute. The fallback
(state_dict save) caught this gracefully and Gate 5 still passed — but the resulting INT8
artifact is not a proper TorchScript deployment artifact, which matters if you want to make any
deployment-readiness claims in the paper. **Fix** (not yet applied — flagging for you to decide
whether it's worth doing before the deadline): define all four fusion submodules
(`norm`, `norm_in`, `proj`, `norm_out`) unconditionally in `__init__` regardless of `fusion_type`,
so TorchScript's static analysis always finds them.

---

## 7. Benchmark against the literature this project is positioned against

From `docs/overview.md`'s own citations (verify these against the original CrossFiT paper before
quoting in the KTI — these are as recorded in this project's docs, not independently re-checked
here):

| | CrossFiT (2022), on DRTiD | DR-VERGE teacher (this run) | DR-VERGE student (this run) |
|---|---|---|---|
| Macula-only | 80.47% accuracy | QWK 0.546 (not directly comparable metric) | QWK 0.378 |
| Disc-only | 77.87% accuracy | QWK 0.523 | QWK 0.313 |
| Dual-view | 84.21% accuracy | QWK 0.621 | QWK 0.406–0.447 |
| Model scale | full-size, task-specific architecture | ResNet-50 (57M params) | 34K params |

**Important honesty note for the paper**: CrossFiT's numbers are *accuracy*, this project's are
*QWK* — these are not directly comparable metrics, and CrossFiT is a purpose-built architecture
(not compressed/distilled), evaluated under whatever split/protocol their paper used, not
necessarily identical to this project's DRTiD split. The correct, defensible claim is **directional
consistency** — both find macula-only > disc-only, and dual-view > either single view — not a
head-to-head numeric comparison. Do not present the DR-VERGE teacher's QWK as "beating" CrossFiT's
accuracy figure; they are different quantities.

Against **Pink-MVAN** (the GemasTIK 2025 champion this project's format follows): that paper
established the "dual-view + KD + PTQ for a resource-constrained target domain" template. DR-VERGE's
distinct contribution is the *CSD mechanism itself* (distilling the shift pattern, not just the
final logits) — which this run tested rigorously and found, honestly, doesn't yet outperform
generic logit-KD. That in itself is a legitimate, citable comparison point: **"unlike prior
single-logit KD approaches, we explicitly tested whether transferring the complementarity-shift
signal outperforms standard distillation, under matched conditions, and found no measurable
advantage at current loss weighting — with a specific, evidenced explanation for why."** That's a
more rigorous empirical contribution than simply proposing a new loss and reporting a win.

---

## 8. What to fix, if time remains

Ranked by expected payoff vs. remaining time, **not** all required:

1. **(Highest payoff, cheapest)** Re-run `dual_csd` with a much larger `β` (e.g. grid over
   `{5, 10, 20}` instead of `{0.5, 0.7}`) or normalize `Δ` before computing the loss (e.g. divide by
   its own L1 norm, or use a magnitude-aware reweighting) so CSD's gradient contribution becomes
   comparable in scale to `L_aux`/`L_logit_KD`. Given Section 5's finding, this is the single most
   likely lever to change the Gate 4 outcome — and if it *still* doesn't help even after fixing the
   scale issue, that would be a much stronger, cleaner negative result than the current one (which
   is confounded by the scale problem).
2. **(Medium payoff)** Add the missing INT8 dual-view-gain computation (Section 6, RQ2 gap) if you
   want to fully answer RQ2 rather than partially.
3. **(Low priority, cosmetic/completeness)** Fix the `InteractionFusion` TorchScript bug (Section
   6.1) if you want a genuine TorchScript INT8 deployment artifact for the paper's efficiency
   claims, rather than the current state_dict fallback.
4. **(Optional, strengthens the paper either way)** A short paragraph explicitly reporting the
   `kl_softmax` L_CSD≈0 finding as a positive ablation result — "we verified our concern about
   magnitude loss in the softmax-KL formulation empirically" is a good, honest addition either way.

**Do not** chase item 1 indefinitely given the deadline — one focused re-run at a much larger β
(or normalized Δ) is a reasonable use of remaining time; if that also doesn't move Gate 4, write up
the negative result as-is with Section 5's explanation and move to the paper.

---

## 9. Is this good enough for the research purpose? Direct answer

**Yes, conditionally** — and the condition is about *how it's framed*, not about redoing the work.

- As a piece of **rigorous, honest empirical research**: yes. The protocol is sound, the negative
  result is real and well-supported statistically, and — unusually for a null result — this run
  produced a specific, evidenced mechanistic explanation for *why* (Section 5), which is exactly
  the kind of finding that makes a negative result publishable/presentable rather than just an
  absence of a positive one.
- As a **direct "yes, CSD works" claim**: no — the data doesn't support that, and claiming it would
  not survive a judge's scrutiny given the bootstrap CIs are printed right there in your own
  output.
- **For GemasTIK specifically**: KTI judging typically rewards methodological rigor, honest framing
  of negative results, and clear identification of *why* something didn't work over a forced
  positive result that collapses under questioning. This project has unusually strong evidence
  infrastructure (gates, bootstrap, ablations, a documented audit trail of bugs found and fixed)
  for a time-constrained competition build. The strongest paper here is: *"we built a rigorous
  protocol to test a specific, novel distillation mechanism; the protocol worked correctly at every
  verifiable stage; the mechanism itself did not show a measurable benefit under the current loss
  weighting, and we identified precisely why (loss magnitude imbalance), which is itself an
  actionable finding for follow-up work."* That is a defensible, complete research contribution as
  it stands, with or without attempting the Section 8 rescue.

Use `docs/judge.md` Section I's safe-phrasing table for every claim in the write-up — it's already
calibrated for exactly this situation (a rigorous method with a nuanced/negative result that must
not be overclaimed).
