/**
 * Every research number shown anywhere on this site.
 *
 * Values come from the locked DR-VERGE Simple-run evaluation protocol. Nothing
 * here may be duplicated inside a component: when the paper's final numbers
 * land, this file is the only edit.
 *
 * Wording rule that applies to all of it — these are EXPERIMENTAL results, not
 * clinical performance guarantees, and the site says so wherever they appear.
 */

export const DISCLAIMER_METRICS =
  "Reported values are experimental results from the locked DR-VERGE evaluation protocol and should not be interpreted as clinical performance guarantees.";

export const DISCLAIMER_SCORES =
  "These scores are internal model outputs and should not be interpreted as calibrated clinical probabilities.";

export const DISCLAIMER_CLINICAL =
  "DR-VERGE is a research prototype and is not intended as a standalone clinical diagnostic system. Model outputs should not replace evaluation by qualified healthcare professionals.";

/* -------------------------------------------------------------------------- */
/* Headline figures                                                            */
/* -------------------------------------------------------------------------- */

export const modelStats = {
  teacherParams: 40_313_932,
  studentParams: 328_588,
  /** Teacher ÷ student, rounded for display. */
  compressionFactor: 123,
  teacherDualViewGain: 0.1143,
  studentFp32LatencyMs: 15.06,
  selectedDeploymentLatencyMs: 6.22,
  ptqQwkRetentionPct: 98.3,
  ordinalGrades: 5,
  fundusViews: 2,
  inputResolution: 224,
} as const;

/** The hero metric grid on the home page. */
export const headlineMetrics = [
  {
    value: "328K",
    label: "Student Parameters",
    detail: "Lightweight dual-view student",
  },
  {
    value: "123×",
    label: "Fewer Parameters",
    detail: "Compared with the ResNet-50 teacher",
  },
  {
    value: "6.22 ms",
    label: "CPU Inference Latency",
    detail: "Selected INT8 deployment, single thread",
  },
  {
    value: "98.3%",
    label: "PTQ QWK Retention",
    detail: "Relative to the FP32 student",
  },
  {
    value: "5",
    label: "Ordinal DR Grades",
    detail: "Grade 0 through Grade 4",
  },
  {
    value: "2",
    label: "Complementary Views",
    detail: "Macula-centered and optic-disc-centered",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* RQ1 — mechanism fidelity                                                    */
/* -------------------------------------------------------------------------- */

export type MechanismMetricKey = "shiftL1" | "cosAgree" | "benefitCorr";

export interface MechanismRow {
  method: string;
  shortMethod: string;
  shiftL1: number;
  cosAgree: number;
  benefitCorr: number;
  isProposed: boolean;
}

/** Lower ShiftL1 is better; higher CosAgree and BenefitCorr are better. */
export const mechanismResults: MechanismRow[] = [
  {
    method: "No Distillation",
    shortMethod: "No KD",
    shiftL1: 0.4605,
    cosAgree: 0.318,
    benefitCorr: 0.185,
    isProposed: false,
  },
  {
    method: "Logit KD",
    shortMethod: "Logit KD",
    shiftL1: 0.4524,
    cosAgree: 0.3468,
    benefitCorr: 0.2161,
    isProposed: false,
  },
  {
    method: "Feature KD",
    shortMethod: "Feature KD",
    shiftL1: 0.4489,
    cosAgree: 0.3721,
    benefitCorr: 0.233,
    isProposed: false,
  },
  {
    method: "CSD (proposed)",
    shortMethod: "CSD",
    shiftL1: 0.432,
    cosAgree: 0.4257,
    benefitCorr: 0.2902,
    isProposed: true,
  },
];

export const mechanismMetricMeta: Record<
  MechanismMetricKey,
  {
    key: MechanismMetricKey;
    label: string;
    direction: "lower" | "higher";
    arrow: string;
    description: string;
  }
> = {
  shiftL1: {
    key: "shiftL1",
    label: "ShiftL1",
    direction: "lower",
    arrow: "↓",
    description:
      "Distance between the student's decision shift and the teacher's. Lower means the student reproduces the teacher's dual-view shift more closely.",
  },
  cosAgree: {
    key: "cosAgree",
    label: "Cosine Agreement",
    direction: "higher",
    arrow: "↑",
    description:
      "Whether the student's shift points in the same direction as the teacher's. Higher means better directional agreement.",
  },
  benefitCorr: {
    key: "benefitCorr",
    label: "Benefit Correlation",
    direction: "higher",
    arrow: "↑",
    description:
      "Whether the student benefits from the second view on the same samples the teacher does. Higher means the benefit pattern transferred.",
  },
};

/**
 * The finding that must never be softened: mechanism fidelity improved, but
 * in-domain predictive QWK did not improve conclusively.
 */
export const rq1Verdict = {
  mechanism:
    "CSD consistently transferred the teacher's dual-view decision-shift structure more faithfully than no distillation, logit KD, or feature KD.",
  predictive:
    "However, stronger mechanism fidelity did not translate into a statistically conclusive in-domain QWK improvement.",
  comparisons: [
    { pair: "CSD vs No Distillation", outcome: "Not conclusive" },
    { pair: "CSD vs Logit KD", outcome: "Not conclusive" },
    { pair: "CSD vs Feature KD", outcome: "Not conclusive" },
  ],
  note: "A confidence interval that includes zero is not a claim. These comparisons are reported as null results rather than omitted.",
} as const;

/* -------------------------------------------------------------------------- */
/* RQ2 — efficiency                                                            */
/* -------------------------------------------------------------------------- */

export interface EfficiencyRow {
  variant: string;
  precision: string;
  latencyMs: number;
  paramsLabel: string;
  qwkRetentionPct: number | null;
  isSelected: boolean;
}

export const efficiencyResults: EfficiencyRow[] = [
  {
    variant: "Teacher (ResNet-50 dual-view)",
    precision: "FP32",
    latencyMs: 76.4,
    paramsLabel: "40.3M",
    qwkRetentionPct: null,
    isSelected: false,
  },
  {
    variant: "Student",
    precision: "FP32",
    latencyMs: 15.06,
    paramsLabel: "328K",
    qwkRetentionPct: 100,
    isSelected: false,
  },
  {
    variant: "Student PTQ",
    precision: "INT8",
    latencyMs: 6.7,
    paramsLabel: "328K",
    qwkRetentionPct: 98.3,
    isSelected: false,
  },
  {
    variant: "Student QAT",
    precision: "INT8",
    latencyMs: 6.45,
    paramsLabel: "328K",
    qwkRetentionPct: 97.1,
    isSelected: false,
  },
  {
    variant: "Student FT-PTQ",
    precision: "INT8",
    latencyMs: 6.22,
    paramsLabel: "328K",
    qwkRetentionPct: 98.3,
    isSelected: true,
  },
];

export const rq2Verdict = {
  headline:
    "INT8 quantization substantially reduced inference cost while preserving most ordinal grading performance.",
  caution:
    "Quantization reduces computational cost. It does not improve grading accuracy, and this site does not claim that it does.",
} as const;

/* -------------------------------------------------------------------------- */
/* External validation — DeepDRiD Set-C                                        */
/* -------------------------------------------------------------------------- */

export interface ExternalRow {
  model: string;
  qwk: number;
  isTeacher: boolean;
  isSelected: boolean;
}

export const externalValidation: ExternalRow[] = [
  { model: "Teacher", qwk: 0.7788, isTeacher: true, isSelected: false },
  { model: "Best CSD", qwk: 0.7346, isTeacher: false, isSelected: false },
  { model: "Selected FP32", qwk: 0.6442, isTeacher: false, isSelected: false },
  { model: "PTQ INT8", qwk: 0.6607, isTeacher: false, isSelected: false },
  { model: "QAT INT8", qwk: 0.7179, isTeacher: false, isSelected: false },
  { model: "FT-PTQ INT8", qwk: 0.7208, isTeacher: false, isSelected: true },
];

export const externalCaveat =
  "External results are reported as supporting evidence. Confidence intervals overlap for several comparisons and external superiority should not be overstated.";

/* -------------------------------------------------------------------------- */
/* Limitations — reported deliberately, because they are what make the rest     */
/* credible.                                                                   */
/* -------------------------------------------------------------------------- */

export const limitations = [
  {
    title: "Moderate absolute QWK",
    body: "Agreement is moderate rather than high. DR-VERGE is positioned as a research contribution on distillation mechanism, not as a state-of-the-art grading system.",
  },
  {
    title: "Relatively low Macro-F1",
    body: "Aggregate ordinal agreement is far better than per-class balance, which means the rare grades are recognised less reliably than the common ones.",
  },
  {
    title: "Minority-grade difficulty",
    body: "Grade 1 and Grade 3 are under-represented in the training data and are the grades the model most often misses.",
  },
  {
    title: "Severe-error rate remains non-trivial",
    body: "Predictions that are two or more grades away from the reference still occur. In a clinical context those are the consequential errors.",
  },
  {
    title: "224x224 input resolution",
    body: "Microaneurysms are among the smallest lesions that define early DR and may not survive downsampling to 224x224.",
  },
  {
    title: "Mechanism gain is not a predictive guarantee",
    body: "CSD transferred the decision-shift structure more faithfully, yet that did not produce a statistically conclusive in-domain QWK improvement. The two are separate claims.",
  },
  {
    title: "Public-dataset generalizability",
    body: "All evaluation used public datasets with their own acquisition characteristics. Performance on other populations, cameras, or protocols is unknown.",
  },
  {
    title: "Research prototype, not clinical validation",
    body: "No prospective clinical study, regulatory evaluation, or deployment validation has been carried out.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Datasets and pipeline                                                       */
/* -------------------------------------------------------------------------- */

export const datasets = [
  {
    name: "DRTiD",
    role: "Primary dual-view dataset",
    detail: "Paired macula-centered and optic-disc-centered fields, 800 / 200 / 550 eyes",
  },
  {
    name: "APTOS 2019",
    role: "Backbone pretraining",
    detail: "Single-field fundus images used to warm-start both backbones",
  },
  {
    name: "DeepDRiD",
    role: "External validation",
    detail: "Set-C reserved as the confirmatory partition, frozen until the end",
  },
] as const;

export const pipelineStages = [
  {
    step: "01",
    title: "APTOS Pretraining",
    body: "Both backbones are warm-started on single-field fundus images.",
  },
  {
    step: "02",
    title: "Dual-View Teacher",
    body: "A ResNet-50 teacher learns from both fields jointly.",
  },
  {
    step: "03",
    title: "Lightweight Student",
    body: "A ~328K-parameter dual-view student is trained from scratch.",
  },
  {
    step: "04",
    title: "Knowledge Distillation",
    body: "Logit KD and feature KD baselines are tuned and frozen.",
  },
  {
    step: "05",
    title: "Complementarity-Shift Distillation",
    body: "The teacher's dual-view decision shift is transferred to the student.",
  },
  {
    step: "06",
    title: "INT8 Quantization",
    body: "PTQ and QAT are applied under a matched operator scope.",
  },
  {
    step: "07",
    title: "External Evaluation",
    body: "The selected model is evaluated once on DeepDRiD Set-C.",
  },
  {
    step: "08",
    title: "Deployment",
    body: "The selected INT8 artifact is exported for CPU inference.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Research figures (real assets from the evaluation run, grayscaled)           */
/* -------------------------------------------------------------------------- */

export interface ResearchFigure {
  id: string;
  src: string;
  title: string;
  caption: string;
}

const FIG = "/research/figures";

export const researchFigures: Record<string, ResearchFigure> = {
  architecture: {
    id: "fig_01_architecture",
    src: `${FIG}/fig_01_architecture.png`,
    title: "Figure 1 — DR-VERGE architecture",
    caption:
      "The teacher produces dual and single-view cumulative probabilities; their difference is the complementarity shift distilled into the lightweight student.",
  },
  dataset: {
    id: "fig_01_dataset",
    src: `${FIG}/fig_01_dataset.png`,
    title: "Figure 2 — Dataset composition",
    caption:
      "DRTiD eye counts per split and grade. Grade 4 is roughly 3.9% of training, which is why the train/validation split is stratified.",
  },
  workflow: {
    id: "fig_02_experimental_workflow",
    src: `${FIG}/fig_02_experimental_workflow.png`,
    title: "Figure 3 — Experimental workflow",
    caption:
      "All selection happens on validation. The DRTiD test set is evaluated once within the run and DeepDRiD stays frozen until the very end.",
  },
  performance: {
    id: "fig_02_performance",
    src: `${FIG}/fig_02_performance.png`,
    title: "Figure 4 — Predictive performance",
    caption: "Mean ± standard deviation across seeds on the internal test set.",
  },
  ordinalSafety: {
    id: "fig_03_ordinal_safety",
    src: `${FIG}/fig_03_ordinal_safety.png`,
    title: "Figure 5 — Ordinal safety",
    caption:
      "A severe error is a prediction two or more grades from the reference — the clinically consequential mistake.",
  },
  perGradeRecall: {
    id: "fig_04_per_grade_recall",
    src: `${FIG}/fig_04_per_grade_recall.png`,
    title: "Figure 6 — Per-grade recall",
    caption:
      "Per-grade recall. Rare intermediate grades are where ordinal models usually fail.",
  },
  confusion: {
    id: "fig_05_confusion",
    src: `${FIG}/fig_05_confusion.png`,
    title: "Figure 7 — Confusion matrices",
    caption: "Row-normalized confusion matrices.",
  },
  dualViewGain: {
    id: "fig_06_dual_view_gain",
    src: `${FIG}/fig_06_dual_view_gain.png`,
    title: "Figure 8 — Dual-view gain",
    caption:
      "G_aux compares the dual head against the model's own auxiliary heads; G_independent compares against independently trained single-view students on the same seed.",
  },
  csdMechanism: {
    id: "fig_07_csd_mechanism",
    src: `${FIG}/fig_07_csd_mechanism.png`,
    title: "Figure 9 — CSD mechanism",
    caption:
      "Lower ShiftL1 means the student's decision-shift structure is closer to the teacher's; higher CosAgree means the shift points the same way; higher BenefitCorr means the student gains from the dual view on the same samples the teacher does.",
  },
  retention: {
    id: "fig_09_retention",
    src: `${FIG}/fig_09_retention.png`,
    title: "Figure 10 — Quantization retention",
    caption:
      "Retention relative to the FP32 model. The 95% line is a pre-specified engineering criterion for choosing an artifact, not a clinical margin.",
  },
  efficiency: {
    id: "fig_10_efficiency",
    src: `${FIG}/fig_10_efficiency.png`,
    title: "Figure 11 — Size and latency",
    caption:
      "Serialized state_dict size and single-thread CPU latency (median of five blocks).",
  },
  pareto: {
    id: "fig_11_pareto",
    src: `${FIG}/fig_11_pareto.png`,
    title: "Figure 12 — Performance/efficiency trade-off",
    caption:
      "QWK against CPU latency. Points closer to the top-left indicate a more favourable trade-off.",
  },
  forest: {
    id: "fig_12_forest",
    src: `${FIG}/fig_12_forest.png`,
    title: "Figure 13 — Forest plot of every comparison",
    caption:
      "Every pre-registered QWK comparison. The point is the observed paired difference and the bar is the bootstrap interval. An interval crossing zero is not a claim.",
  },
  externalSetC: {
    id: "fig_13_external_setc",
    src: `${FIG}/fig_13_external_setc.png`,
    title: "Figure 14 — External evaluation, DeepDRiD Set-C",
    caption:
      "The confirmatory external partition. No tuning, threshold adjustment, or selection happened here.",
  },
  internalVsExternal: {
    id: "fig_14_internal_vs_external",
    src: `${FIG}/fig_14_internal_vs_external.png`,
    title: "Figure 15 — Internal versus external",
    caption:
      "A drop on Set-C is a domain-shift finding to report, not something to tune away.",
  },
};
