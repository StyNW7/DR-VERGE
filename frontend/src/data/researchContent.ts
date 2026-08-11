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
  isPlaceholder: true,
  note: "Placeholder summary — awaiting the final paper abstract.",
  paragraphs: [
    "Diabetic retinopathy screening increasingly relies on automated analysis of retinal fundus photographs, yet most systems reason over a single retinal field. A macula-centered image and an optic-disc-centered image capture different regions of the retina, and combining them changes what a model predicts. DR-VERGE studies that change directly.",
    "We define the complementarity shift as the difference between a model's dual-view cumulative ordinal prediction and the average of its two single-view predictions. Complementarity-Shift Distillation (CSD) trains a lightweight student to reproduce the teacher's shift, rather than only the teacher's final logits or intermediate features.",
    "Across a locked evaluation protocol on DRTiD with external evaluation on DeepDRiD, CSD transferred the teacher's decision-shift structure more faithfully than logit or feature distillation on all three mechanism metrics. That mechanism improvement did not, however, produce a statistically conclusive improvement in in-domain grading agreement — a distinction this work reports rather than obscures.",
    "The selected lightweight student uses approximately 328K parameters and, after INT8 quantization, runs in 6.22 ms on a single CPU thread while retaining 98.3% of its FP32 ordinal agreement.",
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
      body: "A ~328K-parameter model that runs on a CPU in single-digit milliseconds does not require specialised hardware.",
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
