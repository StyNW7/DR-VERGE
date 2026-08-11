# DR-VERGE Pipeline Experiment

Complementarity-Shift Distillation (CSD) and INT8 deployment for lightweight two-field diabetic
retinopathy grading.

## Two notebooks, one experiment

| | `full_pipeline_notebook_final.ipynb` | `full_pipeline_notebook_simple.ipynb` |
|---|---|---|
| Protocol | `DR_VERGE_FINAL_V3` | same science, less machinery |
| Size | 93 cells / 5,039 code lines | 69 cells / 3,004 code lines |
| Training jobs | 102 | **102** (identical) |
| Max epoch-runs | 3,315 | 3,285 — 3 jobs reuse an identical grid result |
| Gate results | 32 | **32** |
| Figures / tables | 14 / 24 | **14 / 24** |
| Runtime on a T4 | ~46 h over 5–6 sessions | **≈ 4.9 h**, one session |
| Multi-session resume | exact, protocol-hash guarded | checkpoint reuse + fresh-namespace guard |

Both answer the same RQ1 and RQ2 with the same splits, architectures, CORAL construction, CSD
formula, seeds, grids, selection rule, matched per-seed RQ2, statistics and external protocol. A
parity audit verifies **67/67** load-bearing science elements are present in the simple notebook.

The difference is engineering scaffolding, not science. The simple notebook is the recommended one
to run.

## The Enhanced follow-up

[`full_pipeline_notebook_enhanced.ipynb`](full_pipeline_notebook_enhanced.ipynb) — 77 cells / 3,421
code lines / 33 gates — is a **pre-registered follow-up** to the simple notebook, built from
`experiment-result/improvements.md`. It is not a replacement: the simple run's result stands, and if
the two disagree, **both are reported**.

It changes four things and nothing else. Sampling (`sqrt` class-balanced, train only), resolution
(224 → 384 with effective batch held at 16), the CORAL decision threshold (`t*` per condition, on
validation), and seed-matched external evaluation (five seeds per condition instead of one, with a
paired patient bootstrap and the previously-untested CSD vs M\* comparison). The RQs, the CSD
formula, the ladder, the splits, the seeds, the selection rule and all 29 gates are unchanged.

The first three are chosen in **Stage A** — before the teacher exists, with no distillation term —
and then frozen. That ordering is load-bearing: a teacher trained at one resolution distilling into
students at another would not crash, it would just be wrong.

See [`ENHANCED_NOTEBOOK.md`](ENHANCED_NOTEBOOK.md). Runtime ≈ 6.5 h if Stage A keeps 224, ≈ 12.5 h if
it adopts 384; `RESUME = True` carries an unfinished run across sessions.

## Documentation

| File | Covers |
|---|---|
| [`SIMPLE_NOTEBOOK.md`](SIMPLE_NOTEBOOK.md) | **the simple notebook**: configuration, resume, every artifact it saves, the rev-simple revision, gates, tables, verification |
| [`ENHANCED_NOTEBOOK.md`](ENHANCED_NOTEBOOK.md) | **the enhanced follow-up**: the four changes, the decision order and why it is that order, the results self-audit, new outputs, runtime, verification, limitations |
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
