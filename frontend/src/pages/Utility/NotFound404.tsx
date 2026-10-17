import { motion, useReducedMotion } from "framer-motion";
import { Home, ScanEye, FileText } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { PageContainer, Seo, Container } from "@/components/layout/PageContainer";
import { FundusIllustration } from "@/components/common/FundusIllustration";
import { useI18n } from "@/i18n/context";

export default function NotFoundPage() {
  const reduce = useReducedMotion();
  const { t, ts } = useI18n();

  return (
    <PageContainer>
      <Seo
        title={ts("Page Not Found", "Halaman Tidak Ditemukan")}
        description={ts("This page could not be found.", "Halaman ini tidak dapat ditemukan.")}
      />

      <Container className="flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* The illustration doubles as the zero in "404". */}
          <div className="flex items-center justify-center gap-2">
            <span className="display ink-gradient text-display-xl leading-none">4</span>
            {/* Drawn with the same stroke weight as the 4s, so it reads as
                the digit first and as an eye second. */}
            <span className="relative flex h-[clamp(3.5rem,14vw,10rem)] w-[clamp(3.5rem,14vw,10rem)] items-center justify-center rounded-full border-[clamp(7px,1.6vw,16px)] border-foreground colorful:border-brand colorful:shadow-[0_18px_50px_-18px_hsl(var(--brand-to)/0.7)]">
              <span className="h-[78%] w-[78%] text-foreground opacity-50 colorful:text-brand colorful:opacity-80">
                <FundusIllustration variant="macula" />
              </span>
            </span>
            <span className="display ink-gradient text-display-xl leading-none">4</span>
          </div>

          <span className="eyebrow mt-8">{t("Error 404", "Galat 404")}</span>

          <h1 className="display mt-5 text-display-sm">
            {t("Page Not Found", "Halaman Tidak Ditemukan")}
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {t(
              "This page doesn't exist. It may have been moved, or the link that brought you here may be out of date.",
              "Halaman ini tidak ada. Halaman mungkin telah dipindahkan, atau tautan yang membawa Anda ke sini sudah tidak berlaku.",
            )}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/" size="lg">
              <Home className="h-4 w-4" aria-hidden="true" />
              {t("Back to Home", "Kembali ke Beranda")}
            </LinkButton>
            <LinkButton to="/demo" size="lg" variant="outline">
              <ScanEye className="h-4 w-4" aria-hidden="true" />
              {t("Model Demo", "Demo Model")}
            </LinkButton>
            <LinkButton to="/research" size="lg" variant="ghost">
              <FileText className="h-4 w-4" aria-hidden="true" />
              {t("Research", "Penelitian")}
            </LinkButton>
          </div>
        </motion.div>
      </Container>
    </PageContainer>
  );
}
