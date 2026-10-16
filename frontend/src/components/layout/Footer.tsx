import { Link } from "react-router-dom";
import { Github, FileText, Download, ArrowUpRight } from "lucide-react";
import { siteConfig, isLinkConfigured } from "@/config/siteConfig";
import { Container } from "./PageContainer";
import { l, useI18n } from "@/i18n/context";

const navLinks = [
  { label: l("Home", "Beranda"), to: "/" },
  { label: l("Model Demo", "Demo Model"), to: "/demo" },
  { label: l("Research", "Penelitian"), to: "/research" },
];

const externalLinks = [
  { label: l("GitHub", "GitHub"), url: siteConfig.githubUrl, icon: Github },
  { label: l("Paper", "Makalah"), url: siteConfig.paperUrl, icon: FileText },
  { label: l("Sample Dataset", "Dataset Sampel"), url: siteConfig.sampleDatasetUrl, icon: Download },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { t, ts, tr } = useI18n();

  return (
    <footer className="no-print grain relative overflow-hidden border-t border-border bg-surface">
      <div className="spotlight pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <Container className="relative py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Identity */}
          <div className="md:col-span-5">
            <div className="display text-3xl">
              {siteConfig.projectName}
            </div>
            <p className="mt-2 font-serif text-lg italic text-muted-foreground">
              {siteConfig.fullName}
            </p>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              {t(
                "Dual-view diabetic retinopathy grading through Complementarity-Shift Distillation and lightweight INT8 deployment.",
                "*Grading* retinopati diabetik *dual-view* melalui *Complementarity-Shift Distillation* dan *deployment* INT8 yang ringan.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="mono rounded-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-background">
                {siteConfig.competition}
              </span>
              <span className="mono rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {siteConfig.category}
              </span>
              <span className="mono rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {siteConfig.institution}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="eyebrow mb-5">{t("Navigation", "Navigasi")}</h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tr(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-4">
            <h3 className="eyebrow mb-5">{t("Resources", "Tautan")}</h3>
            <ul className="flex flex-col gap-3">
              {externalLinks.map((link) => {
                const Icon = link.icon;
                const ok = isLinkConfigured(link.url);
                return (
                  <li key={link.label.en}>
                    {ok ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {tr(link.label)}
                        <ArrowUpRight
                          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      // An unconfigured link is shown as pending rather than
                      // rendered as a link that goes nowhere.
                      <span
                        className="inline-flex items-center gap-2 text-sm text-subtle"
                        title={ts("This link has not been configured yet.", "Tautan ini belum dikonfigurasi.")}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {tr(link.label)}
                        <span className="mono text-[9px] uppercase tracking-[0.14em]">
                          {t("soon", "segera")}
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Oversized wordmark: the page's closing gesture. Decorative only. */}
        <div
          className="ink-gradient pointer-events-none mt-16 select-none text-center text-[clamp(4rem,17vw,15rem)] font-extrabold leading-[0.8] tracking-[-0.06em] opacity-[0.12]"
          aria-hidden="true"
        >
          {siteConfig.projectName}
        </div>

        {/* Disclaimer — the site's most repeated statement, and the last word. */}
        <div className="border-t border-border pt-8">
          <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              {t(
                `${siteConfig.projectName} is a research prototype`,
                `${siteConfig.projectName} adalah prototipe penelitian`,
              )}
            </span>{" "}
            {t(
              "and is not intended for standalone clinical diagnosis. Model outputs are research artifacts and must not replace evaluation by qualified healthcare professionals.",
              "dan tidak ditujukan untuk diagnosis klinis yang berdiri sendiri. Keluaran model merupakan artefak penelitian dan tidak boleh menggantikan evaluasi oleh tenaga kesehatan yang kompeten.",
            )}
          </p>
          <div className="mt-6 flex flex-col gap-2 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {year} {siteConfig.projectName} · {siteConfig.category}
            </span>
            <span className="mono uppercase tracking-[0.14em]">
              {t("Research · Not for clinical use", "Penelitian · Bukan untuk penggunaan klinis")}
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
