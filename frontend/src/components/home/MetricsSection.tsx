import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, MetricCard, Reveal, Callout } from "@/components/common/Primitives";
import { headlineMetrics, DISCLAIMER_METRICS } from "@/data/researchMetrics";
import { useI18n } from "@/i18n/context";

export default function MetricsSection() {
  const { t, tr, n, pick } = useI18n();

  return (
    <Section id="findings">
      <SectionHeader
        eyebrow={t("Research Findings", "Temuan Penelitian")}
        index="04"
        title={pick(
          <>
            What the experiments <em>produced</em>
          </>,
          <>
            Apa yang <em>dihasilkan</em> eksperimen
          </>,
        )}
        description={t(
          "Results from the locked DR-VERGE evaluation protocol: five seeds per condition, selection on validation only, and a test set opened once.",
          "Hasil dari protokol evaluasi DR-VERGE yang telah dikunci: lima *seed* per kondisi, pemilihan hanya pada data validasi, dan data uji yang dibuka satu kali.",
        )}
        size="lg"
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {headlineMetrics.map((m, i) => (
          <Reveal key={m.label.en} delay={i * 0.06}>
            <MetricCard
              value={n(m.value)}
              label={tr(m.label)}
              detail={tr(m.detail)}
              // The deployment latency is the headline engineering result.
              emphasis={"emphasis" in m && m.emphasis}
              className="h-full"
            />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <Callout
          tone="research"
          title={t("How to read these numbers", "Cara membaca angka-angka ini")}
          className="mt-8"
        >
          {tr(DISCLAIMER_METRICS)}
        </Callout>
      </Reveal>
    </Section>
  );
}
