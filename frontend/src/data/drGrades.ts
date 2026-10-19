/**
 * The five ordinal DR grades.
 *
 * Retinal findings follow the International Clinical Diabetic Retinopathy (ICDR)
 * severity scale (Wilkinson et al., Ophthalmology 2003), the 0-4 scale DRTiD,
 * APTOS 2019 and DeepDRiD are labelled on.
 *
 * Descriptions are short and educational ONLY. They deliberately contain no
 * treatment advice, no medication guidance, no diagnostic confirmation, and no
 * urgency instruction — the site is a research showcase, and a visitor reading a
 * grade here must be pointed to a clinician rather than to an action.
 *
 * `name` stays in English because the inference service reports it; the
 * displayed text in either language comes from `gradeText()`.
 */

import { l, type L, type Lang } from "@/i18n/context";

interface GradeCopy {
  name: string;
  shortName: string;
  /** One-line educational description. */
  description: string;
  /** What the grade means in terms of retinal findings, in plain language. */
  detail: string;
}

export interface DrGrade extends GradeCopy {
  grade: number;
  /** Two-digit form used in the large output display. */
  display: string;
  /** Indonesian copy, same meaning. */
  idCopy: GradeCopy;
}

export const drGrades: DrGrade[] = [
  {
    grade: 0,
    display: "00",
    name: "No DR",
    shortName: "No DR",
    description: "No diabetic retinopathy identified in the analysed views.",
    detail:
      "The model did not identify retinal features it associates with diabetic retinopathy. Routine screening intervals are determined by a clinician, not by this tool.",
    idCopy: {
      name: "Tanpa DR",
      shortName: "Tanpa DR",
      description: "Tidak teridentifikasi retinopati diabetik pada citra yang dianalisis.",
      detail:
        "Model tidak mengidentifikasi ciri retina yang diasosiasikannya dengan retinopati diabetik. Interval skrining rutin ditentukan oleh klinisi, bukan oleh alat ini.",
    },
  },
  {
    grade: 1,
    display: "01",
    name: "Mild NPDR",
    shortName: "Mild",
    description: "Mild non-proliferative diabetic retinopathy.",
    detail:
      "The earliest stage: microaneurysms only, under the ICDR scale. Microaneurysms are among the smallest retinal features and are the hardest for any automated system to detect reliably.",
    idCopy: {
      name: "NPDR Ringan",
      shortName: "Ringan",
      description: "Retinopati diabetik non-proliferatif ringan.",
      detail:
        "Tahap paling awal: hanya terdapat mikroaneurisma, menurut skala ICDR. Mikroaneurisma termasuk ciri retina terkecil dan paling sulit dideteksi secara andal oleh sistem otomatis mana pun.",
    },
  },
  {
    grade: 2,
    display: "02",
    name: "Moderate NPDR",
    shortName: "Moderate",
    description: "Moderate non-proliferative diabetic retinopathy.",
    detail:
      "More than microaneurysms alone — for example retinal haemorrhages or hard exudates — but short of the severe criteria. Screening programmes commonly treat moderate NPDR or worse as referable.",
    idCopy: {
      name: "NPDR Sedang",
      shortName: "Sedang",
      description: "Retinopati diabetik non-proliferatif sedang.",
      detail:
        "Lebih dari sekadar mikroaneurisma — misalnya perdarahan retina atau eksudat keras — tetapi belum memenuhi kriteria berat. Program skrining umumnya menganggap NPDR sedang atau lebih berat sebagai kasus yang perlu dirujuk.",
    },
  },
  {
    grade: 3,
    display: "03",
    name: "Severe NPDR",
    shortName: "Severe",
    description: "Severe non-proliferative diabetic retinopathy.",
    detail:
      "An advanced non-proliferative stage, defined by the \"4-2-1\" rule: more than 20 haemorrhages in each of the four quadrants, definite venous beading in two or more, or prominent intraretinal microvascular abnormalities in one or more — with no new vessels. Clinical guidelines treat this stage as requiring specialist assessment.",
    idCopy: {
      name: "NPDR Berat",
      shortName: "Berat",
      description: "Retinopati diabetik non-proliferatif berat.",
      detail:
        "Tahap non-proliferatif lanjut yang didefinisikan dengan aturan \"4-2-1\": lebih dari 20 perdarahan di setiap kuadran dari keempat kuadran, *venous beading* yang jelas di dua kuadran atau lebih, atau kelainan mikrovaskular intraretina yang menonjol di satu kuadran atau lebih — tanpa pembuluh darah baru. Pedoman klinis menyatakan tahap ini memerlukan pemeriksaan oleh dokter spesialis.",
    },
  },
  {
    grade: 4,
    display: "04",
    name: "Proliferative DR",
    shortName: "Proliferative",
    description: "Proliferative diabetic retinopathy.",
    detail:
      "The most advanced stage on this scale: growth of new, fragile blood vessels (neovascularisation), or bleeding into the vitreous or in front of the retina. Specialist ophthalmic assessment is indicated.",
    idCopy: {
      name: "DR Proliferatif",
      shortName: "Proliferatif",
      description: "Retinopati diabetik proliferatif.",
      detail:
        "Tahap paling lanjut pada skala ini: tumbuhnya pembuluh darah baru yang rapuh (neovaskularisasi), atau perdarahan ke dalam vitreus maupun di depan retina. Pemeriksaan oleh dokter spesialis mata diperlukan.",
    },
  },
];

/** Safe lookup — an out-of-range grade from an API must not crash the UI. */
export function getGrade(grade: number | null | undefined): DrGrade | null {
  if (grade === null || grade === undefined || !Number.isFinite(grade)) return null;
  return drGrades.find((g) => g.grade === grade) ?? null;
}

/** The grade's copy in the reader's language. */
export function gradeText(grade: DrGrade, lang: Lang): GradeCopy {
  return lang === "id" ? grade.idCopy : grade;
}

export const GRADE_CONSULT_NOTE =
  "Please consult an ophthalmologist for clinical interpretation.";

export const GRADE_CONSULT_NOTE_L: L = l(
  GRADE_CONSULT_NOTE,
  "Silakan berkonsultasi dengan dokter spesialis mata untuk interpretasi klinis.",
);

/** Labels for the four cumulative ordinal thresholds the CORAL head produces. */
export const ordinalThresholdLabels = [
  { key: "P(Y > 0)", meaning: l("Any diabetic retinopathy present", "Terdapat retinopati diabetik") },
  { key: "P(Y > 1)", meaning: l("Beyond mild NPDR", "Lebih berat dari NPDR ringan") },
  { key: "P(Y > 2)", meaning: l("Beyond moderate NPDR", "Lebih berat dari NPDR sedang") },
  { key: "P(Y > 3)", meaning: l("Beyond severe NPDR", "Lebih berat dari NPDR berat") },
] as const;
