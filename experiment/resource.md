# DR-VERGE — Runtime & Resource Requirements

Estimates for a **full final run** of `experiment/full_pipeline_notebook_final.ipynb`
(protocol `DR_VERGE_FINAL_V3`, `PREFLIGHT = False`).

Produced 2026-08-09. Numbers below are separated into **measured** and **estimated** — read
§7 before trusting any single figure.

**§11 covers `full_pipeline_notebook_simple.ipynb`**, which runs the same experiment with the
cache and early stopping built in — **≈ 4.9 h on a T4, one session.**

---

## 1. Headline

| GPU | As shipped | With the image cache (§5) | Simple notebook (§11) |
|---|---:|---:|---:|
| **T4 (16 GB)** — Colab free / Pro | **≈ 46 h** | **≈ 5.3 h** | **≈ 4.9 h** |
| L4 (24 GB) — Colab Pro | ≈ 44 h | ≈ 3.7 h | ≈ 3.4 h |
| V100 (16 GB) | ≈ 44 h | ≈ 3.6 h | ≈ 3.3 h |
| A100 40 GB — Colab Pro+ | ≈ 43 h | ≈ 2.9 h | ≈ 2.7 h |
| H100 80 GB (non-Colab) | ≈ 43 h | ≈ 2.6 h | ≈ 2.4 h |

*"Realistic" = 65% of the maximum epoch budget, i.e. early stopping fires as it normally does.
Worst case (no early stopping anywhere) is ~1.5× these figures.*

**The single most important line in this document:**

> As shipped, moving from a T4 to an A100 saves **5% of wall-clock** and costs **7× more compute
> units**. The run is not GPU-bound — it is bound by single-threaded image decoding.

---

## 2. What the run contains

Counted directly from the notebook, not estimated.

| Stage | Jobs | Max epochs each |
|---|---:|---:|
| APTOS ResNet-50 pretraining | 1 | 20 |
| APTOS lightweight pretraining | 1 | 30 |
| Teacher (5 freeze + 20 fine-tune) | 1 | 25 |
| Single-view baselines (macula, disc × 5 seeds) | 10 | 40 |
| Core dual-view (no-distill / logit-KD / feature-KD / CSD × 5 seeds) | 20 | 40 |
| Hyperparameter grids (3 methods × 4 configs × 3 tuning seeds) | 36 | 40 |
| CSD formulation ablations (3 × 3 seeds) | 9 | 40 |
| QAT learning-rate grid (3 LR × 3 seeds) | 9 | 10 |
| QAT final (5 seeds) | 5 | 10 |
| FP32-FT control + FP32-FT plain (5 seeds each) | 10 | 10 |
| **Total** | **102** | **3,315 epoch-runs** |

Inference-only work (DRTiD test evaluation, DeepDRiD Set-C/B/A across two field orders, latency
benchmarking, bootstraps) adds roughly **1–2 h** and is included in the totals above.

---

## 3. The bottleneck — measured

Decode + transform timings on the actual dataset files, single-threaded
(Intel Core i7-8700 @ 3.2 GHz):

| Data | Dimensions | Per image | Per epoch |
|---|---|---:|---:|
| DRTiD | 1956 × 1934 JPEG | **32 ms** | **64 s** (2,000 images) |
| APTOS | 3216 × 2136 PNG | **97 ms** | **319 s** (3,296 images) |
| Pre-resized 224² `uint8` cache | — | **0.2 ms** | **0.5 s** |

Against an estimated 4–22 s of GPU work per epoch on a T4:

```
T4, as shipped:   data 62.5 h (89%)   |   GPU 7.7 h (11%)
```

Two compounding causes:

1. `DEFAULT_NUM_WORKERS = 0` — set deliberately, to eliminate the 210
   `AssertionError: can only test a child process` teardown races the first preflight produced.
   The cost is that decoding runs serially with the GPU instead of overlapping it.
2. The **same 1,600 DRTiD images are re-decoded on every epoch of every job** — roughly
   **6.5 million redundant decodes of 1,600 files** across the run.

### Per-epoch wall clock, one dual-view student job (T4)

| Configuration | Per epoch | 40 epochs |
|---|---:|---:|
| As shipped (this CPU) | 73 s | 49 min |
| As shipped (slower Colab vCPU, ×1.4) | 99 s | 66 min |
| With image cache | 9.6 s | 6.4 min |

---

## 4. Why a faster GPU barely helps (as shipped)

Amdahl's law. With 89% of the run outside the GPU, even an infinitely fast GPU caps the saving at
~11%.

| GPU | Wall-clock | vs T4 | Compute units¹ | Units vs T4 |
|---|---:|---:|---:|---:|
| T4 | 45.6 h | — | ≈ 82 | 1.0× |
| L4 | 44.0 h | −3% | ≈ 211 | 2.6× |
| V100 | 43.9 h | −4% | ≈ 215 | 2.6× |
| A100 40 GB | 43.2 h | −5% | ≈ 561 | 6.8× |

**Conclusion: do not pay for a bigger GPU to run this notebook as shipped.** A100 buys 2.4 hours
and costs ~480 extra compute units.

Once the data bottleneck is removed, the picture inverts and GPU choice matters normally:

| GPU | Cached wall-clock | Compute units¹ |
|---|---:|---:|
| T4 | 5.3 h | ≈ 10 |
| L4 | 3.7 h | ≈ 18 |
| A100 40 GB | 2.9 h | ≈ 37 |

**Best value overall: T4 + image cache — ~5 h and ~10 units.**

¹ Colab compute-unit rates are approximate and change; check current rates before budgeting.
Figures assume ≈1.8 (T4), ≈4.8 (L4/V100), ≈13 (A100) units per hour.

---

## 5. The image cache

Every transform in the notebook begins with `A.Resize(224, 224)`. Caching the decoded-and-resized
224×224 `uint8` arrays therefore feeds **byte-identical** arrays into everything downstream.

**Verified:** with augmentation parameters held fixed, original vs pre-resized gives
`max |difference| = 0` uint8 levels across 10 images × 5 rotation angles, for both the standard
transform and the paired `ReplayCompose` path.

| Property | Value |
|---|---|
| RAM needed | **918 MB** (DRTiD 3,100 + APTOS 3,296 images at 224×224×3) |
| Colab RAM available | 12–13 GB |
| Effect on `PROTOCOL_CONFIG` / `PROTOCOL_HASH` | **none** |
| Effect on results | **none** — arithmetically identical |
| Code touched | dataset classes only |
| Speed-up | **131×** on the decode path; ~8.6× end-to-end on T4 |

Not yet applied — it is a change to a notebook that currently passes 45/45 on the final checklist,
so it is offered rather than assumed.

---

## 6. Storage, memory and disk

### Drive artifacts (written by the run): **≈ 1.1 GB**

| Artifact | Size |
|---|---:|
| Teacher export (`checkpoint.pt` + `.pt2` + ONNX) | 461 MB |
| Teacher training checkpoint | 154 MB |
| APTOS ResNet-50 backbone | 90 MB |
| 102 student checkpoints (330K params each) | 128 MB |
| Size probes (~60 evaluations) | 75 MB |
| Figures — 14 × (PNG 400 dpi + PDF + SVG + CSV) | 49 MB |
| INT8 exports, QAT/FT caches, predictions, tables, logs, configs | ~140 MB |

### Colab local disk (staging): **≈ 10 GB**

`USE_LOCAL_DATA_CACHE = True` copies the raw datasets to local SSD once:

| Dataset | Size |
|---|---:|
| APTOS | 8.1 GB |
| DeepDRiD | 1.4 GB |
| DRTiD | 0.5 GB |

A GPU runtime provides 78–110 GB, so this fits comfortably. The one-off copy costs ~2–6 min.

**Keep this enabled.** APTOS is read 50 times (20 + 30 epochs). With the cache off, that is
~405 GB of Drive/FUSE traffic at ~20–40 MB/s — far slower than the copy it avoids.

### RAM

| Use | Peak |
|---|---:|
| Base pipeline (models, loaders, dataframes) | ~3–4 GB |
| Plus the optional image cache | +0.9 GB |
| Colab standard runtime | 12–13 GB |

No high-RAM runtime is required.

---

## 7. How these numbers were produced

| Quantity | Basis | Confidence |
|---|---|---|
| Job and epoch counts | Counted from the notebook source | **Exact** |
| Image decode + transform times | Timed on the actual dataset files | **Measured** |
| Cache equivalence (diff = 0) | Executed comparison | **Verified** |
| Artifact sizes | Computed from parameter counts and file counts | **High** |
| Dataset sizes on disk | `du` on the real folders | **Exact** |
| GPU seconds per epoch | Estimated for a T4 from model size and batch size | **Estimated** |
| GPU scaling factors | Estimated; large models scale with the GPU, the 330K depthwise student is launch-bound and barely does | **Estimated** |
| Compute-unit rates | Approximate published values | **Low — verify** |

### Sensitivity to CPU speed

Decode timings come from a local i7-8700. Colab's vCPU is typically slower:

| Colab CPU vs this machine | As shipped | Cached |
|---|---:|---:|
| Same speed | 45.6 h | 5.3 h |
| 30% slower | 57.8 h | 5.3 h |
| 70% slower | 74.0 h | 5.3 h |

The as-shipped figure is therefore a **lower bound**; the cached figure is insensitive to CPU speed
because decoding is no longer on the critical path.

### Known unknowns

- The preflight notebook stored no per-cell wall-clock (tqdm ran with `leave=False`), so no
  end-to-end measured baseline exists. Only setup timestamps survived: 05:24:39 → 05:26:35 for
  install + mount + Gate 0.
- GPU figures were not measured on this machine (CPU-only, torch 2.10). They are the weakest input
  — but even a 3× error changes the as-shipped total by <10%, because data dominates.

---

## 8. Session planning

### As shipped (~46 h on T4)

Colab sessions cap out well below this, so plan for **5–6 sessions**:

```python
session 1:  RESUME_EXACT = False    # fresh; creates artifacts_final_locked_v3_20260809
session N:  RESUME_EXACT = True     # same RUN_TAG, same DRIVE_BASE
```

Resume is safe by construction: a checkpoint is reused only when its stored `PROTOCOL_HASH` matches
**and** `completed = True`, so a job interrupted mid-training is retrained rather than inherited.

**Keep the same runtime type across all sessions.** `quant_engine` is part of the protocol hash and
is resolved from what the runtime offers (`x86` → `fbgemm` → `onednn`). Switching T4 → L4 mid-run
could change it, move the hash, and cause resume to reject earlier checkpoints.

### With the cache (~5 h on T4)

One session. No resume needed, and none of the multi-session hazards apply.

---

## 9. Recommendation

1. **Add the image cache.** ~40 hours saved, ~70 compute units saved, one session instead of six,
   and provably identical results.
2. **Stay on T4.** A bigger GPU is poor value here — decisively so as shipped, and still only a
   2.4 h saving for ~27 extra units once cached.
3. **Keep `USE_LOCAL_DATA_CACHE = True`.** Disabling it makes the dominant cost worse.
4. **Do not shrink the protocol to save time.** Reducing `SEEDS_TUNING` from 3 to 1 would remove
   ~24 jobs, but it directly weakens the hyperparameter-fairness argument that three review rounds
   were built on. Fix the I/O instead — that costs nothing scientifically.

---

## 10. Quick reference

| Question | Answer |
|---|---|
| GPU required? | Yes — Gate 0 blocks without CUDA |
| Which GPU? | T4 is sufficient and best value |
| High-RAM runtime? | No |
| Free Colab disk needed | ~15 GB |
| Drive space for results | ~1.1 GB |
| Wall-clock, as shipped (T4) | ~46 h over 5–6 sessions |
| Wall-clock, with cache (T4) | ~5 h in one session |
| Wall-clock, simple notebook (T4) | ~4.9 h in one session |
| Compute units, as shipped (T4) | ~82 |
| Compute units, with cache (T4) | ~10 |
| Compute units, simple notebook (T4) | ~9 |

---

## 11. The simplified notebook

`experiment/full_pipeline_notebook_simple.ipynb` — same experiment, same outputs, less machinery.
Written from scratch rather than trimmed, so it carries none of the multi-session scaffolding.

### 11.1 What it runs

**Exactly the same experiment budget** — the science was not reduced:

| | Complex | Simple |
|---|---:|---:|
| Training jobs | 102 | **102** |
| Maximum epoch-runs | 3,315 | **3,315** |
| Seeds (core / tuning / ablation) | 5 / 3 / 3 | **5 / 3 / 3** |
| Hyperparameter grids | 3 × 4 | **3 × 4** |
| Figures | 14 | **14** |

An independent parity audit checks **67/67 load-bearing science elements** — CORAL initialisation
from empirical marginals, the fixed global CSD scale, two-stage selection, matched per-seed RQ2,
hierarchical paired cluster bootstrap, paired cluster permutation, Holm per RQ family, matched
quantization scope, Set-C as the confirmatory partition. All present.

### 11.2 What was removed

| Removed | Why it was safe |
|---|---|
| `RESUME_EXACT` / checkpoint-envelope machinery | a ~5 h run does not need cross-session resume |
| `PROTOCOL_HASH` and the hashed/unhashed config split | that split existed only to make resume safe |
| PT2E supplementary quantization path | supplementary; `RUN_PT2E_SUPPLEMENTARY` shipped `False` anyway |
| `torch.export` / `.pt2` artifact | optional export; ONNX + `state_dict` remain |
| Local-disk staging (`USE_LOCAL_DATA_CACHE`) | superseded — the image cache reads each file once |
| Dependency-pin audit gate | environment check, not a result |
| Legacy name aliases and duplicated smoke checks | dead weight |

Source size: **93 → 69 cells**, **66 → 45 code cells**, **5,039 → 2,649 non-blank code lines
(−47%)**.

### 11.3 Gates

Renamed to a linear `Gate1 … Gate12` scheme. **28 static names, 31 firings at runtime**
(`Gate5_Grid_{tag}` fires once per grid). Nearly all map 1:1 to a complex-notebook gate; the only
genuine drops are the four scaffolding gates in §11.2, and two were added
(`Gate10_Statistics`, `Gate4b_SelectedCSD_Gradient`). **Gates were not cut to save time.**

The one dropped output is `table_02c_validation_viability` — the check survives as
`Gate6b_ValidationViability`, it just no longer writes its own CSV.

### 11.4 Where the time goes

| Change | Saving |
|---|---|
| Image cache on by default (§5) | the ~40 h bottleneck, gone |
| Teacher forward skipped when no distillation term consumes it | ~6% — 15 of 75 student jobs (10 single-view + 5 no-distill) were paying for a dual ResNet-50 forward whose output was discarded |
| Dual-view gain in one forward pass instead of three | <1% — `forward()` already returns all three heads |
| Early stopping in every trainer, with a shared `min_delta = 1e-4` | 0–5% — noise-level "improvements" no longer reset patience |

`USE_AMP` exists but ships **off**: it helps the ResNet-50 teacher, barely helps the 330K depthwise
student, and changes numerics.

**≈ 4.9 h on a T4** (5.3 h cached baseline × ~0.92). Estimated, same confidence class as §7.

### 11.5 Verification performed

| Check | Result |
|---|---|
| All code cells compile | 45/45 |
| Definition-before-use scan | clean (A/B/C) |
| Science parity audit | **67/67** |
| Cleanliness scan | 12/12 |
| Runtime dry-run on the real datasets | **18/18** |

Notable individual results from the dry-run:

- image cache **byte-identical** to `Resize(224)` on the original; 0.000 ms on a hit vs ~32 ms decoding
- QWK vs `sklearn.cohen_kappa_score`: max difference **1.11e-16** over 105 cases
- CORAL monotone, matches empirical marginals, 3.32-logit spread; fusion is view-order sensitive
- early stopping fires on pure noise (`best=0.2000 @ep1`, stopped at ep4) and restores best weights
- the objective evaluates with `t_out=None`, so the teacher skip is real and not just unused
- one-pass dual-view gain **identical to 1e-12** to the three-pass version, verified on
  non-degenerate predictions (5/5/5 distinct grades per head — an untrained model predicts one grade
  for every eye and makes the comparison vacuous)
- DeepDRiD Set-C loads 100 patients / 200 eyes / 400 images, 0 exclusions

### 11.6 Running it

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
RUN_TAG    = "simple_v1"
QUICK      = False      # True = 1 seed, few epochs, ~15 min rehearsal
USE_AMP    = False
```

Set `QUICK = True` once to prove the pipeline runs end to end, then `False` and Run All. No
preflight/final duality, no resume flag, no protocol hash to keep aligned across sessions.

RAM: ~3–4 GB base + **918 MB** for the image cache (measured: DRTiD 445 MB, +APTOS train 866 MB,
+APTOS val 918 MB). Standard Colab runtime is fine.
