import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { drGrades, gradeText } from "@/data/drGrades";
import { gradeTone, GRADE_RAMP } from "@/lib/gradeTone";

/** SVG has no <i>; `*term*` markers become italic tspans instead. */
function svgRich(text: string) {
  if (!text.includes("*")) return text;
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <tspan key={i} fontStyle="italic">
        {part}
      </tspan>
    ) : (
      part
    ),
  );
}

/**
 * Method diagrams.
 *
 * These are drawn rather than imported so they inherit `currentColor` and the
 * theme tokens, and therefore follow light/dark and mono/colourful without a
 * second file — a raster diagram would also be wrong at arbitrary sizes.
 *
 * Shapes that carry meaning are coloured through classes (`fill-brand`,
 * `stroke-amber`, …). In monochrome those tokens are the ink colour, so the
 * diagram is drawn exactly as a single-colour line drawing; the colourful
 * palette gives the stages their hue. Filled stages use a brand gradient whose
 * two stops are the same ink colour in monochrome.
 */

/* -------------------------------------------------------------------------- */
/* Architecture: two views -> shared encoder -> fusion -> CORAL head            */
/* -------------------------------------------------------------------------- */

export function ArchitectureDiagram({ className }: { className?: string }) {
  const { ts, pick } = useI18n();
  return (
    <svg
      viewBox="0 0 900 300"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={ts(
        "DR-VERGE architecture: macula and optic-disc views pass through a shared encoder into interaction fusion and a CORAL ordinal head",
        "Arsitektur DR-VERGE: citra makula dan diskus optik melewati shared encoder menuju interaction fusion dan head ordinal CORAL",
      )}
    >
      <defs>
        <marker
          id="arch-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" fillOpacity="0.6" className="fill-brand" />
        </marker>
        <linearGradient id="arch-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "hsl(var(--brand-from))" }} />
          <stop offset="1" style={{ stopColor: "hsl(var(--brand-to))" }} />
        </linearGradient>
      </defs>

      <g
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.2"
        fill="none"
        markerEnd="url(#arch-arrow)"
        className="stroke-brand"
      >
        <path d="M186 96 C 226 96, 226 130, 262 130" />
        <path d="M186 204 C 226 204, 226 170, 262 170" />
        <path d="M406 150 L 470 150" />
        <path d="M614 150 L 678 150" />
      </g>

      {/* Inputs */}
      {[
        {
          y: 56,
          label: pick("MACULA VIEW", "CITRA MAKULA"),
          sub: "384 x 384",
          accent: "fill-coral-solid stroke-coral-solid",
        },
        {
          y: 164,
          label: pick("OPTIC DISC VIEW", "CITRA DISKUS OPTIK"),
          sub: "384 x 384",
          accent: "fill-amber-solid stroke-amber-solid",
        },
      ].map((b) => (
        <g key={b.label}>
          <rect
            x="24"
            y={b.y}
            width="162"
            height="80"
            rx="10"
            fill="currentColor"
            fillOpacity="0.04"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.2"
            className={b.accent}
          />
          <text
            className="mono"
            x="105"
            y={b.y + 36}
            textAnchor="middle"
            fontSize="12"
            fill="currentColor"
            letterSpacing="1"
          >
            {b.label}
          </text>
          <text
            className="mono"
            x="105"
            y={b.y + 55}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            fillOpacity="0.5"
          >
            {b.sub}
          </text>
        </g>
      ))}

      {/* Shared encoder — one backbone, both views, which is why it is drawn once. */}
      <rect
        x="262"
        y="106"
        width="144"
        height="88"
        rx="10"
        fill="currentColor"
        fillOpacity="0.07"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.4"
        className="fill-brand stroke-brand"
      />
      <text className="mono" x="334" y="144" textAnchor="middle" fontSize="12" fill="currentColor" letterSpacing="1">
        SHARED
      </text>
      <text className="mono" x="334" y="162" textAnchor="middle" fontSize="12" fill="currentColor" letterSpacing="1">
        ENCODER
      </text>

      {/* Interaction fusion */}
      <rect
        x="470"
        y="106"
        width="144"
        height="88"
        rx="10"
        fill="currentColor"
        fillOpacity="0.07"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.4"
        className="fill-brand stroke-brand"
      />
      <text className="mono" x="542" y="138" textAnchor="middle" fontSize="12" fill="currentColor" letterSpacing="1">
        INTERACTION
      </text>
      <text className="mono" x="542" y="156" textAnchor="middle" fontSize="12" fill="currentColor" letterSpacing="1">
        FUSION
      </text>
      <text className="mono" x="542" y="176" textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.5">
        concat · |diff| · product
      </text>

      {/* CORAL head, filled to mark it as the output stage */}
      <rect
        x="678"
        y="106"
        width="198"
        height="88"
        rx="10"
        fill="url(#arch-grad)"
        fillOpacity="0.92"
        stroke="url(#arch-grad)"
        strokeWidth="1.4"
      />
      <text
        className="mono fill-brand-foreground"
        x="777"
        y="138"
        textAnchor="middle"
        fontSize="12"
        letterSpacing="1"
      >
        CORAL ORDINAL HEAD
      </text>
      {/* Four cumulative thresholds, drawn as four ticks. */}
      <g transform="translate(700 152)">
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${i * 40} 0)`}>
            <rect
              x="0"
              y="0"
              width="30"
              height="8"
              rx="4"
              className="fill-brand-foreground"
              fillOpacity="0.45"
            />
            <text
              className="mono fill-brand-foreground"
              x="15"
              y="24"
              textAnchor="middle"
              fontSize="8"
            >
              {`Y>${i}`}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Shift diagram: how Δ is formed and distilled                                 */
/* -------------------------------------------------------------------------- */

export function ShiftDiagram({ className }: { className?: string }) {
  const { ts, pick } = useI18n();
  const single = pick("single view", "*single view*");
  const averaged = pick("averaged baseline", "*baseline* rata-rata");
  return (
    <svg
      viewBox="0 0 900 340"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={ts(
        "Diagram of Complementarity-Shift Distillation: the teacher's dual-view prediction minus its aggregated single-view prediction produces a shift that is transferred to the student",
        "Diagram Complementarity-Shift Distillation: prediksi dual-view milik teacher dikurangi agregasi prediksi single-view menghasilkan pergeseran yang ditransfer ke student",
      )}
    >
      <defs>
        <marker
          id="shift-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" fillOpacity="0.6" className="fill-brand" />
        </marker>
        <linearGradient id="shift-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "hsl(var(--brand-from))" }} />
          <stop offset="1" style={{ stopColor: "hsl(var(--brand-to))" }} />
        </linearGradient>
      </defs>

      {/* --- teacher row --- */}
      <text className="mono" x="24" y="34" fontSize="11" fill="currentColor" fillOpacity="0.55" letterSpacing="1.5">
        TEACHER
      </text>

      <Block x={24} y={48} w={150} h={64} title="p_macula" sub={single} accent="coral" />
      <Operator x={186} y={80} symbol="+" />
      <Block x={214} y={48} w={150} h={64} title="p_disc" sub={single} accent="amber" />
      <Operator x={376} y={80} symbol="=" />
      <Block x={404} y={48} w={166} h={64} title="p_agg" sub={averaged} />

      <Block
        x={24}
        y={146}
        w={340}
        h={64}
        title="p_dual"
        sub={pick("both views fused", "kedua *view* difusikan")}
        filled
      />
      <Operator x={376} y={178} symbol="−" />
      <Block x={404} y={146} w={166} h={64} title="p_agg" sub={averaged} />

      {/* Δ, the quantity the whole method is about */}
      <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" fill="none" markerEnd="url(#shift-arrow)" className="stroke-brand">
        <path d="M586 178 L 646 178" />
      </g>
      {/* Δ is the quantity the method is about: amber in the colourful palette. */}
      <rect
        x="654"
        y="140"
        width="222"
        height="76"
        rx="10"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="6 4"
        className="fill-amber-solid stroke-amber-solid"
      />
      <text className="mono fill-amber" x="765" y="172" textAnchor="middle" fontSize="18" fill="currentColor">
        Δ
        <tspan fontSize="11" dy="-6">
          T
        </tspan>
      </text>
      <text className="mono" x="765" y="196" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.6">
        {svgRich(pick("complementarity shift", "*complementarity shift*"))}
      </text>

      {/* --- transfer --- */}
      <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" fill="none" markerEnd="url(#shift-arrow)" className="stroke-brand">
        <path d="M765 224 L 765 258" />
      </g>
      <text className="mono" x="752" y="248" textAnchor="end" fontSize="10" fill="currentColor" fillOpacity="0.6">
        SmoothL1( Δ_S / s , Δ_T / s )
      </text>

      {/* --- student row --- */}
      <text className="mono" x="24" y="256" fontSize="11" fill="currentColor" fillOpacity="0.55" letterSpacing="1.5">
        STUDENT
      </text>
      <rect
        x="654"
        y="266"
        width="222"
        height="60"
        rx="10"
        fill="url(#shift-grad)"
        fillOpacity="0.92"
        stroke="url(#shift-grad)"
        strokeWidth="1.4"
      />
      <text
        className="mono fill-brand-foreground"
        x="765"
        y="292"
        textAnchor="middle"
        fontSize="16"
      >
        Δ
        <tspan fontSize="10" dy="-5">
          S
        </tspan>
      </text>
      <text
        x="765"
        y="312"
        textAnchor="middle"
        fontSize="9"
        className="mono fill-brand-foreground"
        fillOpacity="0.85"
      >
        {svgRich(pick("student reproduces the shift", "*student* mereproduksi pergeseran"))}
      </text>

      <Block
        x={24}
        y={266}
        w={340}
        h={60}
        title={pick("~328K parameters", "~328K parameter")}
        sub={pick("lightweight dual-view student", "*lightweight dual-view student*")}
        accent="brand"
      />
    </svg>
  );
}

function Block({
  x,
  y,
  w,
  h,
  title,
  sub,
  filled = false,
  accent = "brand",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  filled?: boolean;
  accent?: "brand" | "coral" | "amber";
}) {
  const tint = {
    brand: "fill-brand stroke-brand",
    coral: "fill-coral-solid stroke-coral-solid",
    amber: "fill-amber-solid stroke-amber-solid",
  }[accent];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill="currentColor"
        fillOpacity={filled ? 0.12 : 0.05}
        stroke="currentColor"
        strokeOpacity={filled ? 0.6 : 0.4}
        strokeWidth={filled ? 1.5 : 1.2}
        className={tint}
      />
      <text
        className="mono"
        x={x + w / 2}
        y={y + (sub ? h / 2 - 2 : h / 2 + 4)}
        textAnchor="middle"
        fontSize="13"
        fill="currentColor"
      >
        {title}
      </text>
      {sub && (
        <text
          className="mono"
          x={x + w / 2}
          y={y + h / 2 + 16}
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
          fillOpacity="0.5"
        >
          {svgRich(sub)}
        </text>
      )}
    </g>
  );
}

function Operator({ x, y, symbol }: { x: number; y: number; symbol: string }) {
  return (
    <text
      className="mono"
      x={x + 14}
      y={y + 6}
      textAnchor="middle"
      fontSize="20"
      fill="currentColor"
      fillOpacity="0.6"
    >
      {symbol}
    </text>
  );
}

/* -------------------------------------------------------------------------- */
/* Ordinal severity scale                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The five ordinal grades as a scale.
 *
 * Drawn as a continuous track rather than five separate chips, because the whole
 * point of an ordinal target is that the grades are ordered and the distance
 * between them carries meaning.
 */
export function OrdinalScale({
  active,
  className,
  compact = false,
}: {
  active?: number | null;
  className?: string;
  compact?: boolean;
}) {
  const { lang } = useI18n();
  const grades = drGrades.map((g) => ({ g: g.grade, label: gradeText(g, lang).shortName }));

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Track — from the first dot's centre to the last one's (10% / 90%
            of five equal columns), so it never sticks out past the scale. */}
        <div
          className={cn(
            "absolute left-[10%] right-[10%] top-[15px] h-px bg-border colorful:top-[14.5px] colorful:h-[3px] colorful:rounded-full colorful:opacity-80",
            GRADE_RAMP,
          )}
          aria-hidden="true"
        />
        <ol className="relative flex justify-between">
          {grades.map((item) => {
            const isActive = active === item.g;
            return (
              <li key={item.g} className="flex min-w-0 flex-1 flex-col items-center gap-2 px-0.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
                    isActive
                      ? cn(
                          "border-foreground bg-foreground text-background scale-110 colorful:scale-[1.2] colorful:shadow-lg",
                          gradeTone(item.g).fill,
                        )
                      : cn(
                          "border-border bg-background text-muted-foreground colorful:border-2 colorful:bg-card colorful:text-foreground",
                          gradeTone(item.g).border,
                        ),
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="mono text-xs font-semibold">{item.g}</span>
                </div>
                <span
                  className={cn(
                    "text-center leading-tight transition-colors",
                    // Five labels share one row even on a phone, so the
                    // accessibility mode enlarges them only where they fit.
                    compact ? "text-11" : "text-12 sm:text-xs",
                    "a11y:text-[0.8125rem] sm:a11y:text-[0.9375rem]",
                    isActive ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
