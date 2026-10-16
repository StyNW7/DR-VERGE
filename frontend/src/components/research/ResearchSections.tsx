import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, Quote } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Callout, Badge } from "@/components/common/Primitives";
import { ResearchFigure } from "@/components/common/ResearchFigure";
import { LazyMonoBarChart } from "@/components/common/LazyChart";
import { ArchitectureDiagram, ShiftDiagram } from "@/components/common/Diagrams";
import { Sdg3Logo } from "@/components/common/Sdg3Logo";
import {
  abstract,
  paperMeta,
  researchQuestions,
  researchGap,
  methodStages,
  csdExplanation,
  sdgContent,
} from "@/data/researchContent";
import {
  datasets,
  externalValidation,
  externalCaveat,
  limitations,
  mechanismResults,
  mechanismMetricMeta,
  modelStats,
  researchFigures,
  rq1Verdict,
  efficiencyResults,
  DISCLAIMER_METRICS,
} from "@/data/researchMetrics";
import { siteConfig } from "@/config/siteConfig";
import { useScrollSpy, scrollToSection } from "@/hooks/useScrollSpy";
import { formatCompact } from "@/utils/formatting";
import { signed, ciText } from "@/utils/stats";
import { l, useI18n } from "@/i18n/context";

/* -------------------------------------------------------------------------- */
/* 6.2 Abstract + metadata                                                      */
/* -------------------------------------------------------------------------- */

export function AbstractSection() {
  const { t, tr } = useI18n();

  const meta: Array<{ label: React.ReactNode; value: React.ReactNode }> = [
    { label: t("Competition", "Kompetisi"), value: paperMeta.competition },
    { label: t("Field", "Bidang"), value: paperMeta.field },
    { label: t("Task", "Tugas"), value: tr(paperMeta.task) },
    {
      label: t("Dataset", "Dataset"),
      value: (
        <span className="flex flex-col gap-0.5">
          {paperMeta.datasets.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </span>
      ),
    },
    {
      label: t("Views", "Citra"),
      value: (
        <span className="flex flex-col gap-0.5">
          {paperMeta.views.map((v) => (
            <span key={v.en}>{tr(v)}</span>
          ))}
        </span>
      ),
    },
    { label: t("Classes", "Kelas"), value: tr(paperMeta.classes) },
    { label: t("Institution", "Institusi"), value: siteConfig.institution },
  ];

  return (
    <Section id="abstract">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3">
            <span className="eyebrow">{t("Abstract", "Abstrak")}</span>
            {abstract.isPlaceholder && <Badge tone="warn">{t("Draft", "*Draft*")}</Badge>}
          </div>

          {abstract.isPlaceholder && (
            // Never present draft prose as the published abstract.
            <Callout tone="note" className="mt-5">
              {tr(abstract.note)}
            </Callout>
          )}

          <div className="mt-7 flex flex-col gap-5">
            {abstract.paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-lg leading-relaxed text-foreground"
                    : "text-[15px] leading-relaxed text-muted-foreground"
                }
              >
                {tr(p)}
              </p>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="card-premium p-6 sm:p-7">
            <span className="eyebrow">{t("Research Metadata", "Metadata Penelitian")}</span>
            <dl className="mt-6 flex flex-col">
              {meta.map((m, i) => (
                <div
                  key={i}
                  className={
                    "flex justify-between gap-6 py-3.5 " +
                    (i < meta.length - 1 ? "border-b border-border" : "")
                  }
                >
                  <dt className="mono shrink-0 text-[10px] uppercase tracking-[0.14em] text-subtle">
                    {m.label}
                  </dt>
                  <dd className="text-right text-[13px] font-medium leading-snug">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {datasets.map((d) => (
              <div key={d.name} className="bg-card p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold">{d.name}</span>
                  <span className="mono text-right text-[9px] uppercase tracking-[0.12em] text-subtle">
                    {tr(d.role)}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {tr(d.detail)}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.3 Research questions                                                       */
/* -------------------------------------------------------------------------- */

export function ResearchQuestionsSection() {
  const { t, tr, pick } = useI18n();

  return (
    <Section id="questions" tone="surface">
      <SectionHeader
        eyebrow={t("Research Questions", "Pertanyaan Penelitian")}
        index="02"
        title={pick(
          <>
            Two questions, asked <em>separately</em>
          </>,
          <>
            Dua pertanyaan, diajukan <em>terpisah</em>
          </>,
        )}
        description={t(
          "One is about what the distillation transfers. The other is about what the deployment costs. They are evaluated independently and reported independently.",
          "Pertanyaan pertama menyangkut apa yang ditransfer oleh distilasi. Pertanyaan kedua menyangkut biaya *deployment*. Keduanya dievaluasi dan dilaporkan secara terpisah.",
        )}
        size="lg"
      />

      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {researchQuestions.map((rq, i) => (
          <Reveal key={rq.id} delay={i * 0.08}>
            <div className="card-premium flex h-full flex-col p-7 sm:p-9">
              <div className="flex items-baseline justify-between gap-4">
                <span className="display text-5xl sm:text-6xl">{rq.label}</span>
                <span className="mono text-right text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {tr(rq.topic)}
                </span>
              </div>

              <p className="mt-8 text-[15px] font-medium leading-relaxed text-foreground">
                {tr(rq.question)}
              </p>

              <div className="mt-auto pt-8">
                <span className="mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {t("Judged on", "Dinilai berdasarkan")}
                </span>
                <ul className="mt-3 flex flex-col gap-2">
                  {rq.judgedOn.map((j) => (
                    <li
                      key={j.en}
                      className="flex items-start gap-2.5 text-[13px] text-muted-foreground"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground"
                        aria-hidden="true"
                      />
                      <span>{tr(j)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.4 Research gap                                                             */
/* -------------------------------------------------------------------------- */

export function ResearchGapSection() {
  const { t, tr, pick } = useI18n();

  return (
    <Section id="gap">
      <SectionHeader
        eyebrow={t("Research Gap", "Celah Penelitian")}
        index="03"
        title={pick(
          <>
            Where this sits in the <em>literature</em>
          </>,
          <>
            Posisi penelitian ini dalam <em>literatur</em>
          </>,
        )}
        size="lg"
      />

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="eyebrow">{t("Existing approaches", "Pendekatan yang sudah ada")}</span>
          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {researchGap.existing.map((e) => (
              <div key={e.title.en} className="bg-card p-5">
                <h3 className="text-[13px] font-bold">{tr(e.title)}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {tr(e.body)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="grain relative flex h-full flex-col overflow-hidden rounded-2xl bg-foreground p-7 text-background sm:p-8">
            <Quote className="h-5 w-5 opacity-40" aria-hidden="true" />
            <p className="mt-6 text-xl font-semibold leading-snug tracking-tight">
              {tr(researchGap.question)}
            </p>
            <div className="mt-auto pt-8">
              <span className="mono text-[10px] uppercase tracking-[0.16em] opacity-60">
                {t("The specific question", "Pertanyaan spesifiknya")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Careful novelty wording — never "the first ever". */}
      <Reveal delay={0.08}>
        <Callout
          tone="research"
          title={t("Novelty claim, stated precisely", "Klaim kebaruan, dinyatakan secara cermat")}
          className="mt-6"
        >
          {tr(researchGap.novelty)}{" "}
          {t(
            "That is a statement about the literature we reviewed, not a claim of absolute priority.",
            "Pernyataan ini terbatas pada literatur yang kami kaji, bukan klaim sebagai yang pertama secara mutlak.",
          )}
        </Callout>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.5 / 6.6 Method + formulas                                                  */
/* -------------------------------------------------------------------------- */

export function MethodSection() {
  const { t, tr, pick } = useI18n();

  return (
    <Section id="method" tone="surface">
      <SectionHeader
        eyebrow={t("Method", "Metode")}
        index="04"
        title={pick(
          <>
            From two fields to one <em>ordinal grade</em>
          </>,
          <>
            Dari dua <i>field</i> menjadi satu <em>grade ordinal</em>
          </>,
        )}
        size="lg"
      />

      {/* Architecture */}
      <Reveal>
        <div className="mt-14 card-premium p-6 sm:p-8">
          <span className="eyebrow">{t("Architecture", "Arsitektur")}</span>
          <div className="mt-6 -mx-2 overflow-x-auto px-2 pb-2">
            <div className="min-w-[680px] text-foreground">
              <ArchitectureDiagram />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Stages */}
      <Reveal delay={0.06}>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {methodStages.map((s, i) => (
            <li key={s.title.en} className="flex flex-col gap-3 bg-card p-5">
              <span className="mono text-[10px] tracking-[0.16em] text-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[13px] font-bold leading-tight">{tr(s.title)}</h3>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{tr(s.body)}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* CSD formulas */}
      <Reveal delay={0.08}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="card-premium flex h-full flex-col p-7 sm:p-8">
              <span className="eyebrow mb-7">{t("The CSD objective", "Fungsi objektif CSD")}</span>
              <div className="flex flex-col gap-3">
                {csdExplanation.formulas.map((f, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-border bg-surface px-4 py-3.5">
                      <span className="mono text-base font-semibold">
                        {f.lhs}
                        {f.superscript && (
                          <sup className="text-[10px] opacity-70">{f.superscript}</sup>
                        )}
                      </span>
                      <span className="mono text-muted-foreground">=</span>
                      <span className="mono text-sm">{f.rhs}</span>
                    </div>
                    <div className="mt-1.5 pl-4 text-[11px] text-muted-foreground">
                      {tr(f.note)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-auto border-t border-border pt-6 text-[12px] leading-relaxed text-muted-foreground">
                {tr(csdExplanation.deltaMeaning)}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="card-premium flex h-full flex-col p-6 sm:p-8">
              <span className="eyebrow">{t("Transfer", "Transfer")}</span>
              <div className="mt-6 -mx-2 flex-1 overflow-x-auto px-2 pb-2">
                <div className="min-w-[620px] text-foreground">
                  <ShiftDiagram />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResearchFigure figure={researchFigures.architecture} />
          <ResearchFigure figure={researchFigures.workflow} />
        </div>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.7 RQ1 results                                                              */
/* -------------------------------------------------------------------------- */

export function Rq1ResultsSection() {
  const { t, tr, trs, pick, num, lang } = useI18n();

  const mechanismRows = (["shiftL1", "cosAgree", "benefitCorr"] as const).map((key) => ({
    key,
    meta: mechanismMetricMeta[key],
    rows: mechanismResults.map((r) => ({
      name: r.shortMethod,
      value: r[key],
      emphasis: r.isProposed,
    })),
  }));

  return (
    <Section id="rq1-results">
      <SectionHeader
        eyebrow={t("Results · RQ1", "Hasil · RQ1")}
        index="05"
        title={pick(
          <>
            Mechanism Works. <em>Predictive Superiority Is Not Established.</em>
          </>,
          <>
            Mekanismenya Berhasil. <em>Keunggulan Prediktif Belum Terbukti.</em>
          </>,
        )}
        description={t(
          "These are two separate findings and this page reports both with equal weight.",
          "Keduanya adalah temuan yang terpisah, dan halaman ini melaporkan keduanya dengan bobot yang sama.",
        )}
        size="lg"
      />

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: shift fidelity */}
        <Reveal>
          <div className="card-premium flex h-full flex-col p-7 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tight">
                {t("Shift Fidelity", "*Shift Fidelity*")}
              </h3>
              <Badge tone="solid">{t("CSD best on all three", "CSD terbaik pada ketiganya")}</Badge>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(
                "Whether the student reproduced the teacher's dual-view decision shift.",
                "Apakah *student* mereproduksi pergeseran keputusan *dual-view* milik *teacher*.",
              )}
            </p>

            <div className="mt-8 flex flex-col gap-8">
              {mechanismRows.map(({ key, meta, rows }) => (
                <div key={key}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="mono text-[11px] uppercase tracking-[0.14em]">
                      {tr(meta.label)}
                    </span>
                    <span className="mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                      {meta.direction === "lower"
                        ? t("lower better", "makin rendah makin baik")
                        : t("higher better", "makin tinggi makin baik")}
                    </span>
                  </div>
                  <LazyMonoBarChart
                    data={rows}
                    height={132}
                    digits={4}
                    domain={[
                      Math.max(0, Math.min(...rows.map((r) => r.value)) * 0.9),
                      Math.max(...rows.map((r) => r.value)) * 1.08,
                    ]}
                    ariaLabel={`${trs(meta.label)}: ${rows
                      .map((r) => `${r.name} ${num(r.value, 4)}`)
                      .join(", ")}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* RIGHT: predictive QWK */}
        <Reveal delay={0.08}>
          <div className="flex h-full flex-col rounded-2xl border-2 border-dashed border-foreground bg-card p-7 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tight">
                {t("Predictive QWK", "QWK Prediktif")}
              </h3>
              <Badge tone="warn">{t("All null", "Semua *null*")}</Badge>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(
                "Whether that mechanism gain produced better in-domain grading agreement.",
                "Apakah keunggulan mekanisme tersebut menghasilkan kesepakatan *grading in-domain* yang lebih baik.",
              )}
            </p>

            <div className="mt-8 flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
              {rq1Verdict.comparisons.map((c) => (
                <div key={c.pair.en} className="flex flex-col gap-1 bg-card px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13px] font-medium">{tr(c.pair)}</span>
                    <span className="mono whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {tr(c.outcome)}
                    </span>
                  </div>
                  <span className="mono text-[11px] tabular-nums text-subtle">
                    ΔQWK {signed(c.delta, lang)} · {ciText(c.ciLow, c.ciHigh, lang)}
                  </span>
                </div>
              ))}
            </div>

            <Callout
              tone="caution"
              title={t("Reading a null result", "Cara membaca hasil *null*")}
              className="mt-7"
            >
              {tr(rq1Verdict.note)}{" "}
              {t(
                "These comparisons are reported rather than omitted, because omitting them would leave the mechanism result looking like a predictive one.",
                "Perbandingan ini dilaporkan, bukan dihilangkan, karena menghilangkannya akan membuat hasil mekanisme tampak seolah-olah merupakan hasil prediktif.",
              )}
            </Callout>

            <div className="mt-auto pt-8">
              <p className="text-[15px] font-semibold leading-snug">{tr(rq1Verdict.predictive)}</p>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResearchFigure figure={researchFigures.csdMechanism} />
          <ResearchFigure figure={researchFigures.forest} />
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResearchFigure figure={researchFigures.performance} />
          <ResearchFigure figure={researchFigures.dualViewGain} />
        </div>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.8 RQ2 results                                                              */
/* -------------------------------------------------------------------------- */

export function Rq2ResultsSection() {
  const { t, ts, pick, num, lang } = useI18n();

  const latencyData = efficiencyResults
    .filter((r) => !r.variant.startsWith("Teacher"))
    .map((r) => ({
      name: r.variant.replace("Student ", "").replace("Student", "FP32"),
      value: r.latencyMs,
      emphasis: r.isSelected,
    }));

  return (
    <Section id="rq2-results" tone="surface">
      <SectionHeader
        eyebrow={t("Results · RQ2", "Hasil · RQ2")}
        index="06"
        title={pick(
          <>
            Efficiency Without Large <em>Performance Sacrifice</em>
          </>,
          <>
            Efisien Tanpa <em>Mengorbankan Banyak Performa</em>
          </>,
        )}
        size="lg"
      />

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <div className="card-premium flex h-full flex-col p-7 sm:p-8">
            <span className="eyebrow mb-7">
              {t("Single-thread CPU latency", "Latensi CPU *single-thread*")}
            </span>
            <LazyMonoBarChart
              data={latencyData}
              height={210}
              digits={2}
              unit="ms"
              ariaLabel={`${ts("CPU latency by variant", "Latensi CPU per varian")}: ${latencyData
                .map((d) => `${d.name} ${num(d.value, 2)} ${ts("milliseconds", "milidetik")}`)
                .join(", ")}`}
            />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-5">
          <div className="grid h-full gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatBlock
              value={`${num(modelStats.selectedQwkRetentionPct, 1)}%`}
              label={t("INT8 QWK retention", "Retensi QWK INT8")}
              detail={t(
                "Selected artifact, relative to the FP32 student",
                "Artefak terpilih, relatif terhadap *student* FP32",
              )}
            />
            <StatBlock
              value={`${num(modelStats.studentFp32LatencyMs, 2)} → ${num(modelStats.selectedDeploymentLatencyMs, 2)} ms`}
              label={t("FP32 to selected INT8", "Dari FP32 ke INT8 terpilih")}
              detail={t("Single-thread CPU inference", "Inferensi CPU *single-thread*")}
              emphasis
            />
            <StatBlock
              value={formatCompact(modelStats.studentParams, lang)}
              label={t("Student parameters", "Parameter *student*")}
              detail={t(
                `${modelStats.compressionFactor}× fewer than the teacher`,
                `${modelStats.compressionFactor}× lebih sedikit dibandingkan *teacher*`,
              )}
            />
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResearchFigure figure={researchFigures.retention} />
          <ResearchFigure figure={researchFigures.efficiency} />
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-6">
          <ResearchFigure figure={researchFigures.pareto} />
        </div>
      </Reveal>
    </Section>
  );
}

function StatBlock({
  value,
  label,
  detail,
  emphasis = false,
}: {
  value: string;
  label: React.ReactNode;
  detail: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col justify-center rounded-2xl border p-6 " +
        (emphasis
          ? "grain relative overflow-hidden border-foreground bg-foreground text-background"
          : "card-premium")
      }
    >
      <div className="mono text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-3 text-[13px] font-medium">{label}</div>
      <div
        className={
          "mt-1 text-[11px] " + (emphasis ? "text-background/65" : "text-muted-foreground")
        }
      >
        {detail}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.9 External validation                                                      */
/* -------------------------------------------------------------------------- */

export function ExternalValidationSection() {
  const { t, ts, tr, trs, pick, num } = useI18n();

  const data = externalValidation.map((r) => ({
    name: trs(r.model),
    value: r.qwk,
    emphasis: r.isSelected || r.isTeacher,
  }));

  return (
    <Section id="external">
      <SectionHeader
        eyebrow={t("External Validation", "Validasi Eksternal")}
        index="07"
        title={pick(
          <>
            DeepDRiD <em>Set-C</em>
          </>,
          <>
            DeepDRiD <em>Set-C</em>
          </>,
        )}
        description={t(
          "The confirmatory external partition. No tuning, threshold adjustment, or model selection happened on this data.",
          "Partisi eksternal konfirmatori. Tidak ada penyetelan, penyesuaian ambang, maupun pemilihan model yang dilakukan pada data ini.",
        )}
        size="lg"
      />

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <div className="card-premium p-7 sm:p-8">
            <span className="eyebrow mb-7 block">
              {t("Quadratic Weighted Kappa", "*Quadratic Weighted Kappa*")}
            </span>
            <LazyMonoBarChart
              data={data}
              height={260}
              digits={4}
              domain={[0, 0.9]}
              ariaLabel={`${ts("External QWK on DeepDRiD Set-C", "QWK eksternal pada DeepDRiD Set-C")}: ${data
                .map((d) => `${d.name} ${num(d.value, 4)}`)
                .join(", ")}`}
            />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-5">
          <div className="flex h-full flex-col gap-5">
            <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {externalValidation.map((r) => (
                <div
                  key={r.model.en}
                  className={
                    "flex items-center justify-between gap-4 px-5 py-3.5 " +
                    (r.isSelected ? "bg-foreground text-background" : "bg-card")
                  }
                >
                  <span className="text-[13px] font-medium">{tr(r.model)}</span>
                  <div className="flex items-center gap-3">
                    {r.isSelected && (
                      <span className="mono text-[9px] uppercase tracking-[0.12em] opacity-60">
                        {t("deployed", "di-*deploy*")}
                      </span>
                    )}
                    <span className="mono text-[13px] font-semibold tabular-nums">
                      {num(r.qwk, 4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* The caveat is not a footnote here — it sits beside the numbers. */}
            <Callout tone="caution" title={t("Do not overstate this", "Jangan dilebih-lebihkan")}>
              {tr(externalCaveat)}
            </Callout>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResearchFigure figure={researchFigures.externalSetC} />
          <ResearchFigure figure={researchFigures.internalVsExternal} />
        </div>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Supplementary figures                                                        */
/* -------------------------------------------------------------------------- */

export function FiguresSection() {
  const { t, tr, pick } = useI18n();
  const figs = [
    researchFigures.dataset,
    researchFigures.perGradeRecall,
    researchFigures.confusion,
    researchFigures.ordinalSafety,
  ];

  return (
    <Section id="figures" tone="surface">
      <SectionHeader
        eyebrow={t("Supplementary Figures", "Gambar Pendukung")}
        index="08"
        title={pick(
          <>
            Where the model succeeds and where it <em>fails</em>
          </>,
          <>
            Di mana model berhasil dan di mana model <em>gagal</em>
          </>,
        )}
        description={t(
          "Aggregate metrics hide per-grade behaviour. These figures show it directly.",
          "Metrik agregat menyembunyikan perilaku per *grade*. Gambar-gambar ini menunjukkannya secara langsung.",
        )}
        size="lg"
      />
      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {figs.map((f, i) => (
          <Reveal key={f.id} delay={i * 0.06}>
            <ResearchFigure figure={f} />
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <Callout tone="research" className="mt-10">
          {tr(DISCLAIMER_METRICS)}
        </Callout>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.10 Limitations                                                             */
/* -------------------------------------------------------------------------- */

export function LimitationsSection() {
  const { t, tr, pick } = useI18n();

  return (
    <Section id="limitations">
      <SectionHeader
        eyebrow={t("Limitations", "Keterbatasan")}
        index="09"
        title={pick(
          <>
            What this work does <em>not</em> establish
          </>,
          <>
            Hal yang <em>belum</em> dibuktikan penelitian ini
          </>,
        )}
        description={t(
          "Stated in full. A limitations section that is honest about the weaknesses is what makes the rest of the results worth trusting.",
          "Disampaikan secara lengkap. Bagian keterbatasan yang jujur terhadap kelemahan inilah yang membuat hasil-hasil lainnya layak dipercaya.",
        )}
        size="lg"
      />

      {/* The grid is revealed as one piece: cells fading in individually would
          briefly expose the hairline background as grey blocks. */}
      <Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {limitations.map((lim, i) => (
            <div
              key={lim.title.en}
              // An odd count would leave an empty hairline cell; the last item
              // spans the row instead.
              className={
                "flex h-full gap-4 bg-card p-6 sm:p-7 " +
                (i === limitations.length - 1 && limitations.length % 2 === 1
                  ? "sm:col-span-2"
                  : "")
              }
            >
              <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="flex items-start gap-2 text-[14px] font-bold leading-tight">
                  <AlertTriangle
                    className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{tr(lim.title)}</span>
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {tr(lim.body)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.11 SDG impact                                                              */
/* -------------------------------------------------------------------------- */

const pillars = [
  l("Research", "Penelitian"),
  l("Technology", "Teknologi"),
  l("Accessibility", "Aksesibilitas"),
  l("Preventive Health", "Kesehatan Preventif"),
];

export function SdgImpactSection() {
  const { t, tr } = useI18n();

  return (
    <Section id="sdg-impact" tone="inverted" className="grain overflow-hidden">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="w-32 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-background/20 sm:w-40">
            <Sdg3Logo />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight">SDG 3 — {tr(sdgContent.title)}</h2>
        </div>

        <div className="lg:col-span-8">
          <p className="text-lg font-medium leading-snug">{tr(sdgContent.intro)}</p>

          <div className="mt-9 flex flex-wrap gap-2.5">
            {pillars.map((p) => (
              <span
                key={p.en}
                className="mono rounded-full border border-background/30 px-4 py-1.5 text-[10px] uppercase tracking-[0.14em]"
              >
                {tr(p)}
              </span>
            ))}
          </div>

          {/* "Potential contribution", never "proven impact". */}
          <div className="mt-9 rounded-xl border border-background/25 border-l-[3px] border-l-background p-5">
            <div className="mono mb-2 text-[10px] uppercase tracking-[0.16em]">
              {t(
                "Potential contribution, not proven impact",
                "Potensi kontribusi, bukan dampak yang telah terbukti",
              )}
            </div>
            <p className="text-[13px] leading-relaxed opacity-70">{tr(sdgContent.caution)}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Reading order helper                                                         */
/* -------------------------------------------------------------------------- */

const tocSteps = [
  { id: "abstract", label: l("Abstract", "Abstrak") },
  { id: "questions", label: l("Questions", "Pertanyaan") },
  { id: "gap", label: l("Gap", "Celah") },
  { id: "method", label: l("Method", "Metode") },
  { id: "rq1-results", label: l("RQ1 Results", "Hasil RQ1") },
  { id: "rq2-results", label: l("RQ2 Results", "Hasil RQ2") },
  { id: "external", label: l("External", "Eksternal") },
  { id: "figures", label: l("Figures", "Gambar") },
  { id: "limitations", label: l("Limitations", "Keterbatasan") },
  { id: "sdg-impact", label: l("SDG 3", "SDG 3") },
];

export function ReadingOrder() {
  const { ts, trs } = useI18n();
  const active = useScrollSpy(tocSteps.map((s) => s.id));
  const activeIndex = tocSteps.findIndex((s) => s.id === active);
  const navRef = useRef<HTMLElement>(null);

  // Keep the active chip in view on narrow screens, where the row scrolls.
  useEffect(() => {
    if (!active || !navRef.current) return;
    const chip = navRef.current.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!chip) return;
    const nav = navRef.current;
    const left = chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2;
    nav.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <div className="no-print sticky top-[4.25rem] z-30 sm:top-[4.75rem]">
      <div className="mx-auto max-w-[1200px] px-3 sm:px-6 lg:px-8">
        <div className="glass flex items-center gap-3 rounded-full border border-border py-1.5 pl-4 pr-1.5 shadow-[0_10px_30px_-18px_hsl(var(--shadow-color)/0.4)]">
          <span className="mono hidden shrink-0 text-[10px] uppercase tracking-[0.16em] text-subtle sm:block">
            {activeIndex >= 0
              ? `${String(activeIndex + 1).padStart(2, "0")} / ${String(tocSteps.length).padStart(2, "0")}`
              : ts("On this page", "Di halaman ini")}
          </span>
          <span className="hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden="true" />
          <nav
            ref={navRef}
            aria-label={ts("On this page", "Di halaman ini")}
            className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
          >
            {tocSteps.map((st) => {
              const isActive = st.id === active;
              return (
                <button
                  key={st.id}
                  type="button"
                  data-id={st.id}
                  onClick={() => scrollToSection(st.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={
                    "relative shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors " +
                    (isActive ? "text-background" : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {isActive && (
                    <motion.span
                      layoutId="research-toc-pill"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">{trs(st.label)}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
