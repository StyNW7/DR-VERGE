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

**`results/simple-notebook/`.** It is the primary evidence.

| | simple | efficient |
|---|---|---|
| Integrity gates | **32/32** | partial |
| Confirmatory external evaluation (Set-C) | ✅ | ✗ |
| 5-seed matched RQ2 | ✅ | ✗ |
| Hyperparameter selection | **3 seeds** | 1 seed |
| Verified deployment artifact | ✅ | ✗ |
| Collapse warnings | **0** | 10 conditions flagged |

The efficient run is a **robustness check**, not a competing result. It matters because of what
it agrees with: the RQ1 mechanism ordering (CSD best on all three metrics) replicated across
both runs, from independent training with a different selection regime. Two runs agreeing on
the mechanism is stronger evidence than either alone.

Where they **disagree** — the predictive rankings, which model was selected as M\*, INT8
retention figures — the disagreement is itself reported. Selection-regime instability is a real
property of this task, not something to hide. See `results/knowledge/comparison.md`.

---

## pipeline/

```
pipeline/
├── full_pipeline_notebook_simple.ipynb            ← executed, primary evidence
├── full_pipeline_notebook_final_last_efficient.ipynb ← executed, robustness check
├── full_pipeline_notebook_enhanced.ipynb          ← pre-registered, NOT YET RUN
├── full_pipeline_notebook_rev1/rev2/rev3.ipynb    ← development history
├── src/          datasets · losses · models · pretrain_aptos · utils · smoke_test
├── configs/      one YAML per training condition
├── data/splits/  drtid_train / drtid_val / drtid_test CSVs
├── scripts/      make_splits.py + verification/
└── *.md          protocol and per-notebook documentation
```

### Documentation inside pipeline/

| File | Read it for |
|---|---|
| `FINAL_PROTOCOL.md` | The frozen evaluation protocol — pre-registered rules |
| `SIMPLE_NOTEBOOK.md` | Walkthrough of the primary notebook |
| `ENHANCED_NOTEBOOK.md` | The four planned changes, decision order, known limits |
| `comparison.md` | Why `simple` is primary |
| `documentation.md` · `results.md` · `resource.md` | Implementation notes, results notes, compute budget |
| `revision-notes-rev3.md` | Development history |

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

### The enhanced notebook has not been run

`full_pipeline_notebook_enhanced.ipynb` is a **pre-registered follow-up**, not a replacement.
It adds four changes on top of the simple run:

1. **Stage A recipe selection** — 224/384 × standard/balanced, chosen before the teacher exists
2. **Threshold calibration** — one global `t*` per condition, from validation only
3. **`sqrt` class-balanced sampling** on training loaders
4. **Two new integrity gates**, including a blocking consistency check

The reporting rule was fixed *before* any run: **if the simple and enhanced runs disagree, both
are reported.** Estimated runtime ~6.5 h at 224 px, ~12.5 h at 384 px.

### Verification scripts

`scripts/verification/` statically checks the enhanced notebook before a multi-hour run is
committed to: `verify_enhanced.py` (structural, 39 checks), `dryrun_enhanced.py` (logic, 40
checks), plus name-ordering and unbound-variable passes.

These exist because of a real near-miss. An earlier draft placed Stage A **after** teacher
training — a 384-trained teacher would have distilled into 224 students. Nothing would have
crashed; every number would simply have been wrong. Compile, name-order and unbound checks all
passed *while the bug was present*. Only an explicit ordering assertion caught it.

**Lesson encoded here: a pipeline that runs is not a pipeline that is correct.**

---

## results/

```
results/
├── simple-notebook/      PRIMARY — notebook, 14 figures, RESULTS_OVERVIEW.md, OVERVIEW_ID.md
├── efficient-notebook/   robustness check — notebook, figures, RESULTS_OVERVIEW.md
├── knowledge/            cross-run analysis
└── improvements.md       what a follow-up run should change
```

Each `RESULTS_OVERVIEW.md` is a complete written account of its run: verdict, gate report,
RQ1, RQ2, what to put in the paper, and weaknesses to state. **Read those before reading any
figure.**

`knowledge/` holds `comparison.md` (simple vs efficient), `rq-answer.md` (the RQ answers in
final form), and per-run summaries including Indonesian-language versions.

### Figures

Each figure ships as **`.png` + `.svg` + `.pdf` + `_caption.txt` + `_data.csv`** — the caption
as written for the paper, and the exact numbers behind the plot. A figure whose underlying CSV
is present can be audited; one without it can only be trusted.

The three exhibits that carry the paper:

| Figure | Shows |
|---|---|
| `fig_07_csd_mechanism` | CSD best on all three mechanism panels — the strongest single figure |
| `fig_12_forest` | All pre-registered comparisons with CIs, RQ1 nulls shown honestly |
| `fig_13_external_setc` | The Set-C result — caption must carry the interval-overlap caveat |

> ⚠ **Known hazard, documented in `RESULTS_OVERVIEW.md` §7.** Three figures in
> `figures-simple-notebook/` (`fig_01_architecture`, `fig_02_experimental_workflow`,
> `fig_13_qwk_vs_size`) were produced by the *efficient* run, not this one. The simple notebook
> writes exactly 14 figures, `fig_01_dataset` … `fig_14_internal_vs_external`. **Two different
> `fig_13`s now sit in one folder.** Check the filename against that list before citing
> anything, or you risk citing a figure from the wrong experiment. Nothing has been deleted —
> the hazard is flagged rather than silently resolved.

---

## Statistical protocol

Fixed before the runs, applied without exception:

- **Paired patient-clustered bootstrap** over matched seed pairs — B = 10,000
- **Permutation tests** — P = 10,000, exchangeability within clusters
- **Holm correction within each family** of comparisons, not across all 45
- **A difference whose CI includes zero is not a claim.** Where the bootstrap CI and the
  permutation test disagree (as they do for QAT vs FP32: CI includes zero, p = 0.001), **both
  are reported and neither is claimed.** The convenient one is not selected.

---

## Related

- Research argument → [`../research/`](../research/)
- Data layout → [`../dataset/README.md`](../dataset/README.md)
- Demo → [`../frontend/`](../frontend/)
</content>
