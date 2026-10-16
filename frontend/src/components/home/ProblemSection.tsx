import { Eye, Cpu, ArrowUpDown, Circle, type LucideIcon } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Callout } from "@/components/common/Primitives";
import { OrdinalScale } from "@/components/common/Diagrams";
import { challenges } from "@/data/researchContent";
import { drGrades, gradeText } from "@/data/drGrades";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { gradeTone } from "@/lib/gradeTone";

/** Positional, so it must stay as long as `challenges`. Falls back rather
 *  than rendering `undefined`, which React reports only as error #130. */
const icons: LucideIcon[] = [Eye, Cpu, ArrowUpDown];
const iconFor = (i: number): LucideIcon => icons[i] ?? Circle;

/** Colourful palette: the three challenges are coral, amber and blue cards with
 *  a numbered badge, as in the research deck. */
const accents = ["accent-coral", "accent-amber", "accent-blue"];

export default function ProblemSection() {
  const { t, ts, tr, pick, lang } = useI18n();

  return (
    <Section id="problem" tone="surface">
      <SectionHeader
        eyebrow={ts("The Problem", "Permasalahan")}
        index="01"
        title={pick(
          <>
            Diabetic Retinopathy Demands
            <br className="hidden sm:block" /> More Than a <em>Single View</em>
          </>,
          <>
            Retinopati Diabetik Membutuhkan
            <br className="hidden sm:block" /> Lebih dari <em>Satu Citra</em>
          </>,
        )}
        description={t(
          "Diabetic retinopathy is graded from photographs of the retina. Three properties of that task shape everything about how a model for it should be built.",
          "Tingkat retinopati diabetik dinilai dari foto retina. Tiga karakteristik tugas tersebut menentukan bagaimana seharusnya sebuah model untuknya dibangun.",
        )}
        size="lg"
      />

      {/* Three challenges */}
      <Reveal className="mt-16">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3 colorful:gap-4 colorful:overflow-visible colorful:rounded-none colorful:border-0 colorful:bg-transparent">
          {challenges.map((c, i) => {
            const Icon = iconFor(i);
            return (
              <div
                key={c.number}
                className={cn(
                  "flex h-full flex-col gap-5 bg-card p-7 transition-colors duration-300 hover:bg-surface sm:p-8",
                  "colorful:rounded-2xl colorful:border colorful:border-acc-line colorful:bg-acc-soft colorful:transition-all colorful:hover:-translate-y-0.5 colorful:hover:bg-acc-soft colorful:hover:shadow-[0_18px_36px_-20px_hsl(var(--acc-solid)/0.55)]",
                  accents[i % accents.length],
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface colorful:border-acc-line colorful:bg-card">
                    <Icon className="h-[18px] w-[18px] text-foreground colorful:text-acc" aria-hidden="true" />
                  </span>
                  <span className="mono text-[11px] tracking-[0.16em] text-subtle colorful:hidden">{c.number}</span>
                  <span
                    className="hidden h-10 w-10 items-center justify-center rounded-full bg-acc-solid text-lg font-extrabold text-acc-fg shadow-md colorful:flex"
                    aria-hidden="true"
                  >
                    {Number(c.number)}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">{tr(c.title)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{tr(c.body)}</p>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* The ordinal scale */}
      <Reveal delay={0.1}>
        <div className="mt-16 card-premium p-7 sm:p-10">
          <div className="mb-10 flex flex-col gap-2">
            <span className="eyebrow">{t("The Grading Scale", "Skala Penilaian")}</span>
            <h3 className="text-2xl font-bold tracking-tight">
              {t(
                "Five ordered grades, not five separate labels",
                "Lima tingkat yang berurutan, bukan lima label yang terpisah",
              )}
            </h3>
          </div>

          <OrdinalScale />

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {drGrades.map((g) => {
              const copy = gradeText(g, lang);
              return (
                <div
                  key={g.grade}
                  // The fifth card spans the row on two-column layouts so no
                  // empty hairline cell is left behind.
                  className={cn(
                    "flex flex-col gap-2 bg-card p-5 sm:last:col-span-2 lg:last:col-span-1",
                    gradeTone(g.grade).soft,
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn("hidden h-2.5 w-2.5 rounded-full colorful:block", gradeTone(g.grade).dot)}
                      aria-hidden="true"
                    />
                    <span className="mono text-[10px] uppercase tracking-[0.16em] text-subtle colorful:font-semibold colorful:text-foreground">
                      Grade {g.grade}
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{copy.name}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {copy.description}
                  </span>
                </div>
              );
            })}
          </div>

          <Callout
            tone="medical"
            title={ts("Not a self-diagnosis tool", "Bukan alat diagnosis mandiri")}
            className="mt-8"
          >
            {t(
              "These grade definitions are provided as educational context for the research. They are not a self-assessment scale, and nothing on this site should be used to determine your own or anyone else's eye health.",
              "Definisi tingkat ini disajikan sebagai konteks edukatif bagi penelitian. Definisi ini bukan skala penilaian mandiri, dan tidak ada bagian dari situs ini yang boleh digunakan untuk menentukan kesehatan mata Anda maupun orang lain.",
            )}
          </Callout>
        </div>
      </Reveal>
    </Section>
  );
}
