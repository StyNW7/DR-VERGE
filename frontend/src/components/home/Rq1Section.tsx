import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp, Minus, ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Badge } from "@/components/common/Primitives";
import { LazyMonoBarChart } from "@/components/common/LazyChart";
import {
  mechanismResults,
  mechanismMetricMeta,
  mechanismEvidence,
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
      <div className="mb-1 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <h3 className="text-base font-bold tracking-tight">{tr(meta.label)}</h3>
        <Badge tone="outline" icon={meta.direction === "lower" ? TrendingDown : TrendingUp}>
          {meta.direction === "lower"
            ? t("Lower better", "Makin rendah makin baik")
            : t("Higher better", "Makin tinggi makin baik")}
        </Badge>
      </div>
      <p className="mb-5 text-13 leading-relaxed text-muted-foreground">
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
        <div className="mono mt-auto border-t border-border pt-4 text-11 uppercase tracking-[0.14em] text-foreground colorful:font-semibold colorful:text-brand">
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

      {/* The ordering above is descriptive; this strip is what the inference-only
          supplementary analysis adds on top of it. */}
      <Reveal delay={0.1}>
        <div className="mt-5 card-premium flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex shrink-0 items-baseline gap-2">
            <span className="mono text-4xl font-bold tracking-tight colorful:text-brand-gradient">
              3/3
            </span>
            <span className="mono max-w-[9rem] text-11 uppercase leading-snug tracking-[0.14em] text-muted-foreground">
              {t("baselines, ShiftL1", "pembanding, ShiftL1")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <Badge tone="outline">{t("Supplementary analysis · exploratory", "Analisis suplementer · eksploratori")}</Badge>
            <p className="mt-3 text-14 leading-relaxed text-foreground">
              {tr(mechanismEvidence.headline)}
            </p>
            <dl className="mono mt-4 flex flex-wrap gap-x-6 gap-y-2 text-12 text-muted-foreground">
              <div>
                <dt className="sr-only">{t("Conclusive contrasts", "Kontras konklusif")}</dt>
                <dd>
                  <span className="font-semibold text-foreground">
                    {mechanismEvidence.conclusiveForCsd}/{mechanismEvidence.contrasts}
                  </span>{" "}
                  {t("contrasts conclusive", "kontras konklusif")}
                </dd>
              </div>
              <div>
                <dt className="sr-only">{t("Contrasts favouring a baseline", "Kontras yang menguntungkan pembanding")}</dt>
                <dd>
                  <span className="font-semibold text-foreground">
                    {mechanismEvidence.conclusiveForBaseline}/{mechanismEvidence.contrasts}
                  </span>{" "}
                  {t("favour a baseline", "menguntungkan pembanding")}
                </dd>
              </div>
              <div>
                <dt className="sr-only">DeepDRiD Set-C</dt>
                <dd>
                  Set-C:{" "}
                  <span className="font-semibold text-foreground">{t("rank 1", "peringkat 1")}</span>{" "}
                  {t("on 3/3 metrics", "pada 3/3 metrik")}
                </dd>
              </div>
            </dl>
          </div>
          <Link
            to="/research#mechanism-evidence"
            className="group inline-flex shrink-0 items-center gap-1.5 self-start text-13 font-semibold text-foreground underline-offset-4 hover:underline colorful:text-brand lg:self-center"
          >
            {t("See the evidence", "Lihat buktinya")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>

      {/* The two-part finding. Both halves get equal visual weight, because
          presenting only the first half would misrepresent the result. */}
      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="grain inverse relative overflow-hidden rounded-2xl p-7 sm:p-9">
            <span className="mono text-11 uppercase tracking-[0.16em] opacity-60">
              {t("The mechanism finding", "Temuan mekanisme")}
            </span>
            <p className="mt-4 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {tr(rq1Verdict.mechanism)}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-foreground bg-card p-7 sm:p-9 colorful:border-amber-solid/60 colorful:bg-amber-soft/50">
            <span className="mono text-11 uppercase tracking-[0.16em] text-muted-foreground colorful:font-semibold colorful:text-amber">
              {t("The predictive finding", "Temuan prediktif")}
            </span>
            <p className="mt-4 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {tr(rq1Verdict.predictive)}
            </p>

            <div className="mt-7 flex flex-col gap-3.5 border-t border-border pt-6">
              {rq1Verdict.comparisons.map((c) => (
                <div key={c.pair.en} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3 text-13">
                    <span className="text-muted-foreground">{tr(c.pair)}</span>
                    <span className="mono inline-flex items-center gap-1.5 whitespace-nowrap text-12 uppercase tracking-[0.12em] text-foreground colorful:font-semibold colorful:text-amber">
                      <Minus className="h-3 w-3" aria-hidden="true" />
                      {tr(c.outcome)}
                    </span>
                  </div>
                  {/* The interval is the evidence; the verdict above is only a
                      summary of it. Showing both keeps the claim checkable. */}
                  <div className="mono text-12 tabular-nums text-subtle">
                    ΔQWK {signed(c.delta, lang)} · {ciText(c.ciLow, c.ciHigh, lang)}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-13 leading-relaxed text-muted-foreground">
              {tr(rq1Verdict.note)}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Neither half is the finding on its own — this line is what they mean
          together, and it is the sentence the paper leads with. */}
      <Reveal delay={0.12}>
        <div className="mt-5 rounded-2xl border border-border bg-card/60 p-7 sm:p-9 colorful:border-brand-line colorful:bg-card colorful:border-l-4 colorful:border-l-brand">
          <span className="mono text-11 uppercase tracking-[0.16em] text-muted-foreground colorful:font-semibold colorful:text-brand">
            {t("What the two findings mean together", "Makna kedua temuan bila dilihat bersama")}
          </span>
          <p className="mt-4 max-w-4xl text-15 leading-relaxed text-foreground">
            {tr(rq1Verdict.synthesis)}
          </p>
          <p className="mono mt-6 border-t border-border pt-5 text-12 leading-relaxed text-subtle">
            {tr(rq1Verdict.method)}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
