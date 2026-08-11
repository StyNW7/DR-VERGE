# Verification scripts

Run against a notebook path (they default to `full_pipeline_notebook_enhanced.ipynb`):

```bash
python nameorder_check.py  ../../full_pipeline_notebook_enhanced.ipynb
python unbound_check.py    ../../full_pipeline_notebook_enhanced.ipynb
python verify_enhanced.py  ../../full_pipeline_notebook_enhanced.ipynb
python dryrun_enhanced.py
```

| Script | What it proves | What it cannot prove |
|---|---|---|
| `nameorder_check.py` | Every referenced global is bound somewhere, nothing is used before its defining cell, nothing is used after `del` | That the values are right |
| `unbound_check.py` | No use-before-assignment inside any function body (AST-level) | Anything about module-level flow |
| `verify_enhanced.py` | The **execution order** the method requires, threshold wiring at every prediction site, seed-matched external evaluation, sampler discipline, gradient-accumulation flushes | That the training works |
| `dryrun_enhanced.py` | The **decision rules** against synthetic data with known answers: Stage A selection, `grade_from`, threshold calibration, `thr_for` inheritance, the paired seed bootstrap, the audit's own sensitivity, `sqrt` weighting, the batch plan | Anything about real data |

`verify_enhanced.py` is the one worth understanding. The compile and name checks prove the notebook
*runs*; they would all have passed while Stage A sat after the teacher, silently mismatching the
teacher's resolution against the students'. Ordering assertions are the only thing that catches a
bug whose entire symptom is wrong numbers.

`dryrun_enhanced.py` runs standalone — it transcribes the notebook's decision rules rather than
importing them, so it needs no data, no GPU, and no artifacts. The transcription is the cost: if a
rule changes in the notebook, it must be changed here too, or this file starts testing history.
