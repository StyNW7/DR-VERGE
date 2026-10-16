import { ArrowDown } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Callout } from "@/components/common/Primitives";
import { ShiftDiagram } from "@/components/common/Diagrams";
import { csdExplanation } from "@/data/researchContent";
import { useI18n } from "@/i18n/context";

export default function CsdSection() {
  const { t, tr, pick } = useI18n();

  return (
    <Section id="csd" tone="surface">
      <SectionHeader
        eyebrow={t("The Method", "Metode")}
        index="03"
        title={pick(
          <>
            Distilling More Than the <em>Final Prediction</em>
          </>,
          <>
            Mendistilasi Lebih dari <em>Prediksi Akhir</em>
          </>,
        )}
        description={tr(csdExplanation.intro)}
        size="lg"
      />

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* The four conceptual steps */}
        <Reveal className="lg:col-span-5">
          <div className="card-premium flex h-full flex-col p-7 sm:p-8">
            <span className="eyebrow mb-7">
              {t("How the signal is formed", "Bagaimana sinyal terbentuk")}
            </span>
            <ol className="flex flex-col">
              {csdExplanation.steps.map((s, i) => (
                <li key={s.label.en} className="relative">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          "mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] " +
                          (i === csdExplanation.steps.length - 1
                            ? "bg-foreground text-background"
                            : "border border-border")
                        }
                      >
                        {i + 1}
                      </span>
                      {i < csdExplanation.steps.length - 1 && (
                        <span className="my-1 w-px flex-1 bg-border" aria-hidden="true" />
                      )}
                    </div>
                    <div className="pb-7">
                      <div className="text-sm font-semibold">{tr(s.label)}</div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {tr(s.body)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* Formula block */}
        <Reveal delay={0.08} className="lg:col-span-7">
          <div className="card-premium flex h-full flex-col p-7 sm:p-8">
            <span className="eyebrow mb-7">
              {t("The shift, written down", "Pergeseran dalam rumus")}
            </span>

            <div className="flex flex-col gap-3">
              {csdExplanation.formulas.map((f, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-border bg-surface px-4 py-3.5">
                    <span className="mono text-base font-semibold text-foreground">
                      {f.lhs}
                      {f.superscript && (
                        <sup className="text-[10px] opacity-70">{f.superscript}</sup>
                      )}
                    </span>
                    <span className="mono text-muted-foreground">=</span>
                    <span className="mono text-sm text-foreground">{f.rhs}</span>
                  </div>
                  <div className="mt-1.5 pl-4 text-[11px] text-muted-foreground">
                    {tr(f.note)}
                  </div>
                  {i < csdExplanation.formulas.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-3 w-3 text-subtle" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-7 border-t border-border pt-6 text-[13px] leading-relaxed text-muted-foreground">
              {tr(csdExplanation.deltaMeaning)}
            </p>
          </div>
        </Reveal>
      </div>

      {/* Full method diagram */}
      <Reveal delay={0.1}>
        <div className="mt-6 card-premium overflow-hidden p-6 sm:p-8">
          <span className="eyebrow">
            {t("Teacher to student transfer", "Transfer dari *teacher* ke *student*")}
          </span>
          {/* Horizontal scroll on narrow screens keeps the diagram legible
              instead of shrinking it into illegibility. */}
          <div className="mt-6 -mx-2 overflow-x-auto px-2 pb-2">
            <div className="min-w-[680px] text-foreground">
              <ShiftDiagram />
            </div>
          </div>
        </div>
      </Reveal>

      {/* The claim, stated precisely */}
      <Reveal delay={0.12}>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="grain relative overflow-hidden rounded-2xl bg-foreground p-7 text-background sm:p-9">
            <span className="mono text-[10px] uppercase tracking-[0.18em] opacity-60">
              {t("What CSD does", "Apa yang dilakukan CSD")}
            </span>
            <p className="mt-4 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              {tr(csdExplanation.claim)}
            </p>
          </div>

          <Callout
            tone="research"
            title={t("Wording matters", "Pilihan kata itu penting")}
            className="h-full"
          >
            {pick(
              <>
                This site says that CSD <em>transfers a decision-shift pattern</em>. It does
                not say that CSD understands anatomical complementarity. The method operates
                on a numerical difference between two predictions; what that difference
                corresponds to anatomically is not something this work establishes.
              </>,
              <>
                Situs ini menyatakan bahwa CSD <em>mentransfer pola pergeseran keputusan</em>.
                Situs ini tidak menyatakan bahwa CSD memahami komplementaritas anatomis. Metode
                ini bekerja pada selisih numerik antara dua prediksi; makna anatomis dari
                selisih tersebut bukanlah hal yang dibuktikan oleh penelitian ini.
              </>,
            )}
          </Callout>
        </div>
      </Reveal>
    </Section>
  );
}
