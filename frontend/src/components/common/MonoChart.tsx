import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import { cn } from "@/lib/utils";

/**
 * Recharts wrapped in the site's monochrome system.
 *
 * Colours are CSS variables rather than literals, so every chart follows the
 * light/dark theme without a second render path. Emphasis is carried by fill
 * opacity — the proposed method is solid, the baselines are translucent — which
 * is the only encoding available when the palette has no hue.
 */

const FG = "hsl(var(--foreground))";
const BORDER = "hsl(var(--border))";
const MUTED = "hsl(var(--muted-foreground))";

export interface MonoBarDatum {
  name: string;
  value: number;
  emphasis?: boolean;
}

function MonoTooltip({
  active,
  payload,
  label,
  unit,
  digits,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit?: string;
  digits: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <div className="text-[11px] font-medium text-popover-foreground">{label}</div>
      <div className="mono mt-0.5 text-sm font-semibold text-popover-foreground">
        {payload[0].value.toFixed(digits)}
        {unit ? ` ${unit}` : ""}
      </div>
    </div>
  );
}

export function MonoBarChart({
  data,
  height = 240,
  digits = 4,
  unit,
  domain,
  showValues = true,
  layout = "vertical",
  className,
  ariaLabel,
}: {
  data: MonoBarDatum[];
  height?: number;
  digits?: number;
  unit?: string;
  domain?: [number, number];
  showValues?: boolean;
  /** "vertical" = horizontal bars (labels read left-to-right, best for names). */
  layout?: "vertical" | "horizontal";
  className?: string;
  ariaLabel: string;
}) {
  const isHorizontalBars = layout === "vertical";

  return (
    <div className={cn("w-full", className)} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 8, right: showValues ? 44 : 12, bottom: 4, left: 4 }}
          barCategoryGap={isHorizontalBars ? "22%" : "28%"}
        >
          <CartesianGrid
            stroke={BORDER}
            strokeDasharray="2 4"
            horizontal={!isHorizontalBars}
            vertical={isHorizontalBars}
          />
          {isHorizontalBars ? (
            <>
              <XAxis
                type="number"
                domain={domain ?? [0, "auto"]}
                tick={{ fill: MUTED, fontSize: 10 }}
                axisLine={{ stroke: BORDER }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={104}
                tick={{ fill: MUTED, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                tick={{ fill: MUTED, fontSize: 11 }}
                axisLine={{ stroke: BORDER }}
                tickLine={false}
              />
              <YAxis
                domain={domain ?? [0, "auto"]}
                tick={{ fill: MUTED, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
            </>
          )}
          <Tooltip
            cursor={{ fill: FG, fillOpacity: 0.05 }}
            content={<MonoTooltip unit={unit} digits={digits} />}
          />
          <Bar dataKey="value" radius={isHorizontalBars ? [0, 4, 4, 0] : [4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={FG}
                // The single encoding available without hue.
                fillOpacity={d.emphasis ? 1 : 0.28}
              />
            ))}
            {showValues && (
              <LabelList
                dataKey="value"
                position={isHorizontalBars ? "right" : "top"}
                // Recharts types the label value loosely, so it is narrowed here
                // rather than asserted — a non-numeric label renders as-is.
                formatter={(v: unknown) =>
                  typeof v === "number" ? v.toFixed(digits) : String(v ?? "")
                }
                style={{ fill: MUTED, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
