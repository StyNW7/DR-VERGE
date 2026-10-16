/**
 * Colour classes for the five ordinal DR grades.
 *
 * Every class is `colorful:`-prefixed, so in the monochrome palette none of
 * them apply and the grades stay grey. In the colourful palette the grades
 * follow a severity ramp — blue (no DR) → yellow → orange → red-orange → red —
 * the same ramp the research deck uses. Text on a solid grade fill uses that
 * grade's own `--grade-N-fg` token, chosen for contrast (navy on yellow and
 * orange, white on the rest).
 *
 * The class strings are written out in full because Tailwind only generates
 * classes it can find literally in the source.
 */
export interface GradeTone {
  /** Solid fill + readable text on it. */
  fill: string;
  /** Border in the grade colour. */
  border: string;
  /** Background of a small dot or bar. */
  dot: string;
  /** Faint tint over a card's own background (an inset shadow, so it also
   *  works on cells laid over a hairline grid). */
  soft: string;
}

const tones: GradeTone[] = [
  {
    fill: "colorful:bg-none colorful:border-grade-0 colorful:bg-grade-0 colorful:text-[hsl(var(--grade-0-fg))]",
    border: "colorful:border-grade-0",
    dot: "colorful:bg-grade-0",
    soft: "colorful:shadow-[inset_0_0_0_999px_hsl(var(--grade-0)/0.07)]",
  },
  {
    fill: "colorful:bg-none colorful:border-grade-1 colorful:bg-grade-1 colorful:text-[hsl(var(--grade-1-fg))]",
    border: "colorful:border-grade-1",
    dot: "colorful:bg-grade-1",
    soft: "colorful:shadow-[inset_0_0_0_999px_hsl(var(--grade-1)/0.09)]",
  },
  {
    fill: "colorful:bg-none colorful:border-grade-2 colorful:bg-grade-2 colorful:text-[hsl(var(--grade-2-fg))]",
    border: "colorful:border-grade-2",
    dot: "colorful:bg-grade-2",
    soft: "colorful:shadow-[inset_0_0_0_999px_hsl(var(--grade-2)/0.08)]",
  },
  {
    fill: "colorful:bg-none colorful:border-grade-3 colorful:bg-grade-3 colorful:text-[hsl(var(--grade-3-fg))]",
    border: "colorful:border-grade-3",
    dot: "colorful:bg-grade-3",
    soft: "colorful:shadow-[inset_0_0_0_999px_hsl(var(--grade-3)/0.07)]",
  },
  {
    fill: "colorful:bg-none colorful:border-grade-4 colorful:bg-grade-4 colorful:text-[hsl(var(--grade-4-fg))]",
    border: "colorful:border-grade-4",
    dot: "colorful:bg-grade-4",
    soft: "colorful:shadow-[inset_0_0_0_999px_hsl(var(--grade-4)/0.07)]",
  },
];

const none: GradeTone = { fill: "", border: "", dot: "", soft: "" };

/** Safe for any input — an out-of-range grade simply gets no colour. */
export function gradeTone(grade: number | null | undefined): GradeTone {
  if (grade === null || grade === undefined) return none;
  return tones[grade] ?? none;
}

/** The whole severity ramp as one gradient, for tracks and scale bars. */
export const GRADE_RAMP =
  "colorful:bg-[linear-gradient(90deg,hsl(var(--grade-0)),hsl(var(--grade-1)),hsl(var(--grade-2)),hsl(var(--grade-3)),hsl(var(--grade-4)))]";
