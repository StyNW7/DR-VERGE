import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Badge } from "@/components/common/Primitives";
import { LazyMonoBarChart } from "@/components/common/LazyChart";
import {
  mechanismResults,
  mechanismMetricMeta,
  rq1Verdict,
  type MechanismMetricKey,
} from "@/data/researchMetrics";

const metricKeys: MechanismMetricKey[] = ["shiftL1", "cosAgree", "benefitCorr"];

function MechanismPanel({ metricKey }: { metricKey: MechanismMetricKey }) {
  const meta = mechanismMetricMeta[metricKey];
  const data = mechanismResults.map((r) => ({
    name: r.shortMethod,
    value: r[metricKey],
    emphasis: r.isProposed,
  }));

  // A sensible axis window: pad the observed range so small differences are
  // visible without the bars starting at an arbitrary zero.
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.35 || 0.05;
  const domain: [number, number] = [
    Math.max(0, Number((min - pad).toFixed(3))),
    Number((max + pad).toFixed(3)),
  ];

  const best = meta.direction === "lower" ? min : max;
  const proposed = mechanismResults.find((r) => r.isProposed)!;
  const csdIsBest = proposed[metricKey] === best;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 sm:p-7">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h3 className="text-base font-bold tracking-tight">{meta.label}</h3>
        <Badge tone="outline" icon={meta.direction === "lower" ? TrendingDown : TrendingUp}>
          {meta.direction === "lower" ? "Lower better" : "Higher better"}
        </Badge>
      </div>
      <p className="mb-5 text-[12px] leading-relaxed text-muted-foreground">
        {meta.description}
      </p>

      <LazyMonoBarChart
        data={data}
        domain={domain}
        digits={4}
        height={190}
        ariaLabel={`${meta.label} by distillation method. ${mechanismResults
          .map((r) => `${r.shortMethod} ${r[metricKey].toFixed(4)}`)
          .join(", ")}.`}
      />

      {csdIsBest && (
        <div className="mono mt-4 border-t border-border pt-4 text-[10px] uppercase tracking-[0.14em] text-foreground">
          CSD best on this metric
        </div>
      )}
    </div>
  );
}

export default function Rq1Section() {
  return (
    <Section id="rq1" tone="surface">
      <SectionHeader
        eyebrow="RQ1 · Knowledge Transfer"
        title="What Did CSD Actually Learn?"
        description="Three metrics measure whether the student reproduced the teacher's dual-view decision shift — not whether it graded better."
        size="lg"
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {metricKeys.map((k, i) => (
          <Reveal key={k} delay={i * 0.08}>
            <MechanismPanel metricKey={k} />
          </Reveal>
        ))}
      </div>

      {/* The two-part finding. Both halves get equal visual weight, because
          presenting only the first half would misrepresent the result. */}
      <Reveal delay={0.1}>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl bg-foreground p-7 text-background sm:p-9">
            <span className="mono text-[10px] uppercase tracking-[0.18em] opacity-60">
              The mechanism finding
            </span>
            <p className="mt-4 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {rq1Verdict.mechanism}
            </p>
          </div>

          <div className="rounded-xl border-2 border-dashed border-foreground bg-card p-7 sm:p-9">
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              The predictive finding
            </span>
            <p className="mt-4 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {rq1Verdict.predictive}
            </p>

            <div className="mt-7 flex flex-col gap-2 border-t border-border pt-6">
              {rq1Verdict.comparisons.map((c) => (
                <div
                  key={c.pair}
                  className="flex items-center justify-between gap-3 text-[13px]"
                >
                  <span className="text-muted-foreground">{c.pair}</span>
                  <span className="mono inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-foreground">
                    <Minus className="h-3 w-3" aria-hidden="true" />
                    {c.outcome}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
              {rq1Verdict.note}
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
