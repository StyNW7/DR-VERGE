import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

/**
 * Schematic retinal fundus, drawn as SVG.
 *
 * This is a stylised anatomical diagram, not a photograph and not a rendering of
 * any real patient's retina. It exists so the site can show what "macula-centered"
 * and "optic-disc-centered" mean without shipping stock medical photography or
 * implying that any depicted eye is a genuine case.
 *
 * `variant` moves the anatomy rather than the frame: in the macula-centered view
 * the fovea sits at the centre and the disc is nasal; in the disc-centered view
 * the optic disc is centred and the macula moves temporally. That is the actual
 * difference between the two fields DR-VERGE consumes.
 */
export function FundusIllustration({
  variant,
  className,
  showLabels = false,
  animated = false,
}: {
  variant: "macula" | "disc";
  className?: string;
  showLabels?: boolean;
  animated?: boolean;
}) {
  const isMacula = variant === "macula";
  const { ts } = useI18n();

  // Anatomy positions in a 200x200 viewBox.
  const disc = isMacula ? { x: 138, y: 96 } : { x: 100, y: 100 };
  const macula = isMacula ? { x: 100, y: 100 } : { x: 56, y: 104 };
  const uid = `fundus-${variant}`;

  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={
        isMacula
          ? ts(
              "Schematic diagram of a macula-centered retinal fundus view",
              "Diagram skematik citra fundus retina berpusat makula",
            )
          : ts(
              "Schematic diagram of an optic-disc-centered retinal fundus view",
              "Diagram skematik citra fundus retina berpusat diskus optik",
            )
      }
    >
      <defs>
        {/* Radial falloff: fundus photographs are brightest centrally. */}
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="65%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-macula`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.42" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-disc`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
        </radialGradient>
        {/* Everything is clipped to the retinal circle, as in a real fundus image. */}
        <clipPath id={`${uid}-clip`}>
          <circle cx="100" cy="100" r="92" />
        </clipPath>
      </defs>

      {/* Retinal field */}
      <circle cx="100" cy="100" r="92" fill={`url(#${uid}-glow)`} />
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1"
      />

      <g clipPath={`url(#${uid}-clip)`}>
        {/* Vascular arcades, sweeping out of the optic disc above and below the
            macula — the characteristic shape of the retinal vasculature. */}
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeOpacity="0.4"
        >
          <path
            d={`M${disc.x} ${disc.y} C ${disc.x - 26} ${disc.y - 30}, ${macula.x + 6} ${macula.y - 52}, ${macula.x - 66} ${macula.y - 44}`}
            strokeWidth="2.4"
          />
          <path
            d={`M${disc.x} ${disc.y} C ${disc.x - 26} ${disc.y + 30}, ${macula.x + 6} ${macula.y + 52}, ${macula.x - 66} ${macula.y + 46}`}
            strokeWidth="2.4"
          />
          <path
            d={`M${disc.x} ${disc.y} C ${disc.x + 22} ${disc.y - 22}, ${disc.x + 44} ${disc.y - 40}, ${disc.x + 74} ${disc.y - 52}`}
            strokeWidth="1.9"
          />
          <path
            d={`M${disc.x} ${disc.y} C ${disc.x + 22} ${disc.y + 22}, ${disc.x + 46} ${disc.y + 38}, ${disc.x + 72} ${disc.y + 54}`}
            strokeWidth="1.9"
          />
          <path
            d={`M${disc.x} ${disc.y} C ${disc.x - 10} ${disc.y + 46}, ${disc.x - 34} ${disc.y + 66}, ${disc.x - 52} ${disc.y + 88}`}
            strokeWidth="1.5"
          />
          <path
            d={`M${disc.x} ${disc.y} C ${disc.x - 12} ${disc.y - 44}, ${disc.x - 30} ${disc.y - 68}, ${disc.x - 44} ${disc.y - 90}`}
            strokeWidth="1.5"
          />
        </g>

        {/* Finer branches */}
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeOpacity="0.22"
          strokeWidth="1.1"
        >
          <path d={`M${disc.x - 30} ${disc.y - 32} C ${disc.x - 48} ${disc.y - 40}, ${disc.x - 58} ${disc.y - 26}, ${disc.x - 76} ${disc.y - 30}`} />
          <path d={`M${disc.x - 30} ${disc.y + 32} C ${disc.x - 48} ${disc.y + 42}, ${disc.x - 60} ${disc.y + 30}, ${disc.x - 78} ${disc.y + 36}`} />
          <path d={`M${disc.x + 34} ${disc.y - 34} C ${disc.x + 44} ${disc.y - 18}, ${disc.x + 60} ${disc.y - 14}, ${disc.x + 76} ${disc.y - 18}`} />
          <path d={`M${disc.x + 36} ${disc.y + 32} C ${disc.x + 50} ${disc.y + 20}, ${disc.x + 62} ${disc.y + 22}, ${disc.x + 78} ${disc.y + 14}`} />
        </g>

        {/* Macula and fovea */}
        <circle cx={macula.x} cy={macula.y} r="26" fill={`url(#${uid}-macula)`} />
        <circle cx={macula.x} cy={macula.y} r="4.5" fill="currentColor" fillOpacity="0.55" />

        {/* Optic disc */}
        <ellipse
          cx={disc.x}
          cy={disc.y}
          rx="15"
          ry="16.5"
          fill={`url(#${uid}-disc)`}
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        <ellipse cx={disc.x} cy={disc.y} rx="6" ry="7" fill="currentColor" fillOpacity="0.3" />
      </g>

      {/* The field-of-view ring marks which structure this view is centred on. */}
      <circle
        cx={isMacula ? macula.x : disc.x}
        cy={isMacula ? macula.y : disc.y}
        r="42"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="4 5"
        className={animated ? "animate-dash-flow" : undefined}
      />

      {showLabels && (
        <g className="mono colorful:fill-foreground" fontSize="7" fill="currentColor" fillOpacity="0.75">
          <text x={macula.x} y={macula.y + 40} textAnchor="middle" letterSpacing="1">
            {ts("MACULA", "MAKULA")}
          </text>
          <text x={disc.x} y={disc.y - 24} textAnchor="middle" letterSpacing="1">
            {ts("OPTIC DISC", "DISKUS OPTIK")}
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * The retinal field-of-view relationship between the two captures.
 *
 * Two overlapping circles on one schematic retina: the overlap is shared
 * territory, and each crescent is information only one view contains. That
 * non-overlap is the entire premise of the method.
 */
export function DualFieldDiagram({ className }: { className?: string }) {
  const { ts } = useI18n();
  return (
    <svg
      viewBox="0 0 320 200"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={ts(
        "Diagram showing the overlapping fields of view of the macula-centered and optic-disc-centered captures",
        "Diagram yang menunjukkan area pandang yang saling tumpang-tindih antara citra berpusat makula dan citra berpusat diskus optik",
      )}
    >
      <defs>
        <clipPath id="dfd-left">
          <circle cx="128" cy="100" r="72" />
        </clipPath>
      </defs>

      {/* Shared territory: the intersection of the two fields. */}
      <g clipPath="url(#dfd-left)">
        <circle cx="196" cy="100" r="72" fill="currentColor" fillOpacity="0.16" className="colorful:fill-brand" />
      </g>

      <circle
        cx="128"
        cy="100"
        r="72"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.75"
        className="colorful:stroke-coral-solid"
      />
      <circle
        cx="196"
        cy="100"
        r="72"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.75"
        strokeDasharray="5 4"
        className="colorful:stroke-amber-solid"
      />

      {/* Anatomy anchors */}
      <circle cx="128" cy="100" r="5" fill="currentColor" fillOpacity="0.8" className="colorful:fill-coral-solid" />
      <ellipse cx="196" cy="100" rx="7" ry="8" fill="currentColor" fillOpacity="0.5" className="colorful:fill-amber-solid" />

      <g className="mono" fontSize="8" fill="currentColor" letterSpacing="1.2">
        <text x="66" y="100" textAnchor="middle" fillOpacity="0.7" className="colorful:fill-coral colorful:font-semibold">
          {ts("MACULA", "AREA")}
        </text>
        <text x="66" y="112" textAnchor="middle" fillOpacity="0.45" className="colorful:fill-coral">
          {ts("FIELD", "MAKULA")}
        </text>
        <text x="262" y="100" textAnchor="middle" fillOpacity="0.7" className="colorful:fill-amber colorful:font-semibold">
          {ts("DISC", "AREA")}
        </text>
        <text x="262" y="112" textAnchor="middle" fillOpacity="0.45" className="colorful:fill-amber">
          {ts("FIELD", "DISKUS")}
        </text>
        <text x="162" y="186" textAnchor="middle" fillOpacity="0.55" className="colorful:fill-brand">
          {ts("SHARED + COMPLEMENTARY EVIDENCE", "BUKTI BERSAMA + PELENGKAP")}
        </text>
      </g>
    </svg>
  );
}
