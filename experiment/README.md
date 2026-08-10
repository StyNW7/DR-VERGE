# DR-VERGE Pipeline Experiment

Complementarity-Shift Distillation (CSD) and INT8 deployment for lightweight two-field diabetic
retinopathy grading.

## Two notebooks, one experiment

| | `full_pipeline_notebook_final.ipynb` | `full_pipeline_notebook_simple.ipynb` |
|---|---|---|
| Protocol | `DR_VERGE_FINAL_V3` | same science, less machinery |
| Size | 93 cells / 5,039 code lines | 69 cells / 2,941 code lines |
| Training jobs | 102 | **102** (identical) |
| Max epoch-runs | 3,315 | **3,315** (identical) |
| Gate results | 32 | **32** |
| Figures / tables | 14 / 24 | **14 / 24** |
| Runtime on a T4 | ~46 h over 5–6 sessions | **≈ 4.9 h**, one session |
| Multi-session resume | exact, protocol-hash guarded | checkpoint reuse + fresh-namespace guard |

Both answer the same RQ1 and RQ2 with the same splits, architectures, CORAL construction, CSD
formula, seeds, grids, selection rule, matched per-seed RQ2, statistics and external protocol. A
parity audit verifies **67/67** load-bearing science elements are present in the simple notebook.

The difference is engineering scaffolding, not science. The simple notebook is the recommended one
to run.

## Documentation

| File | Covers |
|---|---|
| [`SIMPLE_NOTEBOOK.md`](SIMPLE_NOTEBOOK.md) | **the simple notebook**: configuration, resume, every artifact it saves, the rev-simple revision, gates, tables, verification |
| [`FINAL_PROTOCOL.md`](FINAL_PROTOCOL.md) | the locked protocol and the response to each review round |
| [`resource.md`](resource.md) | runtime and resource requirements per GPU; §11 covers the simple notebook |
| [`documentation.md`](documentation.md) | method background |
| [`results.md`](results.md) | results write-up |

## Quick start (simple notebook)

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
RUN_TAG    = "final_locked_simple_v1_20260809"   # change for every NEW final run
QUICK      = False    # True = 1 seed, few epochs, Set-B external — a rehearsal
RESUME     = True     # continue an interrupted run in the same RUN_TAG
USE_AMP    = False
```

Rehearse once with `QUICK = True` on a throwaway tag, then set `QUICK = False`, pick a fresh
`RUN_TAG`, and Run All. If Colab disconnects, reopen with the same `RUN_TAG` and Run All again —
nothing already finished is retrained.

`artifacts_<RUN_TAG>/FINAL_RUN_COMPLETE.txt` exists only if the run truly finished with every
blocking gate passed.
