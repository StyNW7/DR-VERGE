import { Download, Github, ArrowRight, FileText } from "lucide-react";
import { PageContainer, Seo, Container, Section } from "@/components/layout/PageContainer";
import { ExternalButton, LinkButton } from "@/components/common/Button";
import { Badge, Reveal, Callout } from "@/components/common/Primitives";
import {
  AbstractSection,
  ResearchQuestionsSection,
  ResearchGapSection,
  MethodSection,
  Rq1ResultsSection,
  Rq2ResultsSection,
  ExternalValidationSection,
  FiguresSection,
  LimitationsSection,
  SdgImpactSection,
  ReadingOrder,
} from "@/components/research/ResearchSections";
import { paperMeta } from "@/data/researchContent";
import { siteConfig, isLinkConfigured } from "@/config/siteConfig";
import { DISCLAIMER_CLINICAL, runProvenance } from "@/data/researchMetrics";

const provenance = [
  {
    label: "Source run",
    value: runProvenance.label,
    detail: runProvenance.runId,
  },
  {
    label: "Integrity gates",
    value: `${runProvenance.gatesPassed}/${runProvenance.gatesTotal}`,
    detail: "All passed, zero errors",
  },
  {
    label: "Self-audit",
    value: `${runProvenance.auditedValues} values`,
    detail: `Recomputed from predictions · ${runProvenance.auditMismatches} mismatches`,
  },
  {
    label: "Statistics",
    value: `${runProvenance.seedsPerCondition} seeds`,
    detail: `B = ${runProvenance.bootstrapResamples.toLocaleString("en-US")} bootstrap · patient-clustered`,
  },
];

export default function ResearchPage() {
  const paperOk = isLinkConfigured(siteConfig.paperUrl);
  const githubOk = isLinkConfigured(siteConfig.githubUrl);

  return (
    <PageContainer>
      <Seo
        title="Research & Paper"
        description="DR-VERGE research: dual-view diabetic retinopathy grading through Complementarity-Shift Distillation and lightweight INT8 deployment. Research questions, method, results, and limitations."
      />

      {/* ================= HEADER ================= */}
      <section className="grain relative overflow-hidden pb-14 pt-12 sm:pb-16 sm:pt-16">
        <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="grid-bg fade-mask-b pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone="outline" icon={FileText}>
              {paperMeta.eyebrow}
            </Badge>
            <Badge tone="default">{paperMeta.competition}</Badge>
            <Badge tone="default">{paperMeta.field}</Badge>
          </div>

          <h1 className="display mt-8 text-display-lg">
            DR-<em>VERGE</em>
          </h1>

          <p className="mt-7 max-w-3xl text-pretty text-lg font-medium leading-snug text-muted-foreground sm:text-2xl">
            {paperMeta.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ExternalButton
              href={siteConfig.paperUrl}
              enabled={paperOk}
              size="lg"
              disabledTitle="The paper link has not been configured yet."
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Paper
            </ExternalButton>
            <LinkButton to="/demo" size="lg" variant="outline">
              Try Model
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <ExternalButton
              href={siteConfig.githubUrl}
              enabled={githubOk}
              size="lg"
              variant="outline"
              disabledTitle="The repository link has not been configured yet."
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              View Repository
            </ExternalButton>
          </div>

          {!paperOk && (
            <p className="mt-5 text-[12px] text-subtle">
              The paper is not yet published. The download link will activate once it is
              available.
            </p>
          )}

          {/* Provenance: where every number on this page comes from. */}
          <dl className="mt-14 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur lg:grid-cols-4">
            {provenance.map((p, i) => (
              <div
                key={p.label}
                className={
                  "flex flex-col gap-1.5 p-5 sm:p-6 " +
                  (i % 2 === 1 ? "border-l border-border " : "") +
                  (i >= 2 ? "border-t border-border lg:border-t-0 " : "") +
                  (i === 2 ? "lg:border-l" : "")
                }
              >
                <dt className="mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {p.label}
                </dt>
                <dd className="text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
                  {p.value}
                </dd>
                <dd className="text-[11px] leading-snug text-muted-foreground">{p.detail}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <ReadingOrder />

      {/* ================= BODY ================= */}
      <AbstractSection />
      <ResearchQuestionsSection />
      <ResearchGapSection />
      <MethodSection />
      <Rq1ResultsSection />
      <Rq2ResultsSection />
      <ExternalValidationSection />
      <FiguresSection />
      <LimitationsSection />
      <SdgImpactSection />

      {/* ================= DOWNLOAD ================= */}
      <Section id="download">
        <Reveal>
          <div className="card-premium grain relative overflow-hidden p-8 sm:p-12 lg:p-16">
            <div
              className="pointer-events-none absolute inset-0 grid-bg opacity-40"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-2xl text-center">
              <span className="eyebrow">Full Paper</span>
              <h2 className="display mt-5 text-display-md">
                Read the <em>Full Paper</em>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                The complete write-up covers the locked evaluation protocol, the statistical
                machinery behind every comparison, the ablations, and the full set of
                results — including the ones that did not go the way we hoped.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ExternalButton
                  href={siteConfig.paperUrl}
                  enabled={paperOk}
                  size="lg"
                  disabledTitle="The paper link has not been configured yet."
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download Paper
                </ExternalButton>
                <LinkButton to="/demo" size="lg" variant="outline">
                  Open Model Demo
                </LinkButton>
                <ExternalButton
                  href={siteConfig.githubUrl}
                  enabled={githubOk}
                  size="lg"
                  variant="ghost"
                  disabledTitle="The repository link has not been configured yet."
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  View GitHub
                </ExternalButton>
              </div>

              <div className="mt-12">
                <Callout tone="medical" className="text-left">
                  {DISCLAIMER_CLINICAL}
                </Callout>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </PageContainer>
  );
}
