# research/

The scientific argument: what DR-VERGE studies, why it is worth studying, and the technical
findings that shaped how it was evaluated. **No experimental results live here** — evidence is
in [`../experiments/`](../experiments/).

```
research/
├── documentation/   the research argument
├── knowledge/       supporting technical notes and dataset findings
└── paper-figures/   dataset figures prepared for the manuscript
```

---

## documentation/

| File | What it holds |
|---|---|
| `overview.md` | **Start here.** The complete research design — background, gap table, RQ1/RQ2, CSD derivation, dataset rationale, experimental matrix, metrics, contributions |

`overview.md` states the research gap in its defensible form — not *"first to combine A+B+C"*,
but a specific claim about which distillation mechanism has not been tried:

> Prior work established the diagnostic benefit of macula- and disc-centred pairs and built
> fusion mechanisms; other work applied dual-view KD in different medical domains. In the
> literature reviewed, no method explicitly distils the **class-probability change** that occurs
> when single-view predictions are aggregated into a dual-view prediction — the signal
> representing *what the model gains from combining two views* — into a lightweight dual-view
> student, compared under control against both no-distillation and standard logit KD.

> **One caveat when reading `overview.md`:** it is the *plan*, written before execution. Two
> things changed in the final implementation. The CSD loss became a scale-normalised SmoothL1
> on the shift rather than a KL divergence over a 5-dimensional softmax — and the ablation in
> the final run confirms this mattered, since the KL-softmax variant scores *worst* of all on
> mechanism fidelity. RQ1's outcome was also a **dissociation, not the improvement the plan
> anticipated**. Where plan and results differ, the results in
> [`../experiments/results/enhanced-notebook/`](../experiments/results/enhanced-notebook/) are
> authoritative.

---

## knowledge/

Technical notes that bridge the research and its deployment, plus dataset properties discovered
during the work.

| Item | What it holds |
|---|---|
| `deployment-guide.md` | How the exported model connects to the web demo: which artifact, where it lives, how it runs in the browser |
| `model-files-for-deployment.md` | Which exported artifacts actually matter for serving predictions, and what each contains |
| `drtid-laterality-examples/` | Four sample images demonstrating that DRTiD distinguishes left and right eyes but provides **no patient identifier** |

The laterality finding has direct methodological consequences and is worth knowing before
reading any statistics:

- DRTiD gives eye-level IDs and an `LR` flag, verified consistent with image geometry on
  **1,550 of 1,550** records — but every ID belongs to exactly one eye, and consecutive IDs pair
  as opposite eyes only **50.2%** of the time, which is chance. Patient grouping is therefore
  not recoverable.
- Internal splits are consequently **eye-disjoint** and the internal bootstrap clusters on eyes.
- DeepDRiD *does* carry `patient_id`, so the external confirmatory analysis clusters on
  **patients** — the stricter standard. The two datasets cover each other's gap, and that is a
  design argument worth stating in the paper.

---

## paper-figures/

| Folder | What it holds |
|---|---|
| `dataset/` | Original DRTiD and DeepDRiD fundus images plus five ready-to-place composites — the two-field pair, severity strips for both datasets, and a cross-dataset comparison |

These are the *dataset* figures. Figures produced by the experiments themselves — performance,
CSD mechanism, forest plot, efficiency Pareto, external validation — live with the run that
generated them, at
[`../experiments/results/enhanced-notebook/outputs/results/figures/`](../experiments/results/enhanced-notebook/outputs/results/figures/),
each shipped with its caption and the exact CSV behind the plot.

---

## Related

- Results and figures → [`../experiments/results/`](../experiments/results/)
- Literature grounding → [`../references/`](../references/)
- Live demo → [`../frontend/`](../frontend/)
