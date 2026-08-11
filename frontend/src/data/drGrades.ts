/**
 * The five ordinal DR grades.
 *
 * Descriptions are short and educational ONLY. They deliberately contain no
 * treatment advice, no medication guidance, no diagnostic confirmation, and no
 * urgency instruction — the site is a research showcase, and a visitor reading a
 * grade here must be pointed to a clinician rather than to an action.
 */

export interface DrGrade {
  grade: number;
  /** Two-digit form used in the large output display. */
  display: string;
  name: string;
  shortName: string;
  /** One-line educational description. */
  description: string;
  /** What the grade means in terms of retinal findings, in plain language. */
  detail: string;
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
  },
  {
    grade: 1,
    display: "01",
    name: "Mild NPDR",
    shortName: "Mild",
    description: "Mild non-proliferative diabetic retinopathy.",
    detail:
      "The earliest stage, characterised in the literature by microaneurysms. These are among the smallest retinal features and are the hardest for any automated system to detect reliably.",
  },
  {
    grade: 2,
    display: "02",
    name: "Moderate NPDR",
    shortName: "Moderate",
    description: "Moderate non-proliferative diabetic retinopathy.",
    detail:
      "An intermediate stage in which more extensive retinal changes are typically described, beyond isolated microaneurysms.",
  },
  {
    grade: 3,
    display: "03",
    name: "Severe NPDR",
    shortName: "Severe",
    description: "Severe non-proliferative diabetic retinopathy.",
    detail:
      "An advanced non-proliferative stage. Clinical guidelines treat this stage as requiring specialist assessment.",
  },
  {
    grade: 4,
    display: "04",
    name: "Proliferative DR",
    shortName: "Proliferative",
    description: "Proliferative diabetic retinopathy.",
    detail:
      "The most advanced stage in this grading scale, associated in the literature with new vessel growth. Specialist ophthalmic assessment is indicated.",
  },
];

/** Safe lookup — an out-of-range grade from an API must not crash the UI. */
export function getGrade(grade: number | null | undefined): DrGrade | null {
  if (grade === null || grade === undefined || !Number.isFinite(grade)) return null;
  return drGrades.find((g) => g.grade === grade) ?? null;
}

export const GRADE_CONSULT_NOTE =
  "Please consult an ophthalmologist for clinical interpretation.";

/** Labels for the four cumulative ordinal thresholds the CORAL head produces. */
export const ordinalThresholdLabels = [
  { key: "P(Y > 0)", meaning: "Any diabetic retinopathy present" },
  { key: "P(Y > 1)", meaning: "Beyond mild NPDR" },
  { key: "P(Y > 2)", meaning: "Beyond moderate NPDR" },
  { key: "P(Y > 3)", meaning: "Beyond severe NPDR" },
] as const;
