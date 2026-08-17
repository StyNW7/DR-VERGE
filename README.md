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
L_CSD = SmoothL1( Δ_student / s , Δ_teacher / s )       s = E_train[ |Δ_teacher| ] = 0.1073
```

The student is then quantized to INT8 and runs in the browser on CPU.

### Research questions

| | Question | Answer |
|---|---|---|
| **RQ1** | Does CSD transfer the dual-view complementarity shift to a lightweight student, against no-distillation, logit-KD and feature-KD? | **Dissociated** — wins 3/3 on mechanism, null on in-domain prediction |
| **RQ2** | How do PTQ and QAT INT8 affect ordinal performance, artifact size, and CPU latency? | **98.96% QWK retained, 55.3× faster, 162.1× smaller than the teacher** |

---

## Headline results

All numbers below come from the **enhanced run** — `experiments/results/enhanced-notebook/`,
run ID `artifacts_enhanced_v1_20260811`, **36/36 integrity gates passed, 0 errors**, with 265
headline values independently recomputed from per-sample predictions and **0 mismatches**.

> Numbers from the `simple-notebook/` and `efficient-notebook/` runs use different
> resolutions, seed counts, and statistical protocols. **They are not comparable and must
> never be mixed into one table.**

### The premise holds first

Before any distillation claim, dual-view has to be worth something:

| Student trained on | Test QWK |
|---|---:|
| Macula view only | 0.5175 |
| Optic-disc view only | 0.5502 |
| **Both views, no distillation** | **0.6042** |

The teacher's own dual-view gain over independently trained single-view models is **+0.1782
QWK**. The premise is established at both model scales.

### RQ1 — a genuine dissociation

CSD reproduces the teacher's decision-shift structure better than every baseline, on all
three mechanism metrics at once:

| Condition | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---:|---:|---:|
| No distillation | 0.3759 | +0.3509 | +0.2193 |
| Logit-KD | 0.3840 | +0.2858 | +0.1795 |
| Feature-KD | 0.3718 | +0.3815 | +0.1943 |
| **CSD (proposed)** | **0.3509** | **+0.4361** | **+0.3075** |

A clean monotone ordering — and **it replicated across all three independent runs** under
different selection regimes. Note that logit-KD scores *worse than no distillation at all* on
two of the three metrics: aligning final outputs can actively blur the cross-field interaction
that CSD sharpens.

CSD was also the method **selected on validation** by the pre-registered rule (val QWK 0.6490,
ahead of feature-KD 0.6477, logit-KD 0.6308, no-distillation 0.6228), so the deployed model is
the proposed method.

**The mechanism advantage did not translate into predictive advantage in-domain.** All three
pre-registered comparisons are null, every interval crossing zero:

| Comparison | ΔQWK | 95% CI | p (Holm) | Verdict |
|---|---:|---|---:|---|
| CSD vs no-distillation | −0.0024 | [−0.0336, +0.0285] | 0.800 | null |
| CSD vs logit-KD | +0.0077 | [−0.0304, +0.0463] | 0.728 | null |
| CSD vs feature-KD | −0.0143 | [−0.0445, +0.0153] | 0.495 | null |

**Both halves are the finding.** The mechanism transferred; the accuracy did not follow. Since
between-method differences (0.0024–0.0143) are narrower than between-seed spread (0.0101–0.0290),
the ranking in any single table is not evidence on its own. This repository reports both halves
with equal weight, and so should any write-up drawn from it.

### RQ2 — compression that holds

| | Teacher | Student FP32 (M\*) | Deployed QAT INT8 |
|---|---:|---:|---:|
| Parameters | 40,313,932 | 328,588 | 328,588 |
| Artifact size | 154.089 MB | 1.2935 MB | **0.9507 MB** |
| CPU latency (1 thread) | 627.61 ms | 32.49 ms | **11.35 ms** |
| Test QWK | 0.7364 | 0.6018 | 0.5956 |

Against the teacher, the deployed artifact is **162.1× smaller and 55.3× faster**, retaining
**81.7%** of the teacher's grading ability at **122.7× fewer parameters**.

INT8 retention against the FP32 student: **QAT 98.96%** (CI includes zero — no credible
degradation), **PTQ 97.27%**. Deployed variant: `qat_int8`, the only candidate to clear the
pre-registered 95% validation-retention gate (99.04% vs PTQ 93.37% and FT-PTQ 93.64%), then
frozen.

**One result needs careful reading.** On the external confirmatory set the ranking flips: PTQ
INT8 scores highest among student variants (0.6729) while the deployed QAT variant scores 0.6344,
a credible gap of −0.0384 [−0.0826, −0.0006]. **The calibration that best preserves in-domain
performance is not automatically the one that best preserves out-of-domain performance.** The
pre-registered choice was kept anyway, because changing it after seeing external data would
destroy the meaning of a confirmatory set. Both artifacts ship.

### External generalisation

Set-C of DeepDRiD — 100 patients, 200 eyes, 400 images, opened once, patient-clustered
intervals:

| Model | Set-C QWK |
|---|---:|
| Teacher | 0.7923 [0.7152, 0.8550] |
| **Student CSD FP32 (M\*)** | **0.6688 ± 0.0415** |

The student retains **84.4%** of the teacher across a genuine domain shift — and scores *higher*
externally (0.6688) than internally (0.6018), which argues the learned representation is not
tied to one dataset's acquisition characteristics.

### Known limitations

Stated plainly, because they belong next to the headline: Macro-F1 is modest (0.3362 internal);
severe-error rate is 0.2582 — roughly one eye in four off by ≥2 grades; absolute QWK is moderate
(students 0.5942–0.6161); **RQ1 is null in-domain**; grade-1 recall is 0.068, which alone
disqualifies standalone clinical use. Notably the teacher's grade-1 recall is **0.0000** — every
student beats it there, so capacity and minority-class sensitivity do not move together.
Full account: [`experiments/results/enhanced-notebook/RESULTS_OVERVIEW.md`](experiments/results/enhanced-notebook/RESULTS_OVERVIEW.md).

---

## Repository map

```
DR-Repo/
│
├── research/         What is being studied — the scientific argument
│   ├── documentation/    the research design and rationale
│   ├── knowledge/        deployment notes + dataset laterality findings
│   └── paper-figures/    dataset figures prepared for the manuscript
│
├── experiments/      How it is proven
│   ├── pipeline/         notebooks, src/, configs/, splits, verification scripts
│   └── results/          executed runs + figures + written result overviews
│       ├── enhanced-notebook/   FINAL RUN — 36/36 gates, source of every paper number
│       ├── simple-notebook/     supporting run, earlier protocol
│       ├── efficient-notebook/  supporting run, compute-frugal variant
│       ├── final-results-documentation/   cross-run comparison
│       └── knowledge/           analyses written during the research
│
├── dataset/          The data (DRTiD · APTOS · DeepDRiD) — not tracked by git
├── frontend/         Public research demo (React · Vite · TypeScript · Tailwind)
└── references/       Academic grounding: literature, past papers, bibliography
```

Each directory carries its own `README.md` explaining what is inside and why it is there.

Internal working material — prompts, chat transcripts, paper drafts, planning notes, and
superseded trials — lives in a git-ignored `_private/` directory and is deliberately not
published.

**Reading order for a reviewer:**

1. [`research/documentation/overview.md`](research/documentation/overview.md) — the research argument
2. [`experiments/results/enhanced-notebook/RESULTS_OVERVIEW.md`](experiments/results/enhanced-notebook/RESULTS_OVERVIEW.md) — what was actually found
3. [`experiments/results/final-results-documentation/final-comparison.md`](experiments/results/final-results-documentation/final-comparison.md) — why this run is the one
4. [`experiments/pipeline/`](experiments/pipeline/) — how to reproduce it
5. [`frontend/`](frontend/) — the live demo

---

## Data

| Dataset | Role | Size |
|---|---|---|
| **DRTiD** | Primary — training and internal test | 1,550 examined eyes · 3,100 dual-view images · grades 0–4 |
| **APTOS 2019** | Backbone pre-training | 3,662 single-view images |
| **DeepDRiD** | External confirmatory validation | Set-C: 100 patients · 200 eyes · 400 images |

Split: **800 train / 200 validation / 550 test** eyes, eye-disjoint, using the dataset's
official train/test division. The 550 test eyes were untouched until final evaluation.

> **A dataset property that shaped the statistics.** DRTiD provides eye-level identifiers and an
> L/R laterality flag but **no patient identifier** — verified across all 1,550 records, and
> consecutive IDs pair as opposite eyes only 50.2% of the time, i.e. chance. Internal splits are
> therefore eye-disjoint and the internal bootstrap clusters on eyes. DeepDRiD *does* carry
> `patient_id`, so external intervals cluster on patients. Details and worked examples:
> [`research/knowledge/drtid-laterality-examples/`](research/knowledge/drtid-laterality-examples/).

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
| `pipeline/notebooks/full_pipeline_notebook_enhanced.ipynb` | **Executed — final run, all paper numbers** | ~12.5 h (A100) |
| `pipeline/notebooks/full_pipeline_notebook_simple.ipynb` | Executed — supporting run | ~6 h (L4) |
| `pipeline/notebooks/full_pipeline_notebook_final_last_efficient.ipynb` | Executed — supporting run | ~4 h |

```bash
pip install -r experiments/pipeline/requirements.txt
```

Exact package versions used by the final run are recorded in
`experiments/results/enhanced-notebook/outputs/configs/requirements_exact.txt`.

Full protocol: [`experiments/pipeline/notebooks-result-explanation/FINAL_PROTOCOL.md`](experiments/pipeline/notebooks-result-explanation/FINAL_PROTOCOL.md) ·
per-notebook notes in the same directory.

### Integrity gates

The pipeline is self-verifying. **36 assertion gates** check data schema, split disjointness,
metric correctness, ordinal-head monotonicity (violation rate 0.00), grid completeness, seed
completeness, quantization-scope equality across PTQ/QAT/FT-PTQ, ONNX export fidelity
(max |diff| 7.15 × 10⁻⁷ against a 1 × 10⁻⁴ tolerance), and statistical procedure. A run that
fails a blocking gate stops rather than reporting a number.

The final gate recomputes every headline value from the raw per-sample prediction files. The
final run reports **36/36 gates and 265/265 values matched**.

---

## Demo website

A frontend showcase lives in [`frontend/`](frontend/) — React · Vite · TypeScript · TailwindCSS ·
Recharts, in a strictly monochrome design system.

```bash
cd frontend
npm install
npm run dev
```

**The model runs for real, entirely in the browser.** The exported student is bundled as ONNX
and executed client-side with `onnxruntime-web` — no server, no API key, no image ever leaves
the visitor's machine. Preprocessing constants come from the exported `metadata.json` rather than
being hardcoded, and the grade is computed as the **count of CORAL thresholds passed**, exactly
as in the notebook.

Verification: running the shipped ONNX model over all 200 Set-C eyes reproduced **QWK 0.7307**
against the notebook's **0.7298** for the same seed — a 0.0009 difference attributable to image
resampling, confirming the browser pipeline is faithful to the research. See
[`frontend/README.md`](frontend/README.md).

---

## Method summary

```
STAGE A — RECIPE SELECTION (before the teacher exists)
  224/384 × standard/balanced sampling, chosen on validation only
  → 384 / standard selected (val QWK 0.6491 vs 0.5549), then frozen

STAGE 1 — TEACHER
  ResNet-50, shared weights across views
  Fusion: InteractionFusion over [z_m, z_d, |z_m − z_d|, z_m ⊙ z_d]
  Head: CORAL ordinal + 2 auxiliary single-view heads
  Outputs p_dual, p_macula, p_disc  →  gives Δ_teacher

STAGE 2 — STUDENT
  Lightweight depthwise-separable backbone, shared weights
  L = L_ordinal(CORAL) + α·L_logitKD + β·L_CSD        α = 0.5, β = 0.1

STAGE 3 — QUANTIZATION
  FP32 → INT8 (PTQ / QAT / fine-tuned PTQ), matched operator scope
  Backbone to INT8; fusion and CORAL head stay FP32 to protect monotonicity
```

**Grades are ordinal, and the code treats them that way.** The CORAL head emits monotone
cumulative probabilities `P(Y > k)`, and the predicted grade is the **count of thresholds
passed** — never an argmax. Grade 3 misread as Grade 0 is a far worse error than Grade 3
misread as Grade 2, and QWK is the primary metric for exactly that reason.

**Primary metric:** QWK. **Also reported:** ordinal MAE, severe-error rate P(|y−ŷ|≥2),
Macro-F1, per-grade recall, dual-view gain G, mechanism fidelity (ShiftL1 / CosAgree /
BenefitCorr), artifact size, and CPU latency.

---

## Contribution claims

Deliberately bounded to what the experiments support:

1. **Measurement** — three metrics that test whether the dual-view interaction actually
   transfers (ShiftL1, CosAgree, BenefitCorr), plus a counterfactual control that receives the
   same teacher guidance without the shift target. This lets transfer be tested directly rather
   than inferred from accuracy.
2. **Algorithmic** — CSD, a distillation mechanism transferring the *probability-shift pattern*
   caused by combining two views, distinct from logit-KD (final output) and relational KD
   (feature structure). Ablations show the effect is specific to the formulation, not a
   by-product of adding a loss term.
3. **Empirical** — a controlled test of CSD against no-distillation, logit-KD and feature-KD
   under one pre-registered protocol, reporting a dissociation rather than a win.
4. **Practical** — characterisation of how INT8 affects a lightweight dual-view DR grader, with
   a working 0.95 MB / 11.35 ms CPU model that runs in a browser.

**No claim of generality to other imaging domains** is made — that was never tested. Novelty is
phrased as *"in the literature reviewed, we did not identify prior work that…"*, never as
"the first ever".

---

## Conventions

- Directories: lowercase `kebab-case`.
- Executed runs are immutable — outputs are historical evidence and are never regenerated in place.
- Superseded material moves to `_private/archive/`, never to deletion.
- `dataset/`, `_private/`, model weights (`*.pt`, `*.pth`, `*.ckpt`) and `__pycache__/` are
  git-ignored. `_private/` holds prompts, drafts, and working notes that are kept locally but
  never published.

---

## Licence and use

Research code and documentation for an academic competition submission. Datasets remain under
their original licences and are not redistributed here.

DR-VERGE is a research prototype and is **not intended for standalone clinical diagnosis**.
