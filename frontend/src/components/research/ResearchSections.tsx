import { useEffect, useRef, useState } from "react";
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
  externalCredibleFindings,
  externalSetup,
  rq2Comparisons,
  rq2ControlComparison,
  rq2Verdict,
  limitations,
  mechanismResults,
  mechanismMetricMeta,
  mechanismEvidence,
  mechanismInferenceInternal,
  mechanismInferenceExternal,
  baselineLabels,
  decompositionRows,
  shiftQuartiles,
  supplementaryFindings,
  supplementaryProvenance,
  type MechanismContrast,
  type MechanismMetricKey,
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
                    : "text-15 leading-relaxed text-muted-foreground"
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
                  <dt className="mono shrink-0 text-11 uppercase tracking-[0.14em] text-subtle">
                    {m.label}
                  </dt>
                  <dd className="text-right text-13 font-medium leading-snug">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {datasets.map((d) => (
              <div key={d.name} className="bg-card p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold">{d.name}</span>
                  <span className="mono text-right text-10 uppercase tracking-[0.12em] text-subtle">
                    {tr(d.role)}
                  </span>
                </div>
                <p className="mt-1.5 text-13 leading-relaxed text-muted-foreground">
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
                <span className="display text-5xl sm:text-6xl colorful:text-brand-gradient">{rq.label}</span>
                <span className="mono text-right text-11 uppercase tracking-[0.16em] text-muted-foreground">
                  {tr(rq.topic)}
                </span>
              </div>

              <p className="mt-8 text-15 font-medium leading-relaxed text-foreground">
                {tr(rq.question)}
              </p>

              <div className="mt-auto pt-8">
                <span className="mono text-11 uppercase tracking-[0.14em] text-subtle">
                  {t("Judged on", "Dinilai berdasarkan")}
                </span>
                <ul className="mt-3 flex flex-col gap-2">
                  {rq.judgedOn.map((j) => (
                    <li
                      key={j.en}
                      className="flex items-start gap-2.5 text-13 text-muted-foreground"
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
              <div key={e.title.en} className="bg-card p-5 colorful:hover:bg-brand-soft/60">
                <h3 className="text-13 font-bold">{tr(e.title)}</h3>
                <p className="mt-2 text-13 leading-relaxed text-muted-foreground">
                  {tr(e.body)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="grain inverse relative flex h-full flex-col overflow-hidden rounded-2xl p-7 sm:p-8">
            <Quote className="h-5 w-5 opacity-40" aria-hidden="true" />
            <p className="mt-6 text-xl font-semibold leading-snug tracking-tight">
              {tr(researchGap.question)}
            </p>
            <div className="mt-auto pt-8">
              <span className="mono text-11 uppercase tracking-[0.16em] opacity-60">
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
              <span className="mono text-11 tracking-[0.16em] text-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-13 font-bold leading-tight">{tr(s.title)}</h3>
              <p className="text-13 leading-relaxed text-muted-foreground">{tr(s.body)}</p>
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
                          <sup className="text-11 opacity-70">{f.superscript}</sup>
                        )}
                      </span>
                      <span className="mono text-muted-foreground">=</span>
                      <span className="mono text-sm">{f.rhs}</span>
                    </div>
                    <div className="mt-1.5 pl-4 text-12 text-muted-foreground">
                      {tr(f.note)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-auto border-t border-border pt-6 text-13 leading-relaxed text-muted-foreground">
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
            <p className="mt-3 text-14 leading-relaxed text-muted-foreground">
              {t(
                "Whether the student reproduced the teacher's dual-view decision shift.",
                "Apakah *student* mereproduksi pergeseran keputusan *dual-view* milik *teacher*.",
              )}
            </p>

            <div className="mt-8 flex flex-col gap-8">
              {mechanismRows.map(({ key, meta, rows }) => (
                <div key={key}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="mono text-12 uppercase tracking-[0.14em]">
                      {tr(meta.label)}
                    </span>
                    <span className="mono text-11 uppercase tracking-[0.12em] text-subtle">
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
          <div className="flex h-full flex-col rounded-2xl border-2 border-dashed border-foreground bg-card p-7 sm:p-8 colorful:border-amber-solid/60 colorful:bg-amber-soft/40">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tight">
                {t("Predictive QWK", "QWK Prediktif")}
              </h3>
              <Badge tone="warn">{t("All null", "Semua *null*")}</Badge>
            </div>
            <p className="mt-3 text-14 leading-relaxed text-muted-foreground">
              {t(
                "Whether that mechanism gain produced better in-domain grading agreement.",
                "Apakah keunggulan mekanisme tersebut menghasilkan kesepakatan *grading in-domain* yang lebih baik.",
              )}
            </p>

            <div className="mt-8 flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
              {rq1Verdict.comparisons.map((c) => (
                <div key={c.pair.en} className="flex flex-col gap-1 bg-card px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-13 font-medium">{tr(c.pair)}</span>
                    <span className="mono whitespace-nowrap text-12 uppercase tracking-[0.12em] text-muted-foreground colorful:font-semibold colorful:text-amber">
                      {tr(c.outcome)}
                    </span>
                  </div>
                  <span className="mono text-12 tabular-nums text-subtle">
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
              <p className="text-15 font-semibold leading-snug">{tr(rq1Verdict.predictive)}</p>
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
/* Mechanism evidence — supplementary analysis v2 (exploratory)                 */
/* -------------------------------------------------------------------------- */

type EvidenceDataset = "internal" | "external";

/**
 * One contrast as an interval on a shared axis. ShiftL1 is lower-is-better, so
 * its sign is flipped: in every row, right of zero means "favours CSD". The
 * printed numbers keep their original sign.
 */
function CiBar({ contrast, extent }: { contrast: MechanismContrast; extent: number }) {
  const flip = mechanismMetricMeta[contrast.metric].direction === "lower" ? -1 : 1;
  const lo = Math.min(contrast.ciLow * flip, contrast.ciHigh * flip);
  const hi = Math.max(contrast.ciLow * flip, contrast.ciHigh * flip);
  const pos = (v: number) => `${((v + extent) / (2 * extent)) * 100}%`;
  return (
    <div className="relative h-5" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      <div className="absolute top-0 h-full w-px bg-foreground/40" style={{ left: "50%" }} />
      <div
        className={
          "absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full " +
          (contrast.conclusive ? "bg-foreground colorful:bg-brand" : "bg-foreground/35")
        }
        style={{ left: pos(lo), width: `calc(${pos(hi)} - ${pos(lo)})` }}
      />
      <div
        className={
          "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 " +
          (contrast.conclusive
            ? "border-foreground bg-foreground colorful:border-brand colorful:bg-brand"
            : "border-foreground/60 bg-card")
        }
        style={{ left: pos(contrast.delta * flip) }}
      />
    </div>
  );
}

export function MechanismEvidenceSection() {
  const { t, ts, tr, trs, pick, num, lang } = useI18n();
  const [dataset, setDataset] = useState<EvidenceDataset>("internal");
  const contrasts = dataset === "internal" ? mechanismInferenceInternal : mechanismInferenceExternal;

  const metricKeys = ["shiftL1", "cosAgree", "benefitCorr"] as const;
  // One axis per metric, wide enough for both datasets, so toggling does not rescale.
  const extentFor = (key: MechanismMetricKey) =>
    Math.max(
      ...[...mechanismInferenceInternal, ...mechanismInferenceExternal]
        .filter((c) => c.metric === key)
        .flatMap((c) => [Math.abs(c.ciLow), Math.abs(c.ciHigh)]),
    ) * 1.08;

  const provenance = [
    {
      value: `${supplementaryProvenance.gatesPassed}/${supplementaryProvenance.gatesTotal}`,
      label: t("Integrity gates", "Gerbang integritas"),
    },
    {
      value: `${supplementaryProvenance.reproductionChecks}/${supplementaryProvenance.reproductionChecks}`,
      label: t("Original results reproduced", "Hasil asli tereproduksi"),
    },
    {
      value: num(supplementaryProvenance.checkpointsHashed, 0),
      label: t("Checkpoints, SHA-256 unchanged", "*Checkpoint*, SHA-256 tidak berubah"),
    },
    {
      value: `B = ${num(supplementaryProvenance.bootstrapResamples, 0)}`,
      label: t("Hierarchical bootstrap", "*Hierarchical bootstrap*"),
    },
  ];

  const layers = [
    {
      value: `${mechanismEvidence.conclusiveForCsd}/${mechanismEvidence.contrasts}`,
      label: t("contrasts conclusive, all for CSD", "kontras konklusif, semuanya untuk CSD"),
    },
    {
      value: `${mechanismEvidence.conclusiveForBaseline}/${mechanismEvidence.contrasts}`,
      label: t("favour a baseline", "menguntungkan pembanding"),
    },
    {
      value: `${mechanismEvidence.seedPairsFavouringCsd}/${mechanismEvidence.seedPairs}`,
      label: t("seed-contrast pairs favour CSD", "pasangan *seed*-kontras searah CSD"),
    },
    {
      value: `${mechanismEvidence.looStable}/${mechanismEvidence.contrasts}`,
      label: t("stable under leave-one-seed-out", "stabil pada *leave-one-seed-out*"),
    },
  ];

  const maxGap = Math.max(...decompositionRows.flatMap((r) => [r.shiftGap, r.baseGap]));

  return (
    <Section id="mechanism-evidence" tone="surface">
      <SectionHeader
        eyebrow={t("Supplementary Analysis · Exploratory", "Analisis Suplementer · Eksploratori")}
        index="06"
        title={pick(
          <>
            The mechanism advantage, <em>tested</em>
          </>,
          <>
            Keunggulan mekanisme, <em>diuji</em>
          </>,
        )}
        description={t(
          "An inference-only analysis on the frozen checkpoints asks three follow-up questions: is CSD's mechanism advantage statistically supported, does it hold on external data, and why does it not become higher QWK? Nothing was retrained, re-thresholded or re-selected.",
          "Analisis *inference-only* pada *checkpoint* beku menjawab tiga pertanyaan lanjutan: apakah keunggulan mekanisme CSD didukung secara statistik, apakah bertahan pada data eksternal, dan mengapa tidak menjadi QWK yang lebih tinggi? Tidak ada model yang dilatih ulang, diubah ambangnya, atau dipilih ulang.",
        )}
        size="lg"
      />

      {/* Provenance first: the original numbers were reproduced before anything new was computed. */}
      <Reveal>
        <dl className="mt-14 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-4">
          {provenance.map((p, i) => (
            <div
              key={i}
              className={
                "flex flex-col gap-1.5 p-5 sm:p-6 " +
                (i % 2 === 1 ? "border-l border-border " : "") +
                (i >= 2 ? "border-t border-border lg:border-t-0 " : "") +
                (i === 2 ? "lg:border-l" : "")
              }
            >
              <dt className="order-2 text-12 leading-snug text-muted-foreground">{p.label}</dt>
              <dd className="order-1 mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl colorful:text-brand">
                {p.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* The nine contrasts. */}
      <Reveal delay={0.06}>
        <div className="mt-6 card-premium p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold tracking-tight">
                {t("CSD minus each baseline, with 95% intervals", "CSD dikurangi tiap pembanding, dengan interval 95%")}
              </h3>
              <p className="mt-2 text-14 leading-relaxed text-muted-foreground">
                {tr(mechanismEvidence.headline)}
              </p>
            </div>
            <div
              role="group"
              aria-label={ts("Dataset", "Dataset")}
              className="inline-flex shrink-0 self-start rounded-full border border-border bg-surface p-1"
            >
              {(
                [
                  { key: "internal", label: t("DRTiD internal", "DRTiD internal") },
                  { key: "external", label: t("DeepDRiD Set-C", "DeepDRiD Set-C") },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setDataset(opt.key)}
                  aria-pressed={dataset === opt.key}
                  className={
                    "rounded-full px-4 py-1.5 text-12 font-medium transition-colors " +
                    (dataset === opt.key
                      ? "brand-fill text-background colorful:text-white"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
            {metricKeys.map((key) => {
              const meta = mechanismMetricMeta[key];
              const rows = contrasts.filter((c) => c.metric === key);
              const conclusive = rows.filter((c) => c.conclusive).length;
              const extent = extentFor(key);
              return (
                <div key={key} className="flex flex-col">
                  <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                    <span className="mono text-12 font-semibold uppercase tracking-[0.14em]">
                      {tr(meta.label)} {meta.arrow}
                    </span>
                    <span className="mono text-11 uppercase tracking-[0.12em] text-subtle">
                      {conclusive}/3 {t("conclusive", "konklusif")}
                    </span>
                  </div>
                  <ul className="mt-4 flex flex-col gap-5">
                    {rows.map((c) => (
                      <li key={c.baseline} className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between gap-3 text-13">
                          <span className="font-medium">
                            {t("vs", "vs")} {baselineLabels[c.baseline]}
                          </span>
                          <span className="mono tabular-nums">
                            {signed(c.delta, lang)}
                            {c.conclusive && <span className="ml-0.5 font-bold colorful:text-brand">*</span>}
                          </span>
                        </div>
                        <CiBar contrast={c} extent={extent} />
                        <div className="mono flex justify-between gap-3 text-11 tabular-nums text-subtle">
                          <span>{ciText(c.ciLow, c.ciHigh, lang)}</span>
                          <span>
                            {c.seedsFavouringCsd}/5 {t("seeds", "*seed*")}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mono mt-8 border-t border-border pt-5 text-11 leading-relaxed text-subtle">
            {t(
              "* 95% interval excludes zero. Bars are drawn so that right of the centre line always favours CSD (ShiftL1 is flipped because lower is better); the printed values keep their sign.",
              "* Interval 95% tidak memuat nol. Batang digambar sehingga sisi kanan garis tengah selalu menguntungkan CSD (ShiftL1 dibalik karena makin rendah makin baik); nilai yang tercetak tetap bertanda aslinya.",
            )}{" "}
            {dataset === "internal"
              ? t(
                  `Resampling unit: examined-eye record (n = ${supplementaryProvenance.internalRecords}).`,
                  `Unit resampling: *examined-eye record* (n = ${supplementaryProvenance.internalRecords}).`,
                )
              : t(
                  `Resampling unit: patient (${supplementaryProvenance.externalPatients} patients, both eyes together).`,
                  `Unit resampling: pasien (${supplementaryProvenance.externalPatients} pasien, kedua mata bersama).`,
                )}
          </p>
        </div>
      </Reveal>

      {/* Supporting layers. */}
      <Reveal delay={0.08}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:col-span-7">
            {layers.map((s, i) => (
              <div key={i} className="bg-card p-5 sm:p-6">
                <div className="mono text-2xl font-bold tracking-tight tabular-nums colorful:text-brand">
                  {s.value}
                </div>
                <div className="mt-2 text-13 leading-snug text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grain inverse relative flex flex-col justify-center overflow-hidden rounded-2xl p-7 lg:col-span-5">
            <span className="mono text-11 uppercase tracking-[0.16em] opacity-60">
              {t("Where the uncertainty comes from", "Asal ketidakpastian")}
            </span>
            <p className="mt-4 text-15 leading-relaxed">{tr(mechanismEvidence.seedNote)}</p>
          </div>
        </div>
      </Reveal>

      {/* Why fidelity does not become QWK, and when CSD helps. */}
      <Reveal delay={0.08}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-premium flex flex-col p-7 sm:p-8">
            <Badge tone="outline" className="self-start">{t("Why fidelity ≠ QWK", "Mengapa fidelitas ≠ QWK")}</Badge>
            <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface px-4 py-4">
              <p className="mono whitespace-nowrap text-center text-13 sm:text-sm">
                p<sub>dual</sub><sup>S</sup> − p<sub>dual</sub><sup>T</sup> = (p̄<sup>S</sup> − p̄<sup>T</sup>) + (Δ<sup>S</sup> − Δ<sup>T</sup>)
              </p>
              <p className="mono mt-2 text-center text-11 uppercase tracking-[0.12em] text-subtle">
                {t("output gap = base-aggregation gap + shift gap", "selisih output = selisih agregasi dasar + selisih shift")}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {decompositionRows.map((r) => (
                <div key={r.shortMethod}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-13">
                    <span className={r.isProposed ? "font-bold" : "font-medium"}>{r.shortMethod}</span>
                    <span className="mono text-12 tabular-nums text-subtle">QWK {num(r.qwk, 3)}</span>
                  </div>
                  {(
                    [
                      { k: "shift", v: r.shiftGap, label: t("shift gap", "selisih *shift*") },
                      { k: "base", v: r.baseGap, label: t("base-aggregation gap", "selisih agregasi dasar") },
                    ] as const
                  ).map((bar) => (
                    <div key={bar.k} className="flex items-center gap-3">
                      <span className="w-36 shrink-0 text-11 text-muted-foreground sm:w-40">{bar.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={
                            "h-full rounded-full " +
                            (r.isProposed
                              ? "bg-foreground colorful:bg-brand"
                              : "bg-foreground/35 colorful:bg-brand/35")
                          }
                          style={{ width: `${(bar.v / maxGap) * 100}%` }}
                        />
                      </div>
                      <span className="mono w-12 shrink-0 text-right text-12 tabular-nums">{num(bar.v, 3)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-border pt-5 text-14 leading-relaxed text-muted-foreground">
              {tr(supplementaryFindings.decomposition)}
            </p>
          </div>

          <div className="card-premium flex flex-col p-7 sm:p-8">
            <Badge tone="outline" className="self-start">{t("When CSD helps most", "Kapan CSD paling bermanfaat")}</Badge>
            <p className="mt-5 text-13 text-muted-foreground">
              {t(
                "Conclusive ShiftL1/CosAgree contrasts favouring CSD, out of 6, by quartile of the teacher's own shift magnitude |Δ_T| (DRTiD).",
                "Kontras ShiftL1/CosAgree yang konklusif menguntungkan CSD, dari 6, per kuartil besarnya *shift teacher* |Δ_T| (DRTiD).",
              )}
            </p>
            <div className="mt-6 grid grid-cols-4 items-end gap-3" style={{ height: 160 }}>
              {shiftQuartiles.map((q) => (
                <div key={q.bin} className="flex h-full flex-col items-center justify-end gap-2">
                  <span className="mono text-13 font-semibold tabular-nums">{q.conclusive}/6</span>
                  <div
                    className={
                      "w-full rounded-t-lg " +
                      (q.conclusive >= 4
                        ? "bg-foreground colorful:bg-brand"
                        : "bg-foreground/25 colorful:bg-brand/30")
                    }
                    style={{ height: `${Math.max(4, (q.conclusive / 6) * 100)}%` }}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-3 text-center">
              {shiftQuartiles.map((q) => (
                <div key={q.bin} className="flex flex-col gap-0.5">
                  <span className="mono text-12 font-semibold">{q.bin}</span>
                  <span className="mono text-11 tabular-nums text-subtle">|Δ_T| {num(q.meanShift, 3)}</span>
                  <span className="mono text-10 tabular-nums text-subtle">
                    {t("rel.", "rel.")} {num(q.relativeLow, 2)}–{num(q.relativeHigh, 2)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-border pt-5 text-14 leading-relaxed text-muted-foreground">
              {tr(supplementaryFindings.whenItHelps)}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Callout tone="research" title={t("Holds on Set-C", "Bertahan di Set-C")}>
            {tr(supplementaryFindings.external)}
          </Callout>
          <Callout tone="caution" title={t("Grade 1 stays hard", "Grade 1 tetap sulit")}>
            {tr(supplementaryFindings.grade1)}
          </Callout>
          <Callout tone="note" title={t("Stable to the metric choice", "Stabil terhadap pilihan metrik")}>
            {tr(supplementaryFindings.stability)}
          </Callout>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResearchFigure figure={researchFigures.internalExternalMechanism} />
          <ResearchFigure figure={researchFigures.decomposition} />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResearchFigure figure={researchFigures.mechanismForest} />
          <ResearchFigure figure={researchFigures.confusionCore} />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Callout tone="caution" title={t("How far these results reach", "Sejauh mana hasil ini berlaku")} className="mt-8">
          {tr(supplementaryFindings.boundaries)}{" "}
          <span className="mono text-12">{trs(mechanismEvidence.method)}</span>
        </Callout>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.8 RQ2 results                                                              */
/* -------------------------------------------------------------------------- */

export function Rq2ResultsSection() {
  const { t, ts, tr, pick, num, lang } = useI18n();

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
        index="07"
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

      {/* The pre-registered comparisons behind the headline, with both tests, so
          the one place they disagree is visible rather than averaged away. */}
      <Reveal delay={0.08}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="card-premium p-7 sm:p-8 lg:col-span-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tight">
                {t("Pre-registered QWK comparisons", "Perbandingan QWK pra-registrasi")}
              </h3>
              <Badge tone="outline">{t("Internal test set", "Data uji internal")}</Badge>
            </div>
            <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
              {[...rq2Comparisons, rq2ControlComparison].map((c) => {
                const ciCrossesZero = c.ciLow < 0 && c.ciHigh > 0;
                const permSignificant = c.pHolm < 0.05;
                const isControl = c.pair === rq2ControlComparison.pair;
                return (
                  <div key={c.pair} className="flex flex-col gap-1 bg-card px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-13 font-medium">
                        {c.pair}
                        {isControl && (
                          <span className="ml-2 text-12 font-normal text-subtle">
                            {t("(supplementary control)", "(kontrol suplemen)")}
                          </span>
                        )}
                      </span>
                      <span className="mono whitespace-nowrap text-12 uppercase tracking-[0.12em] text-muted-foreground colorful:font-semibold colorful:text-amber">
                        {ciCrossesZero && permSignificant
                          ? t("Tests disagree", "Uji tidak sepakat")
                          : t("Not credible", "Tidak kredibel")}
                      </span>
                    </div>
                    <span className="mono text-12 tabular-nums text-subtle">
                      ΔQWK {signed(c.delta, lang)} · {ciText(c.ciLow, c.ciHigh, lang)} · p
                      <sub>Holm</sub> = {num(c.pHolm, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-13 leading-relaxed text-muted-foreground">
              {tr(rq2Verdict.control)}
            </p>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="card-premium p-6">
              <Badge tone="outline">{t("Finding", "Temuan")}</Badge>
              <p className="mt-4 text-15 font-medium leading-relaxed">{tr(rq2Verdict.headline)}</p>
            </div>
            <Callout tone="caution" title={t("One unresolved comparison", "Satu perbandingan belum tuntas")}>
              {tr(rq2Verdict.disagreement)}
            </Callout>
            <Callout tone="research" title={t("What this does not say", "Yang tidak dinyatakan di sini")}>
              {tr(rq2Verdict.caution)}
            </Callout>
          </div>
        </div>
      </Reveal>

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
          ? "grain inverse relative overflow-hidden border-transparent"
          : "card-premium")
      }
    >
      <div className={"mono text-2xl font-bold tracking-tight " + (emphasis ? "" : "colorful:text-brand")}>
        {value}
      </div>
      <div className="mt-3 text-13 font-medium">{label}</div>
      <div
        className={
          "mt-1 text-12 " + (emphasis ? "text-background/65" : "text-muted-foreground")
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
  const { t, ts, tr, trs, pick, num, lang } = useI18n();

  const data = externalValidation.map((r) => ({
    name: trs(r.model),
    value: r.qwk,
    emphasis: r.isSelected || r.isTeacher,
  }));

  return (
    <Section id="external">
      <SectionHeader
        eyebrow={t("External Validation", "Validasi Eksternal")}
        index="08"
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
                    (r.isSelected ? "inverse" : "bg-card")
                  }
                >
                  <span className="text-13 font-medium">{tr(r.model)}</span>
                  <div className="flex items-center gap-3">
                    {r.isSelected && (
                      <span className="mono text-10 uppercase tracking-[0.12em] opacity-60">
                        {t("deployed", "di-*deploy*")}
                      </span>
                    )}
                    <span className="mono text-13 font-semibold tabular-nums">
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

      <Reveal delay={0.08}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* What the partition is, so the QWK values above have a denominator. */}
          <dl className="card-premium grid grid-cols-2 gap-x-6 gap-y-5 p-7 sm:grid-cols-3 sm:p-8 lg:col-span-5 lg:grid-cols-2">
            {[
              { k: t("Patients", "Pasien"), v: num(externalSetup.patients, 0) },
              { k: t("Eyes", "Mata"), v: num(externalSetup.eyes, 0) },
              { k: t("Images", "Citra"), v: num(externalSetup.images, 0) },
              { k: t("Exclusions", "Dikecualikan"), v: num(externalSetup.exclusions, 0) },
              { k: t("Student seeds", "*Seed student*"), v: num(externalSetup.seeds, 0) },
              {
                k: t("Teacher QWK retained", "QWK *teacher* dipertahankan"),
                v: `${num(externalSetup.teacherQwkRetainedPct, 1)}%`,
              },
            ].map((row, i) => (
              <div key={i}>
                <dt className="mono text-10 uppercase tracking-[0.14em] text-subtle">{row.k}</dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">{row.v}</dd>
              </div>
            ))}
          </dl>

          <div className="card-premium p-7 sm:p-8 lg:col-span-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tight">
                {t("The only credible differences on Set-C", "Satu-satunya perbedaan kredibel pada Set-C")}
              </h3>
              <Badge tone="warn">{t("Against the deployed model", "Merugikan model *deployment*")}</Badge>
            </div>
            <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
              {externalCredibleFindings.map((f) => (
                <div key={f.pair + f.metric} className="flex flex-col gap-1 bg-card px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-13 font-medium">{f.pair}</span>
                    <span className="mono whitespace-nowrap text-12 uppercase tracking-[0.12em] text-muted-foreground">
                      {f.metric}
                    </span>
                  </div>
                  <span className="text-13 text-muted-foreground">{tr(f.meaning)}</span>
                  <span className="mono text-12 tabular-nums text-subtle">
                    Δ {signed(f.delta, lang)} · {ciText(f.ciLow, f.ciHigh, lang)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-13 leading-relaxed text-muted-foreground">
              {t(
                "Every other paired Set-C comparison has an interval that includes zero. The teacher is a single run, so its value has no seed interval.",
                "Seluruh perbandingan berpasangan lain pada Set-C memiliki interval yang memuat nol. *Teacher* hanya dilatih satu kali, sehingga nilainya tidak memiliki interval antar-*seed*.",
              )}
            </p>
          </div>
        </div>
      </Reveal>

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
        index="09"
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
        index="10"
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
              <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-11 text-muted-foreground colorful:border-amber-line colorful:bg-amber-soft colorful:font-semibold colorful:text-amber">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="flex items-start gap-2 text-14 font-bold leading-tight">
                  <AlertTriangle
                    className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground colorful:text-amber"
                    aria-hidden="true"
                  />
                  <span>{tr(lim.title)}</span>
                </h3>
                <p className="mt-2 text-14 leading-relaxed text-muted-foreground">
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
                className="mono rounded-full border border-background/30 px-4 py-1.5 text-11 uppercase tracking-[0.14em] colorful:bg-white/10 colorful:font-semibold"
              >
                {tr(p)}
              </span>
            ))}
          </div>

          {/* "Potential contribution", never "proven impact". */}
          <div className="mt-9 rounded-xl border border-background/25 border-l-[3px] border-l-background p-5 colorful:border-l-amber-solid colorful:bg-white/[0.04]">
            <div className="mono mb-2 text-11 uppercase tracking-[0.16em] colorful:font-semibold colorful:text-[hsl(45_100%_75%)]">
              {t(
                "Potential contribution, not proven impact",
                "Potensi kontribusi, bukan dampak yang telah terbukti",
              )}
            </div>
            <p className="text-14 leading-relaxed opacity-70">{tr(sdgContent.caution)}</p>
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
  { id: "mechanism-evidence", label: l("Evidence", "Bukti") },
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
        <div className="glass flex items-center gap-3 rounded-full border border-border py-1.5 pl-4 pr-1.5 shadow-[0_10px_30px_-18px_hsl(var(--shadow-color)/0.4)] colorful:border-brand-line">
          <span className="mono hidden shrink-0 text-11 uppercase tracking-[0.16em] text-subtle sm:block">
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
                    "relative shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-12 font-medium transition-colors " +
                    (isActive
                      ? "text-background colorful:text-white"
                      : "text-muted-foreground hover:text-foreground colorful:hover:text-brand")
                  }
                >
                  {isActive && (
                    <motion.span
                      layoutId="research-toc-pill"
                      className="brand-fill absolute inset-0 rounded-full"
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
