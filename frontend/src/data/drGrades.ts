/**
 * The five ordinal DR grades.
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
      "The earliest stage, characterised in the literature by microaneurysms. These are among the smallest retinal features and are the hardest for any automated system to detect reliably.",
    idCopy: {
      name: "NPDR Ringan",
      shortName: "Ringan",
      description: "Retinopati diabetik non-proliferatif ringan.",
      detail:
        "Tahap paling awal, yang dalam literatur dicirikan oleh mikroaneurisma. Mikroaneurisma termasuk ciri retina terkecil dan paling sulit dideteksi secara andal oleh sistem otomatis mana pun.",
    },
  },
  {
    grade: 2,
    display: "02",
    name: "Moderate NPDR",
    shortName: "Moderate",
    description: "Moderate non-proliferative diabetic retinopathy.",
    detail:
      "An intermediate stage in which more extensive retinal changes are typically described, beyond isolated microaneurysms.",
    idCopy: {
      name: "NPDR Sedang",
      shortName: "Sedang",
      description: "Retinopati diabetik non-proliferatif sedang.",
      detail:
        "Tahap menengah, ketika perubahan retina yang lebih luas umumnya dijumpai, tidak hanya mikroaneurisma yang terisolasi.",
    },
  },
  {
    grade: 3,
    display: "03",
    name: "Severe NPDR",
    shortName: "Severe",
    description: "Severe non-proliferative diabetic retinopathy.",
    detail:
      "An advanced non-proliferative stage. Clinical guidelines treat this stage as requiring specialist assessment.",
    idCopy: {
      name: "NPDR Berat",
      shortName: "Berat",
      description: "Retinopati diabetik non-proliferatif berat.",
      detail:
        "Tahap non-proliferatif lanjut. Pedoman klinis menyatakan tahap ini memerlukan pemeriksaan oleh dokter spesialis.",
    },
  },
  {
    grade: 4,
    display: "04",
    name: "Proliferative DR",
    shortName: "Proliferative",
    description: "Proliferative diabetic retinopathy.",
    detail:
      "The most advanced stage in this grading scale, associated in the literature with new vessel growth. Specialist ophthalmic assessment is indicated.",
    idCopy: {
      name: "DR Proliferatif",
      shortName: "Proliferatif",
      description: "Retinopati diabetik proliferatif.",
      detail:
        "Tahap paling lanjut pada skala ini, yang dalam literatur dikaitkan dengan pertumbuhan pembuluh darah baru. Pemeriksaan oleh dokter spesialis mata diperlukan.",
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
