import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, ArrowDown, Cpu, Lock, FlaskConical } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/layout/PageContainer";
import { siteConfig, runsOnDevice } from "@/config/siteConfig";
import { heroStats } from "@/data/researchMetrics";
import { heroExample } from "@/data/samples";
import { getGrade, ordinalThresholdLabels } from "@/data/drGrades";
import { scrollToSection } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const trust = [
  ...(runsOnDevice
    ? [
        { icon: Cpu, label: "Runs in your browser" },
        { icon: Lock, label: "Images never leave your device" },
      ]
    : []),
  { icon: FlaskConical, label: "Research prototype · not for clinical use" },
];

/** One real fundus field, shown in grayscale so the page stays monochrome. */
function FieldTile({
  src,
  index,
  label,
  delay,
}: {
  src: string;
  index: string;
  label: string;
  delay: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className="group relative aspect-square overflow-hidden rounded-2xl bg-black ring-1 ring-border"
    >
      <img
        src={src}
        alt={`${label} fundus photograph from the public DeepDRiD dataset, shown in grayscale`}
        loading="eager"
        decoding="async"
        className="h-full w-full scale-[1.04] object-cover grayscale contrast-[1.15] transition-transform duration-[1200ms] ease-editorial group-hover:scale-[1.1]"
      />
      {/* Inner vignette keeps the label legible on any photograph. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between">
        <span className="mono rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-white backdrop-blur">
          {index} · {label}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * The hero visual: a real dual-view pair flowing into the student, and the
 * student's real cumulative threshold scores for that exact pair.
 */
function HeroVisual() {
  const reduce = useReducedMotion();
  const scores = heroExample.cumulativeScores;
  const passed = scores.filter((s) => s > heroExample.decisionThreshold).length;
  const grade = getGrade(passed);

  return (
    <div className="card-premium relative rounded-[28px] p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="mono inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground" />
          </span>
          Real model output
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          Eye {heroExample.sampleId}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <FieldTile src={heroExample.macula} index="01" label="Macula" delay={0.15} />
        <FieldTile src={heroExample.disc} index="02" label="Optic disc" delay={0.25} />
      </div>

      {/* Converging connectors */}
      <svg
        viewBox="0 0 400 44"
        className="h-9 w-full text-foreground/25 sm:h-11"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path d="M100 0 C 100 26, 200 18, 200 44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className={reduce ? "" : "animate-dash-flow"} />
        <path d="M300 0 C 300 26, 200 18, 200 44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className={reduce ? "" : "animate-dash-flow"} />
      </svg>

      {/* The model */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
        className="grain relative overflow-hidden rounded-2xl bg-foreground px-4 py-3.5 text-background"
      >
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-tight">
              {siteConfig.projectName} student
            </div>
            <div className="mono truncate text-[9px] uppercase tracking-[0.14em] opacity-60">
              Shared encoder · interaction fusion · CORAL
            </div>
          </div>
          <span className="mono shrink-0 rounded-full border border-background/20 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] opacity-80">
            328K params
          </span>
        </div>
        {!reduce && (
          <motion.div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-background/10 to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        )}
      </motion.div>

      {/* Its output */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
        className="mt-2.5 rounded-2xl border border-border bg-surface/70 p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Ordinal threshold scores
          </span>
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-subtle">
            pass at {heroExample.decisionThreshold.toFixed(1)}
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {scores.map((s, i) => {
            const isPassed = s > heroExample.decisionThreshold;
            return (
              <li key={i} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3">
                <span className={cn("mono text-[11px]", isPassed ? "text-foreground" : "text-muted-foreground")}>
                  {ordinalThresholdLabels[i]?.key ?? `P(Y > ${i})`}
                </span>
                <span className="relative h-1.5 overflow-hidden rounded-full bg-foreground/10">
                  <motion.span
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      isPassed ? "bg-foreground" : "bg-foreground/35",
                    )}
                    initial={reduce ? { width: `${s * 100}%` } : { width: 0 }}
                    animate={{ width: `${s * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.75 + i * 0.08, ease: EASE }}
                  />
                  {/* The 0.5 decision line. */}
                  <span className="absolute inset-y-0 left-1/2 w-px bg-background/80" aria-hidden="true" />
                </span>
                <span className="mono text-right text-[11px] tabular-nums text-muted-foreground">
                  {s.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-[12px] text-muted-foreground">
            {passed} of {scores.length} thresholds passed
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[12px] font-semibold text-background">
            Grade {passed}
            <span className="font-normal opacity-70">· {grade?.name}</span>
          </span>
        </div>
      </motion.div>

      <p className="mono mt-3 px-1 text-center text-[9px] uppercase tracking-[0.14em] text-subtle">
        {heroExample.credit} · shown in grayscale · research output, not a diagnosis
      </p>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: EASE },
        };

  return (
    <section className="grain relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
      {/* Background: spotlight + grid paper, both pure foreground alpha. */}
      <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="grid-bg fade-mask-radial pointer-events-none absolute inset-x-0 top-0 h-[780px] opacity-60"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Copy */}
          <div className="lg:col-span-7">
            <motion.div
              {...fade(0)}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-card/70 py-1 pl-1 pr-4 shadow-sm backdrop-blur"
            >
              <span className="mono rounded-full bg-foreground px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-background">
                {siteConfig.competition}
              </span>
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {siteConfig.category}
              </span>
            </motion.div>

            <motion.h1
              {...fade(0.06)}
              className="display text-[clamp(3rem,7.2vw,6.25rem)] leading-[0.92]"
            >
              Seeing More.
              <br />
              <span className="text-muted-foreground">
                Grading <em className="text-foreground">Smarter.</em>
              </span>
            </motion.h1>

            <motion.p
              {...fade(0.14)}
              className="mt-8 max-w-xl text-pretty text-lg font-medium leading-snug text-foreground sm:text-xl"
            >
              Dual-view intelligence for lightweight diabetic retinopathy grading.
            </motion.p>

            <motion.p
              {...fade(0.2)}
              className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground"
            >
              {siteConfig.projectName} reads two photographs of the same eye — one centred
              on the macula, one on the optic disc — and grades diabetic retinopathy on the
              five-level ordinal scale, with a model small enough to run on an ordinary CPU.
            </motion.p>

            <motion.div {...fade(0.26)} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/demo" size="lg" className="group">
                Try the Model
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </LinkButton>
              <LinkButton to="/research" size="lg" variant="outline">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Explore the Research
              </LinkButton>
            </motion.div>

            <motion.ul
              {...fade(0.34)}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
            >
              {trust.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Visual */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-md lg:max-w-none">
              <HeroVisual />
            </div>
          </div>
        </div>

        {/* Headline numbers */}
        <motion.dl
          {...fade(0.45)}
          className="mt-16 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur lg:mt-20 lg:grid-cols-4"
        >
          {heroStats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col gap-1 p-5 sm:p-7",
                i % 2 === 1 && "border-l border-border",
                i >= 2 && "border-t border-border lg:border-t-0",
                i === 2 && "lg:border-l",
              )}
            >
              <dt className="order-2 text-[13px] font-medium text-foreground">
                {s.label}
                <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                  {s.detail}
                </span>
              </dt>
              <dd className="ink-gradient order-1 text-3xl font-bold tracking-[-0.04em] tabular-nums sm:text-4xl lg:text-5xl">
                {s.value}
              </dd>
            </div>
          ))}
        </motion.dl>

        {/* Scroll affordance */}
        <motion.button
          type="button"
          onClick={() => scrollToSection("journey")}
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="group mx-auto mt-12 hidden items-center gap-3 rounded-full px-3 py-2 text-subtle transition-colors hover:text-foreground lg:flex"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors group-hover:border-foreground/40">
            <ArrowDown className="h-3.5 w-3.5 motion-safe:animate-bounce" aria-hidden="true" />
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.18em]">
            Scroll to explore the research
          </span>
        </motion.button>
      </Container>
    </section>
  );
}
