# 🛠️ scripts/

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

| File | Purpose |
|---|---|
| [`make_splits.py`](make_splits.py) | Builds the DRTiD split (train 800 / validation 200 / test 550) deterministically from the official partition |
| [`verification/`](verification/) | Static checks on the notebook **before** committing to a multi-hour run |

All commands are run from the `experiments/` folder.

---

## ✂️ `make_splits.py`

Reads DRTiD from `dataset/DRTiD/` at the repository root and writes `drtid_{train,val,test}.csv` to `experiments/data/splits/`. That folder is **local and not committed**, because it holds absolute paths to images on each machine.

```bash
python scripts/make_splits.py
```

The partition **exactly as used** by the final run is stored in [`../results/splits/`](../results/splits/).

---

## ✅ `verification/`

```bash
python scripts/verification/nameorder_check.py  notebooks/full_pipeline_notebook_enhanced.ipynb
python scripts/verification/unbound_check.py    notebooks/full_pipeline_notebook_enhanced.ipynb
python scripts/verification/verify_enhanced.py  notebooks/full_pipeline_notebook_enhanced.ipynb
python scripts/verification/dryrun_enhanced.py
```

| Script | What it proves | What it cannot prove |
|---|---|---|
| `nameorder_check.py` | Every global name is defined, never used before its defining cell, and never used after `del` | That the values are right |
| `unbound_check.py` | No use-before-assignment inside any function body (AST level) | Module-level flow |
| `verify_enhanced.py` | The **execution order** the method requires, thresholds at every prediction site, seed-matched external evaluation, sampler discipline | That training works |
| `dryrun_enhanced.py` | The **decision rules** on synthetic data with known answers: Stage A, `grade_from`, threshold calibration, paired bootstrap, self-audit sensitivity | Anything about real data |

Results against the final notebook: `nameorder_check` clean · `unbound_check` clean · `verify_enhanced` **39/39** · `dryrun_enhanced` **40/40**.

> [!TIP]
> **A pipeline that runs is not a pipeline that is correct.** Compile and name checks still passed when Stage A was briefly placed after teacher training — which would have had a 384-resolution teacher distilling into 224-resolution students. Nothing crashed; every number would simply have been wrong. Only the ordering assertions in `verify_enhanced.py` caught it.

`dryrun_enhanced.py` runs standalone, with no data, GPU or artifacts, because it transcribes the notebook's decision rules. The cost: if a rule changes in the notebook, the transcription here must change too.
