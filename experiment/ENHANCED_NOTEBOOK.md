# `full_pipeline_notebook_enhanced.ipynb` — the Enhanced follow-up

**77 cells (49 code, 28 markdown) · 3,421 non-blank code lines · 33 gate names, 34 firings**

Built by upgrading `full_pipeline_notebook_simple.ipynb` according to
`experiment-result/improvements.md` and `upgrade-simple-notebook.md`.

---

## 1. What this notebook is — and what it is not

This is a **pre-registered follow-up** to the Simple run. It is not a replacement, and it is not a
"better version" that supersedes the earlier result.

The Simple run is complete. It produced the method ranking, the deployment decision, and the
statistical verdicts. It also exposed four specific weaknesses. This notebook tests those four, and
only those four.

> **The reporting rule, fixed before the run.** The Simple run is the primary result. This run is
> reported as a follow-up alongside it. **If the two disagree, both are reported**, with this
> notebook's narrower scope stated explicitly.
>
> This rule is written down *before* any number exists, because picking whichever notebook gave the
> nicer answer afterwards is exactly the selection effect the rest of the protocol is built to
> prevent. It costs nothing to commit to now and would be indefensible to decide later.

### What is deliberately unchanged

The research questions, the CSD formulation (`Δ = p_dual − (p_macula + p_disc)/2`, SmoothL1 against
a fixed global scale), the CORAL head, the comparison ladder, the split protocol, the seeds, the
two-stage selection rule, the bootstrap/permutation machinery, and **all 29 gates from the Simple
run**. If any of those moved, the two runs would not be comparable and the follow-up would be
pointless.

Four gates are **added**, never substituted:

| Gate | Asks |
|---|---|
| `Gate4c_StageA_RecipeSelected` | Was the input recipe chosen on validation, from the declared grid, before anything else was trained? |
| `Gate6e_ThresholdCalibrated` | Was a decision threshold chosen for every condition, from the declared grid, on validation only? |
| `Gate12b_ResultsConsistent` | Does every headline number recompute exactly from the per-sample predictions it claims to summarise? (blocking) |
| `Gate12c_CIPermutationAgreement` | Where do the bootstrap CI and the permutation test disagree? (reports, never blocks) |

---

## 2. The four changes

### 2.1 Minority-grade exposure — `sqrt` class-balanced sampling

**The problem.** In the Simple run, QWK sat around 0.55 while Macro-F1 sat near 0.34. That gap is
not noise; it is the signature of a model that orders severity well but rarely *commits* to the rare
grades. Grade 1 and Grade 3 were under-recalled.

**The change.** A `WeightedRandomSampler` with `w_y = 1/√n_y`.

**Why `sqrt` and not full inverse frequency.** Full inverse frequency (`1/n_y`) equalises the
classes exactly — on DRTiD that means showing the rarest grade ~25× more often than nature does,
which trades a large amount of majority-grade accuracy for minority recall and distorts the ordinal
structure QWK measures. `sqrt` moves the exposure ratio from 0.04 to 0.20 rather than to 1.0: a
real correction, not an inversion. This is verified numerically in `dryrun_enhanced.py`.

**Where it applies.** TRAIN loaders only. Validation and test loaders keep the natural distribution
— resampling an evaluation set would change the very quantity being measured.

### 2.2 Resolution — 224 → 384, with the optimisation regime held fixed

**The problem.** Grade 1 DR is defined by microaneurysms, which are among the smallest lesions in
the image. At 224×224 they may simply not survive downsampling, in which case no amount of
distillation or sampling can recover them.

**The change.** 384×384, with the **effective batch held at 16**: the per-step batch halves to 8 and
gradient accumulation restores the effective size.

**Why the batch is held fixed.** Changing resolution *and* effective batch at once would confound
the input change with an optimisation change, and the resulting comparison would answer neither
question. Accumulation is applied to all four trainers (APTOS pretraining, teacher, student,
fine-tune control), each with a flush of the final partial group so the last few batches are not
silently dropped.

**Cost.** 384² is 2.94× the pixels of 224². The image cache holds ~2.64 GB at 384.

### 2.3 Decision threshold — `t*` per condition, on validation

**The problem.** CORAL predicts `grade = count(p_k > t)`, and the Simple run hard-coded `t = 0.5`.
That is the natural default for a sigmoid, but the loss is a *weighted* BCE — the positive weights
deliberately shift the outputs, so there is no reason for 0.5 to remain the best operating point.

**The change.** A grid `[0.35 … 0.65]`, scanned on validation, primary QWK, tie-break Macro-F1 then
severe error. One threshold per **condition** (median across that condition's seeds).

**Why one global `t` and not four.** The head emits four cumulative outputs. Tuning a separate
threshold for each would be four degrees of freedom fitted to 200 validation eyes — ample room to
fit noise. One shared threshold is one degree of freedom.

**Why per condition rather than per seed.** A per-seed threshold is another parameter fitted to
validation. The median across the condition's seeds is stable and still applies one identical rule
to every method, so no method gets a tuning advantage.

**The inheritance rule.** RQ2 variants (PTQ, QAT, fine-tune control) **inherit M\*'s threshold**
rather than calibrating their own. If each quantized variant could re-pick its operating point, the
comparison would stop being about quantization. `thr_for()` is the single lookup that every
prediction path uses, so a calibrated threshold cannot be applied in one code path and forgotten in
another.

**The test set never participates in choosing `t`.**

### 2.4 Seed-matched external evaluation

**The problem — the largest one.** Internally, the Simple run compared five matched seeds per
condition with a patient-clustered paired bootstrap. Externally, on DeepDRiD Set-C, it compared
**one model against one model**. Method and seed were confounded, and no paired interval was
available. The headline external claim was therefore weaker than the internal one, for no reason
other than that inference was never run on the other four checkpoints.

**The change.**

- All five seeds of M\* and all five seeds of `dual_csd` are evaluated externally.
- `fp32_ft_control` is added to the external set. Without it, "quantization helps out-of-domain" and
  "the extra fine-tuning helps out-of-domain" are indistinguishable.
- The paired bootstrap resamples **patients and seed pairs**, so the interval carries both sources
  of variation.
- **`csd_fp32` vs `best_fp32` is now tested** — this is the entire external RQ1 claim, and it
  previously had no test at all.
- A guard: when M\* *is* `dual_csd`, the two conditions are the same checkpoints. The comparison is
  skipped with an explicit message rather than printing a difference of exactly 0 with a zero-width
  CI, which would read like a genuine null result.

Inference is cheap. There was never a good reason to accept a weaker comparison on the confirmatory
partition than on the internal one.

---

## 3. The order of decisions

Every choice is made on validation and **frozen** before the next is made.

```
Stage A: resolution x sampling      4 recipes x 3 tuning seeds, NO distillation
   |  FREEZE recipe
   v
APTOS pretraining -> teacher        both AT the frozen recipe
   |
   v
logit-KD grid -> FREEZE alpha, tau
   |
   v
feature-KD grid, CSD grid           each inherits the frozen alpha, tau
   |
   v
threshold t* per condition          declared grid, validation only
   |  FREEZE
   v
model selection -> test -> external  the test set enters here and never earlier
```

A joint search over resolution × sampling × threshold × hyperparameters would be a grid large enough
to fit the validation set rather than learn from it. Sequencing keeps the total at 4 + 4 + 4 + 4 + 7
evaluations instead of their product.

### Why Stage A runs first, and with no distillation

This is the part most likely to be got wrong, so it is worth stating plainly.

**The teacher is trained at a specific resolution.** If the resolution were chosen *after* the
teacher existed, a 384-trained teacher could end up distilling into 224 students. Nothing would
crash. The run would complete, produce plausible numbers, and every one of them would be wrong.

So Stage A must precede the teacher — which it can only do by training with **no distillation term
at all** (`alpha = beta = gamma = 0`). That is not a compromise forced by the ordering; it also
isolates the question Stage A is actually asking: *does this input recipe help the student?* — not
*which distillation term is best*, which is settled afterwards on the frozen recipe.

Two mechanisms make this safe rather than merely correct-by-convention:

- **Backbone checkpoints are keyed by resolution** (`backbone_lightweight_384.pt`), and the
  resolution is part of the reuse config. A 224 backbone can never be silently handed back for a 384
  run. It also means Stage A's APTOS pretraining for the *winning* recipe is genuinely reused below,
  not repeated.
- **The teacher checkpoint is keyed by resolution and sampling**, and carries both in its reuse
  config, so a teacher from a different recipe is retrained rather than accepted.

### The Stage A selection rule

Not plain argmax QWK. A recipe must beat the 224/standard incumbent by **more than 0.01 QWK**
(`STAGE_A_MIN_GAIN`) to be adopted — 384 costs roughly 2.9× the pixels, and a hairline validation
win does not justify that. Inside the band the tie-break is Macro-F1 → Grade-1 recall → severe error
→ cheaper recipe.

The rule is exercised against synthetic data with known answers in `dryrun_enhanced.py`: a 0.0099
gain is rejected, an exactly-0.0100 gain is rejected (strict inequality), a 0.05 gain is adopted,
and among qualifying recipes the Macro-F1 tie-break — not the top QWK — decides.

---

## 4. The results self-audit

Every other gate in this notebook checks an **input**: the split is clean, the labels are ordinal,
the PTQ and QAT operator scopes match. `Gate12b` is the only one that checks an **output**.

It re-reads every saved per-sample prediction file and recomputes the number the tables report:

- every internal test QWK, from its own predictions
- the deployed model's QWK, cross-checked against `sklearn.cohen_kappa_score(weights="quadratic")`
- every per-condition mean in `table_predictive_performance.csv`, against the rows behind it
- every confirmatory external QWK, from its own predictions

This catches a class of bug the input gates structurally cannot see: a stale prediction file, a
mis-joined table, a threshold applied in one code path and forgotten in another. **A number that
cannot be reproduced from the predictions it claims to summarise is not a result**, so this gate
blocks.

`Gate12c` flags comparisons where the bootstrap CI excludes zero but the permutation p-value does
not, or the reverse. That is **not** an error — the two answer slightly different questions — but it
*is* a weaker claim. It is reported by the notebook rather than left for a reviewer to notice, and
it never blocks, because disagreement is a legitimate statistical outcome and not a pipeline fault.

---

## 5. New outputs

| File | Contents |
|---|---|
| `tables/table_stage_a_recipe_selection.csv` | Four recipes × validation QWK / Macro-F1 / Grade-1 recall / SER |
| `configs/stage_a_recipe.json` | The selected recipe, the full grid, and the rule that chose it |
| `tables/table_threshold_calibration.csv` | Every condition × seed × threshold on the grid |
| `configs/threshold_calibration.json` | `t*` per condition and the selection rule |
| `tables/table_per_grade_performance.csv` | Per-grade precision / recall / F1 / specificity / support |
| `metrics/confusion_normalized_*.csv` | Row-normalised confusion matrices |
| `tables/table_external_summary.csv` | External mean ± sd over the matched seeds |
| `tables/table_external_paired.csv` | Paired external comparisons, now including CSD vs M\* |
| `tables/table_results_audit.csv` | Every recomputed number and whether it matched |
| `tables/table_ci_permutation_disagreement.csv` | Comparisons where the two tests disagree |

Three descriptive metrics are added to every results row: **ExactAccuracy**, **AdjacentErrorRate**,
and **AdjacentAccuracy** (`P(|ŷ − y| ≤ 1)` — "within one severity grade", the number that is
actually intuitive to a clinician).

These are **secondary and descriptive**, declared before the run. QWK remains the primary metric and
the only quantity that selects anything. That ordering is stated here precisely so that adding them
cannot later be mistaken for choosing a metric after seeing results.

---

## 6. Runtime

The Simple run took **≈ 5 hours**. The Enhanced run's cost depends on what Stage A selects, which is
not knowable in advance — that is the point of running it.

| Phase | If Stage A picks 224 | If Stage A picks 384 |
|---|---|---|
| Stage A (12 student trainings + APTOS pretraining at both resolutions) | ≈ 1.3–1.5 h | ≈ 1.3–1.5 h |
| Everything downstream | ≈ 5 h | ≈ 11 h |
| **Total** | **≈ 6.5 h** | **≈ 12.5 h** |

The 384 estimate assumes GPU time scales with pixel count (2.94×) while cached data loading scales
more gently — the run is data-bound at 224 (~50 s data vs ~15 s GPU per DRTiD epoch), so the total
does not scale by the full 2.94×. **Treat these as estimates, not measurements.**

**If the total exceeds one session.** `RESUME = True` reuses every finished checkpoint and trains
only what is missing, so the run can be continued across sessions without losing work. A practical
approach is to let Stage A finish first — it writes `configs/stage_a_recipe.json` — and continue
from there.

**Rehearse first.** `QUICK = True` on a throwaway `RUN_TAG` runs every stage with one seed and
minimal epochs, in a few minutes. Stage A **still runs** in QUICK mode, on a 2-recipe grid at 224 —
it is the newest code in the notebook, so it is precisely what a rehearsal exists to exercise. A
rehearsal proves the pipeline executes end to end; it says nothing whatsoever about accuracy.

---

## 7. Verification performed

None of this proves the *scientific* claims; it proves the notebook does what this document says.

| Check | Script | Result |
|---|---|---|
| Every code cell compiles | `build_enhanced.py` | 49/49 |
| Every referenced global is bound; no forward references; no use-after-delete | `nameorder_check.py` | clean |
| No use-before-assignment inside any function | `unbound_check.py` | clean |
| Ordering, threshold wiring, seed-matching, sampler discipline, accumulation | `verify_enhanced.py` | 39/39 |
| Decision rules against synthetic data with known answers | `dryrun_enhanced.py` | 40/40 |
| All 29 Simple gates preserved | gate diff | 0 missing, 4 added |

`verify_enhanced.py` is the one worth understanding: the compile and name checks prove the notebook
*runs*, but the ordering bug described in §3 would have passed all of them. It asserts the execution
order directly — Stage A before the freeze, the freeze before pretraining, pretraining before the
teacher, the teacher before the CSD scale, and the test set only after selection.

Two bugs were caught by these checks and fixed rather than shipped:

1. **The ordering bug.** As first written, Stage A sat in §13 — after the teacher was already
   trained. Selecting a different resolution would have silently mismatched the teacher and the
   students. Found by writing the ordering assertions, not by running the code.
2. **`ALPHA` did not exist.** The disagreement flag compared `p_holm < ALPHA`; the constant is
   `ALPHA_CI`. This would have raised `NameError` at the very end of a multi-hour run.

---

## 8. Known limitations

- **Stage A uses one condition, not all ten.** The recipe is chosen with no distillation and applied
  to every condition. If resolution interacts strongly with the distillation term, that interaction
  is not measured. Testing it properly would mean 4 recipes × 10 conditions × 5 seeds, which is not
  affordable, and the alternative — choosing the recipe per condition — would give each method its
  own tuning budget and make the comparison unfair.
- **Three tuning seeds in Stage A.** A 0.01 QWK band on three seeds is not a precise instrument. It
  is a guard against adopting an expensive recipe on noise, not a significance test, and it is not
  reported as one.
- **The threshold is calibrated on 200 validation eyes.** One degree of freedom on 200 eyes is
  defensible; it is not free. `table_threshold_calibration.csv` shows the full grid so the
  sensitivity of the choice is visible rather than hidden behind a single selected value.
- **The follow-up shares the Simple run's splits.** It is a re-analysis of the same data with a
  different recipe, not independent replication. Agreement between the two runs is weaker evidence
  than agreement between two datasets would be.
