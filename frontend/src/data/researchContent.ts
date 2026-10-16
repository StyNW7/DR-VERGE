/**
 * Long-form research copy.
 *
 * The abstract is marked `isPlaceholder` because the final paper abstract does
 * not exist yet. The site renders that flag visibly — an "awaiting final paper
 * text" marker — rather than passing draft prose off as the published abstract.
 * Set the flag to false once the real abstract is pasted in.
 */

export const paperMeta = {
  title: "DR-VERGE",
  subtitle:
    "Dual-View Diabetic Retinopathy Grading through Complementarity-Shift Distillation and Lightweight INT8 Deployment",
  eyebrow: "Research Paper",
  competition: "GEMASTIK XIX",
  field: "Karya Tulis Ilmiah TIK",
  task: "Diabetic Retinopathy Grading",
  views: ["Macula-Centered", "Optic-Disc-Centered"],
  classes: "5 Ordinal Grades",
  datasets: ["DRTiD", "APTOS 2019", "DeepDRiD"],
} as const;

export const abstract = {
  // Still a draft: the paper itself is not final. The flag keeps the "Draft"
  // marker on screen until the published abstract replaces this text.
  isPlaceholder: true,
  note: "English rendering of the draft paper's abstract (Intisari). The wording may still change before the paper is final.",
  paragraphs: [
    "Diabetic retinopathy (DR) is a complication of diabetes that can lead to vision impairment, which makes early screening and severity grading important. Single-field approaches cover a limited area of the retina, while dual-view modelling of macula-centred and optic-disc-centred images can enrich the predictive signal — at a higher computational cost.",
    "This study develops and evaluates DR-VERGE (View-Evidence Relational Grading Engine), a five-grade dual-view DR grading framework that combines CORAL ordinal modelling, lightweight knowledge distillation, Complementarity-Shift Distillation (CSD) and INT8 quantization. CSD trains the student to imitate how the teacher's ordinal output changes when the prediction moves from the average of the individual views to the joint dual-view prediction.",
    "The main experiments use DRTiD at 384 × 384 with standard sampling; DeepDRiD Set-C is reserved for external evaluation. The ResNet-50 teacher reaches QWK 0.7364 and the 328,588-parameter CSD student reaches 0.6018. Descriptively, CSD aligns best with the teacher's prediction shift (ShiftL1 0.3509, CosAgree 0.4361, BenefitCorr 0.3075), yet its QWK differences against no distillation, logit KD and feature KD are not statistically significant.",
    "For deployment, QAT INT8 retains 98.96% of the FP32 student's QWK on the internal test set with a 0.9507 MB artifact and 11.347 ms CPU latency — about 162.1× smaller and 55.3× faster than the teacher. On Set-C the FP32 student retains 84.4% of the teacher's QWK, and among student variants PTQ gives the highest estimate. Better shift alignment is therefore not always accompanied by higher QWK. The efficiency results support further development of DR-VERGE for resource-constrained CPU settings, including health facilities in Indonesia's 3T regions, after on-device testing and prospective validation.",
  ],
} as const;

export const researchQuestions = [
  {
    id: "RQ1",
    label: "RQ1",
    topic: "Knowledge Transfer",
    question:
      "To what extent can Complementarity-Shift Distillation transfer the teacher's dual-view ordinal decision-shift structure to a lightweight student compared with no distillation, logit KD, and feature KD?",
    judgedOn: [
      "Quadratic Weighted Kappa as the primary grading metric",
      "Shift fidelity: ShiftL1, cosine agreement, benefit correlation",
    ],
  },
  {
    id: "RQ2",
    label: "RQ2",
    topic: "Efficiency",
    question:
      "To what extent can INT8 post-training quantization and quantization-aware training improve computational efficiency while preserving the grading performance of the selected lightweight dual-view model?",
    judgedOn: [
      "Model size and single-thread CPU inference latency",
      "Retention of ordinal grading performance relative to FP32",
    ],
  },
] as const;

export const researchGap = {
  existing: [
    {
      title: "Single-view retinal grading",
      body: "Most automated DR grading operates on one fundus field per eye.",
    },
    {
      title: "Multi-view fusion",
      body: "Prior work fuses multiple retinal fields to improve prediction.",
    },
    {
      title: "Knowledge distillation",
      body: "Established methods transfer final logits or intermediate feature representations.",
    },
    {
      title: "Medical model compression",
      body: "Quantization and pruning are widely applied to medical image classifiers.",
    },
  ],
  question:
    "Can the change in ordinal decision produced by combining two anatomical views itself be distilled?",
  // Careful novelty wording. Never "the first ever".
  novelty:
    "Based on the literature reviewed in this study, we did not identify prior work explicitly distilling this dual-view cumulative ordinal decision-shift signal into a lightweight student.",
} as const;

export const csdExplanation = {
  intro:
    "Traditional knowledge distillation primarily transfers final predictions or feature representations. DR-VERGE investigates whether the change in ordinal decision produced by combining two views can itself be transferred from a teacher model to a lightweight student.",
  // Never claim the method "understands" anatomy.
  claim:
    "CSD explicitly transfers the teacher's dual-view ordinal decision-shift pattern.",
  deltaMeaning:
    "Delta operationally represents the cumulative ordinal decision shift between the interactive dual-view prediction and an aggregated single-view baseline.",
  steps: [
    {
      label: "Individual-view evidence",
      body: "The model predicts from the macula view and the optic-disc view separately.",
    },
    {
      label: "Dual-view evidence",
      body: "The model predicts from both views fused together.",
    },
    {
      label: "Decision shift",
      body: "The difference between the two is the complementarity shift.",
    },
    {
      label: "Teacher to student transfer",
      body: "CSD trains the student to reproduce the teacher's shift.",
    },
  ],
  formulas: [
    {
      lhs: "p_agg",
      superscript: "T",
      rhs: "( p_macula + p_disc ) / 2",
      note: "Aggregated single-view baseline",
    },
    {
      lhs: "Δ",
      superscript: "T",
      rhs: "p_dual − p_agg",
      note: "Teacher's complementarity shift",
    },
    {
      lhs: "Δ",
      superscript: "S",
      rhs: "p_dual − p_agg",
      note: "Student's complementarity shift",
    },
    {
      lhs: "L_CSD",
      superscript: "",
      rhs: "SmoothL1( Δ_S / s , Δ_T / s )",
      note: "The distillation objective, with a fixed global scale s",
    },
  ],
} as const;

export const methodStages = [
  { title: "Macula + Optic Disc", body: "Two complementary fundus fields per eye." },
  { title: "Shared Encoder", body: "One backbone processes both views." },
  {
    title: "Interaction Fusion",
    body: "Concatenation, absolute difference, and element-wise product, then a normalised MLP.",
  },
  {
    title: "CORAL Ordinal Head",
    body: "Four monotone cumulative thresholds; the grade is the count of thresholds passed.",
  },
  {
    title: "Knowledge Transfer",
    body: "Logit KD, feature KD, and Complementarity-Shift Distillation.",
  },
  { title: "Lightweight Student", body: "A roughly 328K-parameter dual-view network." },
  { title: "PTQ / QAT", body: "INT8 quantization under a matched operator scope." },
  { title: "Deployment", body: "A CPU-ready INT8 artifact." },
] as const;

export const sdgContent = {
  number: "03",
  title: "Good Health and Well-Being",
  un: "Ensure healthy lives and promote well-being for all at all ages.",
  intro:
    "Diabetic retinopathy is a leading cause of preventable vision loss, and early detection is the intervention that matters most. DR-VERGE is positioned as research toward making that detection more accessible.",
  // "Potential contribution", never "proven impact".
  points: [
    {
      title: "Early screening research",
      body: "Ordinal grading research aimed at the stages where intervention is most effective.",
    },
    {
      title: "Accessibility of AI-assisted analysis",
      body: "A ~328K-parameter model that grades an eye on a CPU in about eleven milliseconds does not require specialised hardware.",
    },
    {
      title: "Resource-constrained environments",
      body: "Lower computational requirements are a precondition for research deployment where GPUs are unavailable.",
    },
    {
      title: "Reducing technological barriers",
      body: "Efficiency research lowers the infrastructure needed to study AI-assisted screening.",
    },
  ],
  caution:
    "DR-VERGE is a research prototype and is not a replacement for ophthalmologists or professional medical diagnosis. This work describes a potential contribution toward SDG 3, not a demonstrated improvement in health outcomes.",
} as const;

export const challenges = [
  {
    number: "01",
    title: "Limited View",
    body: "A single fundus field may not capture all relevant retinal information. Lesions outside the imaged region are simply not available to the model.",
  },
  {
    number: "02",
    title: "Heavy Models",
    body: "Powerful deep-learning models may be computationally expensive for resource-constrained environments where screening is most needed.",
  },
  {
    number: "03",
    title: "Ordinal Severity",
    body: "DR grades are ordered 0 → 1 → 2 → 3 → 4. Confusing Grade 0 with Grade 4 is a far worse error than confusing Grade 2 with Grade 3, and the metric must reflect that.",
  },
] as const;

export const viewComparison = {
  macula: {
    label: "Macula-Centered View",
    number: "01",
    body: "Centred on the macula, the region of the retina responsible for detailed central vision. This is the field most single-view DR grading systems use.",
    captures: ["Central retinal region", "Macular changes", "Central lesion burden"],
  },
  disc: {
    label: "Optic-Disc-Centered View",
    number: "02",
    body: "Centred on the optic disc, capturing complementary anatomical information around the optic nerve head and the surrounding retina.",
    captures: [
      "Optic nerve head region",
      "Peripapillary retina",
      "Complementary retinal territory",
    ],
  },
  thesis: "DR-VERGE learns what changes when both views are considered together.",
} as const;
