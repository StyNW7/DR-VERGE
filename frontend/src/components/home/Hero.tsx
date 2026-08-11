import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, ArrowDown } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { FundusIllustration } from "@/components/common/FundusIllustration";
import { Container } from "@/components/layout/PageContainer";
import { siteConfig } from "@/config/siteConfig";
import { cn } from "@/lib/utils";

const capabilities = [
  "Dual-View Fundus",
  "5-Grade Ordinal Classification",
  "Complementarity-Shift Distillation",
  "INT8 Deployment",
];

/**
 * The hero's central visual: two view cards flowing into one model block that
 * emits an ordinal grade. It is the whole method in one glance, which is what
 * the rest of the page then unpacks.
 */
function DualViewFlow() {
  const reduce = useReducedMotion();

  const card = (variant: "macula" | "disc", label: string, index: string, delay: number) => (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex-1 overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors duration-300 hover:border-foreground/40"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="mono text-[10px] tracking-[0.16em] text-subtle">{index}</span>
        <span className="mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="aspect-square text-foreground">
        <FundusIllustration variant={variant} animated />
      </div>
    </motion.div>
  );

  return (
    <div className="relative w-full">
      <div className="flex gap-3 sm:gap-4">
        {card("macula", "Macula", "01", 0.15)}
        {card("disc", "Optic Disc", "02", 0.25)}
      </div>

      {/* Converging connectors */}
      <svg
        viewBox="0 0 400 60"
        className="h-12 w-full text-border sm:h-14"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M100 0 C 100 30, 200 26, 200 56"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M300 0 C 300 30, 200 26, 200 56"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      {/* Model block */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-xl bg-foreground px-5 py-4 text-background"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-tight sm:text-base">
              {siteConfig.projectName}
            </div>
            <div className="mono truncate text-[9px] uppercase tracking-[0.14em] opacity-60">
              Dual-view student · INT8
            </div>
          </div>
          <div className="mono shrink-0 text-right text-[10px] uppercase tracking-[0.14em] opacity-60">
            328K params
          </div>
        </div>
        {/* A slow sweep, suggesting live computation without implying progress. */}
        {!reduce && (
          <motion.div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-background/10 to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        )}
      </motion.div>

      <svg
        viewBox="0 0 400 32"
        className="h-8 w-full text-border"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path d="M200 0 L200 30" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Ordinal output */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Ordinal severity output
          </span>
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-subtle">
            0 → 4
          </span>
        </div>
        <div className="flex items-end gap-1.5" aria-hidden="true">
          {[0.32, 0.5, 1, 0.68, 0.4].map((h, i) => (
            <motion.div
              key={i}
              className={cn(
                "flex-1 rounded-sm",
                i === 2 ? "bg-foreground" : "bg-foreground/20",
              )}
              // transformOrigin makes the bars grow from the baseline, the way a
              // chart does, rather than expanding from their centre.
              style={{ height: `${h * 56}px`, transformOrigin: "bottom" }}
              initial={reduce ? false : { scaleY: 0 }}
              animate={reduce ? undefined : { scaleY: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.7 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </div>
        <div className="mono mt-2 flex justify-between text-[9px] text-subtle" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((g) => (
            <span key={g} className="flex-1 text-center">
              {g}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-20 pt-12 sm:pb-24 sm:pt-16 lg:pb-32 lg:pt-20">
      {/* Grid paper, fading out downward. */}
      <div
        className="pointer-events-none absolute inset-0 grid-bg fade-mask-b opacity-[0.55]"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Copy */}
          <div className="lg:col-span-7">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse-sweep" />
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {siteConfig.competition} · AI for Healthcare
              </span>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="display text-display-lg"
            >
              Seeing More.
              <br />
              <span className="text-muted-foreground">Grading Smarter.</span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-xl text-lg font-medium leading-snug text-foreground sm:text-xl"
            >
              Dual-view intelligence for lightweight diabetic retinopathy grading.
            </motion.p>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground"
            >
              {siteConfig.projectName} is a lightweight AI framework that learns from both
              macula-centered and optic-disc-centered retinal fundus images to perform
              ordinal diabetic retinopathy grading while remaining efficient for
              resource-constrained deployment.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
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

            {/* Capability row */}
            <motion.ul
              initial={reduce ? false : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.36 }}
              className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-7 sm:grid-cols-4"
            >
              {capabilities.map((c) => (
                <li key={c} className="flex flex-col gap-1.5">
                  <span className="h-px w-5 bg-foreground" aria-hidden="true" />
                  <span className="text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
                    {c}
                  </span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Visual */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-sm lg:max-w-none">
              <DualViewFlow />
            </div>
          </div>
        </div>

        {/* Scroll affordance */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 hidden items-center gap-3 lg:flex"
        >
          <ArrowDown className="h-4 w-4 text-subtle" aria-hidden="true" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-subtle">
            Scroll to explore the research
          </span>
        </motion.div>
      </Container>
    </section>
  );
}
