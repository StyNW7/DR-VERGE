import { ArrowRight, Upload, ScanEye } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { LinkButton } from "@/components/common/Button";
import { Reveal, Badge } from "@/components/common/Primitives";
import { FundusIllustration } from "@/components/common/FundusIllustration";
import { siteConfig } from "@/config/siteConfig";

export default function CtaSection() {
  return (
    <Section id="cta" tone="surface" className="overflow-hidden">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div
            className="pointer-events-none absolute inset-0 grid-bg opacity-40"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-12 lg:p-16">
            <div className="lg:col-span-7">
              <Badge tone="outline" icon={ScanEye}>
                Interactive Demo
              </Badge>

              <h2 className="display mt-6 text-display-md">See DR-VERGE in Action</h2>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Upload a macula-centered and optic-disc-centered fundus image pair and
                explore the model's research output — the predicted ordinal grade, the four
                cumulative threshold scores behind it, and the model configuration that
                produced them.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <LinkButton to="/demo" size="lg" className="group">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Open Model Demo
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </LinkButton>
                <LinkButton to="/research" size="lg" variant="outline">
                  Read the Research
                </LinkButton>
              </div>

              <p className="mt-8 max-w-lg text-[12px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  For research and educational use only.
                </span>{" "}
                {siteConfig.projectName} is not a clinical diagnostic system and must not
                be used as a substitute for professional medical evaluation.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto grid max-w-xs grid-cols-2 gap-4">
                <div className="aspect-square rounded-xl border border-border bg-background p-3 text-foreground">
                  <FundusIllustration variant="macula" />
                </div>
                <div className="aspect-square translate-y-6 rounded-xl border border-border bg-background p-3 text-foreground">
                  <FundusIllustration variant="disc" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
