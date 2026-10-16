import { Eye, Cpu, ArrowUpDown, Circle, type LucideIcon } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Callout } from "@/components/common/Primitives";
import { OrdinalScale } from "@/components/common/Diagrams";
import { challenges } from "@/data/researchContent";
import { drGrades, gradeText } from "@/data/drGrades";
import { useI18n } from "@/i18n/context";

/** Positional, so it must stay as long as `challenges`. Falls back rather
 *  than rendering `undefined`, which React reports only as error #130. */
const icons: LucideIcon[] = [Eye, Cpu, ArrowUpDown];
const iconFor = (i: number): LucideIcon => icons[i] ?? Circle;

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
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {challenges.map((c, i) => {
            const Icon = iconFor(i);
            return (
              <div
                key={c.number}
                className="flex h-full flex-col gap-5 bg-card p-7 transition-colors duration-300 hover:bg-surface sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface">
                    <Icon className="h-[18px] w-[18px] text-foreground" aria-hidden="true" />
                  </span>
                  <span className="mono text-[11px] tracking-[0.16em] text-subtle">{c.number}</span>
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
                  className="flex flex-col gap-2 bg-card p-5 sm:last:col-span-2 lg:last:col-span-1"
                >
                  <span className="mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                    Grade {g.grade}
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
