import { PageContainer, Seo } from "@/components/layout/PageContainer";
import Hero from "@/components/home/Hero";
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

/**
 * The narrative order is the point of this page:
 *
 *   Problem -> Two Views -> DR-VERGE -> CSD -> Lightweight -> Results
 *   -> SDG Impact -> Team -> Try Model
 *
 * A visitor should be able to follow the whole research story here without
 * opening the paper.
 */
export default function HomePage() {
  return (
    <PageContainer>
      <Seo
        title="Dual-View Diabetic Retinopathy Research"
        description="DR-VERGE is a lightweight dual-view AI research framework for ordinal diabetic retinopathy grading using Complementarity-Shift Distillation and INT8 quantization."
      />
      <Hero />
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
