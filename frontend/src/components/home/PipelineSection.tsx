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
import { useI18n } from "@/i18n/context";

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
  const { t, tr, pick } = useI18n();

  return (
    <Section id="pipeline" tone="surface">
      <SectionHeader
        eyebrow={t("Research Pipeline", "Tahapan Penelitian")}
        index="08"
        title={pick(
          <>
            {pipelineStages.length} stages, run in one <em>locked</em> order
          </>,
          <>
            {pipelineStages.length} tahap, dijalankan dalam urutan yang <em>terkunci</em>
          </>,
        )}
        description={t(
          "Every selection decision happens on validation. The test set is opened once, and the external set stays frozen until the very end.",
          "Setiap keputusan pemilihan dilakukan pada data validasi. Data uji dibuka satu kali, dan data eksternal tetap dibekukan hingga tahap paling akhir.",
        )}
        size="lg"
      />

      <Reveal className="mt-16">
        {/* Five columns on desktop so the ten stages form two complete rows.
            Revealed as one piece so no grey hairline background shows through
            cells that are still fading in. */}
        <div
          role="list"
          className="relative grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5"
        >
          {pipelineStages.map((s, i) => {
            const Icon = iconFor(i);
            // The contributed stage is filled — it is what the paper is about.
            const isCsd = "isContribution" in s && s.isContribution;
            return (
              <div
                key={s.step}
                role="listitem"
                className={
                  "group relative flex h-full flex-col gap-4 p-6 transition-colors duration-300 " +
                  (isCsd ? "inverse" : "bg-card hover:bg-surface colorful:hover:bg-brand-soft")
                }
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={"h-5 w-5 " + (isCsd ? "text-background" : "text-foreground colorful:text-brand")}
                    aria-hidden="true"
                  />
                  <span
                    className={
                      "mono text-12 tracking-[0.16em] " +
                      (isCsd ? "text-background/50" : "text-subtle colorful:font-semibold")
                    }
                  >
                    {s.step}
                  </span>
                </div>
                <h3 className="text-sm font-bold leading-tight tracking-tight">{tr(s.title)}</h3>
                <p
                  className={
                    "text-13 leading-relaxed " +
                    (isCsd ? "text-background/65" : "text-muted-foreground")
                  }
                >
                  {tr(s.body)}
                </p>
                {isCsd && (
                  <span className="mono mt-auto self-start rounded-full border border-background/25 px-2 py-0.5 text-10 uppercase tracking-[0.14em] colorful:border-transparent colorful:bg-[hsl(45_100%_72%)] colorful:font-semibold colorful:text-[hsl(222_60%_18%)]">
                    {t("Contribution", "Kontribusi")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}
