import { Download, Github, ArrowRight, FileText, Clock } from "lucide-react";
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
import { useI18n } from "@/i18n/context";

/** The paper button. While the PDF is not published it reads as "coming soon"
 *  in a quiet outline style, rather than as a greyed-out primary button. */
function PaperButton({ size = "lg" as const }) {
  const { t, ts } = useI18n();
  const paperOk = isLinkConfigured(siteConfig.paperUrl);
  return (
    <ExternalButton
      href={siteConfig.paperUrl}
      enabled={paperOk}
      size={size}
      variant={paperOk ? "primary" : "outline"}
      disabledTitle={ts(
        "The paper link has not been configured yet.",
        "Tautan makalah belum dikonfigurasi.",
      )}
    >
      {paperOk ? (
        <Download className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Clock className="h-4 w-4" aria-hidden="true" />
      )}
      {paperOk
        ? t("Download Paper", "Unduh Makalah")
        : t("Paper — coming soon", "Makalah — segera hadir")}
    </ExternalButton>
  );
}

export default function ResearchPage() {
  const { t, ts, tr, num } = useI18n();
  const paperOk = isLinkConfigured(siteConfig.paperUrl);
  const githubOk = isLinkConfigured(siteConfig.githubUrl);

  const provenance = [
    {
      label: t("Source run", "Sumber *run*"),
      value: tr(runProvenance.label),
      detail: runProvenance.runId,
    },
    {
      label: t("Integrity gates", "Gerbang integritas"),
      value: `${runProvenance.gatesPassed}/${runProvenance.gatesTotal}`,
      detail: t("All passed, zero errors", "Semua lolos, tanpa *error*"),
    },
    {
      label: t("Self-audit", "Audit mandiri"),
      value: t(`${runProvenance.auditedValues} values`, `${runProvenance.auditedValues} nilai`),
      detail: t(
        `Recomputed from predictions · ${runProvenance.auditMismatches} mismatches`,
        `Dihitung ulang dari prediksi · ${runProvenance.auditMismatches} ketidakcocokan`,
      ),
    },
    {
      label: t("Statistics", "Statistik"),
      value: t(`${runProvenance.seedsPerCondition} seeds`, `${runProvenance.seedsPerCondition} *seed*`),
      detail: t(
        `B = ${num(runProvenance.bootstrapResamples)} bootstrap · patient-clustered`,
        `B = ${num(runProvenance.bootstrapResamples)} *bootstrap* · dikelompokkan per pasien`,
      ),
    },
  ];

  return (
    <PageContainer>
      <Seo
        title={ts("Research & Paper", "Penelitian & Makalah")}
        description={ts(
          "DR-VERGE research: dual-view diabetic retinopathy grading through Complementarity-Shift Distillation and lightweight INT8 deployment. Research questions, method, results, and limitations.",
          "Penelitian DR-VERGE: grading retinopati diabetik dual-view melalui Complementarity-Shift Distillation dan deployment INT8 yang ringan. Pertanyaan penelitian, metode, hasil, dan keterbatasan.",
        )}
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
              {tr(paperMeta.eyebrow)}
            </Badge>
            <Badge tone="default">{paperMeta.competition}</Badge>
            <Badge tone="default">{paperMeta.field}</Badge>
          </div>

          <h1 className="display mt-8 text-display-lg">
            DR-<em>VERGE</em>
          </h1>

          <p className="mt-7 max-w-3xl text-pretty text-lg font-medium leading-snug text-muted-foreground sm:text-2xl">
            {tr(paperMeta.subtitle)}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton to="/demo" size="lg">
              {t("Try the Model", "Coba Modelnya")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <PaperButton />
            <ExternalButton
              href={siteConfig.githubUrl}
              enabled={githubOk}
              size="lg"
              variant="outline"
              disabledTitle={ts(
                "The repository link has not been configured yet.",
                "Tautan repositori belum dikonfigurasi.",
              )}
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              {t("View Repository", "Lihat Repositori")}
            </ExternalButton>
          </div>

          {!paperOk && (
            <p className="mt-5 text-[12px] text-subtle">
              {t(
                "The paper is not yet published. The download link will activate once it is available.",
                "Makalah belum dipublikasikan. Tautan unduhan akan aktif setelah makalah tersedia.",
              )}
            </p>
          )}

          {/* Provenance: where every number on this page comes from. */}
          <dl className="mt-14 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur lg:grid-cols-4">
            {provenance.map((p, i) => (
              <div
                key={i}
                className={
                  "flex min-w-0 flex-col gap-1.5 p-5 sm:p-6 " +
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
                <dd className="break-words text-[11px] leading-snug text-muted-foreground">
                  {p.detail}
                </dd>
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
              <span className="eyebrow">{t("Full Paper", "Makalah Lengkap")}</span>
              <h2 className="display mt-5 text-display-md">
                {t("Read the", "Baca")} <em>{t("Full Paper", "Makalah Lengkap")}</em>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                {t(
                  "The complete write-up covers the locked evaluation protocol, the statistical machinery behind every comparison, the ablations, and the full set of results — including the ones that did not go the way we hoped.",
                  "Naskah lengkapnya mencakup protokol evaluasi yang dikunci, perangkat statistik di balik setiap perbandingan, ablasi, dan seluruh hasil — termasuk hasil yang tidak sesuai harapan kami.",
                )}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <PaperButton />
                <LinkButton to="/demo" size="lg" variant="outline">
                  {t("Open Model Demo", "Buka Demo Model")}
                </LinkButton>
                <ExternalButton
                  href={siteConfig.githubUrl}
                  enabled={githubOk}
                  size="lg"
                  variant="ghost"
                  disabledTitle={ts(
                    "The repository link has not been configured yet.",
                    "Tautan repositori belum dikonfigurasi.",
                  )}
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  {t("View GitHub", "Lihat GitHub")}
                </ExternalButton>
              </div>

              <div className="mt-12">
                <Callout tone="medical" className="text-left">
                  {tr(DISCLAIMER_CLINICAL)}
                </Callout>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </PageContainer>
  );
}
