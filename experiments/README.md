# experiments/

Everything that turns the DR-VERGE hypothesis into evidence.

```
experiments/
├── pipeline/   the code — notebooks, src/, configs/, splits, verification
└── results/    the evidence — executed runs, figures, written overviews
```

The separation is deliberate: **`pipeline/` is what you run, `results/` is what came out.**
Results are historical artifacts and are never regenerated in place.

---

## Which run should I trust?

**`results/enhanced-notebook/`.** It is the final run and the single source of truth for every
number in the paper.

| | enhanced | simple | efficient |
|---|---|---|---|
| Role | **FINAL** | supporting | supporting |
| Integrity gates | **36/36** | 32/32 | partial |
| Headline values recomputed from raw predictions | **265/265 matched** | ✗ | ✗ |
| Input resolution | **384** (selected in Stage A) | 224 | 224 |
| Core seeds | **5** | 5 | 3 |
| Hyperparameter selection | **3 seeds** | 3 seeds | 1 seed |
| Threshold calibration on validation | ✅ | ✗ | ✗ |
| Confirmatory external evaluation (Set-C) | ✅ | ✅ | ✗ |
| Verified deployment artifact | ✅ | ✅ | ✗ |

> **Never mix numbers across runs.** The three runs use different resolutions, seed counts, and
> statistical protocols, so their values are not comparable. A table combining them is wrong even
> if every individual number in it is correct.

The supporting runs matter because of what they **agree** on: the RQ1 mechanism ordering — CSD
best on all three metrics — replicated across all three, from independent training under
different selection regimes. Three runs agreeing on the mechanism is stronger evidence than any
one alone.

Where they **disagree** — predictive rankings, which model was selected as M\*, INT8 retention
figures — the disagreement is itself reported. Selection-regime instability is a real property
of this task, not something to hide. See
[`results/final-results-documentation/final-comparison.md`](results/final-results-documentation/final-comparison.md).

---

## pipeline/

```
pipeline/
├── notebooks/        the four pipeline notebooks (source form)
├── notebooks-result-explanation/   protocol and per-notebook documentation
├── src/              datasets · losses · models · pretrain_aptos · utils · smoke_test
├── configs/          one YAML per training condition
├── data/splits/      drtid_train / drtid_val / drtid_test CSVs
├── scripts/          make_splits.py + verification/
└── requirements.txt
```

### Documentation

All of it lives in [`pipeline/notebooks-result-explanation/`](pipeline/notebooks-result-explanation/):

| File | Read it for |
|---|---|
| `FINAL_PROTOCOL.md` | The frozen evaluation protocol — pre-registered rules |
| `ENHANCED_NOTEBOOK.md` | The final run: its four protocol changes, decision order, known limits |
| `SIMPLE_NOTEBOOK.md` | Walkthrough of the earlier notebook |
| `comparison.md` | How the notebooks differ |
| `documentation.md` · `results.md` · `resource.md` | Implementation notes, results notes, compute budget |

> Some cross-references inside these documents point at paths from an earlier repository layout
> (`docs/…`, `experiment-result/…`). The documents themselves are unchanged and remain accurate
> in content; only the paths are historical.

### Running it

Notebooks target **Google Colab** and resolve data via Google Drive:

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
```

DRTiD is located by search (`_find_drtid`), so the notebooks **do not depend on this
repository's folder layout** — restructuring the repo cannot break them.

```bash
pip install -r requirements.txt
```

Exact versions used by the final run:
`../results/enhanced-notebook/outputs/configs/requirements_exact.txt`.

### What the enhanced run changed

Four changes on top of the simple run, all fixed **before** execution:

1. **Stage A recipe selection** — 224/384 × standard/balanced, chosen before the teacher exists
   → selected **384 / standard** (val QWK 0.6491 vs 0.5549), then frozen
2. **Threshold calibration** — one global `t*` per condition, from validation only
3. **`sqrt` class-balanced sampling** on training loaders
4. **Two new integrity gates**, including a blocking self-audit that recomputes every headline
   value from the raw prediction files

The reporting rule was fixed before any run: **if runs disagree, both are reported.**

### Verification scripts

`scripts/verification/` statically checks a notebook before a multi-hour run is committed to:
`verify_enhanced.py` (structural), `dryrun_enhanced.py` (logic), plus name-ordering and
unbound-variable passes.

These exist because of a real near-miss. An earlier draft placed Stage A **after** teacher
training — a 384-trained teacher would have distilled into 224 students. Nothing would have
crashed; every number would simply have been wrong. Compile, name-order and unbound checks all
passed *while the bug was present*. Only an explicit ordering assertion caught it.

**Lesson encoded here: a pipeline that runs is not a pipeline that is correct.**

---

## results/

```
results/
├── enhanced-notebook/            FINAL — notebook, 14 figures, RESULTS_OVERVIEW.md
├── simple-notebook/              supporting — notebook, figures, overviews (EN + ID)
├── efficient-notebook/           supporting — notebook, archived outputs
├── final-results-documentation/  cross-run comparison and per-run summaries
└── knowledge/                    analyses written during the research
```

Each `RESULTS_OVERVIEW.md` is a complete written account of its run: verdict, gate report, RQ1,
RQ2, and the weaknesses to state. **Read those before reading any figure.**

### Figures

Each figure ships as **`.png` + `.svg` + `.pdf` + `_caption.txt` + `_data.csv`** — the caption as
written for the paper, and the exact numbers behind the plot. A figure whose underlying CSV is
present can be audited; one without it can only be trusted.

The exhibits that carry the paper, all from the enhanced run:

| Figure | Shows |
|---|---|
| `fig_06_dual_view_gain` | The premise: dual-view beats either single view |
| `fig_07_csd_mechanism` | CSD best on all three mechanism panels — the strongest single figure |
| `fig_12_forest` | All pre-registered comparisons with CIs, RQ1 nulls shown honestly |
| `fig_11_pareto` | QWK against CPU latency — the whole of RQ2 in one plot |
| `fig_14_internal_vs_external` | Generalisation across a real domain shift |

✅ The enhanced run's figure folder is **clean**: `fig_01_dataset` … `fig_14_internal_vs_external`,
no duplicates, safe to cite directly.

> ⚠ **Hazard in the *simple* run only.** Three figures in that run's folder were produced by the
> *efficient* run, leaving two different `fig_13`s side by side. Check the filename against the
> canonical list before citing anything from `simple-notebook/`. Nothing was deleted — the hazard
> is flagged rather than silently resolved. Details in that run's `RESULTS_OVERVIEW.md` §7.

---

## Statistical protocol

Fixed before the runs, applied without exception:

- **Paired clustered bootstrap** over matched seed pairs — B = 10,000. Clusters are **eyes**
  internally (DRTiD has no patient IDs) and **patients** externally (DeepDRiD does).
- **Permutation tests** — P = 10,000, exchangeability within clusters
- **Holm correction within each family** of comparisons, not across all 45
- **A difference whose CI includes zero is not a claim.** Where the bootstrap CI and the
  permutation test disagree — as they do for PTQ vs FP32 in the final run: CI includes zero,
  p = 0.024 — **both are reported and neither is claimed.** The convenient one is not selected.

---

## Related

- Research argument → [`../research/`](../research/)
- Data layout → [`../dataset/README.md`](../dataset/README.md)
- Demo → [`../frontend/`](../frontend/)
