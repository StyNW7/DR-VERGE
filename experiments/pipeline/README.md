# DR-VERGE Pipeline

Complementarity-Shift Distillation (CSD) and INT8 deployment for lightweight two-field diabetic
retinopathy grading.

This directory holds the **code**. The executed runs and their outputs are in
[`../results/`](../results/).

```
pipeline/
├── notebooks/                      the four pipeline notebooks
├── notebooks-result-explanation/   protocol and per-notebook documentation
├── src/                            modular components
├── configs/                        one YAML per training condition
├── data/splits/                    committed train / val / test splits
├── scripts/                        make_splits.py + verification/
└── requirements.txt
```

---

## The notebooks

| Notebook | Role | Runtime |
|---|---|---|
| [`notebooks/full_pipeline_notebook_enhanced.ipynb`](notebooks/full_pipeline_notebook_enhanced.ipynb) | **FINAL RUN** — every paper number comes from this | ~12.5 h (A100) |
| [`notebooks/full_pipeline_notebook_simple.ipynb`](notebooks/full_pipeline_notebook_simple.ipynb) | Supporting run, earlier protocol | ~4.9 h (T4) |
| [`notebooks/full_pipeline_notebook_final_last_efficient.ipynb`](notebooks/full_pipeline_notebook_final_last_efficient.ipynb) | Supporting run, compute-frugal variant | ~4 h |
| [`notebooks/full_pipeline_notebook_final.ipynb`](notebooks/full_pipeline_notebook_final.ipynb) | Intermediate version, kept for provenance | ~46 h |

The `final` and `simple` notebooks answer the same RQ1 and RQ2 with identical splits,
architectures, CORAL construction, CSD formula, seeds, grids, selection rule, matched per-seed
RQ2, statistics and external protocol — a parity audit verified **67/67** load-bearing science
elements present in the simple one. The difference is engineering scaffolding, not science.

## The enhanced run

The enhanced notebook is a **pre-registered follow-up** that became the final run. It changes
four things and nothing else:

1. **Stage A recipe selection** — resolution and sampling chosen *before the teacher exists*,
   with no distillation term, then frozen. Selected **384 / standard** (val QWK 0.6491 vs 0.5549).
2. **Threshold calibration** — one global CORAL decision threshold `t*` per condition, fitted on
   validation only.
3. **`sqrt` class-balanced sampling** on training loaders.
4. **Two new integrity gates**, including a blocking self-audit that recomputes every headline
   value from the raw per-sample prediction files.

The RQs, the CSD formula, the condition ladder, the splits, the seeds and the selection rule are
unchanged. It reports **36 gates** in total, all passed, with **265/265** headline values matched
by the self-audit.

The Stage A ordering is load-bearing: a teacher trained at one resolution distilling into
students at another would not crash — it would just be wrong.

See [`notebooks-result-explanation/ENHANCED_NOTEBOOK.md`](notebooks-result-explanation/ENHANCED_NOTEBOOK.md).

---

## Documentation

| File | Covers |
|---|---|
| [`notebooks-result-explanation/FINAL_PROTOCOL.md`](notebooks-result-explanation/FINAL_PROTOCOL.md) | The locked protocol and the response to each review round |
| [`notebooks-result-explanation/ENHANCED_NOTEBOOK.md`](notebooks-result-explanation/ENHANCED_NOTEBOOK.md) | The final run: four changes, decision order, self-audit, outputs, limitations |
| [`notebooks-result-explanation/SIMPLE_NOTEBOOK.md`](notebooks-result-explanation/SIMPLE_NOTEBOOK.md) | The simple notebook: configuration, resume, artifacts, gates, verification |
| [`notebooks-result-explanation/comparison.md`](notebooks-result-explanation/comparison.md) | How the notebooks differ |
| [`notebooks-result-explanation/resource.md`](notebooks-result-explanation/resource.md) | Runtime and resource requirements per GPU |
| [`notebooks-result-explanation/documentation.md`](notebooks-result-explanation/documentation.md) | Method background |
| [`notebooks-result-explanation/results.md`](notebooks-result-explanation/results.md) | Results write-up |

> Cross-references inside these documents sometimes use paths from an earlier repository layout
> (`docs/…`, `experiment-result/…`). The content is unchanged and still accurate; only the paths
> are historical.

---

## Quick start

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
RUN_TAG    = "enhanced_v1_YYYYMMDD"   # change for every NEW final run
QUICK      = False    # True = 1 seed, few epochs, Set-B external — a rehearsal
RESUME     = True     # continue an interrupted run in the same RUN_TAG
USE_AMP    = False
```

```bash
pip install -r requirements.txt
```

Rehearse once with `QUICK = True` on a throwaway tag, then set `QUICK = False`, pick a fresh
`RUN_TAG`, and Run All. If Colab disconnects, reopen with the same `RUN_TAG` and Run All again —
nothing already finished is retrained.

`artifacts_<RUN_TAG>/FINAL_RUN_COMPLETE.txt` exists only if the run truly finished with every
blocking gate passed.

Notebooks locate DRTiD by search (`_find_drtid`), so they do not depend on this repository's
folder layout.

---

## Verification before you commit hours

[`scripts/verification/`](scripts/verification/) statically checks a notebook before a
multi-hour run: structural checks, logic dry-run, name-ordering and unbound-variable passes.

They exist because of a real near-miss — an earlier draft placed Stage A *after* teacher
training, and every automated check passed while the bug was present. Only an explicit ordering
assertion caught it.

---

## Related

- Executed runs and outputs → [`../results/`](../results/)
- Final run overview → [`../results/enhanced-notebook/RESULTS_OVERVIEW.md`](../results/enhanced-notebook/RESULTS_OVERVIEW.md)
- Data layout → [`../../dataset/README.md`](../../dataset/README.md)
