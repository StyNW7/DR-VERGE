import { lazy, Suspense } from "react";
import { Skeleton } from "./Primitives";
import type { MonoBarDatum } from "./MonoChart";

/**
 * Deferred chart loader.
 *
 * Recharts is ~108 kB gzipped — larger than the rest of the application put
 * together. Every chart on this site sits well below the fold, so loading it
 * with the initial bundle would delay first paint for content the visitor has
 * not scrolled to yet. This defers the whole library until a chart actually
 * renders, and shows a correctly-sized skeleton in the meantime so nothing on
 * the page shifts when it arrives.
 */
const MonoBarChart = lazy(() =>
  import("./MonoChart").then((m) => ({ default: m.MonoBarChart })),
);

interface LazyBarChartProps {
  data: MonoBarDatum[];
  height?: number;
  digits?: number;
  unit?: string;
  domain?: [number, number];
  showValues?: boolean;
  layout?: "vertical" | "horizontal";
  className?: string;
  ariaLabel: string;
}

export function LazyMonoBarChart(props: LazyBarChartProps) {
  const height = props.height ?? 240;

  return (
    <Suspense
      fallback={
        <div style={{ height }} className="flex w-full items-end gap-3 px-2 pb-6">
          {props.data.map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              // Rough proportional heights keep the placeholder from looking
              // like a loading bug.
              style={{ height: `${30 + ((i * 17) % 55)}%` }}
            />
          ))}
        </div>
      }
    >
      <MonoBarChart {...props} />
    </Suspense>
  );
}
