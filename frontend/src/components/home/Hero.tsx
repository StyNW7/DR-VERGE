import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, ArrowDown, Cpu, Lock, FlaskConical } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/layout/PageContainer";
import { siteConfig, runsOnDevice } from "@/config/siteConfig";
import { heroStats } from "@/data/researchMetrics";
import { heroExample } from "@/data/samples";
import { getGrade, gradeText, ordinalThresholdLabels } from "@/data/drGrades";
import { scrollToSection } from "@/hooks/useScrollSpy";
import { l, useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { gradeTone } from "@/lib/gradeTone";
import { useIsColorful } from "@/components/theme-provider";
import { AccessibilityPrompt } from "@/components/common/AccessibilityToggle";

const EASE = [0.22, 1, 0.36, 1] as const;

const trust = [
  ...(runsOnDevice
    ? [
        { icon: Cpu, label: l("Runs in your browser", "Berjalan di *browser* Anda") },
        { icon: Lock, label: l("Images never leave your device", "Citra tidak pernah keluar dari perangkat Anda") },
      ]
    : []),
  {
    icon: FlaskConical,
    label: l("Research prototype · not for clinical use", "Prototipe penelitian · bukan untuk penggunaan klinis"),
  },
];

/** Accents for the four headline numbers in the colourful palette. */
const statAccents = ["accent-blue", "accent-coral", "accent-amber", "accent-blue"];

/** One real fundus field: grayscale in the monochrome palette, true colour in
 *  the colourful one. */
function FieldTile({
  src,
  index,
  label,
  alt,
  delay,
}: {
  src: string;
  index: string;
  label: string;
  alt: string;
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
        alt={alt}
        loading="eager"
        decoding="async"
        className="h-full w-full scale-[1.04] object-cover grayscale contrast-[1.15] transition-transform [transition-duration:1200ms] ease-editorial group-hover:scale-[1.1] colorful:grayscale-0 colorful:contrast-[1.05] colorful:saturate-[1.1]"
      />
      {/* Inner vignette keeps the label legible on any photograph. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between">
        <span className="mono rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-10 uppercase tracking-[0.14em] text-white backdrop-blur">
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
  const { t, ts, lang, num } = useI18n();
  const colorful = useIsColorful();
  const scores = heroExample.cumulativeScores;
  const passed = scores.filter((s) => s > heroExample.decisionThreshold).length;
  const grade = getGrade(passed);

  return (
    <div className="card-premium relative rounded-[28px] p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="mono inline-flex items-center gap-2 text-11 uppercase tracking-[0.16em] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/60 colorful:bg-coral-solid/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground colorful:bg-coral-solid" />
          </span>
          {t("Real model output", "Keluaran model asli")}
        </span>
        <span className="mono text-11 uppercase tracking-[0.14em] text-subtle">
          {t("Eye", "Mata")} {heroExample.sampleId}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <FieldTile
          src={heroExample.macula}
          index="01"
          label={ts("Macula", "Makula")}
          alt={
            colorful
              ? ts(
                  "Macula-centred fundus photograph from the public DeepDRiD dataset",
                  "Foto fundus berpusat makula dari dataset publik DeepDRiD",
                )
              : ts(
                  "Macula-centred fundus photograph from the public DeepDRiD dataset, shown in grayscale",
                  "Foto fundus berpusat makula dari dataset publik DeepDRiD, ditampilkan dalam skala abu-abu",
                )
          }
          delay={0.15}
        />
        <FieldTile
          src={heroExample.disc}
          index="02"
          label={ts("Optic disc", "Diskus optik")}
          alt={
            colorful
              ? ts(
                  "Optic-disc-centred fundus photograph from the public DeepDRiD dataset",
                  "Foto fundus berpusat diskus optik dari dataset publik DeepDRiD",
                )
              : ts(
                  "Optic-disc-centred fundus photograph from the public DeepDRiD dataset, shown in grayscale",
                  "Foto fundus berpusat diskus optik dari dataset publik DeepDRiD, ditampilkan dalam skala abu-abu",
                )
          }
          delay={0.25}
        />
      </div>

      {/* Converging connectors */}
      <svg
        viewBox="0 0 400 44"
        className="h-9 w-full text-foreground/25 sm:h-11 colorful:text-brand/60"
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
        className="grain inverse relative overflow-hidden rounded-2xl px-4 py-3.5"
      >
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-tight">
              {siteConfig.projectName} {t("student", "*student*")}
            </div>
            <div className="mono truncate text-10 uppercase tracking-[0.14em] opacity-60 a11y:whitespace-normal">
              Shared encoder · interaction fusion · CORAL
            </div>
          </div>
          <span className="mono shrink-0 rounded-full border border-background/20 px-2.5 py-1 text-10 uppercase tracking-[0.14em] opacity-80">
            {t("328K params", "328K parameter")}
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
        className="mt-2.5 rounded-2xl border border-border bg-surface/70 p-4 colorful:border-brand-line/70 colorful:bg-brand-soft/60"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="mono text-10 uppercase tracking-[0.14em] text-muted-foreground">
            {t("Ordinal threshold scores", "Skor ambang ordinal")}
          </span>
          <span className="mono text-10 uppercase tracking-[0.14em] text-subtle">
            {t("pass at", "lolos pada")} {num(heroExample.decisionThreshold, 1)}
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {scores.map((s, i) => {
            const isPassed = s > heroExample.decisionThreshold;
            return (
              <li key={i} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 a11y:grid-cols-[auto_1fr_auto]">
                <span
                  className={cn(
                    "mono whitespace-nowrap text-12",
                    isPassed ? "text-foreground colorful:font-semibold colorful:text-brand" : "text-muted-foreground",
                  )}
                >
                  {ordinalThresholdLabels[i]?.key ?? `P(Y > ${i})`}
                </span>
                <span className="relative h-1.5 overflow-hidden rounded-full bg-foreground/10 colorful:bg-brand/10">
                  <motion.span
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      isPassed ? "brand-fill" : "bg-foreground/35 colorful:bg-brand/30",
                    )}
                    initial={reduce ? { width: `${s * 100}%` } : { width: 0 }}
                    animate={{ width: `${s * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.75 + i * 0.08, ease: EASE }}
                  />
                  {/* The 0.5 decision line. */}
                  <span className="absolute inset-y-0 left-1/2 w-px bg-background/80" aria-hidden="true" />
                </span>
                <span className="mono text-right text-12 tabular-nums text-muted-foreground">
                  {num(s, 2)}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <span className="text-12 text-muted-foreground">
            {t(
              `${passed} of ${scores.length} thresholds passed`,
              `${passed} dari ${scores.length} ambang terlampaui`,
            )}
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-3 py-1 text-12 font-semibold text-background",
              gradeTone(passed).fill,
            )}
          >
            Grade {passed}
            <span className="font-normal opacity-70">· {grade ? gradeText(grade, lang).name : ""}</span>
          </span>
        </div>
      </motion.div>

      <p className="mono mt-3 px-1 text-center text-10 uppercase tracking-[0.14em] text-subtle">
        {heroExample.credit} ·{" "}
        {colorful
          ? t("research output, not a diagnosis", "keluaran riset, bukan diagnosis")
          : t(
              "shown in grayscale · research output, not a diagnosis",
              "ditampilkan abu-abu · keluaran riset, bukan diagnosis",
            )}
      </p>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const { t, tr, n, pick, isId } = useI18n();

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: EASE },
        };

  return (
    // Pulled up under the transparent navbar (and padded back down by the same
    // amount) so the spotlight and grid start at the very top of the page
    // instead of meeting the bar on a visible seam.
    <section className="grain relative -mt-16 overflow-hidden pb-16 pt-28 sm:-mt-20 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-40">
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
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-card/70 py-1 pl-1 pr-4 shadow-sm backdrop-blur colorful:border-brand-line"
            >
              <span className="brand-fill mono whitespace-nowrap rounded-full px-2.5 py-1 text-10 font-semibold uppercase tracking-[0.16em] a11y:text-[0.75rem]">
                {siteConfig.competition}
              </span>
              <span className="mono whitespace-nowrap text-11 uppercase tracking-[0.16em] text-muted-foreground a11y:text-[0.8125rem]">
                {siteConfig.category}
              </span>
            </motion.div>

            <motion.h1
              {...fade(0.06)}
              className={cn(
                "display leading-[0.92]",
                // The Indonesian line is longer; it gets a size that keeps each
                // phrase on one line at desktop widths.
                isId ? "text-[clamp(2.6rem,5vw,4.75rem)]" : "text-[clamp(3rem,7.2vw,6.25rem)]",
              )}
            >
              {pick(
                <>
                  Seeing More.
                  <br />
                  <span className="text-muted-foreground">
                    Grading <em className="text-foreground">Smarter.</em>
                  </span>
                </>,
                <>
                  Melihat Lebih Luas.
                  <br />
                  <span className="text-muted-foreground">
                    Menilai Lebih <em className="text-foreground">Cerdas.</em>
                  </span>
                </>,
              )}
            </motion.h1>

            <motion.p
              {...fade(0.14)}
              className="mt-8 max-w-xl text-pretty text-lg font-medium leading-snug text-foreground sm:text-xl"
            >
              {t(
                "Dual-view intelligence for lightweight diabetic retinopathy grading.",
                "Kecerdasan *dual-view* untuk *grading* retinopati diabetik yang ringan.",
              )}
            </motion.p>

            <motion.p
              {...fade(0.2)}
              className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground"
            >
              {t(
                `${siteConfig.projectName} reads two photographs of the same eye — one centred on the macula, one on the optic disc — and grades diabetic retinopathy on the five-level ordinal scale, with a model small enough to run on an ordinary CPU.`,
                `${siteConfig.projectName} membaca dua foto dari mata yang sama — satu berpusat pada makula, satu berpusat pada diskus optik — lalu menilai tingkat retinopati diabetik pada skala ordinal lima tingkat, dengan model yang cukup kecil untuk dijalankan di CPU biasa.`,
              )}
            </motion.p>

            <motion.div {...fade(0.26)} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/demo" size="lg" className="group">
                {t("Try the Model", "Coba Modelnya")}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </LinkButton>
              <LinkButton to="/research" size="lg" variant="outline">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                {t("Explore the Research", "Jelajahi Penelitian")}
              </LinkButton>
            </motion.div>

            <motion.ul {...fade(0.34)} className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {trust.map(({ icon: Icon, label }) => (
                <li key={label.en} className="inline-flex items-center gap-2 text-13 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-foreground colorful:text-brand" aria-hidden="true" />
                  {tr(label)}
                </li>
              ))}
            </motion.ul>

            <motion.div {...fade(0.4)} className="mt-7">
              <AccessibilityPrompt />
            </motion.div>
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
          className="mt-16 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur lg:mt-20 lg:grid-cols-4 colorful:bg-card/85 colorful:shadow-[0_18px_40px_-24px_hsl(var(--shadow-color)/0.35)]"
        >
          {heroStats.map((s, i) => (
            <div
              key={s.label.en}
              className={cn(
                "flex flex-col gap-1 p-5 sm:p-7",
                statAccents[i % statAccents.length],
                i % 2 === 1 && "border-l border-border",
                i >= 2 && "border-t border-border lg:border-t-0",
                i === 2 && "lg:border-l",
              )}
            >
              <dt className="order-2 text-13 font-medium text-foreground">
                {tr(s.label)}
                <span className="mt-0.5 block text-12 font-normal text-muted-foreground">
                  {tr(s.detail)}
                </span>
              </dt>
              {/* Accent tick above each number, colourful palette only. */}
              <span className="order-none mb-2 hidden h-1 w-8 rounded-full bg-acc-solid colorful:block" aria-hidden="true" />
              <dd className="ink-gradient order-1 text-3xl font-bold tracking-[-0.04em] tabular-nums sm:text-4xl lg:text-5xl">
                {n(s.value)}
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
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors group-hover:border-foreground/40 colorful:border-brand-line colorful:text-brand">
            <ArrowDown className="h-3.5 w-3.5 motion-safe:animate-bounce" aria-hidden="true" />
          </span>
          <span className="mono text-11 uppercase tracking-[0.16em]">
            {t("Scroll to explore the research", "Gulir untuk menjelajahi penelitian")}
          </span>
        </motion.button>
      </Container>
    </section>
  );
}
