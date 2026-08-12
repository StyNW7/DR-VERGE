import {
  SlidersHorizontal,
  Database,
  Layers,
  Feather,
  GitBranch,
  Sparkles,
  Gauge,
  Binary,
  Globe,
  Rocket,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal } from "@/components/common/Primitives";
import { pipelineStages } from "@/data/researchMetrics";

/**
 * One icon per pipeline stage, in stage order.
 *
 * This list is positional, so it has to stay the same length as
 * `pipelineStages`. It previously fell out of step when stages were added, and
 * because indexing an array is not checked by TypeScript the result was an
 * `undefined` component that only failed at runtime. `iconFor` makes that
 * impossible: a missing entry now degrades to a neutral marker instead of
 * crashing the page.
 */
const icons: LucideIcon[] = [
  SlidersHorizontal, // 01 recipe selection
  Database, //          02 APTOS pretraining
  Layers, //            03 dual-view teacher
  Feather, //           04 lightweight student
  GitBranch, //         05 knowledge distillation
  Sparkles, //          06 complementarity-shift distillation
  Gauge, //             07 threshold calibration
  Binary, //            08 INT8 quantization
  Globe, //             09 external evaluation
  Rocket, //            10 deployment
];

function iconFor(index: number): LucideIcon {
  return icons[index] ?? Circle;
}

export default function PipelineSection() {
  return (
    <Section id="pipeline" tone="surface">
      <SectionHeader
        eyebrow="Research Pipeline"
        title={`${pipelineStages.length} stages, run in one locked order`}
        description="Every selection decision happens on validation. The test set is opened once, and the external set stays frozen until the very end."
        size="lg"
      />

      <div className="mt-16">
        {/* Desktop: horizontal rail. Mobile: vertical list. */}
        <ol className="relative grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {pipelineStages.map((s, i) => {
            const Icon = iconFor(i);
            const isCsd = s.title.includes("Complementarity");
            return (
              <Reveal key={s.step} delay={i * 0.05}>
                <li
                  className={
                    "group relative flex h-full flex-col gap-4 p-6 transition-colors duration-300 sm:p-7 " +
                    // The contributed stage is filled — it is what the paper is about.
                    (isCsd
                      ? "bg-foreground text-background"
                      : "bg-card hover:bg-muted")
                  }
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      className={
                        "h-5 w-5 " + (isCsd ? "text-background" : "text-foreground")
                      }
                      aria-hidden="true"
                    />
                    <span
                      className={
                        "mono text-[11px] tracking-[0.16em] " +
                        (isCsd ? "text-background/50" : "text-subtle")
                      }
                    >
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold leading-tight tracking-tight">
                    {s.title}
                  </h3>
                  <p
                    className={
                      "text-[12px] leading-relaxed " +
                      (isCsd ? "text-background/65" : "text-muted-foreground")
                    }
                  >
                    {s.body}
                  </p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
