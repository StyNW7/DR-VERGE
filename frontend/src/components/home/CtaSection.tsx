import { ArrowRight, Upload, ScanEye } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { LinkButton } from "@/components/common/Button";
import { Reveal } from "@/components/common/Primitives";
import { siteConfig } from "@/config/siteConfig";
import { heroExample } from "@/data/samples";
import { useI18n } from "@/i18n/context";

export default function CtaSection() {
  const { t, pick } = useI18n();
  return (
    <Section id="cta" className="overflow-hidden">
      <Reveal>
        <div className="grain inverse relative overflow-hidden rounded-[32px] shadow-2xl">
          {/* Inverted grid paper, faded towards the copy. */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,hsl(var(--background))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--background))_1px,transparent_1px)] [background-size:56px_56px] fade-mask-radial"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-12 lg:p-16">
            <div className="lg:col-span-7">
              <span className="mono inline-flex items-center gap-2 rounded-full border border-background/25 px-3 py-1 text-[10px] uppercase tracking-[0.14em]">
                <ScanEye className="h-3 w-3" aria-hidden="true" />
                {t("Interactive Demo", "Demo Interaktif")}
              </span>

              <h2 className="display mt-6 text-[clamp(2.5rem,5.4vw,4.5rem)] leading-[0.95]">
                {pick(
                  <>
                    See DR-VERGE <em>in Action</em>
                  </>,
                  <>
                    Lihat DR-VERGE <em>Beraksi</em>
                  </>,
                )}
              </h2>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-background/70">
                {t(
                  "Load a sample eye or upload your own macula-centered and optic-disc-centered pair, and explore the model's research output — the predicted ordinal grade, the four cumulative threshold scores behind it, and the model configuration that produced them.",
                  "Muat sampel mata atau unggah pasangan citra berpusat makula dan berpusat diskus optik milik Anda, lalu telusuri keluaran riset model — *grade* ordinal yang diprediksi, empat skor ambang kumulatif yang mendasarinya, serta konfigurasi model yang menghasilkannya.",
                )}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <LinkButton
                  to="/demo"
                  size="lg"
                  className="group bg-background bg-none text-foreground hover:opacity-90 colorful:shadow-[0_12px_28px_-12px_hsl(222_80%_15%/0.6)]"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {t("Open Model Demo", "Buka Demo Model")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </LinkButton>
                <LinkButton
                  to="/research"
                  size="lg"
                  variant="ghost"
                  className="border border-background/25 text-background hover:bg-background/10 hover:text-background colorful:hover:bg-white/10 colorful:hover:text-white"
                >
                  {t("Read the Research", "Baca Penelitian")}
                </LinkButton>
              </div>

              <p className="mt-8 max-w-lg text-[12px] leading-relaxed text-background/60">
                <span className="font-medium text-background">
                  {t("For research and educational use only.", "Hanya untuk penelitian dan edukasi.")}
                </span>{" "}
                {t(
                  `${siteConfig.projectName} is not a clinical diagnostic system and must not be used as a substitute for professional medical evaluation.`,
                  `${siteConfig.projectName} bukan sistem diagnosis klinis dan tidak boleh digunakan sebagai pengganti evaluasi medis profesional.`,
                )}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto grid max-w-sm grid-cols-2 gap-4">
                {[heroExample.macula, heroExample.disc].map((src, i) => (
                  <div
                    key={src}
                    className={
                      "aspect-square overflow-hidden rounded-2xl bg-black ring-1 ring-background/20 transition-transform duration-700 ease-editorial hover:rotate-0 " +
                      (i === 0 ? "-rotate-3" : "translate-y-8 rotate-3")
                    }
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full scale-105 object-cover grayscale contrast-125 colorful:grayscale-0 colorful:contrast-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
