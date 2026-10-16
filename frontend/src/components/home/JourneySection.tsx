import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, BookOpenText, ScanEye, Microscope, type LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/PageContainer";
import { Reveal } from "@/components/common/Primitives";
import { scrollToSection } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  body: string;
  time: string;
  cta: string;
  /** Either an in-page section or a route. */
  section?: string;
  to?: string;
  primary?: boolean;
}

const steps: Step[] = [
  {
    number: "01",
    icon: BookOpenText,
    title: "Understand the idea",
    body: "Why one photograph is not enough, what a second view adds, and how DR-VERGE teaches that difference to a small model.",
    time: "≈ 5 min read",
    cta: "Start the story",
    section: "problem",
  },
  {
    number: "02",
    icon: ScanEye,
    title: "Try the model",
    body: "Load a sample eye in one click — or upload your own pair — and watch the real model grade it right in your browser.",
    time: "≈ 1 min",
    cta: "Open the demo",
    to: "/demo",
    primary: true,
  },
  {
    number: "03",
    icon: Microscope,
    title: "Check the evidence",
    body: "Every number, confidence interval, external test and limitation, traced back to the locked evaluation run.",
    time: "Full detail",
    cta: "Read the research",
    to: "/research",
  },
];

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border",
            step.primary
              ? "border-background/20 bg-background/10"
              : "border-border bg-surface",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span
          className={cn(
            "mono text-[11px] tracking-[0.16em]",
            step.primary ? "text-background/50" : "text-subtle",
          )}
        >
          {step.number}
        </span>
      </div>

      <h3 className="mt-8 text-xl font-bold tracking-tight">{step.title}</h3>
      <p
        className={cn(
          "mt-3 text-[14px] leading-relaxed",
          step.primary ? "text-background/70" : "text-muted-foreground",
        )}
      >
        {step.body}
      </p>

      <div
        className={cn(
          "mt-auto flex items-center justify-between border-t pt-5",
          step.primary ? "border-background/15" : "border-border",
        )}
      >
        <span
          className={cn(
            "mono text-[10px] uppercase tracking-[0.14em]",
            step.primary ? "text-background/60" : "text-subtle",
          )}
        >
          {step.time}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
          {step.cta}
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
    step.primary
      ? "grain relative overflow-hidden bg-foreground text-background shadow-xl transition-transform duration-300 ease-editorial hover:-translate-y-0.5"
      : "card-premium card-lift",
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
  return (
    <section id="journey" className="relative scroll-mt-24 pb-20 sm:pb-24">
      <Container>
        <Reveal>
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Start here</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Three ways to explore <em className="serif-accent font-normal">DR-VERGE</em>
              </h2>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              New here? Follow them in order — or jump straight to the demo.
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
