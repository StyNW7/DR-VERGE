# research/

The scientific argument: what DR-VERGE studies, why it is worth studying, and the decisions
that shaped it. **No results live here** — evidence is in [`../experiments/`](../experiments/).

```
research/
├── documentation/   the research argument
├── decisions/       scope, boundaries, decision log
└── knowledge/       supporting technical notes
```

---

## documentation/

| File | What it holds |
|---|---|
| `overview.md` | **Start here.** The complete research design — background, gap table, RQ1/RQ2, CSD derivation, dataset rationale, experimental matrix, metrics, contributions |
| `roadmap.md` | Ten-day execution plan with buffer |
| `judge.md` | Framing for competition reviewers |
| `[USED THIS] Technical Documentation.pdf` | Submitted technical documentation |

`overview.md` is the single most important document in the repository. It states the research
gap in its defensible form — not *"first to combine A+B+C"*, but a specific claim about which
distillation mechanism has not been tried:

> Prior work established the diagnostic benefit of macula- and disc-centred pairs and built
> fusion mechanisms; other work applied dual-view KD in different medical domains. In the
> literature reviewed, no method explicitly distils the **class-probability change** that occurs
> when single-view predictions are aggregated into a dual-view prediction — the signal
> representing *what the model gains from combining two views* — into a lightweight dual-view
> student, compared under control against both no-distillation and standard logit KD.

> **One caveat when reading `overview.md`:** it is the *plan*, written before execution. Two
> things changed in the final implementation. The CSD loss became a scale-normalised SmoothL1
> on the shift rather than a KL divergence over a 5-dimensional softmax, and RQ1's outcome was a
> **dissociation, not the improvement the plan anticipated**. Where plan and results differ, the
> results in [`../experiments/results/`](../experiments/results/) are authoritative.

---

## decisions/

The record of what was deliberately included, excluded, and why. Valuable precisely because it
documents the *rejected* options — reviewers ask about those.

| File | What it holds |
|---|---|
| `boundaries.md` | Scope limits — what this study does not attempt |
| `decision-notes.md` | Running log of design decisions and their reasoning |
| `result.md` | Interpretation of findings |
| `resources.md` | Compute budget and constraints |

Two decisions worth knowing before reading anything else:

- **QAT was excluded from the core research questions** and positioned as future work. Two
  questions answered thoroughly beat three answered halfway.
- **DeepDRiD became external validation, not training data.** Its public CSV does not label
  which field (`_l1`/`_l2`) is macula- vs disc-centred, and its "evaluation" subset has no
  ground truth. It is used only for held-out generalisation testing.

---

## knowledge/

| File | What it holds |
|---|---|
| `model-files-for-deployment.md` | Which exported artifacts matter for deployment and what each contains |

---

## Related

- Results and figures → [`../experiments/results/`](../experiments/results/)
- Literature grounding → [`../references/`](../references/)
- Draft revisions → [`../project/revisions/`](../project/revisions/)
</content>
