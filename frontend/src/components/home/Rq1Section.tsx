import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Badge } from "@/components/common/Primitives";
import { LazyMonoBarChart } from "@/components/common/LazyChart";
import {
  mechanismResults,
  mechanismMetricMeta,
  mechanismReplication,
  rq1Verdict,
  type MechanismMetricKey,
} from "@/data/researchMetrics";
import { useI18n } from "@/i18n/context";
import { signed, ciText } from "@/utils/stats";

const metricKeys: MechanismMetricKey[] = ["shiftL1", "cosAgree", "benefitCorr"];

function MechanismPanel({ metricKey }: { metricKey: MechanismMetricKey }) {
  const { t, tr, trs, ts, num } = useI18n();
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
    <div className="card-premium flex h-full flex-col p-6 sm:p-7">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h3 className="text-base font-bold tracking-tight">{tr(meta.label)}</h3>
        <Badge tone="outline" icon={meta.direction === "lower" ? TrendingDown : TrendingUp}>
          {meta.direction === "lower"
            ? t("Lower better", "Makin rendah makin baik")
            : t("Higher better", "Makin tinggi makin baik")}
        </Badge>
      </div>
      <p className="mb-5 text-[12px] leading-relaxed text-muted-foreground">
        {tr(meta.description)}
      </p>

      <LazyMonoBarChart
        data={data}
        domain={domain}
        digits={4}
        height={190}
        ariaLabel={`${trs(meta.label)} ${ts("by distillation method", "per metode distilasi")}. ${mechanismResults
          .map((r) => `${r.shortMethod} ${num(r[metricKey], 4)}`)
          .join(", ")}.`}
      />

      {csdIsBest && (
        <div className="mono mt-auto border-t border-border pt-4 text-[10px] uppercase tracking-[0.14em] text-foreground colorful:font-semibold colorful:text-brand">
          {t("CSD best on this metric", "CSD terbaik pada metrik ini")}
        </div>
      )}
    </div>
  );
}

export default function Rq1Section() {
  const { t, tr, pick, lang } = useI18n();

  return (
    <Section id="rq1" tone="surface">
      <SectionHeader
        eyebrow={t("RQ1 · Knowledge Transfer", "RQ1 · Transfer Pengetahuan")}
        index="05"
        title={pick(
          <>
            What Did CSD <em>Actually</em> Learn?
          </>,
          <>
            Apa yang <em>Sebenarnya</em> Dipelajari CSD?
          </>,
        )}
        description={t(
          "Three metrics measure whether the student reproduced the teacher's dual-view decision shift — not whether it graded better.",
          "Tiga metrik mengukur apakah *student* mereproduksi pergeseran keputusan *dual-view* milik *teacher* — bukan apakah *student* menilai lebih akurat.",
        )}
        size="lg"
      />

      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {metricKeys.map((k, i) => (
          <Reveal key={k} delay={i * 0.08}>
            <MechanismPanel metricKey={k} />
          </Reveal>
        ))}
      </div>

      {/* Replication is the reason this ordering is worth reporting at all. */}
      <Reveal delay={0.1}>
        <div className="mt-5 card-premium flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-7 sm:p-7">
          <div className="flex shrink-0 items-baseline gap-2">
            <span className="mono text-3xl font-bold tracking-tight colorful:text-brand-gradient">
              {mechanismReplication.wins}/{mechanismReplication.measurements}
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {t("measurements", "pengukuran")}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {tr(mechanismReplication.note)}
          </p>
        </div>
      </Reveal>

      {/* The two-part finding. Both halves get equal visual weight, because
          presenting only the first half would misrepresent the result. */}
      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="grain inverse relative overflow-hidden rounded-2xl p-7 sm:p-9">
            <span className="mono text-[10px] uppercase tracking-[0.18em] opacity-60">
              {t("The mechanism finding", "Temuan mekanisme")}
            </span>
            <p className="mt-4 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {tr(rq1Verdict.mechanism)}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-foreground bg-card p-7 sm:p-9 colorful:border-amber-solid/60 colorful:bg-amber-soft/50">
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground colorful:font-semibold colorful:text-amber">
              {t("The predictive finding", "Temuan prediktif")}
            </span>
            <p className="mt-4 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {tr(rq1Verdict.predictive)}
            </p>

            <div className="mt-7 flex flex-col gap-3.5 border-t border-border pt-6">
              {rq1Verdict.comparisons.map((c) => (
                <div key={c.pair.en} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-muted-foreground">{tr(c.pair)}</span>
                    <span className="mono inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-foreground colorful:font-semibold colorful:text-amber">
                      <Minus className="h-3 w-3" aria-hidden="true" />
                      {tr(c.outcome)}
                    </span>
                  </div>
                  {/* The interval is the evidence; the verdict above is only a
                      summary of it. Showing both keeps the claim checkable. */}
                  <div className="mono text-[11px] tabular-nums text-subtle">
                    ΔQWK {signed(c.delta, lang)} · {ciText(c.ciLow, c.ciHigh, lang)}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
              {tr(rq1Verdict.note)}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Neither half is the finding on its own — this line is what they mean
          together, and it is the sentence the paper leads with. */}
      <Reveal delay={0.12}>
        <div className="mt-5 rounded-2xl border border-border bg-card/60 p-7 sm:p-9 colorful:border-brand-line colorful:bg-card colorful:border-l-4 colorful:border-l-brand">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground colorful:font-semibold colorful:text-brand">
            {t("What the two findings mean together", "Makna kedua temuan bila dilihat bersama")}
          </span>
          <p className="mt-4 max-w-4xl text-[15px] leading-relaxed text-foreground">
            {tr(rq1Verdict.synthesis)}
          </p>
          <p className="mono mt-6 border-t border-border pt-5 text-[11px] leading-relaxed text-subtle">
            {tr(rq1Verdict.method)}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
