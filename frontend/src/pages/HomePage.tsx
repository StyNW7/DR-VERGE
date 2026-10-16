import { PageContainer, Seo } from "@/components/layout/PageContainer";
import { SectionRail } from "@/components/common/SectionRail";
import { l, useI18n } from "@/i18n/context";
import Hero from "@/components/home/Hero";
import JourneySection from "@/components/home/JourneySection";
import ProblemSection from "@/components/home/ProblemSection";
import TwoViewsSection from "@/components/home/TwoViewsSection";
import CsdSection from "@/components/home/CsdSection";
import MetricsSection from "@/components/home/MetricsSection";
import Rq1Section from "@/components/home/Rq1Section";
import Rq2Section from "@/components/home/Rq2Section";
import SdgSection from "@/components/home/SdgSection";
import PipelineSection from "@/components/home/PipelineSection";
import TeamSection from "@/components/home/TeamSection";
import CtaSection from "@/components/home/CtaSection";

/** The chapters of the home page, in reading order. Ids match each section. */
const chapters = [
  { id: "problem", label: l("Problem", "Masalah") },
  { id: "two-views", label: l("Two views", "Dua *view*") },
  { id: "csd", label: l("Method", "Metode") },
  { id: "findings", label: l("Findings", "Temuan") },
  { id: "rq1", label: l("RQ1 · Transfer", "RQ1 · Transfer") },
  { id: "rq2", label: l("RQ2 · Efficiency", "RQ2 · Efisiensi") },
  { id: "sdg", label: l("SDG 3", "SDG 3") },
  { id: "pipeline", label: l("Pipeline", "Tahapan") },
  { id: "team", label: l("Team", "Tim") },
  { id: "cta", label: l("Try it", "Coba") },
];

/**
 * The narrative order is the point of this page:
 *
 *   Start here -> Problem -> Two Views -> DR-VERGE -> CSD -> Lightweight
 *   -> Results -> SDG Impact -> Team -> Try Model
 *
 * A visitor should be able to follow the whole research story here without
 * opening the paper. The chapter rail on the right keeps them oriented.
 */
export default function HomePage() {
  const { ts } = useI18n();
  return (
    <PageContainer>
      <Seo
        title={ts("Dual-View Diabetic Retinopathy Research", "Penelitian Retinopati Diabetik Dual-View")}
        description={ts(
          "DR-VERGE is a lightweight dual-view AI research framework for ordinal diabetic retinopathy grading using Complementarity-Shift Distillation and INT8 quantization.",
          "DR-VERGE adalah kerangka penelitian AI dual-view yang ringan untuk grading ordinal retinopati diabetik menggunakan Complementarity-Shift Distillation dan kuantisasi INT8.",
        )}
      />
      <SectionRail items={chapters} />
      <Hero />
      <JourneySection />
      <ProblemSection />
      <TwoViewsSection />
      <CsdSection />
      <MetricsSection />
      <Rq1Section />
      <Rq2Section />
      <SdgSection />
      <PipelineSection />
      <TeamSection />
      <CtaSection />
    </PageContainer>
  );
}
