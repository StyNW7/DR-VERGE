# scripts/

| Item | Purpose |
|---|---|
| `make_splits.py` | Builds the committed DRTiD train / validation / test split deterministically |
| [`verification/`](verification/) | Static checks run on a notebook *before* committing to a multi-hour run |

The verification scripts exist because of a real near-miss: an earlier draft ordered the
pipeline so that a teacher trained at one resolution would have distilled into students at
another. Nothing would have crashed — every number would simply have been wrong. Compile,
name-order and unbound-variable checks all passed while the bug was present; only an explicit
ordering assertion caught it.
