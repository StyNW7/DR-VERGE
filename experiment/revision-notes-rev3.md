# DR-VERGE rev3 — Revision Notes

**File:** `experiment/full_pipeline_notebook_rev3.ipynb` (59 cells: 36 code, 23 markdown)
**Supersedes:** `full_pipeline_notebook_rev2.ipynb` (kept for comparison — it holds the saved
outputs this revision is based on)
**Written:** 8 Agustus 2026
**Basis:** `experiment/results.md` (analysis of the completed rev2 run) + `docs/judge.md` (the
pre-registered external audit)

Every change below is justified by a **measured number from the rev2 run**, not by intuition. Each
fix was then verified to work by executing the revised code against the real DRTiD data before
this document was written.

---

## 0. Why rev2 needed revising

rev2 executed flawlessly as software — no crashes, all gates 1/2/3/5 passed, full experiment matrix
completed. But it returned a **null result at Gate 4**: `dual_csd` 0.406 vs `dual_no_distill` 0.447
vs `dual_logitkd` 0.415, with bootstrap 95% CIs spanning zero in both comparisons.

Reading rev2's own saved cell outputs showed the null was **not** a clean verdict on the CSD idea.
Three independent pipeline defects made the RQ1 test *uninformative* rather than *negative*:

1. The ordinal head was initialized in a collapsed state, so every model (teacher included) only
   ever predicted the two extreme grades.
2. The student was ~40× below its own design spec in capacity, so all dual-view conditions hit the
   same ceiling regardless of supervision.
3. The CSD loss contributed under 0.5% of total training loss, so "with CSD" and "without CSD" were
   nearly the same experiment.

A null result is only publishable if the thing being tested was actually given a fair test. rev3
fixes the defects so that whatever Gate 4 reports next is a genuine finding about the method.

---

## 1. The three critical fixes

### Fix 1 — CORAL thresholds initialized from the label distribution *(highest impact)*

**Evidence from rev2.** Per-grade sensitivity across every single condition, teacher included:

| | Grade 0 | Grade 1 | Grade 2 | Grade 3 | Grade 4 |
|---|---|---|---|---|---|
| teacher | 0.940 | 0.020 | 0.007 | 0.000 | 1.000 |
| dual_csd (s42) | 0.770 | 0.000 | 0.021 | 0.014 | 0.850 |
| dual_no_distill (s42) | 0.909 | 0.000 | 0.007 | 0.014 | 0.900 |

The models were effectively binary Grade-0-vs-Grade-4 classifiers. Grades 1–3 — which are **72 +
194 + 109 = 375 of 800 training eyes, i.e. 47% of the data** — were essentially never predicted.

**Root cause.** rev2 initialized `bias_steps` at a constant −3.0, so `softplus(−3) = 0.049` per
step and all four thresholds started within 0.15 logits of each other (initial P(y>k) = 0.50, 0.49,
0.48, 0.46). DRTiD's actual marginals require thresholds spread across **[+0.030, −0.333, −1.551,
−3.211]**, a span of 3.24 logits — roughly 22× wider than where rev2 started.

This matters more for CORAL than for a normal classifier: CORAL's shared-weight design gives each
sample a *single* scalar score compared against all K−1 thresholds. When the thresholds sit on top
of each other, there is no score value that yields an intermediate grade — the prediction jumps
from 0 straight to 4. That is precisely the measured pathology.

**Fix.** `compute_init_thresholds(train_csv)` returns `logit(P(y>k))` from training-split label
frequencies; `CORALHead` accepts it and inverts the softplus parameterization so the model *starts*
at the dataset's marginal distribution and only has to learn deviations from it.

**Verified.** Threshold spread now **3.241 logits**, initial P(y>k) = [0.5075, 0.4175, 0.1750,
0.0388] — matching the empirical marginals exactly. The smoke test now asserts `spread > 1.5` so
this can never silently regress.

> Note on judge.md Flag 16: the audit suggested initializing at −3.0 to avoid overly *wide*
> softplus(0)=0.693 spacing. That suggestion was directionally reasonable but overcorrected —
> deriving the spacing from the data is strictly better than either constant.

### Fix 2 — `pos_weight` mode `sqrt`

**Evidence.** Raw inverse-frequency weighting gives `pos_weight = [0.97, 1.40, 4.71, 24.81]`. The
24.8× weight on threshold 3 (only 31 of 800 eyes are Grade 4) pushed P(y>3) so hard that Grade 4
recall hit 0.95–1.00 while Grade 3 recall sat at 0.00 — over-prediction of the top grade, which QWK
punishes quadratically.

**Fix.** `POS_WEIGHT_MODE = "sqrt"` → `[0.99, 1.18, 2.17, 4.98]`. Keeps the direction of the
imbalance correction, removes its degeneracy. `"full"` (rev2 behavior) and `"none"` remain
available for ablation. Also mitigates judge.md **Flag 4**: a milder weight distorts the sigmoid
outputs less, which matters because CSD's Δ is defined on exactly those outputs.

### Fix 3 — Student capacity restored to design spec

**Evidence.** rev2's student parameter breakdown:

```
backbone (conv stack):    8,176     <-- the actual feature extractor
InteractionFusion    :   25,872     <-- 75% of the entire model
CORAL heads          :      236
TOTAL                :   34,284
```

The project's own technical documentation (Appendix C item 6) targets **0.3–0.4M parameters** and
explicitly flags under-capacity as a risk. An 8K-parameter feature extractor for 224×224 fundus
images is ~40× below that. The symptom in the results: `dual_no_distill` 0.447, `dual_logitkd`
0.415, `dual_csd` 0.406 — a 0.04 QWK band with overlapping seed spreads, which is what a shared
capacity ceiling looks like.

**Fix.** `STUDENT_CHANNELS = (32, 64, 96, 128, 160, 192, 224)` → **329,484 params** (124,736 in the
backbone). Smoke test asserts `> 150,000`.

**Honest tradeoff:** the teacher also shrank (57.1M → 40.3M, because the fusion MLP now projects to
`feat_dim` rather than `2×feat_dim`), so the headline compression ratio drops from ~1,660× to
**~122×**. That is a real reduction in the efficiency claim — but a 34K student that cannot learn
the task is not a meaningful efficiency result in the first place. 122× smaller at a genuinely
usable accuracy is the stronger, more defensible claim.

---

## 2. The CSD formula fix (RQ1's mechanism)

**Evidence.** From rev2's final `dual_csd` training logs at the grid-selected β=0.7:

```
epoch 3: L_task=0.816, L_aux=1.728, L_logit_KD=0.657, L_CSD=0.0138, L_total=2.019
```

β·L_CSD ≈ 0.0097 out of ~2.02 total — **under 0.5%**, versus λ_aux·L_aux at 43% and α·L_logit_KD at
16%. judge.md **Flag 6** predicted exactly this before any training ran.

**Two compounding causes.** (a) Δ lives in cumulative-probability space, so its entries are small.
(b) `SmoothL1` with the default `beta=1.0` keeps small residuals in its **quadratic** regime, where
`d/dx(0.5x²) = x` — so a 0.05 residual yields a 0.05 gradient, shrinking the signal a second time.

**Fix.** New default variant `smoothl1_norm` divides both shift vectors by the teacher shift's own
mean magnitude (detached, per batch) before the Huber loss. Scale-free, O(1), and — because the
divisor is detached and applied identically to both sides — it rescales the objective without
changing which student shift pattern is optimal. Magnitude information is preserved, unlike the
softmax normalization in `kl_softmax`.

**Verified on a real DRTiD batch:**

| variant | loss | gradient norm |
|---|---|---|
| `smoothl1` (rev2 default) | 0.000896 | 0.0593 |
| **`smoothl1_norm` (rev3 default)** | 0.141329 | **9.0018** — 152× larger |
| `magnitude_weighted_direction` | 0.071645 | 4.5660 |
| `kl_softmax` (v1) | 0.000990 | 0.0861 |

The smoke test now asserts the CSD/task gradient ratio exceeds 0.01, so a regression to rev2's
silent-no-op state fails loudly instead of producing a meaningless null result eight hours later.

**Grid rebalanced accordingly.** rev2 searched β ∈ {0.5, 0.7} — every point of which produced a
negligible contribution, so the search could never have found a working setting. rev3 searches
β ∈ {0.1, 0.2, 0.5} with the normalized variant. These values were chosen from the **measured**
gradient ratio (β=1.0 gives ratio ≈5.3, i.e. CSD would start overwhelming the task loss — the
opposite failure from rev2 and just as damaging), so the grid brackets the balanced region rather
than guessing. The rev2 and v1 formulations are retained in the grid as explicit controlled
ablations.

**`kl_softmax` is now empirically justified as ablation-only.** rev2 logged `L_CSD = 0.0000` for all
16 epochs of that variant — direct confirmation that softmax-normalizing Δ destroys the magnitude
information CSD exists to transfer. Worth one sentence in the paper as a positive ablation finding.

---

## 3. Rigor additions (judge.md flags rev2 left open)

| Addition | judge.md ref | Why it matters |
|---|---|---|
| **Per-component gradient-norm logging** | Flag 6 | rev2 logged loss *values* only. Two terms with similar values can have wildly different gradients — which is why the CSD no-op stayed invisible until logs were hand-read after the full run. Now measured once per epoch and printed inline. |
| **Shift-fidelity: ShiftMAE, CosAgree, BenefitCorr** | Flag 10 | QWK cannot tell you whether CSD did *what it claims*. `BenefitCorr` correlates the teacher's and student's per-sample fusion benefit `B_i = NLL(p_agg) − NLL(p_dual)` — if CSD transfers complementarity, the student should benefit on the *same samples* the teacher does. This lets the paper report mechanism and performance **independently**, e.g. "CSD demonstrably transfers the shift pattern but that does not translate into higher QWK" — a precise, publishable finding that rev2 simply could not express. |
| **Feature-KD control baseline** (`dual_featkd`, 3 seeds) | Section G item 3 | The control that makes CSD's novelty claim falsifiable. `dual_logitkd` only asks "does any distillation help"; feature-KD asks "is decision-shift knowledge special versus ordinary representation transfer". Included in the bootstrap comparisons. |
| **External dual-view gain** | Flag 8 | rev2 reported only *internal* gain (fusion head vs its own auxiliary heads, which share a jointly-trained backbone). External gain compares against the independently trained single-view students. judge.md is explicit these must not be conflated. |
| **Calibration: ECE + Brier** | Flag 4 | CSD is framed as distilling a shift in *confidence*, so how calibrated those outputs are is load-bearing for the claim. rev2 measured neither. |
| **INT8 dual-view gain** | RQ2 completeness | rev2 left this `NaN`, so RQ2's real sub-question — *does PTQ preserve the dual-view advantage or erode it disproportionately?* — was never measured, only overall QWK drop. rev3 runs all three view modes through the quantized model. |

---

## 4. Bug fixes

**TorchScript / Gate 5.** rev2 hit `Module 'InteractionFusion' has no attribute 'norm'` and silently
fell back to a `state_dict` save, meaning the INT8 artifact was not a real deployment artifact.
Cause: `self.norm` was created only when `fusion_type == "linear"`, but `forward()` references both
branches, and TorchScript statically analyses every branch regardless of reachability. Fixed by
defining all fusion submodules unconditionally.

**Verified** by extracting the class to a real module and scripting it: both `interaction_mlp` and
`linear` now script and execute cleanly.

**Training stability.** rev2's validation QWK oscillated hard (0.51 → 0.35 → 0.46 between
consecutive epochs), which both burned the patience budget and made "best epoch" partly a lottery.
rev3 switches to **AdamW + cosine-annealed LR**, 40 epochs, patience 8.

---

## 5. What was verified before shipping

Not assumed — executed against the real DRTiD dataset:

- All 36 code cells compile.
- Gate 1 split reproduces exactly (800/200/550, all 5 grades in every split).
- The real smoke-test cell runs and all four rev3 assertions pass: student capacity 329,484 params,
  threshold spread 3.241 logits, ordinal violation rate 0.0, CSD/task gradient ratio 5.28 at β=1.0.
- CSD loss/gradient magnitudes measured across all four variants (table in §2).
- `compute_shift_fidelity`, `compute_calibration`, `compute_external_gain`, `feature_kd_loss` all
  execute on real data and return sane values.
- `torch.jit.script(InteractionFusion)` succeeds for both fusion types.

---

## 6. What this does and does not promise

**Does:** removes the three defects that made rev2's RQ1 test uninformative, closes every judge.md
flag that was still open in code, completes RQ2's measurement, and instruments the pipeline so a
future failure of this kind is caught *during* the run rather than after it.

**Does not:** guarantee `dual_csd` will beat its baselines. That is an empirical question, and the
notebook is deliberately built to report a negative answer honestly if that is what the data says —
Gate 4's printout still says so explicitly, and the shift-fidelity block now lets you distinguish
"CSD transferred the pattern but it didn't help accuracy" from "CSD didn't transfer anything at
all". Those are different findings and rev2 could not tell them apart.

**Expect Gate 2 to need attention again.** The teacher's architecture changed (thresholds, fusion
width), so its dual-view gain must be re-established. `docs/documentation.md` §0.2 has the tuning
levers (`lambda_aux`, `freeze_lr`) if it lands borderline as it did before.

---

## 7. How to run it

Same as before, with one important difference:

1. Open `experiment/full_pipeline_notebook_rev3.ipynb` in Colab Pro, GPU runtime.
2. Set `DRIVE_BASE` in Section 2.
3. Run all.

**Every rev2 checkpoint is architecturally incompatible with rev3** (different CORAL
parameterization, different backbone widths). `checkpoint_is_compatible()` detects this
automatically and retrains rather than loading stale weights — no manual Drive cleanup needed. This
does mean **both APTOS backbones must re-pretrain** (~1 hr each), since the student width changed.
Budget a full end-to-end run: the student count went from 16 to 23 (feature-KD × 3 seeds, and a
7-point grid instead of 4), and each run is longer given the larger student and 40-epoch schedule.
