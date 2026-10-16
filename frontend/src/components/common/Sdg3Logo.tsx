import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

/**
 * Sustainable Development Goal 3 icon, drawn inline.
 *
 * This is the one coloured element on the site, deliberately: the SDG icons are
 * identified by their official colour, and SDG 3 is "#4C9F38". The title follows
 * the reader's language — "Kehidupan Sehat dan Sejahtera" is the official
 * Indonesian name of the goal.
 */
export const SDG3_GREEN = "#4C9F38";

export function Sdg3Logo({ className }: { className?: string }) {
  const { ts, pick } = useI18n();
  const lines = pick(["GOOD HEALTH", "AND WELL-BEING"], ["KEHIDUPAN SEHAT", "DAN SEJAHTERA"]);

  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={ts(
        "Sustainable Development Goal 3: Good Health and Well-Being",
        "Tujuan Pembangunan Berkelanjutan 3: Kehidupan Sehat dan Sejahtera",
      )}
    >
      <rect width="200" height="200" fill={SDG3_GREEN} />

      {/* Goal number */}
      <text
        x="14"
        y="72"
        fill="#fff"
        fontFamily="Oswald, 'Arial Narrow', Inter, sans-serif"
        fontWeight="700"
        fontSize="74"
        letterSpacing="-2"
      >
        3
      </text>

      {/* Goal title */}
      <g
        fill="#fff"
        fontFamily="Oswald, 'Arial Narrow', Inter, sans-serif"
        fontWeight="700"
        fontSize={pick(15.5, 13.5)}
        letterSpacing="0.2"
      >
        <text x="62" y="32">
          {lines[0]}
        </text>
        <text x="62" y="51">
          {lines[1]}
        </text>
      </g>

      {/* Heartbeat line running into a heart, as in the official icon. */}
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M30 138 H66 L76 112 L90 162 L102 124 L110 138 H124" />
        <path d="M124 138 C 112 120, 120 100, 138 104 C 146 106, 150 112, 152 118 C 154 112, 158 106, 166 104 C 184 100, 192 120, 180 138 L 152 166 L 140 154" />
      </g>
    </svg>
  );
}
