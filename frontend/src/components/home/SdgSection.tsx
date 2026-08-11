import { Section } from "@/components/layout/PageContainer";
import { Reveal, Callout } from "@/components/common/Primitives";
import { sdgContent } from "@/data/researchContent";

/**
 * SDG 3 section.
 *
 * Rendered in monochrome rather than the official SDG palette: the site's
 * identity is black and white throughout, and a single colourful UN badge would
 * be the one inconsistent element on the page. The "03" is treated as editorial
 * typography instead.
 */
export default function SdgSection() {
  return (
    <Section id="sdg" tone="inverted" className="overflow-hidden">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        {/* The number */}
        <div className="lg:col-span-5">
          <Reveal>
            <div className="flex items-start gap-5">
              <span className="display text-display-xl leading-none text-background">
                {sdgContent.number}
              </span>
              <div className="pt-3">
                <div className="mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                  Sustainable
                  <br />
                  Development
                  <br />
                  Goal
                </div>
              </div>
            </div>
            <h2 className="display mt-8 text-display-sm">{sdgContent.title}</h2>
            <p className="mt-6 max-w-md border-l-2 border-background/30 pl-5 text-sm italic leading-relaxed opacity-70">
              “{sdgContent.un}”
            </p>
          </Reveal>
        </div>

        {/* The connection */}
        <div className="lg:col-span-7">
          <Reveal delay={0.08}>
            <p className="text-lg font-medium leading-snug sm:text-xl">
              {sdgContent.intro}
            </p>

            <div className="mt-10 grid gap-px overflow-hidden rounded-xl bg-background/20 sm:grid-cols-2">
              {sdgContent.points.map((p) => (
                <div key={p.title} className="bg-foreground p-6">
                  <h3 className="text-sm font-bold">{p.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed opacity-65">{p.body}</p>
                </div>
              ))}
            </div>

            {/* Inverted callout — the section runs on the dark ground. */}
            <div className="mt-8 rounded-lg border border-background/25 border-l-[3px] border-l-background p-5">
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.16em]">
                Scope of this claim
              </div>
              <p className="text-[13px] leading-relaxed opacity-70">
                {sdgContent.caution}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/** Kept exported for parity with other sections that need a light-ground note. */
export function SdgFootnote() {
  return (
    <Callout tone="medical" title="Research positioning">
      {sdgContent.caution}
    </Callout>
  );
}
