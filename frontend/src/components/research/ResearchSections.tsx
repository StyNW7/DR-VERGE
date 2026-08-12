import { Check, AlertTriangle, ArrowRight, Quote } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import {
  SectionHeader,
  Reveal,
  Callout,
  Badge,
  Divider,
} from "@/components/common/Primitives";
import { ResearchFigure } from "@/components/common/ResearchFigure";
import { LazyMonoBarChart } from "@/components/common/LazyChart";
import { ArchitectureDiagram, ShiftDiagram } from "@/components/common/Diagrams";
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
import { formatCompact } from "@/utils/formatting";

/* -------------------------------------------------------------------------- */
/* 6.2 Abstract + metadata                                                      */
/* -------------------------------------------------------------------------- */

export function AbstractSection() {
  const meta: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Competition", value: paperMeta.competition },
    { label: "Field", value: paperMeta.field },
    { label: "Task", value: paperMeta.task },
    {
      label: "Dataset",
      value: (
        <span className="flex flex-col gap-0.5">
          {paperMeta.datasets.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </span>
      ),
    },
    {
      label: "Views",
      value: (
        <span className="flex flex-col gap-0.5">
          {paperMeta.views.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </span>
      ),
    },
    { label: "Classes", value: paperMeta.classes },
    { label: "Institution", value: siteConfig.institution },
  ];

  return (
    <Section id="abstract">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3">
            <span className="eyebrow">Abstract</span>
            {abstract.isPlaceholder && <Badge tone="warn">Draft</Badge>}
          </div>

          {abstract.isPlaceholder && (
            // Never present draft prose as the published abstract.
            <Callout tone="note" className="mt-5">
              {abstract.note} The final text will replace this once the paper is complete.
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
                {p}
              </p>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-7">
            <span className="eyebrow">Research Metadata</span>
            <dl className="mt-6 flex flex-col">
              {meta.map((m, i) => (
                <div
                  key={m.label}
                  className={
                    "flex justify-between gap-6 py-3.5 " +
                    (i < meta.length - 1 ? "border-b border-border" : "")
                  }
                >
                  <dt className="mono shrink-0 text-[10px] uppercase tracking-[0.14em] text-subtle">
                    {m.label}
                  </dt>
                  <dd className="text-right text-[13px] font-medium leading-snug">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border">
            {datasets.map((d) => (
              <div key={d.name} className="bg-card p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold">{d.name}</span>
                  <span className="mono text-[9px] uppercase tracking-[0.12em] text-subtle">
                    {d.role}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {d.detail}
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
  return (
    <Section id="questions" tone="surface">
      <SectionHeader
        eyebrow="Research Questions"
        title="Two questions, asked separately"
        description="One is about what the distillation transfers. The other is about what the deployment costs. They are evaluated independently and reported independently."
        size="lg"
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {researchQuestions.map((rq, i) => (
          <Reveal key={rq.id} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7 sm:p-9">
              <div className="flex items-baseline justify-between gap-4">
                <span className="display text-5xl sm:text-6xl">{rq.label}</span>
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {rq.topic}
                </span>
              </div>

              <p className="mt-8 text-[15px] font-medium leading-relaxed text-foreground">
                {rq.question}
              </p>

              <div className="mt-auto pt-8">
                <span className="mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  Judged on
                </span>
                <ul className="mt-3 flex flex-col gap-2">
                  {rq.judgedOn.map((j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-[13px] text-muted-foreground"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground"
                        aria-hidden="true"
                      />
                      {j}
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
  return (
    <Section id="gap">
      <SectionHeader
        eyebrow="Research Gap"
        title="Where this sits in the literature"
        size="lg"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="eyebrow">Existing approaches</span>
          <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {researchGap.existing.map((e) => (
              <div key={e.title} className="bg-card p-5">
                <h3 className="text-[13px] font-bold">{e.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {e.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex h-full flex-col rounded-xl bg-foreground p-7 text-background sm:p-8">
            <Quote className="h-5 w-5 opacity-40" aria-hidden="true" />
            <p className="mt-6 text-xl font-semibold leading-snug tracking-tight">
              {researchGap.question}
            </p>
            <div className="mt-auto pt-8">
              <span className="mono text-[10px] uppercase tracking-[0.16em] opacity-50">
                The specific question
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Careful novelty wording — never "the first ever". */}
      <Reveal delay={0.08}>
        <Callout tone="research" title="Novelty claim, stated precisely" className="mt-6">
          {researchGap.novelty} That is a statement about the literature we reviewed, not a
          claim of absolute priority.
        </Callout>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.5 / 6.6 Method + formulas                                                  */
/* -------------------------------------------------------------------------- */

export function MethodSection() {
  return (
    <Section id="method" tone="surface">
      <SectionHeader
        eyebrow="Method"
        title="From two fields to one ordinal grade"
        size="lg"
      />

      {/* Architecture */}
      <Reveal>
        <div className="mt-14 rounded-xl border border-border bg-card p-6 sm:p-8">
          <span className="eyebrow">Architecture</span>
          <div className="mt-6 -mx-2 overflow-x-auto px-2 pb-2">
            <div className="min-w-[680px] text-foreground">
              <ArchitectureDiagram />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Stages */}
      <Reveal delay={0.06}>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {methodStages.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3 bg-card p-5">
              <span className="mono text-[10px] tracking-[0.16em] text-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[13px] font-bold leading-tight">{s.title}</h3>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* CSD formulas */}
      <Reveal delay={0.08}>
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7 sm:p-8">
              <span className="eyebrow mb-7">The CSD objective</span>
              <div className="flex flex-col gap-3">
                {csdExplanation.formulas.map((f, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-border bg-surface px-4 py-3.5">
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
                      {f.note}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-auto border-t border-border pt-6 text-[12px] leading-relaxed text-muted-foreground">
                {csdExplanation.deltaMeaning}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 sm:p-8">
              <span className="eyebrow">Transfer</span>
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
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
  const mechanismRows = (
    ["shiftL1", "cosAgree", "benefitCorr"] as const
  ).map((key) => ({
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
        eyebrow="Results · RQ1"
        title="Mechanism Works. Predictive Superiority Is Not Established."
        description="These are two separate findings and this page reports both with equal weight."
        size="lg"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {/* LEFT: shift fidelity */}
        <Reveal>
          <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-bold tracking-tight">Shift Fidelity</h3>
              <Badge tone="solid">CSD best on all three</Badge>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              Whether the student reproduced the teacher's dual-view decision shift.
            </p>

            <div className="mt-8 flex flex-col gap-8">
              {mechanismRows.map(({ key, meta, rows }) => (
                <div key={key}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="mono text-[11px] uppercase tracking-[0.14em]">
                      {meta.label}
                    </span>
                    <span className="mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                      {meta.direction === "lower" ? "lower better" : "higher better"}
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
                    ariaLabel={`${meta.label} by method: ${rows
                      .map((r) => `${r.name} ${r.value.toFixed(4)}`)
                      .join(", ")}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* RIGHT: predictive QWK */}
        <Reveal delay={0.08}>
          <div className="flex h-full flex-col rounded-xl border-2 border-dashed border-foreground bg-card p-7 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-bold tracking-tight">Predictive QWK</h3>
              <Badge tone="warn">All null</Badge>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              Whether that mechanism gain produced better in-domain grading agreement.
            </p>

            <div className="mt-8 flex flex-col gap-px overflow-hidden rounded-lg border border-border bg-border">
              {rq1Verdict.comparisons.map((c) => (
                <div
                  key={c.pair}
                  className="flex items-center justify-between gap-4 bg-card px-5 py-4"
                >
                  <span className="text-[13px] font-medium">{c.pair}</span>
                  <span className="mono whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {c.outcome}
                  </span>
                </div>
              ))}
            </div>

            <Callout tone="caution" title="Reading a null result" className="mt-7">
              {rq1Verdict.note} These comparisons are reported rather than omitted, because
              omitting them would leave the mechanism result looking like a predictive one.
            </Callout>

            <div className="mt-auto pt-8">
              <p className="text-[15px] font-semibold leading-snug">
                {rq1Verdict.predictive}
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ResearchFigure figure={researchFigures.csdMechanism} />
          <ResearchFigure figure={researchFigures.forest} />
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
        eyebrow="Results · RQ2"
        title="Efficiency Without Large Performance Sacrifice"
        size="lg"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7 sm:p-8">
            <span className="eyebrow mb-7">Single-thread CPU latency</span>
            <LazyMonoBarChart
              data={latencyData}
              height={210}
              digits={2}
              unit="ms"
              ariaLabel={`CPU latency by variant: ${latencyData
                .map((d) => `${d.name} ${d.value.toFixed(2)} milliseconds`)
                .join(", ")}`}
            />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-5">
          <div className="grid h-full gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatBlock
              value={`${modelStats.selectedQwkRetentionPct}%`}
              label="INT8 QWK retention"
              detail="Selected artifact, relative to the FP32 student"
            />
            <StatBlock
              value={`${modelStats.studentFp32LatencyMs.toFixed(2)} → ${modelStats.selectedDeploymentLatencyMs.toFixed(2)} ms`}
              label="FP32 to selected INT8"
              detail="Single-thread CPU inference"
              emphasis
            />
            <StatBlock
              value={formatCompact(modelStats.studentParams)}
              label="Student parameters"
              detail={`${modelStats.compressionFactor}× fewer than the teacher`}
            />
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
  label: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col justify-center rounded-xl border p-6 " +
        (emphasis
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card")
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
  const data = externalValidation.map((r) => ({
    name: r.model,
    value: r.qwk,
    emphasis: r.isSelected || r.isTeacher,
  }));

  return (
    <Section id="external">
      <SectionHeader
        eyebrow="External Validation"
        title="DeepDRiD Set-C"
        description="The confirmatory external partition. No tuning, threshold adjustment, or model selection happened on this data."
        size="lg"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <div className="rounded-xl border border-border bg-card p-7 sm:p-8">
            <span className="eyebrow mb-7 block">Quadratic Weighted Kappa</span>
            <LazyMonoBarChart
              data={data}
              height={260}
              digits={4}
              domain={[0, 0.9]}
              ariaLabel={`External QWK on DeepDRiD Set-C: ${data
                .map((d) => `${d.name} ${d.value.toFixed(4)}`)
                .join(", ")}`}
            />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-5">
          <div className="flex h-full flex-col gap-5">
            <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
              {externalValidation.map((r) => (
                <div
                  key={r.model}
                  className={
                    "flex items-center justify-between gap-4 px-5 py-3.5 " +
                    (r.isSelected ? "bg-foreground text-background" : "bg-card")
                  }
                >
                  <span className="text-[13px] font-medium">{r.model}</span>
                  <div className="flex items-center gap-3">
                    {r.isSelected && (
                      <span className="mono text-[9px] uppercase tracking-[0.12em] opacity-60">
                        selected
                      </span>
                    )}
                    <span className="mono text-[13px] font-semibold tabular-nums">
                      {r.qwk.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* The caveat is not a footnote here — it sits beside the numbers. */}
            <Callout tone="caution" title="Do not overstate this">
              {externalCaveat}
            </Callout>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
  const figs = [
    researchFigures.dataset,
    researchFigures.perGradeRecall,
    researchFigures.confusion,
    researchFigures.ordinalSafety,
  ];

  return (
    <Section id="figures" tone="surface">
      <SectionHeader
        eyebrow="Supplementary Figures"
        title="Where the model succeeds and where it fails"
        description="Aggregate metrics hide per-grade behaviour. These figures show it directly."
        size="lg"
      />
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        {figs.map((f, i) => (
          <Reveal key={f.id} delay={i * 0.06}>
            <ResearchFigure figure={f} />
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <Callout tone="research" className="mt-10">
          {DISCLAIMER_METRICS}
        </Callout>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.10 Limitations                                                             */
/* -------------------------------------------------------------------------- */

export function LimitationsSection() {
  return (
    <Section id="limitations">
      <SectionHeader
        eyebrow="Limitations"
        title="What this work does not establish"
        description="Stated in full. A limitations section that is honest about the weaknesses is what makes the rest of the results worth trusting."
        size="lg"
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        {limitations.map((l, i) => (
          <Reveal key={l.title} delay={i * 0.04}>
            <div className="flex h-full gap-4 bg-card p-6 sm:p-7">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-[14px] font-bold leading-tight">{l.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {l.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6.11 SDG impact                                                              */
/* -------------------------------------------------------------------------- */

export function SdgImpactSection() {
  const pillars = ["Research", "Technology", "Accessibility", "Preventive Health"];

  return (
    <Section id="sdg-impact" tone="inverted">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <span className="display text-display-lg leading-none">{sdgContent.number}</span>
          <h2 className="mt-6 text-2xl font-bold tracking-tight">
            SDG {sdgContent.number} — {sdgContent.title}
          </h2>
        </div>

        <div className="lg:col-span-8">
          <p className="text-lg font-medium leading-snug">{sdgContent.intro}</p>

          <div className="mt-9 flex flex-wrap gap-2.5">
            {pillars.map((p) => (
              <span
                key={p}
                className="mono rounded-full border border-background/30 px-4 py-1.5 text-[10px] uppercase tracking-[0.14em]"
              >
                {p}
              </span>
            ))}
          </div>

          {/* "Potential contribution", never "proven impact". */}
          <div className="mt-9 rounded-lg border border-background/25 border-l-[3px] border-l-background p-5">
            <div className="mono mb-2 text-[10px] uppercase tracking-[0.16em]">
              Potential contribution, not proven impact
            </div>
            <p className="text-[13px] leading-relaxed opacity-70">{sdgContent.caution}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Reading order helper                                                         */
/* -------------------------------------------------------------------------- */

export function ReadingOrder() {
  const steps = [
    { id: "abstract", label: "Abstract" },
    { id: "questions", label: "Research Questions" },
    { id: "gap", label: "Research Gap" },
    { id: "method", label: "Method" },
    { id: "rq1-results", label: "RQ1 Results" },
    { id: "rq2-results", label: "RQ2 Results" },
    { id: "external", label: "External Validation" },
    { id: "figures", label: "Figures" },
    { id: "limitations", label: "Limitations" },
  ];

  return (
    <div className="no-print border-y border-border bg-surface">
      <div className="mx-auto max-w-[1200px] px-5 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="mono shrink-0 text-[10px] uppercase tracking-[0.16em] text-subtle">
            On this page
          </span>
          <Divider className="hidden h-4 w-px shrink-0 border-l border-border sm:block" />
          <nav className="flex items-center gap-1">
            {steps.map((s, i) => (
              <span key={s.id} className="flex shrink-0 items-center">
                <a
                  href={`#${s.id}`}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s.label}
                </a>
                {i < steps.length - 1 && (
                  <ArrowRight
                    className="h-3 w-3 shrink-0 text-subtle"
                    aria-hidden="true"
                  />
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
