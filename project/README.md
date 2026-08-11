# project/

Workflow provenance — how the work was actually produced. **Not research results**, and not
evidence for any claim. Kept because provenance is frequently what a reviewer asks about, and
because reconstructing it later is impossible.

```
project/
├── prompts/     specifications written for AI-assisted development
└── revisions/   draft and revision history
```

Both are git-ignored (`prompts/`, `revisions/` in `.gitignore`). They live in the working tree
for the team, not in the published history.

---

## prompts/

| File | Specified |
|---|---|
| `dr-verge-fe.md` | Full specification for the demo website — sections, copy rules, safety constraints, acceptance criteria |
| `restructure.md` | Repository restructuring guideline |

`dr-verge-fe.md` is worth keeping visible: it is where the **research-safety rules** for the
website are written down and made testable. Rules such as *model outputs are "Ordinal Threshold
Scores", never "clinical confidence"*, *RQ1's null result gets equal visual weight to its
positive one*, and *INT8 reduces cost and is never described as improving accuracy* originate
here and are enforced by `frontend/scripts/audit-acceptance.py`.

---

## revisions/

| File | Stage |
|---|---|
| `dr-verge-rev.md` | Early revision pass |
| `rev-simple.md` · `rev-fix.md` | Simple-notebook revisions |
| `rev-final.md` · `rev-final-2.md` | Final revision passes |
| `last-revision.md` | Most recent |
| `upgrade-simple-notebook.md` | Specification behind the enhanced notebook |

`upgrade-simple-notebook.md`, together with
[`../experiments/results/improvements.md`](../experiments/results/improvements.md), is the
**pre-registration** for `full_pipeline_notebook_enhanced.ipynb`. It matters that these were
written *before* that notebook was built: it makes the enhanced run a pre-registered follow-up
rather than a post-hoc search for a better number.

---

## Related

- Frontend implementing `dr-verge-fe.md` → [`../frontend/`](../frontend/)
- Notebook implementing `upgrade-simple-notebook.md` → [`../experiments/pipeline/ENHANCED_NOTEBOOK.md`](../experiments/pipeline/ENHANCED_NOTEBOOK.md)
</content>
