import { Link } from "react-router-dom";
import { Github, FileText, Download, ArrowUpRight } from "lucide-react";
import { siteConfig, isLinkConfigured } from "@/config/siteConfig";
import { Container } from "./PageContainer";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Model Demo", to: "/demo" },
  { label: "Research", to: "/research" },
];

const externalLinks = [
  { label: "GitHub", url: siteConfig.githubUrl, icon: Github },
  { label: "Paper", url: siteConfig.paperUrl, icon: FileText },
  { label: "Sample Dataset", url: siteConfig.sampleDatasetUrl, icon: Download },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="no-print border-t border-border bg-surface">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Identity */}
          <div className="md:col-span-5">
            <div className="display text-3xl">{siteConfig.projectName}</div>
            <p className="mt-2 text-sm text-muted-foreground">{siteConfig.fullName}</p>
            <div className="mt-6 flex flex-col gap-1">
              <span className="mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                {siteConfig.competition}
              </span>
              <span className="text-sm text-muted-foreground">
                AI for Healthcare Research
              </span>
              <span className="text-sm text-muted-foreground">
                {siteConfig.institution}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="eyebrow mb-5">Navigation</h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-4">
            <h3 className="eyebrow mb-5">Resources</h3>
            <ul className="flex flex-col gap-3">
              {externalLinks.map((l) => {
                const Icon = l.icon;
                const ok = isLinkConfigured(l.url);
                return (
                  <li key={l.label}>
                    {ok ? (
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {l.label}
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
                        title="This link has not been configured yet."
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {l.label}
                        <span className="mono text-[9px] uppercase tracking-[0.14em]">
                          soon
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Disclaimer — the site's most repeated statement, and the last word. */}
        <div className="mt-14 border-t border-border pt-8">
          <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              {siteConfig.projectName} is a research prototype
            </span>{" "}
            and is not intended for standalone clinical diagnosis. Model outputs are
            research artifacts and must not replace evaluation by qualified healthcare
            professionals.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {year} {siteConfig.projectName} · {siteConfig.category}
            </span>
            <span className="mono uppercase tracking-[0.14em]">
              Research · Not for clinical use
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
