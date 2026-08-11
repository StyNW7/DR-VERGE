import { motion, useReducedMotion } from "framer-motion";
import { Zap, HardDrive } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Callout, Badge } from "@/components/common/Primitives";
import { modelStats, efficiencyResults, rq2Verdict } from "@/data/researchMetrics";
import { formatCompact } from "@/utils/formatting";
import { cn } from "@/lib/utils";

/** Animated proportional comparison bar. */
function CompareBar({
  label,
  sublabel,
  value,
  max,
  display,
  emphasis = false,
  delay = 0,
}: {
  label: string;
  sublabel: string;
  value: number;
  max: number;
  display: string;
  emphasis?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  // A floor keeps a tiny value (328K against 40.3M) visible rather than
  // collapsing to an invisible sliver.
  const pct = Math.max(2.5, (value / max) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <span className="text-sm font-semibold">{label}</span>
          <span className="mono ml-2 text-[10px] uppercase tracking-[0.12em] text-subtle">
            {sublabel}
          </span>
        </div>
        <span className="mono shrink-0 text-sm font-semibold">{display}</span>
      </div>
      <div className="h-8 w-full overflow-hidden rounded-md bg-muted">
        <motion.div
          className={cn("h-full rounded-md", emphasis ? "bg-foreground" : "bg-foreground/25")}
          initial={reduce ? { width: `${pct}%` } : { width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function Rq2Section() {
  const maxLatency = Math.max(...efficiencyResults.map((r) => r.latencyMs));

  return (
    <Section id="rq2">
      <SectionHeader
        eyebrow="RQ2 · Efficiency"
        title="Designed to Be Lightweight"
        description="The student is two orders of magnitude smaller than the teacher, and INT8 quantization cuts its CPU inference cost again."
        size="lg"
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-12">
        {/* Parameters */}
        <Reveal className="lg:col-span-5">
          <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7 sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <span className="eyebrow">Model size</span>
              <HardDrive className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-6">
              <CompareBar
                label="Teacher"
                sublabel="ResNet-50 dual-view"
                value={modelStats.teacherParams}
                max={modelStats.teacherParams}
                display={formatCompact(modelStats.teacherParams)}
              />
              <CompareBar
                label="Student"
                sublabel="DR-VERGE"
                value={modelStats.studentParams}
                max={modelStats.teacherParams}
                display={formatCompact(modelStats.studentParams)}
                emphasis
                delay={0.15}
              />
            </div>

            <div className="mt-auto flex items-baseline gap-3 border-t border-border pt-7">
              <span className="mono text-4xl font-bold tracking-tight">
                {modelStats.compressionFactor}×
              </span>
              <span className="text-sm leading-tight text-muted-foreground">
                fewer parameters
                <br />
                than the teacher
              </span>
            </div>
          </div>
        </Reveal>

        {/* Latency */}
        <Reveal delay={0.08} className="lg:col-span-7">
          <div className="flex h-full flex-col rounded-xl border border-border bg-card p-7 sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <span className="eyebrow">Single-thread CPU latency</span>
              <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-5">
              {efficiencyResults.map((r, i) => (
                <CompareBar
                  key={r.variant}
                  label={r.variant}
                  sublabel={r.precision}
                  value={r.latencyMs}
                  max={maxLatency}
                  display={`${r.latencyMs.toFixed(2)} ms`}
                  emphasis={r.isSelected}
                  delay={i * 0.08}
                />
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-7 sm:grid-cols-3">
              <div>
                <div className="mono text-2xl font-bold">
                  {modelStats.studentFp32LatencyMs.toFixed(2)}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">FP32 student, ms</div>
              </div>
              <div>
                <div className="mono text-2xl font-bold">
                  {modelStats.selectedDeploymentLatencyMs.toFixed(2)}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Selected INT8, ms
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="mono text-2xl font-bold">
                  {modelStats.ptqQwkRetentionPct}%
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  PTQ QWK retention
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-xl bg-foreground p-7 text-background sm:p-9 lg:col-span-2">
            <Badge tone="outline" className="border-background/30 text-background">
              Finding
            </Badge>
            <p className="mt-5 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {rq2Verdict.headline}
            </p>
          </div>
          {/* The disclaimer that stops the section reading as "INT8 is better". */}
          <Callout tone="caution" title="What this does not say">
            {rq2Verdict.caution}
          </Callout>
        </div>
      </Reveal>
    </Section>
  );
}
