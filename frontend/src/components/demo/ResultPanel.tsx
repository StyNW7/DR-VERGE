import { Info, Check, Cpu, Layers, Binary, Timer, Boxes, ScanEye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InferenceResult } from "@/services/inferenceApi";
import { getGrade, ordinalThresholdLabels, GRADE_CONSULT_NOTE } from "@/data/drGrades";
import { DISCLAIMER_SCORES } from "@/data/researchMetrics";
import { OrdinalScale } from "@/components/common/Diagrams";
import { Callout, ScoreBar, Badge } from "@/components/common/Primitives";
import { clamp01, formatMs, formatScore, formatTimestamp } from "@/utils/formatting";

/* -------------------------------------------------------------------------- */
/* Output hero                                                                 */
/* -------------------------------------------------------------------------- */

export function OutputHero({ result }: { result: InferenceResult }) {
  const grade = getGrade(result.grade);
  const maxGrade = 4;

  return (
    <div className="print-block overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid gap-px bg-border md:grid-cols-5">
        {/* The grade itself */}
        <div className="flex flex-col justify-between bg-foreground p-8 text-background md:col-span-2 sm:p-10">
          <div>
            <span className="mono text-[10px] uppercase tracking-[0.18em] opacity-60">
              Predicted DR Grade
            </span>
            <div className="display mt-5 text-[clamp(4.5rem,18vw,8rem)] leading-[0.82]">
              {grade?.display ?? String(result.grade)}
            </div>
          </div>
          <div className="mt-7">
            <div className="text-xl font-bold tracking-tight sm:text-2xl">
              {result.gradeName}
            </div>
            <div className="mono mt-2 text-[10px] uppercase tracking-[0.14em] opacity-60">
              Grade {result.grade} of {maxGrade}
            </div>
          </div>
        </div>

        {/* Ordinal position */}
        <div className="flex flex-col justify-center gap-8 bg-card p-8 md:col-span-3 sm:p-10">
          <div>
            <span className="eyebrow">Ordinal Severity</span>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              DR grades are ordered. The position on this scale carries meaning — an error
              of one grade is not the same as an error of three.
            </p>
          </div>

          <OrdinalScale active={result.grade} />

          {grade && (
            <div className="border-t border-border pt-6">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {grade.detail}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Ordinal threshold scores                                                    */
/* -------------------------------------------------------------------------- */

export function OrdinalThresholdScores({ result }: { result: InferenceResult }) {
  if (result.ordinalScores.length === 0) {
    return (
      <SectionCard title="Ordinal Threshold Scores" icon={Layers}>
        <EmptyNote>
          The inference service did not return cumulative threshold scores for this
          request.
        </EmptyNote>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Ordinal Threshold Scores"
      icon={Layers}
      description="DR-VERGE models DR grading through four cumulative ordinal decision thresholds. The predicted grade is the number of thresholds the model passes."
    >
      <div className="flex flex-col gap-5">
        {result.ordinalScores.map((score, i) => {
          const meta = ordinalThresholdLabels[i];
          const value = clamp01(score);
          // A threshold "passed" at the conventional 0.5 operating point.
          const passed = score > 0.5;

          return (
            <div key={i} className="print-block">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="mono text-sm font-semibold">
                    {meta?.key ?? `P(Y > ${i})`}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {meta?.meaning}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {passed && (
                    <span className="mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      passed
                    </span>
                  )}
                  <span className="mono text-sm font-semibold tabular-nums">
                    {formatScore(score, 4)}
                  </span>
                </div>
              </div>
              <ScoreBar value={value} emphasis={passed} />
            </div>
          );
        })}
      </div>

      <Callout tone="note" className="mt-7">
        {DISCLAIMER_SCORES}
      </Callout>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Relative grade scores                                                       */
/* -------------------------------------------------------------------------- */

export function RelativeGradeScores({ result }: { result: InferenceResult }) {
  if (result.gradeScores.length === 0) return null;

  const max = Math.max(...result.gradeScores);

  return (
    <SectionCard
      title="Relative Grade Scores"
      icon={Boxes}
      // NOT "probability distribution" — the API has not declared calibration.
      description="Relative score assigned to each of the five ordinal grades. These are model outputs, not calibrated probabilities."
    >
      <div className="flex flex-col gap-4">
        {result.gradeScores.map((score, g) => {
          const info = getGrade(g);
          const isPredicted = g === result.grade;
          return (
            <div key={g} className="print-block">
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      "mono text-sm",
                      isPredicted ? "font-bold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Grade {g}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{info?.name}</span>
                </div>
                <span
                  className={cn(
                    "mono text-sm tabular-nums",
                    isPredicted ? "font-bold" : "text-muted-foreground",
                  )}
                >
                  {formatScore(score, 4)}
                </span>
              </div>
              {/* Scaled to the largest score so the shape is readable even when
                  every value is small. */}
              <ScoreBar value={max > 0 ? score / max : 0} emphasis={isPredicted} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Dual-view input summary                                                     */
/* -------------------------------------------------------------------------- */

export function DualViewSummary({
  maculaName,
  discName,
}: {
  maculaName: string;
  discName: string;
}) {
  const rows = [
    { label: "Macula View", value: maculaName, done: true },
    { label: "Optic Disc View", value: discName, done: true },
    { label: "Dual-View Fusion", value: "Completed", done: true },
  ];

  return (
    <SectionCard title="Dual-View Input Summary" icon={ScanEye}>
      <ul className="flex flex-col gap-px overflow-hidden rounded-lg border border-border bg-border">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between gap-4 bg-card px-4 py-3.5"
          >
            <span className="flex items-center gap-3 text-[13px] font-medium">
              <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {r.label}
            </span>
            <span className="truncate text-[12px] text-muted-foreground" title={r.value}>
              {r.value}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">
        Both views are jointly processed by DR-VERGE. The final grade is produced from
        their fused representation, not from either view alone.
      </p>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Model information                                                           */
/* -------------------------------------------------------------------------- */

export function ModelInformation({ result }: { result: InferenceResult }) {
  const rows = [
    { label: "Model", value: result.model.name, icon: Cpu },
    { label: "Architecture", value: "Lightweight Dual-View Student", icon: Layers },
    { label: "Task", value: "5-Class Ordinal DR Grading", icon: Boxes },
    { label: "Input", value: "Macula + Optic Disc", icon: ScanEye },
    { label: "Variant", value: result.model.variant ?? "—", icon: Binary },
    { label: "Quantization", value: result.model.quantization ?? "—", icon: Binary },
    {
      label: "Inference Runtime",
      value: result.latencyMs !== null ? formatMs(result.latencyMs) : "—",
      icon: Timer,
    },
    { label: "Model Version", value: result.model.version ?? "—", icon: Info },
  ];

  return (
    <SectionCard title="Model Information" icon={Cpu}>
      <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="bg-card px-4 py-3.5">
            <dt className="mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              {r.label}
            </dt>
            <dd className="mt-1 truncate text-[13px] font-medium" title={r.value}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mono mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-subtle">
        <span>Round trip {formatMs(result.clientElapsedMs, 0)}</span>
        <span>{formatTimestamp(new Date(result.receivedAt))}</span>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Interpretation                                                              */
/* -------------------------------------------------------------------------- */

export function ResultInterpretation({ result }: { result: InferenceResult }) {
  const grade = getGrade(result.grade);
  if (!grade) return null;

  return (
    <SectionCard title="Result Interpretation" icon={Info}>
      <div className="flex flex-col gap-4">
        <div>
          <Badge tone="solid">{grade.name}</Badge>
          <p className="mt-4 text-[14px] leading-relaxed text-foreground">
            {grade.description}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {grade.detail}
          </p>
        </div>

        {/* No treatment advice, no urgency instruction — only this. */}
        <Callout tone="medical" title="Clinical interpretation">
          {GRADE_CONSULT_NOTE} This output is a research artifact produced by a prototype
          model and is not a diagnosis, a screening result, or a basis for any medical
          decision.
        </Callout>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared shell                                                                */
/* -------------------------------------------------------------------------- */

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="print-block rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          {description && (
            <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
      {children}
    </p>
  );
}
