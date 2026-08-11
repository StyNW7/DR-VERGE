import { motion, useReducedMotion } from "framer-motion";
import { Home, ScanEye, FileText } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import { PageContainer, Seo, Container } from "@/components/layout/PageContainer";
import { FundusIllustration } from "@/components/common/FundusIllustration";

export default function NotFoundPage() {
  const reduce = useReducedMotion();

  return (
    <PageContainer>
      <Seo title="Page Not Found" description="This page could not be found." />

      <Container className="flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* The illustration doubles as the zero in "404". */}
          <div className="flex items-center justify-center gap-2">
            <span className="display text-display-xl leading-none">4</span>
            <span className="h-[clamp(3.5rem,14vw,10rem)] w-[clamp(3.5rem,14vw,10rem)] text-foreground opacity-30">
              <FundusIllustration variant="macula" />
            </span>
            <span className="display text-display-xl leading-none">4</span>
          </div>

          <span className="eyebrow mt-8">Error 404</span>

          <h1 className="display mt-5 text-display-sm">Page Not Found</h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            This page doesn't exist. It may have been moved, or the link that brought you
            here may be out of date.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/" size="lg">
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </LinkButton>
            <LinkButton to="/demo" size="lg" variant="outline">
              <ScanEye className="h-4 w-4" aria-hidden="true" />
              Model Demo
            </LinkButton>
            <LinkButton to="/research" size="lg" variant="ghost">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Research
            </LinkButton>
          </div>
        </motion.div>
      </Container>
    </PageContainer>
  );
}
