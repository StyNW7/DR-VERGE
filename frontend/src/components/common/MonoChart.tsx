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
import { useI18n, type Lang } from "@/i18n/context";
import { formatScore } from "@/utils/formatting";
import { useA11y } from "@/components/theme-provider";

/** Axis ticks: up to three decimals, in the reader's number format. */
const tickFormat = (lang: Lang) => (v: unknown) =>
  typeof v === "number"
    ? v.toLocaleString(lang === "id" ? "id-ID" : "en-US", { maximumFractionDigits: 3 })
    : String(v ?? "");

/**
 * Recharts wrapped in the site's design system.
 *
 * Colours are CSS variables rather than literals, so every chart follows the
 * light/dark theme and the mono/colourful palette without a second render
 * path. The proposed method is drawn in `--chart-1` (solid ink in monochrome,
 * brand blue in colourful); baselines in a translucent `--chart-2`, so the
 * comparison still reads when the palette has no hue.
 */

const FG = "hsl(var(--foreground))";
const EMPHASIS = "hsl(var(--chart-1))";
const BASELINE = "hsl(var(--chart-2) / var(--chart-2-alpha))";
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
  lang,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit?: string;
  digits: number;
  lang: Lang;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <div className="text-12 font-medium text-popover-foreground">{label}</div>
      <div className="mono mt-0.5 text-sm font-semibold text-popover-foreground">
        {formatScore(payload[0].value, digits, lang)}
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
  const { lang } = useI18n();
  // Recharts draws its text at fixed pixel sizes, so the accessibility mode
  // has to be passed in rather than inherited from the type scale.
  const { a11y } = useA11y();
  const small = a11y ? 13 : 10;
  const label = a11y ? 14 : 11;

  return (
    <div className={cn("w-full", className)} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 8, right: showValues ? (a11y ? 60 : 44) : 12, bottom: 4, left: 4 }}
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
                tick={{ fill: MUTED, fontSize: small }}
                tickFormatter={tickFormat(lang)}
                axisLine={{ stroke: BORDER }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={a11y ? 116 : 104}
                tick={{ fill: MUTED, fontSize: label }}
                axisLine={false}
                tickLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                tick={{ fill: MUTED, fontSize: label }}
                axisLine={{ stroke: BORDER }}
                tickLine={false}
              />
              <YAxis
                domain={domain ?? [0, "auto"]}
                tick={{ fill: MUTED, fontSize: small }}
                tickFormatter={tickFormat(lang)}
                axisLine={false}
                tickLine={false}
                width={a11y ? 54 : 44}
              />
            </>
          )}
          <Tooltip
            cursor={{ fill: FG, fillOpacity: 0.05 }}
            content={<MonoTooltip unit={unit} digits={digits} lang={lang} />}
          />
          <Bar dataKey="value" radius={isHorizontalBars ? [0, 4, 4, 0] : [4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.emphasis ? EMPHASIS : BASELINE} />
            ))}
            {showValues && (
              <LabelList
                dataKey="value"
                position={isHorizontalBars ? "right" : "top"}
                // Recharts types the label value loosely, so it is narrowed here
                // rather than asserted — a non-numeric label renders as-is.
                formatter={(v: unknown) =>
                  typeof v === "number" ? formatScore(v, digits, lang) : String(v ?? "")
                }
                style={{ fill: MUTED, fontSize: small, fontFamily: "JetBrains Mono, monospace" }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
