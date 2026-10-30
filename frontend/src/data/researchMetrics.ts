/**
 * Every research number shown anywhere on this site.
 *
 * Source of truth: the ENHANCED run, `artifacts_enhanced_v1_20260811` — the
 * primary result of the study (36/36 integrity gates, self-audit recomputed 265
 * headline values from per-sample predictions with zero mismatches). Values are
 * transcribed from `experiments/results/tables/*.csv`, not from prose.
 *
 * The mechanism-inference block further down comes from the inference-only
 * supplementary analysis, `artifacts_enhanced_supplementary_v2_20261029`
 * (56/56 gates), transcribed from `experiments/results/supplementary/tables/`.
 * It is exploratory and never changes a main-run number.
 *
 * Nothing here may be duplicated inside a component: when the paper's numbers
 * move, this file is the only edit.
 *
 * Copy is bilingual (`l(en, id)`); both sides must say exactly the same thing.
 * Numbers are stored once and formatted per language by the components.
 *
 * Wording rule that applies to all of it — these are EXPERIMENTAL results, not
 * clinical performance guarantees, and the site says so wherever they appear.
 */

import { l, type L } from "@/i18n/context";

/** Provenance shown wherever the site cites its own numbers. */
export const runProvenance = {
  runId: "artifacts_enhanced_v1_20260811",
  label: l("Enhanced run", "*Run enhanced*"),
  gatesPassed: 36,
  gatesTotal: 36,
  auditedValues: 265,
  auditMismatches: 0,
  hardware: "NVIDIA A100-SXM4-80GB",
  seedsPerCondition: 5,
  bootstrapResamples: 10_000,
  permutations: 10_000,
} as const;

/** Provenance of the inference-only supplementary analysis (v2). */
export const supplementaryProvenance = {
  runId: "artifacts_enhanced_supplementary_v2_20261029",
  gatesPassed: 56,
  gatesTotal: 56,
  reproductionChecks: 156,
  checkpointsHashed: 21,
  bootstrapResamples: 10_000,
  internalRecords: 550,
  externalPatients: 100,
} as const;

export const DISCLAIMER_METRICS = l(
  "Reported values are experimental results from the locked DR-VERGE evaluation protocol and should not be interpreted as clinical performance guarantees.",
  "Nilai yang dilaporkan merupakan hasil eksperimen dari protokol evaluasi DR-VERGE yang telah dikunci dan tidak boleh ditafsirkan sebagai jaminan performa klinis.",
);

export const DISCLAIMER_SCORES = l(
  "These scores are internal model outputs and should not be interpreted as calibrated clinical probabilities.",
  "Skor ini merupakan keluaran internal model dan tidak boleh ditafsirkan sebagai probabilitas klinis yang terkalibrasi.",
);

export const DISCLAIMER_CLINICAL = l(
  "DR-VERGE is a research prototype and is not intended as a standalone clinical diagnostic system. Model outputs should not replace evaluation by qualified healthcare professionals.",
  "DR-VERGE adalah prototipe penelitian dan tidak ditujukan sebagai sistem diagnosis klinis yang berdiri sendiri. Keluaran model tidak boleh menggantikan evaluasi oleh tenaga kesehatan yang kompeten.",
);

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
  /** Deployed QAT INT8 artifact versus the teacher (paper abstract, RQ2). */
  teacherSizeMb: 154.089,
  deployedSizeMb: 0.9507,
  deployedSizeReductionVsTeacher: 162.1,
  deployedSpeedupVsTeacher: 55.3,
} as const;

/** The four numbers under the home hero — the deployment story at a glance. */
export const heroStats = [
  { value: "328K", label: l("parameters", "parameter"), detail: l("Dual-view student", "*Student dual-view*") },
  { value: "0.95 MB", label: l("INT8 artifact", "artefak INT8"), detail: l("Deployed QAT model", "Model QAT untuk *deployment*") },
  { value: "11.35 ms", label: l("per eye on CPU", "per mata di CPU"), detail: l("Single thread", "*Single thread*") },
  { value: "162×", label: l("smaller than teacher", "lebih kecil dari *teacher*"), detail: l("55× faster, too", "dan 55× lebih cepat") },
] as const;

/** The hero metric grid on the home page. */
export const headlineMetrics = [
  {
    value: "328K",
    label: l("Student Parameters", "Parameter *Student*"),
    detail: l("Lightweight dual-view student", "*Lightweight student dual-view*"),
  },
  {
    value: "123×",
    label: l("Fewer Parameters", "Parameter Lebih Sedikit"),
    detail: l("Compared with the ResNet-50 teacher", "Dibandingkan *teacher* ResNet-50"),
  },
  {
    value: "11.35 ms",
    label: l("CPU Inference Latency", "Latensi Inferensi CPU"),
    detail: l("Selected INT8 deployment, single thread", "*Deployment* INT8 terpilih, *single thread*"),
    emphasis: true,
  },
  {
    value: "99.0%",
    label: l("QWK Retention at INT8", "Retensi QWK pada INT8"),
    detail: l("Selected artifact, relative to the FP32 student", "Artefak terpilih, relatif terhadap *student* FP32"),
  },
  {
    value: "5",
    label: l("Ordinal DR Grades", "Tingkat Ordinal DR"),
    detail: l("Grade 0 through Grade 4", "*Grade* 0 hingga *Grade* 4"),
  },
  {
    value: "2",
    label: l("Complementary Views", "*View* yang Saling Melengkapi"),
    detail: l("Macula-centered and optic-disc-centered", "Berpusat makula dan berpusat diskus optik"),
  },
] as const;

/* -------------------------------------------------------------------------- */
/* RQ1 — mechanism fidelity                                                    */
/* -------------------------------------------------------------------------- */

export type MechanismMetricKey = "shiftL1" | "cosAgree" | "benefitCorr";

export interface MechanismRow {
  method: L;
  /** Method names are technical labels and stay identical in both languages. */
  shortMethod: string;
  shiftL1: number;
  cosAgree: number;
  benefitCorr: number;
  isProposed: boolean;
}

/** Lower ShiftL1 is better; higher CosAgree and BenefitCorr are better. */
export const mechanismResults: MechanismRow[] = [
  {
    method: l("No Distillation", "Tanpa Distilasi"),
    shortMethod: "No KD",
    shiftL1: 0.3759,
    cosAgree: 0.3509,
    benefitCorr: 0.2193,
    isProposed: false,
  },
  {
    method: l("Logit KD", "*Logit* KD"),
    shortMethod: "Logit KD",
    shiftL1: 0.384,
    cosAgree: 0.2858,
    benefitCorr: 0.1795,
    isProposed: false,
  },
  {
    method: l("Feature KD", "*Feature* KD"),
    shortMethod: "Feature KD",
    shiftL1: 0.3718,
    cosAgree: 0.3815,
    benefitCorr: 0.1943,
    isProposed: false,
  },
  {
    method: l("CSD (proposed)", "CSD (usulan)"),
    shortMethod: "CSD",
    shiftL1: 0.3509,
    cosAgree: 0.4361,
    benefitCorr: 0.3075,
    isProposed: true,
  },
];

/* -------------------------------------------------------------------------- */
/* RQ1 — mechanism inference (supplementary analysis v2, exploratory)           */
/* -------------------------------------------------------------------------- */

export type BaselineKey = "noDistill" | "logitKd" | "featureKd";

export interface MechanismContrast {
  metric: MechanismMetricKey;
  baseline: BaselineKey;
  /** CSD − baseline, mean of the five matched seeds. */
  delta: number;
  ciLow: number;
  ciHigh: number;
  /** 95% CI excludes zero in CSD's favour. No contrast favours a baseline. */
  conclusive: boolean;
  /** Seeds (of 5) on which CSD is better than the baseline. */
  seedsFavouringCsd: number;
}

export const baselineLabels: Record<BaselineKey, string> = {
  noDistill: "NoDistill",
  logitKd: "Logit-KD",
  featureKd: "Feature-KD",
};

/**
 * Hierarchical paired bootstrap (B = 10,000) over 550 examined-eye records AND
 * the five seeds, from `table_mechanism_internal_stats.csv`.
 */
export const mechanismInferenceInternal: MechanismContrast[] = [
  { metric: "shiftL1", baseline: "noDistill", delta: -0.0249, ciLow: -0.0477, ciHigh: -0.0043, conclusive: true, seedsFavouringCsd: 5 },
  { metric: "shiftL1", baseline: "logitKd", delta: -0.0331, ciLow: -0.0567, ciHigh: -0.0103, conclusive: true, seedsFavouringCsd: 4 },
  { metric: "shiftL1", baseline: "featureKd", delta: -0.0209, ciLow: -0.0408, ciHigh: -0.0012, conclusive: true, seedsFavouringCsd: 4 },
  { metric: "cosAgree", baseline: "noDistill", delta: 0.0852, ciLow: -0.0134, ciHigh: 0.187, conclusive: false, seedsFavouringCsd: 3 },
  { metric: "cosAgree", baseline: "logitKd", delta: 0.1503, ciLow: 0.0263, ciHigh: 0.3011, conclusive: true, seedsFavouringCsd: 4 },
  { metric: "cosAgree", baseline: "featureKd", delta: 0.0546, ciLow: -0.0225, ciHigh: 0.1407, conclusive: false, seedsFavouringCsd: 4 },
  { metric: "benefitCorr", baseline: "noDistill", delta: 0.0882, ciLow: -0.0342, ciHigh: 0.2329, conclusive: false, seedsFavouringCsd: 3 },
  { metric: "benefitCorr", baseline: "logitKd", delta: 0.128, ciLow: -0.0038, ciHigh: 0.2643, conclusive: false, seedsFavouringCsd: 4 },
  { metric: "benefitCorr", baseline: "featureKd", delta: 0.1132, ciLow: -0.039, ciHigh: 0.2662, conclusive: false, seedsFavouringCsd: 3 },
];

/** Same design on DeepDRiD Set-C, patient-clustered, from `table_mechanism_external_stats.csv`. */
export const mechanismInferenceExternal: MechanismContrast[] = [
  { metric: "shiftL1", baseline: "noDistill", delta: -0.0152, ciLow: -0.0486, ciHigh: 0.0182, conclusive: false, seedsFavouringCsd: 3 },
  { metric: "shiftL1", baseline: "logitKd", delta: -0.0103, ciLow: -0.0435, ciHigh: 0.0254, conclusive: false, seedsFavouringCsd: 2 },
  { metric: "shiftL1", baseline: "featureKd", delta: -0.0069, ciLow: -0.0394, ciHigh: 0.0284, conclusive: false, seedsFavouringCsd: 3 },
  { metric: "cosAgree", baseline: "noDistill", delta: 0.1283, ciLow: 0.025, ciHigh: 0.2505, conclusive: true, seedsFavouringCsd: 5 },
  { metric: "cosAgree", baseline: "logitKd", delta: 0.1608, ciLow: 0.0358, ciHigh: 0.3036, conclusive: true, seedsFavouringCsd: 5 },
  { metric: "cosAgree", baseline: "featureKd", delta: 0.0519, ciLow: -0.0294, ciHigh: 0.132, conclusive: false, seedsFavouringCsd: 4 },
  { metric: "benefitCorr", baseline: "noDistill", delta: 0.1196, ciLow: -0.0278, ciHigh: 0.2573, conclusive: false, seedsFavouringCsd: 5 },
  { metric: "benefitCorr", baseline: "logitKd", delta: 0.1106, ciLow: -0.0105, ciHigh: 0.256, conclusive: false, seedsFavouringCsd: 5 },
  { metric: "benefitCorr", baseline: "featureKd", delta: 0.0891, ciLow: -0.0461, ciHigh: 0.2485, conclusive: false, seedsFavouringCsd: 4 },
];

/** The supporting layers behind the nine internal contrasts. */
export const mechanismEvidence = {
  contrasts: 9,
  conclusiveForCsd: 4,
  conclusiveForBaseline: 0,
  seedPairsFavouringCsd: 34,
  seedPairs: 45,
  looStable: 9,
  fixedModelConclusive: 9,
  maxPHolm: 0.0034,
  headline: l(
    "ShiftL1 — the metric that most directly measures what CSD optimises — is lower for CSD than for all three baselines, with 95% intervals that exclude zero.",
    "ShiftL1 — metrik yang paling langsung mengukur apa yang dioptimalkan CSD — lebih rendah pada CSD dibandingkan ketiga pembanding, dengan interval 95% yang tidak memuat nol.",
  ),
  seedNote: l(
    "When the trained models are held fixed, all nine contrasts separate from zero; once seed-to-seed variation is resampled too, four do. The remaining uncertainty comes from having five models per condition, not from the size of the test set.",
    "Bila model terlatih dianggap tetap, kesembilan kontras memisah dari nol; setelah variasi antar-*seed* ikut diresampling, empat kontras yang bertahan. Ketidakpastian yang tersisa berasal dari jumlah model (lima per kondisi), bukan dari ukuran data uji.",
  ),
  method: l(
    "Hierarchical paired bootstrap, B = 10,000: every replicate resamples examined-eye records (DRTiD) or patients (Set-C) and the five seeds jointly, with the same draw for CSD, the baseline and the teacher, and recomputes each metric. Exploratory post-hoc analysis on frozen checkpoints.",
    "*Hierarchical paired bootstrap*, B = 10.000: setiap replikasi meresampling *examined-eye record* (DRTiD) atau pasien (Set-C) dan lima *seed* secara bersamaan, dengan penarikan yang sama untuk CSD, pembanding, dan *teacher*, lalu menghitung ulang setiap metrik. Analisis eksploratori pasca-hoc pada *checkpoint* beku.",
  ),
} as const;

/** Set-C mechanism values (mean of 5 seeds); CSD ranks first on all three. */
export const mechanismExternal: MechanismRow[] = [
  { method: l("No Distillation", "Tanpa Distilasi"), shortMethod: "No KD", shiftL1: 0.3128, cosAgree: 0.2548, benefitCorr: 0.1161, isProposed: false },
  { method: l("Logit KD", "*Logit* KD"), shortMethod: "Logit KD", shiftL1: 0.3079, cosAgree: 0.2223, benefitCorr: 0.1251, isProposed: false },
  { method: l("Feature KD", "*Feature* KD"), shortMethod: "Feature KD", shiftL1: 0.3044, cosAgree: 0.3312, benefitCorr: 0.1466, isProposed: false },
  { method: l("CSD (proposed)", "CSD (usulan)"), shortMethod: "CSD", shiftL1: 0.2975, cosAgree: 0.3831, benefitCorr: 0.2357, isProposed: true },
];

/** Why the external ShiftL1 contrasts are weaker: the teacher's own shift shrinks. */
export const teacherShiftProfile = {
  internalMeanShift: 0.4097,
  externalMeanShift: 0.2659,
  internalDualGain: 0.05,
  externalDualGain: 0.0073,
} as const;

/**
 * Exact identity p_dual^S − p_dual^T = (p̄^S − p̄^T) + (Δ^S − Δ^T), DRTiD internal,
 * mean per-eye L1 over 5 seeds, from `table_mechanism_decomposition.csv`.
 */
export const decompositionRows = [
  { shortMethod: "No KD", shiftGap: 0.376, baseGap: 0.427, outputGap: 0.545, gradeAgreementPct: 61.4, qwk: 0.604, isProposed: false },
  { shortMethod: "Logit KD", shiftGap: 0.384, baseGap: 0.448, outputGap: 0.587, gradeAgreementPct: 64.8, qwk: 0.594, isProposed: false },
  { shortMethod: "Feature KD", shiftGap: 0.372, baseGap: 0.422, outputGap: 0.569, gradeAgreementPct: 66.1, qwk: 0.616, isProposed: false },
  { shortMethod: "CSD", shiftGap: 0.351, baseGap: 0.436, outputGap: 0.558, gradeAgreementPct: 65.5, qwk: 0.602, isProposed: true },
] as const;

export const decompositionAssociation = {
  baseGapVsQwk: -0.52,
  shiftL1VsQwk: -0.35,
  models: 20,
} as const;

/** Quartiles of the teacher's own |Δ_T|; conclusive ShiftL1/CosAgree contrasts out of 6. */
export const shiftQuartiles = [
  { bin: "Q1", eyes: 138, meanShift: 0.103, relativeLow: 2.24, relativeHigh: 2.38, conclusive: 1 },
  { bin: "Q2", eyes: 137, meanShift: 0.274, relativeLow: 0.93, relativeHigh: 0.97, conclusive: 0 },
  { bin: "Q3", eyes: 137, meanShift: 0.461, relativeLow: 0.73, relativeHigh: 0.81, conclusive: 0 },
  { bin: "Q4", eyes: 138, meanShift: 0.801, relativeLow: 0.73, relativeHigh: 0.83, conclusive: 4 },
] as const;

export const supplementaryFindings = {
  decomposition: l(
    "The final-output gap to the teacher splits exactly into a base-aggregation gap and a shift gap. CSD has the smallest shift gap — the term it targets — but a slightly larger base-aggregation gap than Feature KD, so its final grades agree with the teacher about as often (65.5% vs 66.1%). Across 20 student models, QWK tracks the base-aggregation gap (ρ = −0.52) more than ShiftL1 (ρ = −0.35).",
    "Selisih output akhir terhadap *teacher* terurai tepat menjadi selisih agregasi dasar dan selisih *shift*. CSD memiliki selisih *shift* terkecil — suku yang ditargetkannya — tetapi selisih agregasi dasarnya sedikit lebih besar daripada *Feature* KD, sehingga kesesuaian *grade* akhirnya dengan *teacher* setara (65,5% vs 66,1%). Di 20 model *student*, QWK lebih berkaitan dengan selisih agregasi dasar (ρ = −0,52) daripada dengan ShiftL1 (ρ = −0,35).",
  ),
  whenItHelps: l(
    "CSD's advantage concentrates where the teacher's shift is large: in the top quartile 4 of 6 ShiftL1/CosAgree contrasts are conclusive, against 1 in the bottom quartile, where every student's shift error exceeds the teacher's own shift. On the 325 eyes the teacher grades correctly, CSD beats Logit KD on all three metrics, including BenefitCorr (+0.1170 [+0.0122, +0.2199]).",
    "Keunggulan CSD terkonsentrasi ketika *shift teacher* besar: pada kuartil teratas 4 dari 6 kontras ShiftL1/CosAgree konklusif, dibandingkan 1 pada kuartil terbawah, tempat kesalahan *shift* semua *student* melampaui *shift teacher* itu sendiri. Pada 325 mata yang dinilai benar oleh *teacher*, CSD mengungguli *Logit* KD pada ketiga metrik, termasuk BenefitCorr (+0,1170 [+0,0122; +0,2199]).",
  ),
  external: l(
    "On DeepDRiD Set-C CSD still ranks first on all three metrics, and its CosAgree is conclusively higher than No Distillation's and Logit KD's. External ShiftL1 is not conclusive because the signal to imitate weakens: the teacher's mean shift falls from 0.4097 to 0.2659 and its dual-view gain from +0.0500 to +0.0073.",
    "Pada DeepDRiD Set-C, CSD tetap peringkat pertama pada ketiga metrik, dan CosAgree-nya konklusif lebih tinggi daripada Tanpa Distilasi dan *Logit* KD. ShiftL1 eksternal belum konklusif karena sinyal yang ditiru melemah: rerata *shift teacher* turun dari 0,4097 menjadi 0,2659 dan *dual-view gain*-nya dari +0,0500 menjadi +0,0073.",
  ),
  grade1: l(
    "Grade 1 is hard for every model, the teacher included: recall is 0.000 for the teacher and 0.068 for CSD, and the errors lean milder — 72% of Grade-1 eyes are graded 0 by the teacher, 65.2% by CSD.",
    "Grade 1 sulit bagi semua model, termasuk *teacher*: *recall* 0,000 untuk *teacher* dan 0,068 untuk CSD, dan kesalahannya condong lebih ringan — 72% mata Grade 1 dinilai Grade 0 oleh *teacher*, 65,2% oleh CSD.",
  ),
  stability: l(
    "CSD stays first on BenefitCorr under both Pearson and Spearman, internally and on Set-C, and its ordinal threshold-score calibration (ECE 0.056) sits within the other students' range.",
    "CSD tetap peringkat pertama BenefitCorr dengan Pearson maupun Spearman, internal maupun di Set-C, dan kalibrasi skor ambang ordinalnya (ECE 0,056) berada dalam kisaran *student* lain.",
  ),
  boundaries: l(
    "Allowed: “CSD's ShiftL1 is lower than all three baselines (exploratory, 95% CI excludes zero).” Not allowed: “CSD is significant on all three mechanism metrics”, “BenefitCorr is significant”, or “CSD improves QWK”.",
    "Boleh: “ShiftL1 CSD lebih rendah daripada ketiga pembanding (eksploratori, IK 95% tidak memuat nol).” Tidak boleh: “CSD signifikan pada ketiga metrik mekanisme”, “BenefitCorr signifikan”, atau “CSD meningkatkan QWK”.",
  ),
} as const;

export const mechanismMetricMeta: Record<
  MechanismMetricKey,
  {
    key: MechanismMetricKey;
    label: L;
    direction: "lower" | "higher";
    arrow: string;
    description: L;
  }
> = {
  shiftL1: {
    key: "shiftL1",
    label: l("ShiftL1", "ShiftL1"),
    direction: "lower",
    arrow: "↓",
    description: l(
      "Distance between the student's decision shift and the teacher's. Lower means the student reproduces the teacher's dual-view shift more closely.",
      "Jarak antara pergeseran keputusan *student* dan *teacher*. Makin rendah, makin dekat *student* mereproduksi pergeseran *dual-view* milik *teacher*.",
    ),
  },
  cosAgree: {
    key: "cosAgree",
    label: l("Cosine Agreement", "*Cosine Agreement*"),
    direction: "higher",
    arrow: "↑",
    description: l(
      "Whether the student's shift points in the same direction as the teacher's. Higher means better directional agreement.",
      "Apakah pergeseran *student* mengarah ke arah yang sama dengan pergeseran *teacher*. Makin tinggi, makin selaras arahnya.",
    ),
  },
  benefitCorr: {
    key: "benefitCorr",
    label: l("Benefit Correlation", "*Benefit Correlation*"),
    direction: "higher",
    arrow: "↑",
    description: l(
      "Whether the student benefits from the second view on the same samples the teacher does. Higher means the benefit pattern transferred.",
      "Apakah *student* memperoleh manfaat dari *view* kedua pada sampel yang sama dengan *teacher*. Makin tinggi, makin berhasil pola manfaat tersebut ditransfer.",
    ),
  },
};

/**
 * The finding that must never be softened: mechanism fidelity improved, but
 * in-domain predictive QWK did not improve conclusively.
 */
export const rq1Verdict = {
  mechanism: l(
    "CSD transferred the teacher's dual-view decision-shift structure more faithfully than no distillation, logit KD, or feature KD — ranking best on all three mechanism metrics. On ShiftL1 the advantage over every baseline holds with a 95% interval that excludes zero (exploratory supplementary analysis).",
    "CSD mentransfer struktur pergeseran keputusan *dual-view* milik *teacher* dengan lebih setia dibandingkan tanpa distilasi, *logit* KD, maupun *feature* KD — menempati peringkat terbaik pada ketiga metrik mekanisme. Pada ShiftL1, keunggulan atas setiap pembanding bertahan dengan interval 95% yang tidak memuat nol (analisis suplementer eksploratori).",
  ),
  predictive: l(
    "Stronger mechanism fidelity did not translate into a statistically conclusive in-domain QWK improvement: every interval is narrow and includes zero, placing CSD on a par with each baseline.",
    "Fidelitas mekanisme yang lebih kuat tidak menghasilkan peningkatan QWK *in-domain* yang konklusif secara statistik: setiap interval sempit dan memuat nol, sehingga CSD setara dengan setiap *baseline*.",
  ),
  synthesis: l(
    "Taken together, the mechanism transfer was obtained at no measurable cost to predictive accuracy. The dissociation between the two axes is reported as the study's central finding rather than smoothed over — and it has an exact explanation: the final output also depends on how each single view matches the teacher, a term CSD does not target.",
    "Secara keseluruhan, transfer mekanisme diperoleh tanpa biaya yang terukur terhadap akurasi prediktif. Disosiasi antara kedua aspek ini dilaporkan sebagai temuan utama penelitian, bukan disamarkan — dan penjelasannya eksak: output akhir juga bergantung pada kemiripan prediksi tiap *view* dengan *teacher*, suku yang tidak ditargetkan CSD.",
  ),
  comparisons: [
    {
      pair: l("CSD vs No Distillation", "CSD vs Tanpa Distilasi"),
      delta: -0.0024,
      ciLow: -0.0336,
      ciHigh: 0.0285,
      outcome: l("Not conclusive", "Tidak konklusif"),
    },
    {
      pair: l("CSD vs Logit KD", "CSD vs *Logit* KD"),
      delta: 0.0077,
      ciLow: -0.0304,
      ciHigh: 0.0463,
      outcome: l("Not conclusive", "Tidak konklusif"),
    },
    {
      pair: l("CSD vs Feature KD", "CSD vs *Feature* KD"),
      delta: -0.0143,
      ciLow: -0.0445,
      ciHigh: 0.0153,
      outcome: l("Not conclusive", "Tidak konklusif"),
    },
  ],
  note: l(
    "A confidence interval that includes zero is not a claim. These comparisons are reported as null results rather than omitted.",
    "Interval kepercayaan yang memuat nol bukanlah dasar klaim. Perbandingan ini dilaporkan sebagai hasil *null*, bukan dihilangkan.",
  ),
  method: l(
    "Paired cluster bootstrap over 5 matched seeds (B = 10,000; resampling eyes on DRTiD and patients on DeepDRiD), paired permutation tests (P = 10,000), and Holm correction within each family of comparisons.",
    "*Paired cluster bootstrap* pada 5 *seed* berpasangan (B = 10.000; yang di-*resample* adalah mata pada DRTiD dan pasien pada DeepDRiD), uji permutasi berpasangan (P = 10.000), dan koreksi Holm di dalam setiap keluarga perbandingan.",
  ),
} as const;

/* -------------------------------------------------------------------------- */
/* RQ2 — efficiency                                                            */
/* -------------------------------------------------------------------------- */

export interface EfficiencyRow {
  /** Variant names are technical labels and stay identical in both languages. */
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

/**
 * Pre-registered RQ2 comparisons on the internal test set, from
 * `table_statistics.csv`. `pHolm` is the Holm-adjusted permutation p-value.
 */
export const rq2Comparisons = [
  { pair: "PTQ INT8 vs FP32", delta: -0.0164, ciLow: -0.036, ciHigh: 0.0023, pHolm: 0.0243 },
  { pair: "QAT INT8 vs FP32", delta: -0.0063, ciLow: -0.0293, ciHigh: 0.0175, pHolm: 0.4854 },
  { pair: "QAT INT8 vs PTQ INT8", delta: 0.0101, ciLow: -0.0179, ciHigh: 0.0411, pHolm: 0.4854 },
] as const;

/** Supplementary control: QAT against an FP32 student given the same extra epochs. */
export const rq2ControlComparison = {
  pair: "QAT INT8 vs FP32 fine-tune control",
  delta: -0.017,
  ciLow: -0.0378,
  ciHigh: 0.0049,
  pHolm: 0.0552,
} as const;

export const rq2Verdict = {
  headline: l(
    "INT8 quantization cut single-thread CPU latency about 2.9× and artifact size 1.36× against the FP32 student, and every pre-registered bootstrap interval for the QWK change includes zero.",
    "Kuantisasi INT8 memangkas latensi CPU *single-thread* sekitar 2,9× dan ukuran artefak 1,36× dibandingkan *student* FP32, dan setiap interval *bootstrap* pra-registrasi untuk perubahan QWK memuat nol.",
  ),
  disagreement: l(
    "For PTQ INT8 versus FP32 the bootstrap interval includes zero, but the Holm-adjusted permutation test gives p = 0.024. The protocol reports both and claims neither equivalence nor degradation.",
    "Untuk PTQ INT8 dibandingkan FP32, interval *bootstrap* memuat nol, tetapi uji permutasi yang dikoreksi Holm memberikan p = 0,024. Protokol melaporkan keduanya dan tidak mengklaim kesetaraan maupun penurunan.",
  ),
  control: l(
    "A matched FP32 fine-tuning control — the same extra epochs, without fake quantization — separates the effect of quantization from the effect of extra training. QAT INT8 against that control is not a credible difference.",
    "Kontrol *fine-tuning* FP32 yang setara — tambahan *epoch* yang sama, tanpa *fake quantization* — memisahkan efek kuantisasi dari efek pelatihan tambahan. Perbandingan QAT INT8 terhadap kontrol tersebut tidak menunjukkan perbedaan yang kredibel.",
  ),
  caution: l(
    "Quantization reduces computational cost. It does not improve grading accuracy, and this site does not claim that it does.",
    "Kuantisasi menurunkan biaya komputasi. Kuantisasi tidak meningkatkan akurasi *grading*, dan situs ini tidak mengklaim demikian.",
  ),
} as const;

/* -------------------------------------------------------------------------- */
/* External validation — DeepDRiD Set-C                                        */
/* -------------------------------------------------------------------------- */

export interface ExternalRow {
  model: L;
  qwk: number;
  isTeacher: boolean;
  isSelected: boolean;
}

export const externalValidation: ExternalRow[] = [
  { model: l("Teacher", "*Teacher*"), qwk: 0.7923, isTeacher: true, isSelected: false },
  { model: l("PTQ INT8", "PTQ INT8"), qwk: 0.6729, isTeacher: false, isSelected: false },
  { model: l("Student FP32 (CSD)", "*Student* FP32 (CSD)"), qwk: 0.6688, isTeacher: false, isSelected: false },
  { model: l("FP32 fine-tune control", "Kontrol *fine-tune* FP32"), qwk: 0.6567, isTeacher: false, isSelected: false },
  { model: l("FT-PTQ INT8", "FT-PTQ INT8"), qwk: 0.6513, isTeacher: false, isSelected: false },
  { model: l("QAT INT8", "QAT INT8"), qwk: 0.6344, isTeacher: false, isSelected: true },
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

export const externalCaveat = l(
  "External results are reported as supporting evidence. Most paired intervals on Set-C include zero, so no ranking among the student variants should be read from the bar heights alone.",
  "Hasil eksternal dilaporkan sebagai bukti pendukung. Sebagian besar interval berpasangan pada Set-C memuat nol, sehingga urutan antarvarian *student* tidak boleh disimpulkan hanya dari tinggi batang.",
);

/**
 * The only paired Set-C comparisons whose interval excludes zero, from
 * `table_external_paired.csv`. Both go against the deployed QAT artifact, which
 * is exactly why they are shown.
 */
export const externalCredibleFindings = [
  {
    pair: "QAT INT8 vs PTQ INT8",
    metric: "QWK",
    delta: -0.0384,
    ciLow: -0.0826,
    ciHigh: -0.0006,
    meaning: l("QAT agrees less with the reference than PTQ", "QAT kurang sesuai dengan referensi dibandingkan PTQ"),
  },
  {
    pair: "QAT INT8 vs FP32",
    metric: "SER",
    delta: 0.032,
    ciLow: 0.001,
    ciHigh: 0.069,
    meaning: l(
      "QAT misses by two or more grades more often than FP32",
      "QAT lebih sering meleset dua *grade* atau lebih dibandingkan FP32",
    ),
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Limitations — reported deliberately, because they are what make the rest     */
/* credible.                                                                   */
/* -------------------------------------------------------------------------- */

export const limitations = [
  {
    title: l("Moderate absolute QWK", "QWK absolut masih moderat"),
    body: l(
      "Agreement is moderate rather than high — 0.7364 for the teacher and 0.6018 for the student on the internal test set. DR-VERGE is positioned as a research contribution on distillation mechanism and deployability, not as a state-of-the-art grading system.",
      "Tingkat kesepakatan tergolong moderat, bukan tinggi — 0,7364 untuk *teacher* dan 0,6018 untuk *student* pada data uji internal. DR-VERGE diposisikan sebagai kontribusi penelitian pada mekanisme distilasi dan kesiapan *deployment*, bukan sebagai sistem *grading state-of-the-art*.",
    ),
  },
  {
    title: l("Relatively low Macro-F1", "Macro-F1 relatif rendah"),
    body: l(
      "Aggregate ordinal agreement is far better than per-class balance, which means the rare grades are recognised less reliably than the common ones.",
      "Kesepakatan ordinal agregat jauh lebih baik daripada keseimbangan per kelas, sehingga *grade* yang jarang dikenali kurang andal dibandingkan *grade* yang umum.",
    ),
  },
  {
    title: l("Mild NPDR is the weakest grade", "NPDR ringan adalah *grade* terlemah"),
    body: l(
      "Grade 1 recall for the CSD student averages 0.068 on the internal test set and 0.044 on DeepDRiD Set-C; the teacher recalls none of the Mild NPDR eyes in either. Early NPDR is the grade the system misses most often, and it is also the grade on which human graders agree least.",
      "*Recall* *Grade* 1 untuk *student* CSD rata-rata 0,068 pada data uji internal dan 0,044 pada DeepDRiD Set-C; *teacher* tidak mengenali satu pun mata NPDR ringan pada keduanya. NPDR tahap awal adalah *grade* yang paling sering terlewat oleh sistem, sekaligus *grade* yang paling jarang disepakati oleh *grader* manusia.",
    ),
  },
  {
    title: l("Two-grade errors are still common", "Kesalahan dua *grade* masih sering terjadi"),
    body: l(
      "The CORAL head never produces an incoherent threshold order, and 74.2% of predictions land within one grade of the reference. But exact agreement is 50.3%, and 25.8% of internal test eyes are graded two or more steps away (teacher: 17.6%). In a clinical context those are the consequential errors.",
      "*Head* CORAL tidak pernah menghasilkan urutan ambang yang tidak koheren, dan 74,2% prediksi berada dalam jarak satu *grade* dari referensi. Namun, kesesuaian tepat hanya 50,3%, dan 25,8% mata pada data uji internal dinilai meleset dua tingkat atau lebih (*teacher*: 17,6%). Dalam konteks klinis, kesalahan seperti itulah yang berdampak.",
    ),
  },
  {
    title: l("Input resolution bounds the smallest lesions", "Resolusi masukan membatasi deteksi lesi terkecil"),
    body: l(
      "Stage A selected 384x384 over 224x224 by a wide margin, but microaneurysms are among the smallest lesions defining early DR and may still not survive downsampling.",
      "Tahap A memilih 384x384 dibandingkan 224x224 dengan selisih yang lebar, tetapi mikroaneurisma termasuk lesi terkecil penanda DR tahap awal dan bisa saja tetap hilang saat citra diperkecil (*downsampling*).",
    ),
  },
  {
    title: l("Mechanism gain is not a predictive guarantee", "Keunggulan mekanisme bukan jaminan prediktif"),
    body: l(
      "CSD transferred the decision-shift structure more faithfully, yet that did not produce a statistically conclusive in-domain QWK improvement. The decomposition identity shows why the two can separate. They are separate claims and are reported separately.",
      "CSD mentransfer struktur pergeseran keputusan dengan lebih setia, tetapi hal itu tidak menghasilkan peningkatan QWK *in-domain* yang konklusif secara statistik. Identitas dekomposisi menunjukkan mengapa keduanya dapat terpisah. Keduanya merupakan klaim terpisah dan dilaporkan secara terpisah.",
    ),
  },
  {
    title: l("Mechanism inference is exploratory", "Inferensi mekanisme bersifat eksploratori"),
    body: l(
      "The supplementary analysis was designed after the main results were known and rests on five models per condition. Only 4 of 9 internal contrasts are conclusive; BenefitCorr points toward CSD but its intervals include zero, the nine intervals are not multiplicity-corrected, and DRTiD's resampling unit is the examined eye, not the patient.",
      "Analisis suplementer dirancang setelah hasil utama diketahui dan didasarkan pada lima model per kondisi. Hanya 4 dari 9 kontras internal yang konklusif; BenefitCorr searah dengan CSD tetapi intervalnya memuat nol, kesembilan interval belum dikoreksi multiplisitas, dan unit resampling DRTiD adalah mata, bukan pasien.",
    ),
  },
  {
    title: l("Methods are closely matched on accuracy", "Akurasi antarmetode sangat berdekatan"),
    body: l(
      "All four distillation conditions fall within a narrow QWK band (0.5942–0.6161), and the paired differences between them are smaller than their seed-to-seed spread. This is why the mechanism axis, not the accuracy axis, is where the contribution is claimed.",
      "Keempat kondisi distilasi berada dalam rentang QWK yang sempit (0,5942–0,6161), dan selisih berpasangan antarmetode lebih kecil daripada sebaran antar-*seed*-nya. Karena itulah kontribusi diklaim pada aspek mekanisme, bukan pada aspek akurasi.",
    ),
  },
  {
    title: l("Deployment choice and external result disagree", "Pilihan *deployment* dan hasil eksternal tidak sejalan"),
    body: l(
      "The frozen deployment rule chose QAT INT8 for its 99.0% validation retention. On DeepDRiD Set-C, that same artifact scored credibly below PTQ INT8 (ΔQWK −0.0384) and missed by two or more grades credibly more often than FP32. The rule was fixed before testing, so the choice stands — but an internal selection criterion did not predict external behaviour.",
      "Aturan *deployment* yang telah dibekukan memilih QAT INT8 karena retensi validasinya 99,0%. Pada DeepDRiD Set-C, artefak yang sama justru secara kredibel lebih rendah daripada PTQ INT8 (ΔQWK −0,0384) dan secara kredibel lebih sering meleset dua *grade* atau lebih dibandingkan FP32. Aturan itu ditetapkan sebelum pengujian sehingga pilihannya tetap sah — tetapi kriteria seleksi internal tidak memprediksi perilaku eksternal.",
    ),
  },
  {
    title: l("Single teacher run, three-seed ablations", "*Teacher* dilatih sekali, ablasi tiga *seed*"),
    body: l(
      "The teacher was trained once, so its numbers are single values with no seed variance. The three CSD ablations used three seeds and were not tested statistically, so a higher ablation mean is not a claim.",
      "*Teacher* hanya dilatih satu kali, sehingga angkanya adalah nilai tunggal tanpa variasi antar-*seed*. Tiga ablasi CSD menggunakan tiga *seed* dan tidak diuji secara statistik, sehingga rerata ablasi yang lebih tinggi bukanlah dasar klaim.",
    ),
  },
  {
    title: l("Public-dataset generalizability", "Generalisasi dari dataset publik"),
    body: l(
      "All evaluation used public datasets with their own acquisition characteristics. Performance on other populations, cameras, or protocols is unknown.",
      "Seluruh evaluasi menggunakan dataset publik dengan karakteristik akuisisinya masing-masing. Performa pada populasi, kamera, atau protokol lain belum diketahui.",
    ),
  },
  {
    title: l("Research prototype, not clinical validation", "Prototipe penelitian, bukan validasi klinis"),
    body: l(
      "No prospective clinical study, regulatory evaluation, or deployment validation has been carried out.",
      "Belum ada studi klinis prospektif, evaluasi regulasi, maupun validasi *deployment* yang dilakukan.",
    ),
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Datasets and pipeline                                                       */
/* -------------------------------------------------------------------------- */

export const datasets = [
  {
    name: "DRTiD",
    role: l("Primary dual-view dataset", "Dataset *dual-view* utama"),
    detail: l(
      "Paired macula-centered and optic-disc-centered fields, 800 / 200 / 550 eyes",
      "Pasangan *field* berpusat makula dan diskus optik, 800 / 200 / 550 mata",
    ),
  },
  {
    name: "APTOS 2019",
    role: l("Backbone pretraining", "Pra-pelatihan *backbone*"),
    detail: l(
      "Single-field fundus images used to warm-start both backbones",
      "Citra fundus *single-field* untuk inisialisasi awal kedua *backbone*",
    ),
  },
  {
    name: "DeepDRiD",
    role: l("External validation", "Validasi eksternal"),
    detail: l(
      "Set-C reserved as the confirmatory partition, frozen until the end",
      "Set-C dicadangkan sebagai partisi konfirmatori dan dibekukan hingga tahap akhir",
    ),
  },
] as const;

export const pipelineStages = [
  {
    step: "01",
    title: l("Recipe Selection", "Pemilihan Konfigurasi"),
    body: l(
      "Resolution and sampling are chosen on validation before the teacher exists, so the choice cannot be shaped by later results. 384x384 was selected.",
      "Resolusi dan metode *sampling* dipilih pada data validasi sebelum *teacher* dilatih, sehingga pilihan tersebut tidak dapat dipengaruhi oleh hasil selanjutnya. Resolusi 384x384 terpilih.",
    ),
  },
  {
    step: "02",
    title: l("APTOS Pretraining", "Pra-pelatihan APTOS"),
    body: l(
      "Both backbones are warm-started on single-field fundus images.",
      "Kedua *backbone* diinisialisasi awal menggunakan citra fundus *single-field*.",
    ),
  },
  {
    step: "03",
    title: l("Dual-View Teacher", "*Teacher Dual-View*"),
    body: l(
      "An ImageNet- and APTOS-initialised ResNet-50 teacher learns from both fields jointly and reaches 0.7364 test QWK.",
      "*Teacher* ResNet-50 yang diinisialisasi dari ImageNet dan APTOS belajar dari kedua *field* secara bersamaan dan mencapai QWK uji 0,7364.",
    ),
  },
  {
    step: "04",
    title: l("Lightweight Student", "*Lightweight Student*"),
    body: l(
      "A 328K-parameter dual-view student, with no ImageNet weights, is trained from its APTOS-pretrained backbone across five seeds.",
      "*Student dual-view* dengan 328 ribu parameter, tanpa bobot ImageNet, dilatih dari *backbone* hasil pra-pelatihan APTOS pada lima *seed*.",
    ),
  },
  {
    step: "05",
    title: l("Knowledge Distillation", "*Knowledge Distillation*"),
    body: l(
      "Logit KD and feature KD baselines are tuned over three seeds and frozen.",
      "*Baseline logit* KD dan *feature* KD disetel pada tiga *seed*, lalu dibekukan.",
    ),
  },
  {
    step: "06",
    title: l("Complementarity-Shift Distillation", "*Complementarity-Shift Distillation*"),
    body: l(
      "The teacher's dual-view decision shift is transferred to the student.",
      "Pergeseran keputusan *dual-view* milik *teacher* ditransfer ke *student*.",
    ),
    isContribution: true,
  },
  {
    step: "07",
    title: l("Threshold Calibration", "Kalibrasi Ambang"),
    body: l(
      "One global decision threshold per condition is fitted on validation only.",
      "Satu ambang keputusan global untuk setiap kondisi ditentukan hanya dari data validasi.",
    ),
  },
  {
    step: "08",
    title: l("INT8 Quantization", "Kuantisasi INT8"),
    body: l(
      "PTQ, QAT and FT-PTQ are applied under a matched operator scope, with an FP32 fine-tuning control.",
      "PTQ, QAT, dan FT-PTQ diterapkan dengan cakupan operator yang setara, disertai kontrol *fine-tuning* FP32.",
    ),
  },
  {
    step: "09",
    title: l("External Evaluation", "Evaluasi Eksternal"),
    body: l(
      "Five matched seeds are evaluated once on the frozen DeepDRiD Set-C partition.",
      "Lima *seed* berpasangan dievaluasi satu kali pada partisi DeepDRiD Set-C yang dibekukan.",
    ),
  },
  {
    step: "10",
    title: l("Deployment", "*Deployment*"),
    body: l(
      "The selected INT8 artifact is exported and verified to reload from disk.",
      "Artefak INT8 terpilih diekspor dan diverifikasi dapat dimuat ulang dari *disk*.",
    ),
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Research figures (real assets from the evaluation run, grayscaled)           */
/* -------------------------------------------------------------------------- */

export interface ResearchFigure {
  id: string;
  src: string;
  title: L;
  caption: L;
}

const FIG = "/research/figures";

export const researchFigures: Record<string, ResearchFigure> = {
  architecture: {
    id: "fig_01_architecture",
    src: `${FIG}/fig_01_architecture.png`,
    title: l("Figure 1 — DR-VERGE architecture", "Gambar 1 — Arsitektur DR-VERGE"),
    caption: l(
      "The teacher produces dual and single-view cumulative probabilities; their difference is the complementarity shift distilled into the lightweight student.",
      "*Teacher* menghasilkan probabilitas kumulatif *dual-view* dan *single-view*; selisih keduanya adalah *complementarity shift* yang didistilasi ke *lightweight student*.",
    ),
  },
  dataset: {
    id: "fig_01_dataset",
    src: `${FIG}/fig_01_dataset.png`,
    title: l("Figure 2 — Dataset composition", "Gambar 2 — Komposisi dataset"),
    caption: l(
      "DRTiD eye counts per split and grade: 800 training, 200 validation and 550 test eyes. The rarest grades are a small fraction of training, which is why the train/validation split is stratified.",
      "Jumlah mata DRTiD per partisi dan *grade*: 800 mata latih, 200 mata validasi, dan 550 mata uji. *Grade* yang paling jarang hanya mengisi sebagian kecil data latih, sehingga pembagian data latih/validasi dilakukan secara terstratifikasi.",
    ),
  },
  workflow: {
    id: "fig_02_experimental_workflow",
    src: `${FIG}/fig_02_experimental_workflow.png`,
    title: l("Figure 3 — Experimental workflow", "Gambar 3 — Alur eksperimen"),
    caption: l(
      "All selection happens on validation. The DRTiD test set is evaluated once within the run and DeepDRiD stays frozen until the very end.",
      "Seluruh pemilihan dilakukan pada data validasi. Data uji DRTiD dievaluasi satu kali dalam *run*, dan DeepDRiD tetap dibekukan hingga tahap paling akhir.",
    ),
  },
  performance: {
    id: "fig_02_performance",
    src: `${FIG}/fig_02_performance.png`,
    title: l("Figure 4 — Predictive performance", "Gambar 4 — Performa prediktif"),
    caption: l(
      "Mean ± standard deviation across five matched seeds on the internal test set. The four distillation conditions sit within a narrow band, which is why the mechanism metrics carry the RQ1 argument.",
      "Rerata ± simpangan baku dari lima *seed* berpasangan pada data uji internal. Keempat kondisi distilasi berada dalam rentang yang sempit, sehingga argumen RQ1 bertumpu pada metrik mekanisme.",
    ),
  },
  ordinalSafety: {
    id: "fig_03_ordinal_safety",
    src: `${FIG}/fig_03_ordinal_safety.png`,
    title: l("Figure 5 — Ordinal safety", "Gambar 5 — Keamanan ordinal"),
    caption: l(
      "A severe error is a prediction two or more grades from the reference — the clinically consequential mistake.",
      "*Severe error* adalah prediksi yang meleset dua *grade* atau lebih dari referensi — jenis kesalahan yang berdampak secara klinis.",
    ),
  },
  perGradeRecall: {
    id: "fig_04_per_grade_recall",
    src: `${FIG}/fig_04_per_grade_recall.png`,
    title: l("Figure 6 — Per-grade recall", "Gambar 6 — *Recall* per *grade*"),
    caption: l(
      "Per-grade recall. The system is strongest at the ends of the ordinal scale; Mild NPDR is the weakest grade and is also the one human readers agree on least.",
      "*Recall* per *grade*. Sistem paling kuat di kedua ujung skala ordinal; NPDR ringan adalah *grade* terlemah sekaligus *grade* yang paling jarang disepakati oleh pembaca manusia.",
    ),
  },
  confusion: {
    id: "fig_05_confusion",
    src: `${FIG}/fig_05_confusion.png`,
    title: l("Figure 7 — Confusion matrices", "Gambar 7 — *Confusion matrix*"),
    caption: l("Row-normalized confusion matrices.", "*Confusion matrix* yang dinormalisasi per baris."),
  },
  dualViewGain: {
    id: "fig_06_dual_view_gain",
    src: `${FIG}/fig_06_dual_view_gain.png`,
    title: l("Figure 8 — Dual-view gain", "Gambar 8 — *Dual-view gain*"),
    caption: l(
      "G_aux compares the dual head against the model's own auxiliary heads; G_independent compares against independently trained single-view students on the same seed.",
      "G_aux membandingkan *dual head* dengan *auxiliary head* milik model itu sendiri; G_independent membandingkan dengan *student single-view* yang dilatih terpisah pada *seed* yang sama.",
    ),
  },
  csdMechanism: {
    id: "fig_07_csd_mechanism",
    src: `${FIG}/fig_07_csd_mechanism.png`,
    title: l("Figure 9 — CSD mechanism", "Gambar 9 — Mekanisme CSD"),
    caption: l(
      "Lower ShiftL1 means the student's decision-shift structure is closer to the teacher's; higher CosAgree means the shift points the same way; higher BenefitCorr means the student gains from the dual view on the same samples the teacher does.",
      "ShiftL1 yang lebih rendah berarti struktur pergeseran keputusan *student* lebih dekat dengan *teacher*; CosAgree yang lebih tinggi berarti arah pergeserannya sama; BenefitCorr yang lebih tinggi berarti *student* memperoleh manfaat *dual-view* pada sampel yang sama dengan *teacher*.",
    ),
  },
  csdGradient: {
    id: "fig_08_csd_gradient",
    src: `${FIG}/fig_08_csd_gradient.png`,
    title: l("Figure 10 — CSD gradient balance", "Gambar 10 — Keseimbangan gradien CSD"),
    caption: l(
      "Ratio of the CSD gradient to the task gradient on the shared backbone. At the selected weight the ratio is 0.5335, so the shift objective contributes a real signal without overwhelming the grading task.",
      "Rasio gradien CSD terhadap gradien tugas pada *shared backbone*. Pada bobot terpilih rasionya 0,5335, sehingga objektif pergeseran memberikan sinyal yang nyata tanpa mendominasi tugas *grading*.",
    ),
  },
  retention: {
    id: "fig_09_retention",
    src: `${FIG}/fig_09_retention.png`,
    title: l("Figure 11 — Quantization retention", "Gambar 11 — Retensi setelah kuantisasi"),
    caption: l(
      "Retention relative to the FP32 model. The 95% line is a pre-specified engineering criterion for choosing an artifact, not a clinical margin.",
      "Retensi relatif terhadap model FP32. Garis 95% adalah kriteria rekayasa yang ditetapkan sebelumnya untuk memilih artefak, bukan margin klinis.",
    ),
  },
  efficiency: {
    id: "fig_10_efficiency",
    src: `${FIG}/fig_10_efficiency.png`,
    title: l("Figure 12 — Size and latency", "Gambar 12 — Ukuran dan latensi"),
    caption: l(
      "Serialized state_dict size and single-thread CPU latency (median of five blocks).",
      "Ukuran *state_dict* yang diserialisasi dan latensi CPU *single-thread* (median dari lima blok).",
    ),
  },
  pareto: {
    id: "fig_11_pareto",
    src: `${FIG}/fig_11_pareto.png`,
    title: l("Figure 13 — Performance/efficiency trade-off", "Gambar 13 — *Trade-off* performa dan efisiensi"),
    caption: l(
      "QWK against CPU latency. Points closer to the top-left indicate a more favourable trade-off.",
      "QWK terhadap latensi CPU. Titik yang makin dekat ke kiri atas menunjukkan *trade-off* yang makin menguntungkan.",
    ),
  },
  forest: {
    id: "fig_12_forest",
    src: `${FIG}/fig_12_forest.png`,
    title: l("Figure 14 — Forest plot of every comparison", "Gambar 14 — *Forest plot* seluruh perbandingan"),
    caption: l(
      "Every pre-registered QWK comparison. The point is the observed paired difference and the bar is the bootstrap interval. An interval crossing zero is not a claim.",
      "Seluruh perbandingan QWK yang telah dipra-registrasi. Titik menunjukkan selisih berpasangan yang teramati dan batang menunjukkan interval *bootstrap*. Interval yang melintasi nol bukanlah dasar klaim.",
    ),
  },
  externalSetC: {
    id: "fig_13_external_setc",
    src: `${FIG}/fig_13_external_setc.png`,
    title: l("Figure 15 — External evaluation, DeepDRiD Set-C", "Gambar 15 — Evaluasi eksternal, DeepDRiD Set-C"),
    caption: l(
      "The confirmatory external partition. No tuning, threshold adjustment, or selection happened here.",
      "Partisi eksternal konfirmatori. Tidak ada penyetelan, penyesuaian ambang, maupun pemilihan model yang dilakukan di sini.",
    ),
  },
  mechanismForest: {
    id: "fig_mechanism_effect_forest",
    src: `${FIG}/fig_mechanism_effect_forest.png`,
    title: l("Figure 17 — Mechanism-fidelity contrasts", "Gambar 17 — Kontras fidelitas mekanisme"),
    caption: l(
      "CSD minus each baseline on the internal test set, with 95% hierarchical-bootstrap intervals (B = 10,000). Lower ShiftL1 and higher CosAgree/BenefitCorr favour CSD. Exploratory.",
      "CSD dikurangi tiap pembanding pada data uji internal, dengan interval 95% *hierarchical bootstrap* (B = 10.000). ShiftL1 lebih rendah serta CosAgree/BenefitCorr lebih tinggi menguntungkan CSD. Eksploratori.",
    ),
  },
  internalExternalMechanism: {
    id: "fig_internal_external_mechanism",
    src: `${FIG}/fig_internal_external_mechanism.png`,
    title: l("Figure 18 — Mechanism fidelity, internal and Set-C", "Gambar 18 — Fidelitas mekanisme, internal dan Set-C"),
    caption: l(
      "Circles: DRTiD internal test (resampling examined-eye records, n = 550). Squares: DeepDRiD Set-C (resampling patients, 100 patients / 200 eyes). Filled markers are intervals that exclude zero.",
      "Lingkaran: data uji internal DRTiD (resampling *examined-eye record*, n = 550). Persegi: DeepDRiD Set-C (resampling pasien, 100 pasien / 200 mata). Penanda terisi adalah interval yang tidak memuat nol.",
    ),
  },
  decomposition: {
    id: "fig_mechanism_decomposition",
    src: `${FIG}/fig_mechanism_decomposition.png`,
    title: l("Figure 19 — Mechanism–prediction decomposition", "Gambar 19 — Dekomposisi mekanisme–prediksi"),
    caption: l(
      "Shift gap, base-aggregation gap and final-output gap to the teacher for each condition. CSD minimises the shift gap it targets; the base-aggregation gap, which it does not target, is the one QWK tracks more closely.",
      "Selisih *shift*, selisih agregasi dasar, dan selisih output akhir terhadap *teacher* untuk tiap kondisi. CSD meminimalkan selisih *shift* yang ditargetkannya; selisih agregasi dasar, yang tidak ditargetkannya, lebih erat berkaitan dengan QWK.",
    ),
  },
  confusionCore: {
    id: "fig_confusion_core_models",
    src: `${FIG}/fig_confusion_core_models.png`,
    title: l("Figure 20 — Confusion matrices, core models", "Gambar 20 — *Confusion matrix* model inti"),
    caption: l(
      "Row-normalised; the diagonal is recall. Grade 1 is the weak spot for every model, the teacher included, and its errors lean toward Grade 0.",
      "Ternormalisasi per baris; diagonal adalah *recall*. Grade 1 menjadi titik lemah semua model, termasuk *teacher*, dan kesalahannya condong ke Grade 0.",
    ),
  },
  internalVsExternal: {
    id: "fig_14_internal_vs_external",
    src: `${FIG}/fig_14_internal_vs_external.png`,
    title: l("Figure 16 — Internal versus external", "Gambar 16 — Internal dibandingkan eksternal"),
    caption: l(
      "A drop on Set-C is a domain-shift finding to report, not something to tune away.",
      "Penurunan pada Set-C adalah temuan pergeseran domain yang perlu dilaporkan, bukan sesuatu yang dihilangkan dengan penyetelan.",
    ),
  },
};
