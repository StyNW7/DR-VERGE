import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, BookOpenText, ScanEye, Microscope, type LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/PageContainer";
import { Reveal } from "@/components/common/Primitives";
import { scrollToSection } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";
import { l, useI18n, type L } from "@/i18n/context";

interface Step {
  number: string;
  icon: LucideIcon;
  title: L;
  body: L;
  time: L;
  cta: L;
  /** Either an in-page section or a route. */
  section?: string;
  to?: string;
  primary?: boolean;
  /** Accent in the colourful palette. */
  accent: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: BookOpenText,
    title: l("Understand the idea", "Pahami idenya"),
    body: l(
      "Why one photograph is not enough, what a second view adds, and how DR-VERGE teaches that difference to a small model.",
      "Mengapa satu foto tidak cukup, apa yang ditambahkan oleh *view* kedua, dan bagaimana DR-VERGE mengajarkan perbedaan itu kepada model yang kecil.",
    ),
    time: l("≈ 5 min read", "≈ 5 menit baca"),
    cta: l("Start the story", "Mulai membaca"),
    section: "problem",
    accent: "accent-coral",
  },
  {
    number: "02",
    icon: ScanEye,
    title: l("Try the model", "Coba modelnya"),
    body: l(
      "Load a sample eye in one click — or upload your own pair — and watch the real model grade it right in your browser.",
      "Muat sampel mata dengan satu klik — atau unggah pasangan citra Anda sendiri — lalu lihat model asli menilainya langsung di *browser* Anda.",
    ),
    time: l("≈ 1 min", "≈ 1 menit"),
    cta: l("Open the demo", "Buka demo"),
    to: "/demo",
    primary: true,
    accent: "accent-blue",
  },
  {
    number: "03",
    icon: Microscope,
    title: l("Check the evidence", "Periksa buktinya"),
    body: l(
      "Every number, confidence interval, external test and limitation, traced back to the locked evaluation run.",
      "Setiap angka, interval kepercayaan, uji eksternal, dan keterbatasan, dapat ditelusuri kembali ke *run* evaluasi yang telah dikunci.",
    ),
    time: l("Full detail", "Detail lengkap"),
    cta: l("Read the research", "Baca penelitiannya"),
    to: "/research",
    accent: "accent-amber",
  },
];

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  const { tr } = useI18n();
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border",
            step.primary
              ? "border-background/20 bg-background/10"
              : "border-border bg-surface colorful:border-acc-line colorful:bg-acc-soft colorful:text-acc",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span
          className={cn(
            "mono text-12 tracking-[0.16em]",
            step.primary ? "text-background/50" : "text-subtle colorful:font-semibold colorful:text-acc",
          )}
        >
          {step.number}
        </span>
      </div>

      <h3 className="mt-8 text-xl font-bold tracking-tight">{tr(step.title)}</h3>
      <p
        className={cn(
          "mt-3 text-14 leading-relaxed",
          step.primary ? "text-background/70" : "text-muted-foreground",
        )}
      >
        {tr(step.body)}
      </p>

      <div
        className={cn(
          "mt-auto flex items-center justify-between border-t pt-5",
          step.primary ? "border-background/15" : "border-border",
        )}
      >
        <span
          className={cn(
            "mono text-11 uppercase tracking-[0.14em]",
            step.primary ? "text-background/60" : "text-subtle",
          )}
        >
          {tr(step.time)}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-13 font-semibold",
            !step.primary && "colorful:text-acc",
          )}
        >
          {tr(step.cta)}
          {step.section ? (
            <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          )}
        </span>
      </div>
    </>
  );

  const cls = cn(
    "group flex h-full min-h-[280px] flex-col rounded-2xl p-7 text-left sm:p-8",
    step.accent,
    step.primary
      ? "grain inverse relative overflow-hidden shadow-xl transition-transform duration-300 ease-editorial hover:-translate-y-0.5"
      : "card-premium card-lift colorful:border-t-[3px] colorful:border-t-acc-solid",
  );

  if (step.to) {
    return (
      <Link to={step.to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => scrollToSection(step.section!)} className={cls}>
      {inner}
    </button>
  );
}

/**
 * "Start here". The home page is long; this tells a first-time visitor the
 * three things they can do and roughly how long each takes, before the
 * research story begins.
 */
export default function JourneySection() {
  const { t } = useI18n();
  return (
    <section id="journey" className="relative scroll-mt-24 pb-20 sm:pb-24">
      <Container>
        <Reveal>
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">{t("Start here", "Mulai dari sini")}</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {t("Three ways to explore", "Tiga cara menjelajahi")}{" "}
                <em className="serif-accent font-normal">DR-VERGE</em>
              </h2>
            </div>
            <p className="max-w-sm text-14 leading-relaxed text-muted-foreground">
              {t(
                "New here? Follow them in order — or jump straight to the demo.",
                "Baru pertama kali? Ikuti secara berurutan — atau langsung menuju demo.",
              )}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {steps.map((s, i) => (
            <Reveal key={s.number} delay={i * 0.08} className="h-full">
              <StepCard step={s} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
