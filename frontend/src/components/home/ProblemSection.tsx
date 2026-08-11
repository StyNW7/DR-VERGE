import { Eye, Cpu, ArrowUpDown } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Callout } from "@/components/common/Primitives";
import { OrdinalScale } from "@/components/common/Diagrams";
import { challenges } from "@/data/researchContent";
import { drGrades } from "@/data/drGrades";

const icons = [Eye, Cpu, ArrowUpDown];

export default function ProblemSection() {
  return (
    <Section id="problem" tone="surface">
      <SectionHeader
        eyebrow="The Problem"
        title={
          <>
            Diabetic Retinopathy Demands
            <br className="hidden sm:block" /> More Than a Single View
          </>
        }
        description="Diabetic retinopathy is graded from photographs of the retina. Three properties of that task shape everything about how a model for it should be built."
        size="lg"
      />

      {/* Three challenges */}
      <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
        {challenges.map((c, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={c.number} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-5 bg-card p-7 transition-colors duration-300 hover:bg-muted sm:p-8">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                  <span className="mono text-[11px] tracking-[0.16em] text-subtle">
                    {c.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">{c.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* The ordinal scale */}
      <Reveal delay={0.1}>
        <div className="mt-16 rounded-xl border border-border bg-card p-7 sm:p-10">
          <div className="mb-10 flex flex-col gap-2">
            <span className="eyebrow">The Grading Scale</span>
            <h3 className="text-2xl font-bold tracking-tight">
              Five ordered grades, not five separate labels
            </h3>
          </div>

          <OrdinalScale />

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {drGrades.map((g) => (
              <div key={g.grade} className="flex flex-col gap-2 bg-card p-5">
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                  Grade {g.grade}
                </span>
                <span className="text-sm font-semibold">{g.name}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {g.description}
                </span>
              </div>
            ))}
          </div>

          <Callout tone="medical" title="Not a self-diagnosis tool" className="mt-8">
            These grade definitions are provided as educational context for the research.
            They are not a self-assessment scale, and nothing on this site should be used
            to determine your own or anyone else's eye health.
          </Callout>
        </div>
      </Reveal>
    </Section>
  );
}
