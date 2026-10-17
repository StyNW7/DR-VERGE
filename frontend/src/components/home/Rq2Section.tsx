import { motion, useReducedMotion } from "framer-motion";
import { Zap, HardDrive } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Callout, Badge } from "@/components/common/Primitives";
import { modelStats, efficiencyResults, rq2Verdict } from "@/data/researchMetrics";
import { formatCompact } from "@/utils/formatting";
import { useI18n } from "@/i18n/context";
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
  label: React.ReactNode;
  sublabel: React.ReactNode;
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
          <span className="mono ml-2 text-11 uppercase tracking-[0.12em] text-subtle">
            {sublabel}
          </span>
        </div>
        <span className={cn("mono shrink-0 text-sm font-semibold", emphasis && "colorful:text-brand")}>
          {display}
        </span>
      </div>
      <div className="h-8 w-full overflow-hidden rounded-lg bg-muted colorful:bg-brand-soft">
        <motion.div
          className={cn("h-full rounded-lg", emphasis ? "brand-fill" : "bg-foreground/25 colorful:bg-[hsl(var(--chart-2))]")}
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
  const { t, tr, pick, num, lang } = useI18n();
  const maxLatency = Math.max(...efficiencyResults.map((r) => r.latencyMs));

  return (
    <Section id="rq2">
      <SectionHeader
        eyebrow={t("RQ2 · Efficiency", "RQ2 · Efisiensi")}
        index="06"
        title={pick(
          <>
            Designed to Be <em>Lightweight</em>
          </>,
          <>
            Dirancang agar <em>Ringan</em>
          </>,
        )}
        description={t(
          "The student is two orders of magnitude smaller than the teacher, and INT8 quantization cuts its CPU inference cost again.",
          "*Student* berukuran dua orde besaran lebih kecil daripada *teacher*, dan kuantisasi INT8 memangkas lagi biaya inferensinya di CPU.",
        )}
        size="lg"
      />

      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Parameters */}
        <Reveal className="lg:col-span-5">
          <div className="card-premium flex h-full flex-col p-7 sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <span className="eyebrow">{t("Model size", "Ukuran model")}</span>
              <HardDrive className="h-4 w-4 text-muted-foreground colorful:text-brand" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-6">
              <CompareBar
                label={t("Teacher", "*Teacher*")}
                sublabel={t("ResNet-50 dual-view", "ResNet-50 *dual-view*")}
                value={modelStats.teacherParams}
                max={modelStats.teacherParams}
                display={formatCompact(modelStats.teacherParams, lang)}
              />
              <CompareBar
                label={t("Student", "*Student*")}
                sublabel="DR-VERGE"
                value={modelStats.studentParams}
                max={modelStats.teacherParams}
                display={formatCompact(modelStats.studentParams, lang)}
                emphasis
                delay={0.15}
              />
            </div>

            <div className="mt-auto flex items-baseline gap-3 border-t border-border pt-7">
              <span className="mono text-4xl font-bold tracking-tight colorful:text-brand-gradient">
                {modelStats.compressionFactor}×
              </span>
              <span className="text-sm leading-tight text-muted-foreground">
                {pick(
                  <>
                    fewer parameters
                    <br />
                    than the teacher
                  </>,
                  <>
                    parameter lebih sedikit
                    <br />
                    dibandingkan <i>teacher</i>
                  </>,
                )}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Latency */}
        <Reveal delay={0.08} className="lg:col-span-7">
          <div className="card-premium flex h-full flex-col p-7 sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <span className="eyebrow">
                {t("Single-thread CPU latency", "Latensi CPU *single-thread*")}
              </span>
              <Zap className="h-4 w-4 text-muted-foreground colorful:text-amber" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-5">
              {efficiencyResults.map((r, i) => (
                <CompareBar
                  key={r.variant}
                  label={r.variant}
                  sublabel={r.precision}
                  value={r.latencyMs}
                  max={maxLatency}
                  display={`${num(r.latencyMs, 2)} ms`}
                  emphasis={r.isSelected}
                  delay={i * 0.08}
                />
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-7 sm:grid-cols-3">
              <div>
                <div className="mono text-2xl font-bold colorful:text-coral">
                  {num(modelStats.studentFp32LatencyMs, 2)}
                </div>
                <div className="mt-1 text-12 text-muted-foreground">
                  {t("FP32 student, ms", "*Student* FP32, ms")}
                </div>
              </div>
              <div>
                <div className="mono text-2xl font-bold colorful:text-brand">
                  {num(modelStats.selectedDeploymentLatencyMs, 2)}
                </div>
                <div className="mt-1 text-12 text-muted-foreground">
                  {t("Selected INT8, ms", "INT8 terpilih, ms")}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="mono text-2xl font-bold colorful:text-amber">
                  {num(modelStats.selectedQwkRetentionPct, 1)}%
                </div>
                <div className="mt-1 text-12 text-muted-foreground">
                  {t("INT8 QWK retention", "Retensi QWK INT8")}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="grain inverse relative overflow-hidden rounded-2xl p-7 sm:p-9 lg:col-span-2">
            <Badge
              tone="outline"
              className="border-background/30 text-background colorful:border-white/40 colorful:bg-white/10 colorful:text-white"
            >
              {t("Finding", "Temuan")}
            </Badge>
            <p className="mt-5 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {tr(rq2Verdict.headline)}
            </p>
          </div>
          {/* The disclaimer that stops the section reading as "INT8 is better". */}
          <Callout tone="caution" title={t("What this does not say", "Yang tidak dinyatakan di sini")}>
            {tr(rq2Verdict.caution)}
          </Callout>
        </div>
      </Reveal>
    </Section>
  );
}
