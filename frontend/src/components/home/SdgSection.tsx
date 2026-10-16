import { Section } from "@/components/layout/PageContainer";
import { Reveal } from "@/components/common/Primitives";
import { Sdg3Logo } from "@/components/common/Sdg3Logo";
import { sdgContent } from "@/data/researchContent";
import { useI18n } from "@/i18n/context";

/**
 * SDG 3 section.
 *
 * The section itself stays on the site's inverted monochrome ground; the
 * official SDG 3 icon is the only coloured element, shown at its true colour
 * because that colour is part of how the goal is recognised.
 */
export default function SdgSection() {
  const { t, tr } = useI18n();

  return (
    <Section id="sdg" tone="inverted" className="grain overflow-hidden">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
        {/* The goal */}
        <div className="lg:col-span-5">
          <Reveal>
            <div className="flex items-center gap-5">
              <div className="w-28 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-background/20 sm:w-36">
                <Sdg3Logo />
              </div>
              <div className="mono text-[10px] uppercase leading-relaxed tracking-[0.2em] opacity-60">
                {t("Sustainable", "Tujuan")}
                <br />
                {t("Development", "Pembangunan")}
                <br />
                {t("Goal 3", "Berkelanjutan 3")}
              </div>
            </div>
            <h2 className="display mt-8 text-display-sm">{tr(sdgContent.title)}</h2>
            <p className="mt-6 max-w-md border-l-2 border-background/30 pl-5 text-sm italic leading-relaxed opacity-70">
              “{tr(sdgContent.un)}”
            </p>
          </Reveal>
        </div>

        {/* The connection */}
        <div className="lg:col-span-7">
          <Reveal delay={0.08}>
            <p className="text-lg font-medium leading-snug sm:text-xl">{tr(sdgContent.intro)}</p>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-background/20 sm:grid-cols-2">
              {sdgContent.points.map((p) => (
                <div key={p.title.en} className="bg-foreground p-6">
                  <h3 className="text-sm font-bold">{tr(p.title)}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed opacity-65">{tr(p.body)}</p>
                </div>
              ))}
            </div>

            {/* Inverted callout — the section runs on the dark ground. */}
            <div className="mt-8 rounded-xl border border-background/25 border-l-[3px] border-l-background p-5">
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.16em]">
                {t("Scope of this claim", "Cakupan klaim ini")}
              </div>
              <p className="text-[13px] leading-relaxed opacity-70">{tr(sdgContent.caution)}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
