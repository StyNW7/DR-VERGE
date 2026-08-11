# DR-VERGE — Comparison of the Two Final Notebooks

| | **Simple** | **Efficient** |
|---|---|---|
| File | `full_pipeline_notebook_simple.ipynb` | `full_pipeline_notebook_final_last_efficient.ipynb` |
| sha256 (first 12) | `263a26c07632` | `a7f3a7f53d60` |
| Size | 69 cells (45 code, 24 md), 3,005 lines | 84 cells (58 code, 26 md), 3,092 lines |
| Expected runtime | **≈ 4.9 h**, any runtime | **≈ 7.9 h** with ≥6 vCPU, **≈ 20.8 h** with 2 |
| Training jobs | 102 | 56 |
| Max epoch-runs | 3,285 | 1,975 |

**Headline: the Simple notebook runs ~83% more training jobs and still finishes ~3 hours sooner.**
Those are not in tension — they measure different things. The job count is *how much experiment*
gets done; the wall clock is dominated by *how the images are read*. Simple caches decoded images
and removes the I/O bottleneck outright; Efficient re-decodes every image every epoch and parallelises
that work instead.

**Recommendation: use the Simple notebook as the primary result for the paper.** Details in §5.

---

## 1. What is identical — the science core

Both notebooks answer the same RQ1 and RQ2 with the same method. Verified by extracting these values
from both files, not from recollection:

| Element | Both |
|---|---|
| Datasets | DRTiD (development), APTOS (backbone pretraining), DeepDRiD (external) |
| DRTiD split | 800 train / 200 val / 550 test eyes, stratified, split seed 42 |
| Input | 224 × 224, 5 grades, CORAL with 4 cumulative thresholds |
| Ordinal head | monotone thresholds, initialised from empirical marginals |
| Class imbalance | `POS_WEIGHT_MODE = "sqrt"` — √(N_neg/N_pos) per threshold |
| Architectures | ResNet-50 dual-view teacher; ~330K-param depthwise student; InteractionFusion |
| CSD formulation | Δ = p_dual − (p_macula + p_disc)/2, distilled at a **fixed global scale** from the frozen teacher |
| Core seeds | 42, 123, 2026, 3407, 8888 |
| Ablation / baseline seeds | 42, 123, 2026 |
| Student budget | 40 epochs, patience 8 |
| Selection | **validation only**, two-stage, `SELECTION_TIE_EPS = 0.005`, same tie-break chain |
| Statistics | cluster bootstrap + permutation test, **B = P = 10,000**, Holm correction |
| Early stopping | every trainer, `EARLY_STOP_MIN_DELTA = 1e-4` |
| Quantization | eager, backbone-only, PTQ and QAT on a matched operator scope |
| Test-set discipline | frozen before the test set is opened; test never used for selection |

Anything computed downstream — QWK, Macro-F1, MAE, severe-error rate, shift fidelity, dual-view
gain, retention, latency — is defined identically in both.

**So: choosing between them does not change the method, the model, or what is being measured.**
It changes how thoroughly the method is exercised and how much evidence is retained.

---

## 2. Where they genuinely differ

Ordered by how much it matters to a reviewer.

| # | Aspect | Simple | Efficient | Stronger |
|---|---|---|---|---|
| 1 | **DeepDRiD Set-C** | **used as the primary confirmatory partition** (100 patients / 200 eyes) | **not loaded at all** — Set-A/B only | **Simple** |
| 2 | **Hyperparameter grids** | scored on the **mean over 3 seeds** | scored on **1 seed** | **Simple** |
| 3 | **RQ2 seeds** | **5**, matched per seed (FP32ₛ → PTQₛ/QATₛ/FT-PTQₛ) | 3 | **Simple** |
| 4 | **RQ2 multiplicity** | 2 Holm families: 3 primary + controls separate | 1 family of 5, controls included | **Simple** |
| 5 | **RQ2 variants** | 5 (adds FT-PTQ) | 4 | **Simple** |
| 6 | **Gates** | 29 named (32 firings) | 17 | **Simple** |
| 7 | **Resume safety** | checkpoint must match keys **and condition and config** | keys/shapes only | **Simple** |
| 8 | **Outputs** | 24 tables, 14 figures, 6 model exports + `selected_deployment/` | 12 tables, 11 figures, 5 model exports | **Simple** |
| 9 | **CSD α tuning** | α **frozen** at the logit-KD winner | α **re-tuned** inside the CSD grid | *trade-off — see below* |
| 10 | **Data path** | in-RAM resized-image cache, `num_workers=0` | 6 workers, no cache | **Simple** |

### The four that would actually draw reviewer questions

**1 — DeepDRiD Set-C.** Simple evaluates on Set-C, the partition DeepDRiD reserves for final
challenge evaluation (100 patients, zero overlap with A or B), with Set-B/A as supplementary and a
partition-disjointness gate. Efficient never loads Set-C. External confirmation on a genuinely
held-out partition is one of the strongest claims available in this study, and only Simple makes it.

**2 — Grid selection on 1 seed vs 3.** Efficient picks α, τ, γ and β from a single training run per
configuration. With seed-to-seed QWK variation of a few points, a configuration can win by luck.
Simple averages over three seeds before selecting. This is the difference between "the best setting"
and "the setting that happened to get a good seed", and it is cheap insurance for the central claim.

**3 — RQ2 multiplicity.** Efficient puts all five RQ2 comparisons in one Holm family, so the
FP32/PTQ/QAT headline is penalised for the presence of its own fine-tune controls. Simple splits
them: *p* = 0.01 adjusts to **0.030** in the 3-comparison primary family versus **0.060** pooled.
Same data, different reported significance — purely from how the family was declared.

**9 — CSD α, a real trade-off, not a defect.**
- *Simple* freezes α at the logit-KD winner, so "logit-KD" and "logit-KD + CSD" differ by **exactly
  one term**. Cleanest possible ablation logic, and CSD gets a *smaller* tuning budget than the
  baseline — conservative, harder for CSD to win, which strengthens the claim if it does.
- *Efficient* gives CSD its own α grid, which supports a **matched tuning budget** fairness argument.

Both are defensible. Simple's choice also follows the reviewer's explicit instruction in
`revision/rev-simple.md` §23.

---

## 3. Why Simple does more work and still finishes sooner

One DRTiD epoch touches 2,000 full-resolution images (1,600 train + 400 validation).

| | Simple | Efficient |
|---|---|---|
| Strategy | decode + resize **once**, cache the 224² `uint8` array in RAM | re-decode every image every epoch, parallelised over 6 workers |
| Cost per image | ~0.2 ms (cache hit) | ~36 ms measured, ~50 ms on a Colab vCPU |
| Data per DRTiD epoch | ~0.3 s | ~16.8 s at 6 workers, ~50 s at 2 |
| Epoch is bound by | **GPU** | **data**, at every worker count tested |
| RAM cost | +918 MB (measured) | — |
| Sensitive to vCPU count? | **No** | **Yes — this is the risk** |

The cache is provably free: every transform begins with `Resize(224, 224)`, so caching the resized
array feeds byte-identical tensors downstream. Verified on the real files — **0 uint8 levels** of
difference with augmentation parameters held equal.

**The practical consequence.** Efficient's 7.9 h assumes Colab gives you ≥6 vCPU. A standard T4
runtime often provides 2, and then `DATALOADER_WORKERS = min(6, cpu_count)` resolves to 2 and the
run takes **~20.8 h**. Simple is unaffected either way, because after the first epoch it never
touches the disk again.

### GPU choice

Efficient is data-bound at every configuration, so a faster GPU buys almost nothing:

| Runtime | Workers | Wall clock | Compute units |
|---|---:|---:|---:|
| T4 @ 2 vCPU | 2 | 20.8 h | ~38 |
| T4 @ 8 vCPU | 6 | 7.9 h | ~14 |
| L4 @ 8 vCPU | 6 | 7.9 h | ~38 |
| A100 @ 12 vCPU | 6 | 7.9 h | ~103 |

L4 and A100 land on the same data floor — **the A100 is 2.7× the cost for identical wall clock**.
Run `!nproc` before choosing. Simple needs none of this: ~4.9 h on a T4, ~10 units.

---

## 4. Verification performed

This is where the two differ most, and it is not a property of the notebooks but of how much
testing each has had.

| Check | Simple | Efficient |
|---|---|---|
| Code cells compile | 45/45 | 58/58 |
| `nbformat` schema | PASS, zero warnings | PASS |
| Definition-before-use (module scope) | clean | clean |
| Use-before-assignment (inside functions) | clean | clean |
| Science-parity audit | **67/67** | not applicable |
| rev-simple compliance + invariants | **85/85** | — |
| Reporting cells executed on synthetic results | **27/27** | 8/8 (new code only) |
| Runtime dry-run on the real datasets | **25/25 and 18/18** | **none** |

**Simple has been executed against the real DRTiD/APTOS/DeepDRiD files; Efficient has not.** For
Efficient, only the blocks that were changed have been run. Neither notebook has had a full
end-to-end GPU run, so for both, the training loops, PTQ/QAT conversion, ONNX export and deployment
reload remain unexercised until you run them.

Both should be rehearsed once before a final run — `QUICK = True` for Simple, `PREFLIGHT = True` for
Efficient. That exercises quantization and export in ~15 minutes.

---

## 5. Recommendation

**Use the Simple notebook for the paper's primary results.**

It is stronger on every axis that a reviewer examines — external confirmation on Set-C,
hyperparameters selected over 3 seeds rather than 1, RQ2 across 5 matched seeds, correctly separated
multiplicity families, 29 gates, and a complete artifact trail — while also being **faster, cheaper,
and independent of which Colab runtime you are given**. There is no axis on which Efficient is
scientifically stronger; its one distinctive choice (α re-tuned inside the CSD grid) is a defensible
alternative, not an improvement.

It is also the only one of the two that has been executed against your real data.

**What Efficient is good for.** Keep it. Two honest uses:

1. **A robustness check.** If both notebooks reach the same RQ1 conclusion under different
   hyperparameter-selection regimes (1 seed vs 3) and a different CSD α policy, that is a genuinely
   useful stability statement about the finding.
2. **A cheaper re-run.** 56 jobs vs 102 makes it a reasonable vehicle for a quick variant if you
   later need one.

**What not to do:** do not report results from both as if they were one experiment. They select
hyperparameters differently and evaluate on different external partitions, so their numbers are not
interchangeable. Pick one as primary — Simple — and cite the other explicitly as a secondary
analysis if you use it at all.

### Before running either

| | Simple | Efficient |
|---|---|---|
| Mode flag | `QUICK = False` | `PREFLIGHT = False` |
| Run tag | `RUN_TAG` must be unused | ⚠ still `"preflight_v1"` — **change it** |
| Resume | `RESUME = True` (config-aware) | reuses on keys/shapes only ⚠ |
| Runtime | any; T4 fine | run `!nproc` first; L4 if it reports 2 |
| Done when | `FINAL_RUN_COMPLETE.txt` exists | `FINAL_RUN_COMPLETE.txt` exists |

⚠ **Efficient only:** because its resume check does not inspect training completion, a *partially
trained* backbone checkpoint is accepted as finished on restart. If you interrupt it during APTOS
pretraining, delete `checkpoints/pretrained_backbones/aptos_*_backbone.pt` before resuming, or the
teacher will inherit a half-trained backbone and every downstream result with it. Simple does not
have this failure mode.
