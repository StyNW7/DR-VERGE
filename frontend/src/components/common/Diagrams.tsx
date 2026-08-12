import { cn } from "@/lib/utils";

/**
 * Monochrome method diagrams.
 *
 * These are drawn rather than imported so they inherit `currentColor` and
 * therefore invert correctly between light and dark themes — a raster diagram
 * would need two files and would still be wrong at arbitrary sizes.
 */

/* -------------------------------------------------------------------------- */
/* Architecture: two views -> shared encoder -> fusion -> CORAL head            */
/* -------------------------------------------------------------------------- */

export function ArchitectureDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 300"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="DR-VERGE architecture: macula and optic-disc views pass through a shared encoder into interaction fusion and a CORAL ordinal head"
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
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" fillOpacity="0.6" />
        </marker>
      </defs>

      <g
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.2"
        fill="none"
        markerEnd="url(#arch-arrow)"
      >
        <path d="M186 96 C 226 96, 226 130, 262 130" />
        <path d="M186 204 C 226 204, 226 170, 262 170" />
        <path d="M406 150 L 470 150" />
        <path d="M614 150 L 678 150" />
      </g>

      {/* Inputs */}
      {[
        { y: 56, label: "MACULA VIEW", sub: "384 x 384" },
        { y: 164, label: "OPTIC DISC VIEW", sub: "384 x 384" },
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
        fill="currentColor"
        fillOpacity="0.92"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <text
        className="mono"
        x="777"
        y="138"
        textAnchor="middle"
        fontSize="12"
        letterSpacing="1"
        fill="currentColor"
        style={{ mixBlendMode: "difference" }}
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
              fill="currentColor"
              fillOpacity="0.35"
              style={{ mixBlendMode: "difference" }}
            />
            <text
              className="mono"
              x="15"
              y="24"
              textAnchor="middle"
              fontSize="8"
              fill="currentColor"
              style={{ mixBlendMode: "difference" }}
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
  return (
    <svg
      viewBox="0 0 900 340"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Diagram of Complementarity-Shift Distillation: the teacher's dual-view prediction minus its aggregated single-view prediction produces a shift that is transferred to the student"
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
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" fillOpacity="0.6" />
        </marker>
      </defs>

      {/* --- teacher row --- */}
      <text className="mono" x="24" y="34" fontSize="11" fill="currentColor" fillOpacity="0.55" letterSpacing="1.5">
        TEACHER
      </text>

      <Block x={24} y={48} w={150} h={64} title="p_macula" sub="single view" />
      <Operator x={186} y={80} symbol="+" />
      <Block x={214} y={48} w={150} h={64} title="p_disc" sub="single view" />
      <Operator x={376} y={80} symbol="=" />
      <Block x={404} y={48} w={166} h={64} title="p_agg" sub="averaged baseline" />

      <Block x={24} y={146} w={340} h={64} title="p_dual" sub="both views fused" filled />
      <Operator x={376} y={178} symbol="−" />
      <Block x={404} y={146} w={166} h={64} title="p_agg" sub="averaged baseline" />

      {/* Δ, the quantity the whole method is about */}
      <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" fill="none" markerEnd="url(#shift-arrow)">
        <path d="M586 178 L 646 178" />
      </g>
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
      />
      <text className="mono" x="765" y="172" textAnchor="middle" fontSize="18" fill="currentColor">
        Δ
        <tspan fontSize="11" dy="-6">
          T
        </tspan>
      </text>
      <text className="mono" x="765" y="196" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.6">
        complementarity shift
      </text>

      {/* --- transfer --- */}
      <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" fill="none" markerEnd="url(#shift-arrow)">
        <path d="M765 224 L 765 258" />
      </g>
      <text className="mono" x="782" y="248" fontSize="10" fill="currentColor" fillOpacity="0.6">
        SmoothL1( Δ_S / s , Δ_T / s )
      </text>

      {/* --- student row --- */}
      <text className="mono" x="24" y="286" fontSize="11" fill="currentColor" fillOpacity="0.55" letterSpacing="1.5">
        STUDENT
      </text>
      <rect
        x="654"
        y="266"
        width="222"
        height="60"
        rx="10"
        fill="currentColor"
        fillOpacity="0.92"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <text
        className="mono"
        x="765"
        y="292"
        textAnchor="middle"
        fontSize="16"
        fill="currentColor"
        style={{ mixBlendMode: "difference" }}
      >
        Δ
        <tspan fontSize="10" dy="-5">
          S
        </tspan>
      </text>
      <text
        className="mono"
        x="765"
        y="312"
        textAnchor="middle"
        fontSize="9"
        fill="currentColor"
        fillOpacity="0.7"
        style={{ mixBlendMode: "difference" }}
      >
        student reproduces the shift
      </text>

      <Block x={24} y={266} w={340} h={60} title="~328K parameters" sub="lightweight dual-view student" />
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
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  filled?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill="currentColor"
        fillOpacity={filled ? 0.12 : 0.04}
        stroke="currentColor"
        strokeOpacity={filled ? 0.6 : 0.4}
        strokeWidth={filled ? 1.5 : 1.2}
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
          {sub}
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
  const grades = [
    { g: 0, label: "No DR" },
    { g: 1, label: "Mild" },
    { g: 2, label: "Moderate" },
    { g: 3, label: "Severe" },
    { g: 4, label: "Proliferative" },
  ];

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Track */}
        <div
          className="absolute left-0 right-0 top-[15px] h-px bg-border"
          aria-hidden="true"
        />
        <ol className="relative flex justify-between">
          {grades.map((item) => {
            const isActive = active === item.g;
            return (
              <li key={item.g} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
                    isActive
                      ? "border-foreground bg-foreground text-background scale-110"
                      : "border-border bg-background text-muted-foreground",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="mono text-xs font-semibold">{item.g}</span>
                </div>
                <span
                  className={cn(
                    "text-center leading-tight transition-colors",
                    compact ? "text-[10px]" : "text-[11px] sm:text-xs",
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
