# DR-VERGE

**View-Evidence Relational Grading Engine** — dual-view diabetic retinopathy grading
through Complementarity-Shift Distillation and INT8 deployment.

GEMASTIK XIX · Karya Tulis Ilmiah TIK · BINUS University

> **Research prototype. Not a medical device.** Every number in this repository is a
> research artifact produced under a fixed evaluation protocol. Nothing here is validated
> for clinical use, and no output may replace assessment by a qualified ophthalmologist.

---

## What this project is

Clinical DR screening uses **two-field fundus photography**: one photograph centred on the
**macula**, one on the **optic disc**. The two fields are anatomically complementary — each
shows lesions the other can miss — and models that read both outperform models that read
either alone.

But accurate two-field models are heavy, and lightweight models read one field. That leaves
an unexamined question:

> When a dual-view model is compressed, does the *specific advantage of combining two views*
> survive — or is it the first thing lost?

DR-VERGE attacks this with a distillation signal aimed directly at that advantage.

### The idea in one equation

A teacher predicts three times: from the macula view, from the disc view, and from both.
The **complementarity shift** is what changes when it stops looking at one view and starts
looking at two:

```
Δ = p_dual − (p_macula + p_disc) / 2
```

Δ is not the prediction. It is *what the second view bought* — the direction and magnitude
of the teacher's change of mind. **Complementarity-Shift Distillation (CSD)** trains a
328K-parameter student to reproduce that shift, not merely the final logits:

```
L_CSD = SmoothL1( Δ_student / s , Δ_teacher / s )       s = E_train[ |Δ_teacher| ]
```

The student is then quantized to INT8 for CPU deployment.

### Research questions

| | Question | Answer |
|---|---|---|
| **RQ1** | Does CSD improve a lightweight dual-view student over (a) no distillation and (b) standard logit-KD? | **Dissociated** — wins on mechanism, null on in-domain prediction |
| **RQ2** | How does PTQ INT8 affect ordinal performance, model size, and latency? | **98.3% QWK retained, 2.47× faster, 1.36× smaller** |

---

## Headline results

From the primary run — `experiments/results/simple-notebook/`, 50/50 cells, **0 errors,
32/32 integrity gates passed**.

### RQ1 — a genuine dissociation

CSD reproduces the teacher's decision-shift structure better than every baseline:

| Condition | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---:|---:|---:|
| No distillation | 0.4605 | +0.3180 | +0.1850 |
| Logit-KD | 0.4524 | +0.3468 | +0.2161 |
| Feature-KD | 0.4489 | +0.3721 | +0.2330 |
| **CSD (proposed)** | **0.4320** | **+0.4257** | **+0.2902** |

A clean monotone ordering — and **it replicated across two independent runs** with different
hyperparameter-selection regimes.

**It did not translate into predictive advantage in-domain.** All three pre-registered
comparisons are null, every interval crossing zero:

| Comparison | ΔQWK | 95% CI | p | Verdict |
|---|---:|---|---:|---|
| CSD vs no-distillation | +0.0171 | [−0.0276, +0.0648] | 0.112 | null |
| CSD vs logit-KD | −0.0250 | [−0.0781, +0.0254] | 0.085 | null |
| CSD vs feature-KD | −0.0189 | [−0.0639, +0.0263] | 0.093 | null |

**Both halves are the finding.** The mechanism transferred; the accuracy did not follow.
This repository reports them with equal weight, and so should any write-up drawn from it.

### RQ2 — compression that holds

| | Teacher | Deployed student | Ratio |
|---|---:|---:|---:|
| Parameters | 40,313,932 | 328,588 | **123×** |
| CPU latency | — | **6.22 ms** | 18.0× faster |
| Artifact size | — | — | 119× smaller |
| Test QWK | 0.6544 | — | 84.7% retained |

INT8 retention: **PTQ 98.3%**, FT-PTQ 97.5%, QAT 94.7%. Deployed variant: `ft_ptq_int8`,
selected on validation only by a pre-registered rule, then frozen.

**One result needs careful reading.** On the external confirmatory set, the two INT8 variants
that improve credibly are exactly the two involving fine-tuning; plain PTQ does not. The gain
therefore tracks **fine-tuning, not quantization**. This repository does not claim "INT8
improves generalization."

### Known limitations

Stated plainly, because they belong next to the headline: Macro-F1 is low (~0.34 internal);
severe-error rate ~0.26 — roughly one eye in four off by ≥2 grades; absolute QWK is modest
(students 0.51–0.55); RQ1 is null in-domain; the external Set-C advantage has overlapping
intervals and does not replicate on Set-A/B; fine-tuning and quantization cannot be fully
separated externally. Full list: [`experiments/results/simple-notebook/RESULTS_OVERVIEW.md`](experiments/results/simple-notebook/RESULTS_OVERVIEW.md) §6.

---

## Repository map

```
DR-Repo/
│
├── research/         What is being studied — the scientific argument
│   ├── documentation/    overview, roadmap, judge-facing notes, technical PDF
│   ├── decisions/        scope boundaries, decision log, results discussion
│   └── knowledge/        deployment notes
│
├── experiments/      How it is proven
│   ├── pipeline/         notebooks, src/, configs/, splits, verification scripts
│   └── results/          executed runs + figures + written result overviews
│       ├── simple-notebook/      PRIMARY EVIDENCE — 32/32 gates
│       ├── efficient-notebook/   robustness check
│       └── knowledge/            cross-run comparison and RQ answers
│
├── dataset/          The data (DRTiD · APTOS · DeepDRiD) — not tracked by git
├── frontend/         Public research demo (React · Vite · TypeScript · Tailwind)
├── references/       Academic grounding: literature, past-papers, large-references
├── project/          Workflow provenance: prompts, revisions
└── archive/          Superseded material, preserved not deleted
```

Each directory carries its own `README.md` explaining what is inside and why it is there.

**Reading order for a reviewer:**

1. [`research/documentation/overview.md`](research/documentation/overview.md) — the full research argument
2. [`experiments/results/simple-notebook/RESULTS_OVERVIEW.md`](experiments/results/simple-notebook/RESULTS_OVERVIEW.md) — what was actually found
3. [`experiments/pipeline/`](experiments/pipeline/) — how to reproduce it
4. [`frontend/`](frontend/) — the demo

---

## Data

| Dataset | Role | Size |
|---|---|---|
| **DRTiD** | Primary — training and internal test | 1,550 patient-eyes · 3,100 dual-view images · grades 0–4 |
| **APTOS 2019** | Backbone pre-training | 3,662 single-view images |
| **DeepDRiD** | External validation (Set-A / B / C) | Set-C: 100 patients · 200 eyes · 400 images |

Split: **800 train / 200 validation / 550 test** eyes, patient-wise, using the dataset's
official train/test division. The 550 test eyes were untouched until final evaluation.

DRTiD is the same dataset used by CrossFiT (2022), so the macula-only / disc-only / dual-view
figures here are **directly comparable to that benchmark** rather than merely cited.

> Datasets are **not committed** — they are large and carry their own licences. See
> [`dataset/README.md`](dataset/README.md) for the expected layout and where to obtain each one.

---

## Reproducing the experiments

The notebooks are written for **Google Colab** and resolve data through Google Drive:

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
```

They locate DRTiD by search (`_find_drtid`), so they do **not** depend on this repository's
directory layout.

| Notebook | Status | Runtime |
|---|---|---|
| `pipeline/full_pipeline_notebook_simple.ipynb` | **Executed — primary evidence** | ~6 h (L4) |
| `pipeline/full_pipeline_notebook_final_last_efficient.ipynb` | Executed — robustness check | ~4 h |
| `pipeline/full_pipeline_notebook_enhanced.ipynb` | **Pre-registered, not yet executed** | ~6.5 h @224 / ~12.5 h @384 |

```bash
pip install -r experiments/pipeline/requirements.txt
```

Full protocol: [`experiments/pipeline/FINAL_PROTOCOL.md`](experiments/pipeline/FINAL_PROTOCOL.md) ·
per-notebook notes: `SIMPLE_NOTEBOOK.md`, `ENHANCED_NOTEBOOK.md`.

### Integrity gates

The pipeline is self-verifying. **32 assertion gates** check data schema, split disjointness,
metric correctness (`fast_qwk` vs sklearn agrees to 1.11e-16), ordinal-head monotonicity, grid
completeness, seed completeness, quantization-scope equality, and statistical procedure. A run
that fails a gate stops rather than reporting a number.

Results are only trusted when the gate report is clean. The primary run reports **32/32**.

---

## Demo website

A frontend showcase lives in [`frontend/`](frontend/) — React · Vite · TypeScript · TailwindCSS ·
Recharts, in a strictly monochrome design system.

```bash
cd frontend
npm install
npm run dev
```

**The model is not deployed yet**, so the demo runs in mock mode. Mock output is *structurally*
real (monotone CORAL vector; grade = count of thresholds passed) but the numbers are meaningless,
and every result is flagged as simulated in six separate places. See [`frontend/README.md`](frontend/README.md).

---

## Method summary

```
STAGE 1 — TEACHER
  ResNet-50, shared weights across views
  Fusion: concatenation → FC
  Head: CORAL ordinal + 2 auxiliary single-view heads
  Outputs p_dual, p_macula, p_disc  →  gives Δ_teacher

STAGE 2 — STUDENT
  Lightweight depthwise-separable backbone, shared weights
  L = L_ordinal(CORAL) + α·L_logitKD + β·L_CSD

STAGE 3 — QUANTIZATION
  FP32 → INT8 (PTQ / QAT / fine-tuned PTQ), evaluated for degradation
```

**Grades are ordinal, and the code treats them that way.** The CORAL head emits monotone
cumulative probabilities `P(Y > k)`, and the predicted grade is the **count of thresholds
passed** — never an argmax. Grade 3 misread as Grade 0 is a far worse error than Grade 3
misread as Grade 2, and QWK is the primary metric for exactly that reason.

**Primary metric:** QWK. **Also reported:** ordinal MAE, severe-error rate P(|y−ŷ|≥2),
Macro-F1, per-grade sensitivity, dual-view gain G, model size, and CPU latency.

---

## Contribution claims

Deliberately bounded to what the experiments support:

1. **Algorithmic** — CSD, a distillation mechanism transferring the *probability-shift pattern*
   caused by combining two views, distinct from logit-KD (final output) and relational KD
   (feature structure).
2. **Empirical** — a controlled test of CSD against no-distillation, logit-KD and feature-KD
   under one protocol, reporting a dissociation rather than a win.
3. **Practical** — characterisation of how INT8 affects dual-view gain in a lightweight DR
   grader, with a working 6.22 ms CPU model.

**No claim of generality to other imaging domains** is made — that was never tested. Novelty is
phrased as *"in the literature reviewed, we did not identify prior work that…"*, never as
"the first ever".

---

## Conventions

- Directories: lowercase `kebab-case`.
- Executed runs are immutable — outputs are historical evidence and are never regenerated in place.
- Superseded material moves to `archive/`, never to deletion.
- `dataset/`, `archive/`, `project/prompts/`, `project/revisions/`, `references/past-papers/`,
  model weights (`*.pt`, `*.pth`, `*.ckpt`) and `__pycache__/` are git-ignored.

---

## Licence and use

Research code and documentation for an academic competition submission. Datasets remain under
their original licences and are not redistributed here.

DR-VERGE is a research prototype and is **not intended for standalone clinical diagnosis**.
</content>
