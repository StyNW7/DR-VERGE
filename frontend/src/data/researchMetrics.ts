/**
 * Every research number shown anywhere on this site.
 *
 * Source of truth: the ENHANCED run, `artifacts_enhanced_v1_20260811` — the
 * primary result of the study (36/36 integrity gates, self-audit recomputed 265
 * headline values from per-sample predictions with zero mismatches). Values are
 * transcribed from `outputs/results/tables/*.csv`, not from prose.
 *
 * Nothing here may be duplicated inside a component: when the paper's numbers
 * move, this file is the only edit.
 *
 * Wording rule that applies to all of it — these are EXPERIMENTAL results, not
 * clinical performance guarantees, and the site says so wherever they appear.
 */

/** Provenance shown wherever the site cites its own numbers. */
export const runProvenance = {
  runId: "artifacts_enhanced_v1_20260811",
  label: "Enhanced run",
  gatesPassed: 36,
  gatesTotal: 36,
  auditedValues: 265,
  auditMismatches: 0,
  hardware: "NVIDIA A100-SXM4-80GB",
  seedsPerCondition: 5,
  bootstrapResamples: 10_000,
  permutations: 10_000,
} as const;

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
  /** Teacher ÷ student parameters, rounded for display. */
  compressionFactor: 123,
  /** Serialized artifact ratio, teacher ÷ student FP32. */
  artifactCompressionFactor: 119,
  /** Teacher dual head vs its own best auxiliary head, on validation. */
  teacherDualViewGain: 0.0469,
  /** Student dual head vs independently trained single-view students. */
  studentDualViewGain: 0.0516,
  teacherQwk: 0.7364,
  studentQwk: 0.6018,
  /** Student QWK as a share of the teacher's. */
  teacherQwkRetainedPct: 81.7,
  teacherLatencyMs: 627.61,
  studentFp32LatencyMs: 32.55,
  selectedDeploymentLatencyMs: 11.35,
  /** Selected deployment artifact is QAT INT8, seed 42. */
  selectedQwkRetentionPct: 99.0,
  cpuSpeedupVsTeacher: 19.3,
  ordinalGrades: 5,
  fundusViews: 2,
  inputResolution: 384,
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
    value: "11.35 ms",
    label: "CPU Inference Latency",
    detail: "Selected INT8 deployment, single thread",
  },
  {
    value: "99.0%",
    label: "QWK Retention at INT8",
    detail: "Selected artifact, relative to the FP32 student",
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
    shiftL1: 0.3759,
    cosAgree: 0.3509,
    benefitCorr: 0.2193,
    isProposed: false,
  },
  {
    method: "Logit KD",
    shortMethod: "Logit KD",
    shiftL1: 0.384,
    cosAgree: 0.2858,
    benefitCorr: 0.1795,
    isProposed: false,
  },
  {
    method: "Feature KD",
    shortMethod: "Feature KD",
    shiftL1: 0.3718,
    cosAgree: 0.3815,
    benefitCorr: 0.1943,
    isProposed: false,
  },
  {
    method: "CSD (proposed)",
    shortMethod: "CSD",
    shiftL1: 0.3509,
    cosAgree: 0.4361,
    benefitCorr: 0.3075,
    isProposed: true,
  },
];

/**
 * The mechanism ordering held in all three independent runs — 9 of 9
 * measurements, across different resolutions, hardware and selection regimes.
 * This replication is the strongest evidence in the study.
 */
export const mechanismReplication = {
  runs: 3,
  measurements: 9,
  wins: 9,
  note: "CSD ranked best on all three mechanism metrics in every independent run, at 224 and 384 pixels, under different hyperparameter-selection regimes.",
} as const;

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
    "CSD transferred the teacher's dual-view decision-shift structure more faithfully than no distillation, logit KD, or feature KD — ranking best on all three mechanism metrics, in all three independent runs.",
  predictive:
    "Stronger mechanism fidelity did not translate into a statistically conclusive in-domain QWK improvement: every interval is narrow and includes zero, placing CSD on a par with each baseline.",
  synthesis:
    "Taken together, the mechanism transfer was obtained at no measurable cost to predictive accuracy. The dissociation between the two axes is reported as the study's central finding rather than smoothed over.",
  comparisons: [
    { pair: "CSD vs No Distillation", delta: -0.0024, ciLow: -0.0336, ciHigh: 0.0285, outcome: "Not conclusive" },
    { pair: "CSD vs Logit KD", delta: 0.0077, ciLow: -0.0304, ciHigh: 0.0463, outcome: "Not conclusive" },
    { pair: "CSD vs Feature KD", delta: -0.0143, ciLow: -0.0445, ciHigh: 0.0153, outcome: "Not conclusive" },
  ],
  note: "A confidence interval that includes zero is not a claim. These comparisons are reported as null results rather than omitted.",
  method:
    "Paired patient-clustered bootstrap over 5 matched seeds (B = 10,000), permutation tests (P = 10,000), Holm correction within each family.",
} as const;

/* -------------------------------------------------------------------------- */
/* RQ2 — efficiency                                                            */
/* -------------------------------------------------------------------------- */

export interface EfficiencyRow {
  variant: string;
  precision: string;
  latencyMs: number;
  /** Serialized state_dict size in megabytes. */
  sizeMb: number;
  paramsLabel: string;
  qwkRetentionPct: number | null;
  isSelected: boolean;
}

export const efficiencyResults: EfficiencyRow[] = [
  {
    variant: "Teacher (ResNet-50 dual-view)",
    precision: "FP32",
    latencyMs: 627.61,
    sizeMb: 154.09,
    paramsLabel: "40.3M",
    qwkRetentionPct: null,
    isSelected: false,
  },
  {
    variant: "Student",
    precision: "FP32",
    latencyMs: 32.55,
    sizeMb: 1.29,
    paramsLabel: "328K",
    qwkRetentionPct: 100,
    isSelected: false,
  },
  {
    variant: "Student PTQ",
    precision: "INT8",
    latencyMs: 11.24,
    sizeMb: 0.95,
    paramsLabel: "328K",
    qwkRetentionPct: 97.3,
    isSelected: false,
  },
  {
    variant: "Student FT-PTQ",
    precision: "INT8",
    latencyMs: 11.26,
    sizeMb: 0.95,
    paramsLabel: "328K",
    qwkRetentionPct: 96.8,
    isSelected: false,
  },
  {
    variant: "Student QAT",
    precision: "INT8",
    latencyMs: 11.35,
    sizeMb: 0.95,
    paramsLabel: "328K",
    qwkRetentionPct: 99.0,
    isSelected: true,
  },
];

/** Pre-registered RQ2 comparisons on the internal test set. */
export const rq2Comparisons = [
  { pair: "PTQ INT8 vs FP32", delta: -0.0164, ciLow: -0.036, ciHigh: 0.0023 },
  { pair: "QAT INT8 vs FP32", delta: -0.0063, ciLow: -0.0293, ciHigh: 0.0175 },
  { pair: "QAT INT8 vs PTQ INT8", delta: 0.0101, ciLow: -0.0179, ciHigh: 0.0411 },
] as const;

export const rq2Verdict = {
  headline:
    "INT8 quantization substantially reduced inference cost while preserving ordinal grading performance: no variant showed a credible degradation against the FP32 student.",
  control:
    "A matched FP32 fine-tuning control was run alongside, so the retention is attributable to quantization-aware training rather than to the extra epochs it involves.",
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
  { model: "Teacher", qwk: 0.7923, isTeacher: true, isSelected: false },
  { model: "PTQ INT8", qwk: 0.6729, isTeacher: false, isSelected: false },
  { model: "Student FP32 (CSD)", qwk: 0.6688, isTeacher: false, isSelected: false },
  { model: "FP32 fine-tune control", qwk: 0.6567, isTeacher: false, isSelected: false },
  { model: "FT-PTQ INT8", qwk: 0.6513, isTeacher: false, isSelected: false },
  { model: "QAT INT8", qwk: 0.6344, isTeacher: false, isSelected: true },
];

/** Set-C is the pre-registered confirmatory partition, frozen until the end. */
export const externalSetup = {
  partition: "DeepDRiD Set-C",
  patients: 100,
  eyes: 200,
  images: 400,
  exclusions: 0,
  seeds: 5,
  /** Student QWK as a share of the teacher's, on the external partition. */
  teacherQwkRetainedPct: 84.4,
} as const;

export const externalCaveat =
  "External results are reported as supporting evidence. Confidence intervals overlap for several comparisons and external superiority should not be overstated.";

/* -------------------------------------------------------------------------- */
/* Limitations — reported deliberately, because they are what make the rest     */
/* credible.                                                                   */
/* -------------------------------------------------------------------------- */

export const limitations = [
  {
    title: "Moderate absolute QWK",
    body: "Agreement is moderate rather than high — 0.7364 for the teacher and 0.6018 for the student on the internal test set. DR-VERGE is positioned as a research contribution on distillation mechanism and deployability, not as a state-of-the-art grading system.",
  },
  {
    title: "Relatively low Macro-F1",
    body: "Aggregate ordinal agreement is far better than per-class balance, which means the rare grades are recognised less reliably than the common ones.",
  },
  {
    title: "Mild NPDR is the weakest grade",
    body: "Grade 1 recall is 0.111 on the external partition. Early NPDR is the grade the system misses most often, and it is also the grade with the lowest agreement among human readers.",
  },
  {
    title: "Errors concentrate in adjacent grades",
    body: "Adjacent accuracy reaches 0.7418 and ordinal monotonicity violations are zero, so mistakes almost always land one grade away rather than jumping. Predictions two or more grades from the reference still occur, and in a clinical context those are the consequential errors.",
  },
  {
    title: "Input resolution bounds the smallest lesions",
    body: "Stage A selected 384x384 over 224x224 by a wide margin, but microaneurysms are among the smallest lesions defining early DR and may still not survive downsampling.",
  },
  {
    title: "Mechanism gain is not a predictive guarantee",
    body: "CSD transferred the decision-shift structure more faithfully, yet that did not produce a statistically conclusive in-domain QWK improvement. The two are separate claims and are reported separately.",
  },
  {
    title: "Methods are closely matched on accuracy",
    body: "All four distillation conditions fall within a narrow band, and the selected method differed between runs. This is why the mechanism axis, not the accuracy axis, is where the contribution is claimed.",
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
    title: "Recipe Selection",
    body: "Resolution and sampling are chosen on validation before the teacher exists, so the choice cannot be shaped by later results. 384x384 was selected.",
  },
  {
    step: "02",
    title: "APTOS Pretraining",
    body: "Both backbones are warm-started on single-field fundus images.",
  },
  {
    step: "03",
    title: "Dual-View Teacher",
    body: "A ResNet-50 teacher learns from both fields jointly and reaches 0.7364 QWK.",
  },
  {
    step: "04",
    title: "Lightweight Student",
    body: "A 328K-parameter dual-view student is trained from scratch.",
  },
  {
    step: "05",
    title: "Knowledge Distillation",
    body: "Logit KD and feature KD baselines are tuned over three seeds and frozen.",
  },
  {
    step: "06",
    title: "Complementarity-Shift Distillation",
    body: "The teacher's dual-view decision shift is transferred to the student.",
  },
  {
    step: "07",
    title: "Threshold Calibration",
    body: "One global decision threshold per condition is fitted on validation only.",
  },
  {
    step: "08",
    title: "INT8 Quantization",
    body: "PTQ, QAT and FT-PTQ are applied under a matched operator scope, with an FP32 fine-tuning control.",
  },
  {
    step: "09",
    title: "External Evaluation",
    body: "Five matched seeds are evaluated once on the frozen DeepDRiD Set-C partition.",
  },
  {
    step: "10",
    title: "Deployment",
    body: "The selected INT8 artifact is exported and verified to reload from disk.",
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
      "DRTiD eye counts per split and grade: 800 training, 200 validation and 550 test eyes. The rarest grades are a small fraction of training, which is why the train/validation split is stratified.",
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
    caption:
      "Mean ± standard deviation across five matched seeds on the internal test set. The four distillation conditions sit within a narrow band, which is why the mechanism metrics carry the RQ1 argument.",
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
      "Per-grade recall. The system is strongest at the ends of the ordinal scale; Mild NPDR is the weakest grade and is also the one human readers agree on least.",
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
  csdGradient: {
    id: "fig_08_csd_gradient",
    src: `${FIG}/fig_08_csd_gradient.png`,
    title: "Figure 10 — CSD gradient balance",
    caption:
      "Ratio of the CSD gradient to the task gradient on the shared backbone. At the selected weight the ratio is 0.5335, so the shift objective contributes a real signal without overwhelming the grading task.",
  },
  retention: {
    id: "fig_09_retention",
    src: `${FIG}/fig_09_retention.png`,
    title: "Figure 11 — Quantization retention",
    caption:
      "Retention relative to the FP32 model. The 95% line is a pre-specified engineering criterion for choosing an artifact, not a clinical margin.",
  },
  efficiency: {
    id: "fig_10_efficiency",
    src: `${FIG}/fig_10_efficiency.png`,
    title: "Figure 12 — Size and latency",
    caption:
      "Serialized state_dict size and single-thread CPU latency (median of five blocks).",
  },
  pareto: {
    id: "fig_11_pareto",
    src: `${FIG}/fig_11_pareto.png`,
    title: "Figure 13 — Performance/efficiency trade-off",
    caption:
      "QWK against CPU latency. Points closer to the top-left indicate a more favourable trade-off.",
  },
  forest: {
    id: "fig_12_forest",
    src: `${FIG}/fig_12_forest.png`,
    title: "Figure 14 — Forest plot of every comparison",
    caption:
      "Every pre-registered QWK comparison. The point is the observed paired difference and the bar is the bootstrap interval. An interval crossing zero is not a claim.",
  },
  externalSetC: {
    id: "fig_13_external_setc",
    src: `${FIG}/fig_13_external_setc.png`,
    title: "Figure 15 — External evaluation, DeepDRiD Set-C",
    caption:
      "The confirmatory external partition. No tuning, threshold adjustment, or selection happened here.",
  },
  internalVsExternal: {
    id: "fig_14_internal_vs_external",
    src: `${FIG}/fig_14_internal_vs_external.png`,
    title: "Figure 16 — Internal versus external",
    caption:
      "A drop on Set-C is a domain-shift finding to report, not something to tune away.",
  },
};
