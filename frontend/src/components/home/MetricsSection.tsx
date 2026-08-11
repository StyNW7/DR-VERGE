import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, MetricCard, Reveal, Callout } from "@/components/common/Primitives";
import { headlineMetrics, DISCLAIMER_METRICS } from "@/data/researchMetrics";

export default function MetricsSection() {
  return (
    <Section id="findings">
      <SectionHeader
        eyebrow="Research Findings"
        title="What the experiments produced"
        description="Results from the locked DR-VERGE evaluation protocol: five seeds per condition, selection on validation only, and a test set opened once."
        size="lg"
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {headlineMetrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.06}>
            <MetricCard
              value={m.value}
              label={m.label}
              detail={m.detail}
              // The deployment latency is the headline engineering result.
              emphasis={m.label === "CPU Inference Latency"}
              className="h-full"
            />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <Callout tone="research" title="How to read these numbers" className="mt-8">
          {DISCLAIMER_METRICS}
        </Callout>
      </Reveal>
    </Section>
  );
}
