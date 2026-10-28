<div align="center">

<img src="frontend/public/Images/logo.png" alt="GEMASTIK XIX 2026" width="130" />

# DR-VERGE

### View-Evidence Relational Grading Engine

**Complementarity-Shift Distillation and INT8 Quantization for Diabetic Retinopathy Grading on Dual-View Fundus Images**

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

<br />

[![GEMASTIK XIX 2026](https://img.shields.io/badge/GEMASTIK_XIX-2026-0B4F9C?style=for-the-badge)](https://gemastik.kemdiktisaintek.go.id/landing/tentang)
[![Category](https://img.shields.io/badge/Scientific_Paper-ICT-F39C12?style=for-the-badge)](#)
[![SDG 3](https://img.shields.io/badge/SDG_3-Good_Health_%26_Well--being-4C9F38?style=for-the-badge)](https://sdgs.un.org/goals/goal3)
[![Demo](https://img.shields.io/badge/Demo-dr--verge.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dr-verge.vercel.app)

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.11-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![ONNX Runtime Web](https://img.shields.io/badge/ONNX_Runtime-Web-005CED?style=flat-square&logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![Google Colab](https://img.shields.io/badge/Google_Colab-A100-F9AB00?style=flat-square&logo=googlecolab&logoColor=white)](https://colab.research.google.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![Integrity gates](https://img.shields.io/badge/integrity_gates-36%2F36_passed-2EA44F?style=flat-square)](experiments/results/tables/table_gate_report.csv)
[![Results audit](https://img.shields.io/badge/results_audit-265%2F265_matched-2EA44F?style=flat-square)](experiments/results/tables/table_results_audit.csv)
[![Model size](https://img.shields.io/badge/model_INT8-0.95_MB-8A2BE2?style=flat-square)](experiments/results/tables/table_efficiency.csv)
[![CPU latency](https://img.shields.io/badge/CPU_latency-11.35_ms-8A2BE2?style=flat-square)](experiments/results/tables/table_efficiency.csv)
[![Status](https://img.shields.io/badge/status-research_prototype-lightgrey?style=flat-square)](#-limitations-and-disclaimer)
[![Not a medical device](https://img.shields.io/badge/not_a-medical_device-C0392B?style=flat-square)](#-limitations-and-disclaimer)

<br />

<a href="https://dr-verge.vercel.app"><img src="docs/screenshots/en/hero-light-dark.webp" alt="DR-VERGE web prototype in light and dark mode" width="100%" /></a>

<sub>The DR-VERGE web prototype — <b>light mode</b> (left) and <b>dark mode</b> (right). The model runs directly in the browser. <a href="#-dr-verge-web-prototype">See more ↓</a></sub>

</div>

> [!IMPORTANT]
> **Research prototype, not a medical device.** Every number in this repository is a research artifact produced under an evaluation protocol that was locked in advance. No output is validated for clinical use, and no result may replace an examination by a qualified ophthalmologist.

---

## 📑 Table of Contents

- [Summary](#-summary)
- [Background](#-background)
- [Core Idea: Complementarity-Shift Distillation](#-core-idea-complementarity-shift-distillation)
- [Research Questions](#-research-questions)
- [Architecture and Research Workflow](#-architecture-and-research-workflow)
- [Data and Experimental Protocol](#-data-and-experimental-protocol)
- [Main Results](#-main-results)
- [Limitations and Disclaimer](#-limitations-and-disclaimer)
- [Contributions](#-contributions)
- [Repository Structure](#-repository-structure)
- [Reproducing the Experiments](#-reproducing-the-experiments)
- [DR-VERGE Web Prototype](#-dr-verge-web-prototype)
- [Team](#-team)
- [Citation](#-citation)

---

## ✨ Summary

DR-VERGE is a five-grade diabetic retinopathy (DR) grading framework built on **two fundus images of the same eye** — one centred on the **macula**, one centred on the **optic disc**. It combines **CORAL** ordinal modelling, lightweight knowledge distillation, a new distillation method called **Complementarity-Shift Distillation (CSD)**, and **INT8 quantization** so the model runs fast on a CPU.

<div align="center">

| 🎯 Teacher QWK | 🪶 CSD student QWK | 📦 INT8 model size | ⚡ CPU latency | 🗜️ Smaller than teacher | 🚀 Faster than teacher |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **0.7364** | **0.6018** | **0.9507 MB** | **11.35 ms** | **162.1×** | **55.3×** |

</div>

- **The dual-view premise holds** — a student that reads both views (QWK 0.6042) outperforms students that read only the macula (0.5175) or only the optic disc (0.5502).
- **RQ1 — an honest dissociation.** CSD is the most aligned with the teacher's prediction shift on all three metrics (ShiftL1 0.3509 · CosAgree 0.4361 · BenefitCorr 0.3075), but its QWK differences against NoDistill, Logit-KD and Feature-KD are **not statistically significant**.
- **RQ2 — compression that holds.** QAT INT8 retains **98.96%** of the FP32 student's QWK with an artifact **under 1 MB** and **11.35 ms** latency on a single CPU thread.
- **External generalisation.** On DeepDRiD Set-C, the FP32 student retains **84.4%** of the teacher's QWK.
- **Auditable.** The pipeline verifies itself: **36/36 integrity gates passed** and **265/265 headline values** matched when recomputed from per-sample predictions.

---

## 🩺 Background

<img align="right" src="frontend/public/Images/SDG3.png" alt="SDG 3" width="110" />

Around **589 million** adults were living with diabetes in 2024, a number projected to reach **853 million** by 2050. The prevalence of DR among people with diabetes is **22.27%**, and the number of affected adults is expected to rise from **103.12 million** (2020) to **160.50 million** (2045). In Indonesia, eye-care professionals and facilities remain concentrated in large cities, while the archipelagic geography and the **3T regions** (underdeveloped, frontier and outermost areas) make screening hard to reach.

A single fundus image (single-field) has limited retinal coverage and can miss lesions outside the photographed area. The **two-field** approach — macula-centred and optic-disc-centred images of the same eye — widens that coverage, but accurate dual-view models tend to be heavy. DR-VERGE addresses a question that has received little attention:

> **When a dual-view model is compressed, does the specific advantage of combining two views survive — or is it the first thing to be lost?**

This research supports **SDG 3** (good health and well-being), aligns with the **fourth Asta Cita of Indonesia's RPJMN 2025–2029**, and answers the GEMASTIK XIX 2026 theme of ICT innovation that is _"Impactful, Inclusive, and Sustainable towards a Smart Society"_.

<div align="center">
<img src="research/paper-figures/dataset/figures/fig_twofield_pair_drtid_annotated.png" alt="DRTiD two-field fundus pair" width="820" />
<br />
<sub><b>Figure 1.</b> The same eye from DRTiD: (a) macula-centred and (b) optic-disc-centred image. The two fields overlap only partially, so each captures retinal area the other does not.</sub>
</div>

---

## 💡 Core Idea: Complementarity-Shift Distillation

The teacher model produces three ordinal predictions: from the macula view, from the optic-disc view, and from both together (joint dual-view). With CORAL, each prediction is a vector of four cumulative probabilities:

$$
\mathbf{p} = \big[\,P(y>0),\; P(y>1),\; P(y>2),\; P(y>3)\,\big]
$$

The **prediction shift** is the signed change when the model moves from the average of the two individual-view predictions to the joint dual-view prediction:

$$
\bar{\mathbf{p}} = \frac{\mathbf{p}_{\text{mac}} + \mathbf{p}_{\text{disc}}}{2}, \qquad \Delta = \mathbf{p}_{\text{dual}} - \bar{\mathbf{p}}
$$

Δ is **not** the prediction — Δ is _what the second view buys_: the direction and magnitude of the teacher's change of decision. CSD trains the student to reproduce that change, not merely to imitate the final output:

$$
\mathcal{L}_{\text{CSD}} = \frac{1}{N}\sum_{i=1}^{N} \text{SmoothL1}\!\left(\frac{\Delta_i^{S}}{s},\, \frac{\Delta_i^{T}}{s}\right), \qquad s = \mathbb{E}_{\text{train}}\big[\,|\Delta^{T}|\,\big] = 0.1073
$$

The global scale _s_ is computed **once** from the frozen teacher over the whole training set to keep the loss scale stable. The student's total loss:

$$
\mathcal{L} = \mathcal{L}_{\text{CORAL}} + \lambda\,\mathcal{L}_{\text{aux}} + \alpha\,\mathcal{L}_{\text{logitKD}} + \beta\,\mathcal{L}_{\text{CSD}}, \qquad \lambda = 0.5,\;\; \alpha = 0.5,\;\; \tau = 2,\;\; \beta = 0.1
$$

> [!NOTE]
> Δ is treated as an **operational prediction-shift proxy** — a measure of the model's prediction behaviour — and does **not** directly measure anatomical or biological complementarity of the retina.

---

## ❓ Research Questions

| | Question | Short answer |
|:---:|---|---|
| **RQ1** | To what extent can CSD transfer the prediction shift from the teacher to a lightweight student, compared with NoDistill, Logit-KD and Feature-KD? | **Dissociation** — CSD is descriptively best on all three shift-fidelity metrics, but not significantly better in QWK |
| **RQ2** | To what extent do PTQ and QAT INT8 affect QWK retention, artifact size and CPU inference latency of the selected lightweight model? | **QAT retains 98.96% of QWK**, 0.9507 MB artifact, 11.35 ms — 162.1× smaller and 55.3× faster than the teacher |

---

## 🏗️ Architecture and Research Workflow

<div align="center">
<img src="frontend/public/research/figures/fig_01_architecture.png" alt="DR-VERGE architecture" width="860" />
<br />
<sub><b>Figure 2.</b> DR-VERGE architecture: a dual-view ResNet-50 teacher, a lightweight student with InteractionFusion, CSD, and PTQ/QAT INT8 deployment optimisation.</sub>
</div>

<br />

| Component | Teacher | Student |
|---|---|---|
| Backbone | ResNet-50 (weights shared across views) | Custom depthwise-separable CNN (shared weights) |
| Pre-training | APTOS 2019 | APTOS 2019 |
| Fusion | InteractionFusion over $[\,z_m,\; z_d,\; \lvert z_m - z_d\rvert,\; z_m \odot z_d\,]$ | Same |
| Heads | 3 CORAL heads (macula · disc · dual) | Same |
| Parameters | 40,313,932 | **328,588** |

**DR grades are ordinal, and the code treats them that way.** CORAL produces monotone cumulative probabilities, and the final grade is the **number of thresholds passed** — never an argmax. Misreading grade 3 as grade 0 is far more harmful than misreading it as grade 2, which is why **Quadratic Weighted Kappa (QWK)** is the primary metric.

The research workflow has six stages. **Every decision is made on validation data only**; the internal test set and the external data are opened only after everything has been locked.

```mermaid
flowchart LR
    A["1 · Data preparation<br/>DRTiD 800 / 200 / 550<br/>APTOS integrity check"] --> B["2 · Stage A<br/>select input recipe<br/>384 px · standard"]
    B --> C["3 · APTOS pre-training<br/>+ ResNet-50 teacher<br/>dual-view"]
    C --> D["4 · Student + distillation<br/>NoDistill · Logit-KD<br/>Feature-KD · CSD (RQ1)"]
    D --> E["5 · INT8 quantization<br/>PTQ · QAT · FT-PTQ<br/>select deployment (RQ2)"]
    E --> F["6 · Evaluation & verification<br/>DRTiD internal test<br/>DeepDRiD Set-C · ONNX export"]

    classDef sel fill:#E3F2FD,stroke:#1565C0,color:#0D47A1;
    classDef ev fill:#FFF3E0,stroke:#EF6C00,color:#E65100;
    class A,B,C,D,E sel;
    class F ev;
```

---

## 🗂️ Data and Experimental Protocol

| Dataset | Role | Size |
|---|---|---|
| **DRTiD** | Primary — training, validation and internal test | 1,550 examined-eye records · 3,100 dual-view images · grades 0–4 |
| **APTOS 2019** | Backbone pre-training | 3,662 single-view images (2,930 train · 366 validation) |
| **DeepDRiD** | External confirmatory evaluation | Set-C: 100 patients · 200 eyes · 400 images |

| DRTiD partition | Eyes | Grade 0 | Grade 1 | Grade 2 | Grade 3 | Grade 4 |
|---|---:|---:|---:|---:|---:|---:|
| Train | 800 | 386 | 72 | 208 | 104 | 30 |
| Validation | 200 | 96 | 18 | 52 | 26 | 8 |
| Internal test | 550 | 265 | 50 | 146 | 69 | 20 |

**Protocol locked before execution:**

- **Data split** — DRTiD's official partition is used as provided; the 1,000 training records are split, stratified by grade, into 800/200 (seed 42). DRTiD has **no patient identifier**, so the internal sampling unit is the examined-eye record.
- **Stage A** — four recipes (224/384 × standard/balanced sampling) compared without distillation over three seeds. Selected **384 × 384, standard sampling** (validation QWK 0.6491 vs 0.5549).
- **Augmentation** — rotation ±15° (p = 0.7) with the same geometric transform on both fields; brightness/contrast ±0.15 (p = 0.5) applied independently per field.
- **Seeds** — tuning {42, 123, 2026}; main comparison over five core seeds {42, 123, 2026, 3407, 8888}.
- **Decision threshold** — one global threshold per condition from the range 0.35–0.65 (step 0.05), chosen on validation.
- **Method selection** — mean validation QWK over five seeds; differences < 0.005 are treated as ties, broken by Macro-F1 → severe error rate → MAE → complexity.
- **Statistics** — 10,000 hierarchical paired cluster bootstrap replicates + 10,000 paired permutation iterations, with Holm correction within each hypothesis family. **A difference whose 95% confidence interval includes zero is not claimed.**
- **Quantization** — eager static quantization (x86 engine) on the backbone; InteractionFusion and the CORAL heads stay FP32 (mixed precision). Deterministic PTQ calibration on the 800 training records; QAT learning rate 3 × 10⁻⁵.
- **Deployment criterion** — validation QWK retention ≥ 95% and no credible worsening of severe error; among eligible candidates the lowest median latency wins. The 95% threshold is an engineering criterion, **not** a clinical non-inferiority margin.
- **Latency** — batch size 1, one CPU thread, 50 warm-up inferences, five blocks × 500 inferences, median.

The final experiment ran on Google Colab with an **NVIDIA A100-SXM4-80GB**, an Intel Xeon @ 2.20 GHz host CPU, and **PyTorch 2.11.0+cu128**.

---

## 📊 Main Results

Every number comes from a single final run (`enhanced_v1_20260811`), stored in full under [`experiments/results/`](experiments/results/). Each figure ships with a `*_data.csv` file containing the exact numbers behind it.

### 1. The dual-view premise holds

```mermaid
xychart-beta
    title "DRTiD internal test QWK (mean of 5 seeds; teacher 1 seed)"
    x-axis ["Macula", "Disc", "NoDistill", "Logit-KD", "Feature-KD", "CSD", "Teacher"]
    y-axis "QWK" 0.4 --> 0.8
    bar [0.5175, 0.5502, 0.6042, 0.5942, 0.6161, 0.6018, 0.7364]
```

On validation, the teacher's joint dual-view prediction beats its best single-view auxiliary head by **+0.0469 QWK**, and the teacher shows a measurable prediction shift — the signal CSD targets.

<div align="center">
<img src="experiments/results/figures/fig_06_dual_view_gain.png" alt="Dual-view gain" width="760" />
</div>

### 2. RQ1 — Predictive performance (550 DRTiD internal test eyes)

| Model / Condition | QWK ↑ | Macro-F1 ↑ | MAE ↓ | SER ↓ |
|---|---:|---:|---:|---:|
| ResNet-50 teacher (dual-view, 1 seed) | 0.7364 | 0.3887 | 0.5909 | 0.1764 |
| Student, macula only | 0.5175 ± 0.0193 | 0.3330 ± 0.0239 | 0.8524 ± 0.0240 | 0.2742 ± 0.0084 |
| Student, optic disc only | 0.5502 ± 0.0067 | 0.3422 ± 0.0139 | 0.8047 ± 0.0108 | 0.2549 ± 0.0122 |
| Dual-view, no distillation | 0.6042 ± 0.0166 | 0.3355 ± 0.0119 | 0.8105 ± 0.0316 | 0.2505 ± 0.0127 |
| Logit-KD | 0.5942 ± 0.0290 | **0.3589 ± 0.0278** | 0.7775 ± 0.0646 | 0.2487 ± 0.0187 |
| Logit-KD + Feature-KD | **0.6161 ± 0.0101** | 0.3435 ± 0.0113 | **0.7702 ± 0.0278** | **0.2396 ± 0.0107** |
| **Logit-KD + CSD (DR-VERGE)** | 0.6018 ± 0.0149 | 0.3362 ± 0.0152 | 0.7902 ± 0.0250 | 0.2582 ± 0.0081 |

<sub>Students: mean ± standard deviation over five core seeds. SER = severe error rate, P(|y − ŷ| ≥ 2). Bold = best among students.</sub>

Compared with the teacher, CSD retains **81.7%** of QWK with **122.7× fewer parameters**. Paired comparisons against the three baselines:

| Comparison | ΔQWK | 95% CI | p (permutation) | p (Holm) | Verdict |
|---|---:|---|---:|---:|---|
| CSD vs no distillation | −0.0024 | [−0.0336; +0.0285] | 0.8003 | 0.8003 | not significant |
| CSD vs Logit-KD | +0.0077 | [−0.0304; +0.0463] | 0.3640 | 0.7279 | not significant |
| CSD vs Feature-KD | −0.0143 | [−0.0445; +0.0153] | 0.1650 | 0.4950 | not significant |

<div align="center">
<img src="experiments/results/figures/fig_12_forest.png" alt="Forest plot of paired comparisons" width="760" />
</div>

### 3. RQ1 — Mechanism-transfer fidelity

CSD achieves the **lowest ShiftL1 and the highest CosAgree and BenefitCorr** — a consistent monotone pattern — and the main formulation also outperforms all three ablation variants.

| Condition / Formulation | QWK | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---:|---:|---:|---:|
| Dual-view, no distillation | 0.6042 | 0.3759 | 0.3509 | 0.2193 |
| Logit-KD | 0.5942 | 0.3840 | 0.2858 | 0.1795 |
| Logit-KD + Feature-KD | 0.6161 | 0.3718 | 0.3815 | 0.1943 |
| **Logit-KD + CSD (DR-VERGE)** | 0.6018 | **0.3509** | **0.4361** | **0.3075** |
| Ablation: no scaling (raw-Huber, 3 seeds) | 0.6178 | 0.3746 | 0.4017 | 0.2036 |
| Ablation: KL-softmax, negative control (3 seeds) | 0.6099 | 0.3885 | 0.3274 | 0.1082 |
| Ablation: same-head counterfactual (3 seeds) | 0.6128 | 0.3576 | 0.4327 | 0.2544 |

<div align="center">
<img src="experiments/results/figures/fig_07_csd_mechanism.png" alt="CSD mechanism" width="860" />
</div>

> [!TIP]
> **Both halves are the finding.** The mechanism transferred, but accuracy did not improve significantly with it. Fidelity to the prediction shift and predictive performance **did not move together**, so they must be evaluated as two distinct aspects.

### 4. RQ2 — Efficiency and quantization

| Model | Parameters | Size (MB) | CPU latency (ms) | QWK retention | ΔQWK vs FP32 [95% CI] |
|---|---:|---:|---:|---:|---|
| ResNet-50 teacher | 40,313,932 | 154.089 | 627.610 | — | — |
| Student FP32 (M\*, CSD) | 328,588 | 1.2935 | 32.490 | 100.00% | — |
| Student PTQ INT8 | 328,588 | **0.9507** | **11.238** | 97.27% | −0.0164 [−0.0360; +0.0023] |
| **Student QAT INT8 (deployment)** | 328,588 | **0.9507** | 11.347 | **98.96%** | **−0.0063** [−0.0293; +0.0175] |

QAT INT8 was the only candidate to clear the 95% validation-retention criterion (99.04% vs PTQ 93.37%), so it was selected and frozen as the deployment artifact **before** the test data was opened. Both variants' confidence intervals include zero; however, the Holm-corrected permutation test shows a PTQ vs FP32 difference (p = 0.0243), while QAT shows none (Holm p = 0.4854). When the two procedures disagree, **both are reported and neither is claimed**.

<table>
<tr>
<td width="50%"><img src="experiments/results/figures/fig_11_pareto.png" alt="QWK vs latency Pareto" /></td>
<td width="50%"><img src="experiments/results/figures/fig_10_efficiency.png" alt="Efficiency" /></td>
</tr>
<tr>
<td align="center"><sub>QWK vs CPU latency trade-off</sub></td>
<td align="center"><sub>Artifact size and latency</sub></td>
</tr>
</table>

### 5. External generalisation — DeepDRiD Set-C

Models are **frozen** — no fine-tuning, no threshold tuning. Bootstrap intervals are clustered by **patient**.

| Model | Set-C QWK |
|---|---:|
| ResNet-50 teacher (1 seed) | 0.7923 [0.7152; 0.8550] |
| Student PTQ INT8 | **0.6729 ± 0.0365** |
| Student FP32 (M\*) | 0.6688 ± 0.0415 |
| Fine-tuned FP32 (control) | 0.6567 ± 0.0364 |
| Student FT-PTQ INT8 | 0.6513 ± 0.0315 |
| Student QAT INT8 (deployment) | 0.6344 ± 0.0326 |

The FP32 student retains **84.4%** of the teacher's QWK in the external domain. On Set-C the ranking flips: QAT scores lower than PTQ (ΔQWK −0.0384, 95% CI [−0.0826; −0.0006]). The variant that is optimal on internal validation is **not necessarily** the best in an external domain — the pre-registered choice was kept, because changing it after seeing external data would destroy the meaning of a confirmatory set.

<div align="center">
<img src="experiments/results/figures/fig_14_internal_vs_external.png" alt="Internal vs external" width="760" />
</div>

<details>
<summary><b>🖼️ Full gallery of all 14 result figures</b></summary>

<br />

| | |
|:---:|:---:|
| <img src="experiments/results/figures/fig_01_dataset.png" width="400" /><br/><sub>01 · Dataset</sub> | <img src="experiments/results/figures/fig_02_performance.png" width="400" /><br/><sub>02 · Performance</sub> |
| <img src="experiments/results/figures/fig_03_ordinal_safety.png" width="400" /><br/><sub>03 · Ordinal safety</sub> | <img src="experiments/results/figures/fig_04_per_grade_recall.png" width="400" /><br/><sub>04 · Per-grade recall</sub> |
| <img src="experiments/results/figures/fig_05_confusion.png" width="400" /><br/><sub>05 · Confusion matrices</sub> | <img src="experiments/results/figures/fig_06_dual_view_gain.png" width="400" /><br/><sub>06 · Dual-view gain</sub> |
| <img src="experiments/results/figures/fig_07_csd_mechanism.png" width="400" /><br/><sub>07 · CSD mechanism</sub> | <img src="experiments/results/figures/fig_08_csd_gradient.png" width="400" /><br/><sub>08 · CSD gradient</sub> |
| <img src="experiments/results/figures/fig_09_retention.png" width="400" /><br/><sub>09 · Quantization retention</sub> | <img src="experiments/results/figures/fig_10_efficiency.png" width="400" /><br/><sub>10 · Efficiency</sub> |
| <img src="experiments/results/figures/fig_11_pareto.png" width="400" /><br/><sub>11 · Pareto</sub> | <img src="experiments/results/figures/fig_12_forest.png" width="400" /><br/><sub>12 · Forest plot</sub> |
| <img src="experiments/results/figures/fig_13_external_setc.png" width="400" /><br/><sub>13 · External Set-C</sub> | <img src="experiments/results/figures/fig_14_internal_vs_external.png" width="400" /><br/><sub>14 · Internal vs external</sub> |

</details>

---

## ⚠️ Limitations and Disclaimer

- **RQ1 is null on prediction** — CSD's advantage is in mechanism fidelity only, not QWK.
- **Absolute QWK is moderate** (students 0.5942–0.6161) and Macro-F1 is low (0.3362 for CSD).
- **Severe error rate 0.2582** — roughly one eye in four is off by ≥ 2 grades.
- **Grade-1 recall is very low**, so the model is not fit for standalone diagnostic use.
- **No patient identifier in DRTiD** — internal splitting and bootstrap are eye-level, not patient-level.
- **Evaluation is computational only** — no prospective validation, no testing across fundus cameras, no testing on target CPU devices, and no clinical trial yet.
- **No claim of generality** to other imaging domains.

DR-VERGE is a research prototype and is **not intended for standalone clinical diagnosis**.

---

## 🧩 Contributions

1. **Algorithmic** — formulates CSD, which uses the signed joint-vs-individual cumulative ordinal prediction shift as its distillation target; distinct from Logit-KD (final output) and from feature/relational distillation.
2. **Measurement** — three shift-fidelity metrics (ShiftL1, CosAgree, BenefitCorr) plus a counterfactual control, so mechanism transfer is tested directly and separately from accuracy.
3. **Empirical** — a controlled test of CSD against NoDistill, Logit-KD and Feature-KD under one pre-registered protocol, reported as it came out: a dissociation.
4. **Practical** — a characterisation of how INT8 affects a lightweight dual-view DR grader, yielding a 0.95 MB / 11.35 ms model that runs in the browser.

---

## 📁 Repository Structure

```text
DR-VERGE/
├── README.md                 main documentation (Bahasa Indonesia)
├── README.en.md              main documentation (English)
│
├── experiments/              experiments — code and evidence
│   ├── notebooks/            full_pipeline_notebook_enhanced.ipynb  ← the final notebook
│   ├── results/              final-run outputs: tables, figures, per-sample predictions, configs
│   ├── src/                  modular components: models, losses, datasets, pre-training
│   ├── configs/              one YAML per training condition
│   ├── scripts/              make_splits.py + verification/
│   └── requirements.txt
│
├── research/                 scientific argument, mathematical derivation, deployment notes, paper figures
├── references/               literature and bibliography
├── dataset/                  dataset layout and sources (data is not committed)
├── frontend/                 web prototype (React · Vite · TypeScript · ONNX Runtime Web)
└── docs/screenshots/         web prototype screenshots (id/ · en/)
```

Each directory carries a `README.md` (Indonesian) and a `README.en.md` (English) — or a single `README.md` for directories that are already stable — explaining what it contains and why.

**Suggested reading order:**

1. This document — the full picture of the research.
2. [`experiments/README.en.md`](experiments/README.en.md) — how the experiments are organised and run.
3. [`experiments/results/README.en.md`](experiments/results/README.en.md) — a map of every output of the final run.
4. [`research/math.md`](research/math.md) — the full mathematical derivation.
5. [`frontend/`](frontend/) — the web prototype that runs the model in the browser.

---

## 🔁 Reproducing the Experiments

The entire experiment lives in **one self-contained notebook**: [`experiments/notebooks/full_pipeline_notebook_enhanced.ipynb`](experiments/notebooks/full_pipeline_notebook_enhanced.ipynb). It is designed for **Google Colab** and reads data from Google Drive.

**1. Place the datasets on Google Drive**

```text
MyDrive/DR-VERGE/
└── dataset/
    ├── DRTiD/                ← "Original Images/" + "Ground Truths/DR_grade/"
    ├── APTOS/
    └── DeepDRiD-master/      ← regular_fundus_images/
```

DRTiD and DeepDRiD are located automatically, so the notebook **does not depend** on this repository's layout. See [`dataset/README.en.md`](dataset/README.en.md) for each dataset's source and details.

**2. Set the configuration in the _Configuration_ cell**

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
RUN_TAG    = "enhanced_v1_YYYYMMDD"   # use a fresh tag for every new run
QUICK      = False                    # True = short rehearsal (1 seed, few epochs)
RESUME     = True                     # continue an interrupted run under the same RUN_TAG
USE_AMP    = False
```

**3. Run all cells**

Rehearse first with `QUICK = True` on a throwaway `RUN_TAG`. A full run takes **about 12.5 hours on an A100**. If Colab disconnects, reopen with the same `RUN_TAG` and Run All again — finished work is never retrained.

A successful run writes `artifacts_<RUN_TAG>/FINAL_RUN_COMPLETE.txt` **only if every blocking gate passed**. For a local environment:

```bash
pip install -r experiments/requirements.txt
```

The exact package versions of the final run are recorded in [`experiments/results/configs/requirements_exact.txt`](experiments/results/configs/requirements_exact.txt).

### Pipeline integrity

The pipeline verifies itself through **36 integrity gates** — data schema, partition disjointness, metric correctness, ordinal-head monotonicity, grid and seed completeness, equal quantization scope across PTQ/QAT/FT-PTQ, ONNX export fidelity, and statistical procedure. A run that fails a blocking gate stops instead of reporting a number. The final gate recomputes every headline value from the per-sample prediction files: **265/265 matched**.

---

## 🌐 DR-VERGE Web Prototype

<div align="center">

[![Open Prototype](https://img.shields.io/badge/Open_Prototype-dr--verge.vercel.app-1565C0?style=for-the-badge&logo=googlechrome&logoColor=white)](https://dr-verge.vercel.app)
[![Frontend Code](https://img.shields.io/badge/Code-frontend%2F-24292F?style=for-the-badge&logo=github&logoColor=white)](frontend/)

</div>

The DR-VERGE web prototype bridges the research and its audience: anyone can **try the model directly**, understand the idea behind CSD without reading the paper, and then inspect the experimental evidence. The site has three pages — **Home**, **Model Demo** and **Research** — in two languages, two display modes and two colour palettes.

> [!NOTE]
> **The model really runs in your browser.** The ONNX model is downloaded once and executed on the device through `onnxruntime-web` (WebAssembly) — no server, no API, and **images are never uploaded anywhere**. Preprocessing constants are read from the exported `metadata.json`, and the grade is computed as the number of CORAL thresholds passed — exactly as in the notebook.

### 🌗 Light and dark mode

<table>
<tr>
<td width="50%"><img src="docs/screenshots/en/hero-light.webp" alt="Home — light mode" /></td>
<td width="50%"><img src="docs/screenshots/en/hero-dark.webp" alt="Home — dark mode" /></td>
</tr>
<tr>
<td align="center"><sub><b>Light mode</b> — Home with the <i>Colorful</i> palette</sub></td>
<td align="center"><sub><b>Dark mode</b> — Home with the <i>Colorful</i> palette</sub></td>
</tr>
</table>

Switching modes plays a circular-reveal animation that grows from the toggle button (View Transitions API), with a smooth colour cross-fade as a fallback on browsers that do not support it yet. The visitor's choice is remembered for the next visit.

### 🎨 Two colour palettes: Colorful and Monochrome

<table>
<tr>
<td width="50%"><img src="docs/screenshots/en/hero-mono-light.webp" alt="Monochrome palette — light" /></td>
<td width="50%"><img src="docs/screenshots/en/hero-mono-dark.webp" alt="Monochrome palette — dark" /></td>
</tr>
<tr>
<td align="center"><sub><b>Monochrome</b> palette — light mode</sub></td>
<td align="center"><sub><b>Monochrome</b> palette — dark mode</sub></td>
</tr>
</table>

The **Colorful** palette uses a blue gradient as its primary colour, with red and yellow accents for severity; the **Monochrome** palette presents a calm black-and-white design. Both palettes work in light and dark mode, with text-to-background contrast kept high so everything stays easy to read.

### 🔬 Model Demo — three steps

```mermaid
flowchart LR
    A["1 · Choose an eye<br/>12 DeepDRiD samples<br/>or upload your own"] --> B["2 · Run the analysis<br/>the ONNX model runs<br/>on your device"]
    B --> C["3 · Read the result<br/>ordinal grade · threshold scores<br/>· reference comparison"]

    classDef step fill:#E3F2FD,stroke:#1565C0,color:#0D47A1;
    class A,B,C step;
```

<table>
<tr>
<td width="50%"><img src="docs/screenshots/en/demo-upload-light.webp" alt="Step 1 — choosing a dual-view pair" /></td>
<td width="50%"><img src="docs/screenshots/en/demo-result-light.webp" alt="Step 3 — analysis result" /></td>
</tr>
<tr>
<td align="center"><sub><b>Step 1</b> — pick one of 12 samples or upload a macula + optic-disc pair</sub></td>
<td align="center"><sub><b>Step 3</b> — the predicted grade on the ordinal severity scale</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/en/demo-detail-light.webp" alt="Result details — threshold scores and reference" /></td>
<td width="50%"><img src="docs/screenshots/en/demo-result-dark.webp" alt="Analysis result — dark mode" /></td>
</tr>
<tr>
<td align="center"><sub>Result details — four threshold scores <i>P(y &gt; k)</i>, relative per-grade scores, and the comparison with the reference grade</sub></td>
<td align="center"><sub>The same result in dark mode</sub></td>
</tr>
</table>

In the example above, sample **p24-R** is predicted as **Grade 3 (Severe NPDR)**, matching its reference grade — 3 of the 4 ordinal thresholds are passed at a 0.5 threshold. The result can be printed or saved as a summary.

### 🏠 Home — the research story from problem to impact

<table>
<tr>
<td width="50%"><img src="docs/screenshots/en/home-problem-light.webp" alt="The problem" /></td>
<td width="50%"><img src="docs/screenshots/en/home-two-views-dark.webp" alt="Why two views" /></td>
</tr>
<tr>
<td align="center"><sub><b>The problem</b> — limited coverage, heavy models, ordinal severity</sub></td>
<td align="center"><sub><b>Why two views</b> — the macula and optic disc complement each other</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/en/home-csd-light.webp" alt="The CSD method" /></td>
<td width="50%"><img src="docs/screenshots/en/home-pipeline-dark.webp" alt="Research stages" /></td>
</tr>
<tr>
<td align="center"><sub><b>Method</b> — how the CSD signal is formed, step by step</sub></td>
<td align="center"><sub><b>Research stages</b> — 10 stages in a locked order</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/en/home-findings-light.webp" alt="Research findings" /></td>
<td width="50%"><img src="docs/screenshots/en/home-rq1-dark.webp" alt="RQ1" /></td>
</tr>
<tr>
<td align="center"><sub><b>Findings</b> — headline numbers from the final run</sub></td>
<td align="center"><sub><b>RQ1</b> — three shift-fidelity metrics, CSD best on all three</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/en/home-rq2-light.webp" alt="RQ2" /></td>
<td width="50%"><img src="docs/screenshots/en/home-sdg-light.webp" alt="SDG 3" /></td>
</tr>
<tr>
<td align="center"><sub><b>RQ2</b> — teacher vs student model size and CPU latency</sub></td>
<td align="center"><sub><b>SDG 3</b> — a contribution to good health and well-being</sub></td>
</tr>
</table>

### 📚 Research page — the paper in interactive form

<table>
<tr>
<td width="33%"><img src="docs/screenshots/en/research-top-dark.webp" alt="Research page" /></td>
<td width="33%"><img src="docs/screenshots/en/research-method-dark.webp" alt="Method" /></td>
<td width="33%"><img src="docs/screenshots/en/research-rq1-light.webp" alt="RQ1 results" /></td>
</tr>
<tr>
<td align="center"><sub>Run summary: 36/36 gates, 265 audited values</sub></td>
<td align="center"><sub>Dual-view architecture diagram</sub></td>
<td align="center"><sub>RQ1 results — the mechanism worked, the predictive edge is unproven</sub></td>
</tr>
</table>

This page presents the abstract, research questions, research gap, method, RQ1 and RQ2 results, external validation, a figure gallery, limitations and the SDG 3 impact — every number comes from the same final run as this README.

### 📱 Responsive on mobile

<table>
<tr>
<td align="center"><img src="docs/screenshots/en/mobile-light.webp" alt="Mobile view — light" width="260" /></td>
<td align="center"><img src="docs/screenshots/en/mobile-dark.webp" alt="Mobile view — dark" width="260" /></td>
</tr>
<tr>
<td align="center"><sub>Mobile — light mode</sub></td>
<td align="center"><sub>Mobile — dark mode</sub></td>
</tr>
</table>

### ✨ Key features

| Feature | Description |
|---|---|
| 🧠 **On-device inference** | The CSD student model (FP32, seed 3407; `model.onnx` ≈190 KB + ≈1.3 MB of weights) is executed by ONNX Runtime Web. No image is sent to a server. |
| 🖼️ **12 ready-to-use sample pairs** | 12 eyes (24 images) from DeepDRiD, CC BY-SA 4.0. Folder names do not leak the grade, so results can be judged honestly. |
| 📤 **Upload your own images** | A macula + optic-disc image pair (JPG/PNG, up to 12 MB per image). |
| 📊 **Transparent ordinal results** | The predicted grade, its position on the severity scale, the four threshold scores _P(y > k)_, relative per-grade scores, and the comparison with the reference grade for samples. |
| 🌐 **Two languages** | Bahasa Indonesia and English; common technical terms stay in English and are italicised in the Indonesian version. |
| 🌗 **Light / dark** | A circular-reveal animation when switching modes; the choice is remembered. |
| 🎨 **Colorful / Monochrome** | A blue gradient with red-yellow accents, or a black-and-white design. |
| ♿ **Accessibility mode** | Larger text and stronger contrast — friendly for older users. |
| 📱 **Responsive** | The layout adapts from phones to desktops. |
| ⚖️ **Honest about its limits** | A "research prototype" label on every result, and a note that the demo runs the FP32 variant (seed 3407) while the paper's deployment artifact is the QAT INT8 variant (seed 42) of the same method. |

**Fidelity to the notebook.** Running the bundled ONNX model over all 200 DeepDRiD Set-C eyes gives **QWK 0.7307**, against **0.7298** in the notebook for the same seed. The 0.0009 difference comes from image resampling, confirming that the in-browser pipeline is faithful to the research.

### 🧰 Technology

| Layer | Technology |
|---|---|
| UI framework | React 18 · TypeScript 5.8 · Vite 6 · React Router 7 |
| Styling | Tailwind CSS 3.4 · Radix UI · Framer Motion · Lucide Icons |
| Charts | Recharts |
| Inference | ONNX Runtime Web (WebAssembly) |
| Hosting | Vercel |

### ▶️ Running locally

```bash
cd frontend
npm install
npm run dev            # development server at http://localhost:5173
npm run build          # production build
npm run verify:model   # checks the ONNX model files and runs one forward pass
```

Frontend architecture, `.env` configuration and deployment guide: [`frontend/README.md`](frontend/README.md). All screenshots are in [`docs/screenshots/`](docs/screenshots/).

---

## 👥 Team

<div align="center">

| <img src="frontend/public/Images/Stanley.jpg" width="110" /> | <img src="frontend/public/Images/Seline.jpeg" width="110" /> | <img src="frontend/public/Images/Hamra.jpeg" width="110" /> | <img src="frontend/public/Images/Nikita.jpg" width="110" /> |
|:---:|:---:|:---:|:---:|
| **Stanley Nathanael Wijaya** | **Seline Loewel** | **Ahmad Hamra** | **Nikita Ananda Putri Masaling** |
| Team Leader · AI & Model Development | Research Paper Writing | Research & Video Documentation | Research Advisor |
| Computer Science | Business Engineering | Computer Science | School of Computer Science |
| [GitHub](https://github.com/StyNW7) · [LinkedIn](https://www.linkedin.com/in/stanley-nathanael-wijaya/) | [GitHub](https://github.com/selineloewel8-prog) · [LinkedIn](https://www.linkedin.com/in/seline-loewel/) | [GitHub](https://github.com/Ahamra1120) · [LinkedIn](https://www.linkedin.com/in/ahmad-hamra/) | [LinkedIn](https://www.linkedin.com/in/nikita-masaling/) |

**Bina Nusantara University (BINUS University)** · GEMASTIK XIX 2026 · ICT Scientific Paper

</div>

---

## 📝 Citation

If this repository is useful for your research, please cite:

```bibtex
@article{wijaya2026drverge,
  title   = {DR-VERGE: Complementarity-Shift Distillation dan Kuantisasi untuk
             Grading Retinopati Diabetik pada Fundus Dual-View},
  author  = {Wijaya, Stanley Nathanael and Loewel, Seline and Hamra, Ahmad and
             Masaling, Nikita Ananda Putri},
  journal = {Buletin Pagelaran Mahasiswa Nasional Bidang Teknologi Informasi dan Komunikasi},
  volume  = {1},
  year    = {2026},
  note    = {GEMASTIK XIX 2026, Karya Tulis Ilmiah TIK}
}
```

---

## 📄 License and Data Use

This code and documentation were prepared for research and an academic competition. Datasets are **not redistributed** through this repository; each dataset remains under its owner's licence and must be obtained directly from its provider (see [`dataset/README.en.md`](dataset/README.en.md)).

<div align="center">
<sub>Made with ❤️ by the DR-VERGE Team · BINUS University · 2026</sub>
</div>
