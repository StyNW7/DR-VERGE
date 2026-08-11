import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  Play,
  Printer,
  RotateCcw,
  ScanEye,
  FileImage,
  ArrowRight,
} from "lucide-react";
import { PageContainer, Section, Seo, Container } from "@/components/layout/PageContainer";
import { Button, ExternalButton, LinkButton } from "@/components/common/Button";
import { Badge, Callout, Reveal, SectionHeader } from "@/components/common/Primitives";
import { FundusIllustration } from "@/components/common/FundusIllustration";
import { UploadDropzone, ZoomModal } from "@/components/demo/UploadDropzone";
import {
  DemoModeBanner,
  ErrorState,
  ProcessingState,
} from "@/components/demo/DemoStates";
import {
  DualViewSummary,
  ModelInformation,
  OrdinalThresholdScores,
  OutputHero,
  RelativeGradeScores,
  ResultInterpretation,
} from "@/components/demo/ResultPanel";
import { useInference } from "@/hooks/useInference";
import { isMockMode } from "@/services/inferenceApi";
import { siteConfig, isLinkConfigured } from "@/config/siteConfig";
import { DISCLAIMER_CLINICAL } from "@/data/researchMetrics";
import {
  readImageMeta,
  validateImageFile,
  type UploadedImage,
} from "@/utils/fileValidation";
import { formatScore, formatMs, formatTimestamp } from "@/utils/formatting";

type Slot = "macula" | "disc";

const slotConfig = {
  macula: {
    index: "01",
    label: "Macula",
    title: "Macula-Centered Fundus Image",
    hint: "Centred on the macula — the field most single-view systems use.",
  },
  disc: {
    index: "02",
    label: "Optic Disc",
    title: "Optic-Disc-Centered Fundus Image",
    hint: "Centred on the optic disc, capturing complementary retinal territory.",
  },
} as const;

export default function DemoPage() {
  const [images, setImages] = useState<Record<Slot, UploadedImage | null>>({
    macula: null,
    disc: null,
  });
  const [errors, setErrors] = useState<Record<Slot, string | null>>({
    macula: null,
    disc: null,
  });
  const [zoomSlot, setZoomSlot] = useState<Slot | null>(null);

  const inference = useInference();
  const resultRef = useRef<HTMLDivElement>(null);
  const mock = isMockMode();

  const bothReady = Boolean(images.macula && images.disc);

  // Keep the hook's idle/ready state in step with upload readiness.
  // Depends on the stable `setReadiness` callback rather than the whole hook
  // object, which is a new reference on every render.
  const { setReadiness } = inference;
  useEffect(() => {
    setReadiness(bothReady);
  }, [bothReady, setReadiness]);

  // Object URLs are a leak if they are never revoked, so every URL created here
  // is released when it is replaced and when the page unmounts.
  const revokeAll = useCallback(() => {
    Object.values(images).forEach((img) => {
      if (img) URL.revokeObjectURL(img.previewUrl);
    });
  }, [images]);

  useEffect(() => {
    return () => {
      Object.values(images).forEach((img) => {
        if (img) URL.revokeObjectURL(img.previewUrl);
      });
    };
    // Intentionally unmount-only: the cleanup for a *replaced* image is handled
    // in handleSelect, where the old URL is still in scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = useCallback(async (slot: Slot, file: File) => {
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setErrors((e) => ({ ...e, [slot]: validation.error ?? "That file could not be used." }));
      return;
    }

    setErrors((e) => ({ ...e, [slot]: null }));
    const previewUrl = URL.createObjectURL(file);

    setImages((prev) => {
      const old = prev[slot];
      if (old) URL.revokeObjectURL(old.previewUrl);
      return { ...prev, [slot]: { file, previewUrl, meta: null } };
    });

    // Dimensions arrive asynchronously and only enrich the metadata panel.
    const meta = await readImageMeta(file);
    setImages((prev) => {
      const current = prev[slot];
      if (!current || current.file !== file) return prev; // superseded
      return { ...prev, [slot]: { ...current, meta } };
    });
  }, []);

  const handleClear = useCallback((slot: Slot) => {
    setImages((prev) => {
      const old = prev[slot];
      if (old) URL.revokeObjectURL(old.previewUrl);
      return { ...prev, [slot]: null };
    });
    setErrors((e) => ({ ...e, [slot]: null }));
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!images.macula || !images.disc) return;
    void inference.analyze(images.macula.file, images.disc.file);
  }, [images, inference]);

  const handleStartOver = useCallback(() => {
    revokeAll();
    setImages({ macula: null, disc: null });
    setErrors({ macula: null, disc: null });
    inference.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [inference, revokeAll]);

  // Bring the result into view once it lands.
  useEffect(() => {
    if (inference.status === "success" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [inference.status]);

  const result = inference.result;

  return (
    <PageContainer>
      <Seo
        title="Model Demo"
        description="Upload a macula-centered and optic-disc-centered retinal fundus image pair and inspect the DR-VERGE ordinal grading output. Research prototype; not for clinical use."
      />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-border pb-14 pt-12 sm:pb-16 sm:pt-16">
        <div
          className="pointer-events-none absolute inset-0 grid-bg fade-mask-b opacity-40"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="outline" icon={ScanEye}>
              Research Prototype
            </Badge>
            {mock && <Badge tone="warn">Demo Mode</Badge>}
          </div>

          <h1 className="display mt-7 text-display-md">Test DR-VERGE</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Upload two complementary retinal fundus views and inspect the model's ordinal
            grading output.
          </p>

          <div className="mt-8 max-w-2xl">
            <Callout tone="medical" title="Research and educational use only">
              {DISCLAIMER_CLINICAL} Do not upload images expecting a medical answer, and do
              not upload identifiable patient data.
            </Callout>
          </div>

          {mock && (
            <div className="mt-4 max-w-2xl">
              <DemoModeBanner />
            </div>
          )}
        </Container>
      </section>

      {/* ================= INPUT REQUIREMENTS ================= */}
      <Section className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">Required Inputs</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
              Two views of the same eye
            </h2>
            <p className="mt-4 max-w-prose text-[14px] leading-relaxed text-muted-foreground">
              DR-VERGE is a dual-view model. It needs both fields to produce a grade —
              that pairing is the entire premise of the method, so inference stays disabled
              until both are provided.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {(["macula", "disc"] as Slot[]).map((slot) => (
                <div
                  key={slot}
                  className="flex gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <div className="h-14 w-14 shrink-0 text-foreground">
                    <FundusIllustration variant={slot} />
                  </div>
                  <div className="min-w-0">
                    <div className="mono text-[10px] tracking-[0.14em] text-subtle">
                      {slotConfig[slot].index}
                    </div>
                    <div className="mt-1 text-[13px] font-semibold leading-tight">
                      {slotConfig[slot].title}
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                      {slotConfig[slot].hint}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              <div className="bg-card px-4 py-3.5">
                <dt className="mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  Accepted formats
                </dt>
                <dd className="mt-1 text-[13px] font-medium">JPG · JPEG · PNG</dd>
              </div>
              <div className="bg-card px-4 py-3.5">
                <dt className="mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  Recommended
                </dt>
                <dd className="mt-1 text-[13px] font-medium">
                  Clear single-field fundus photograph
                </dd>
              </div>
            </dl>
          </div>

          {/* Sample dataset */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-7 sm:p-8">
              <FileImage className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-bold tracking-tight">
                Need compatible examples?
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                Download sample dual-view fundus image pairs prepared for research
                demonstration. The samples open in a new tab and are not redistributed by
                this site.
              </p>
              <div className="mt-auto pt-7">
                <ExternalButton
                  href={siteConfig.sampleDatasetUrl}
                  enabled={isLinkConfigured(siteConfig.sampleDatasetUrl)}
                  variant="secondary"
                  className="w-full"
                  disabledTitle="The sample dataset link has not been configured for this deployment yet."
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Get Sample Images
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </ExternalButton>
                {!isLinkConfigured(siteConfig.sampleDatasetUrl) && (
                  <p className="mt-3 text-center text-[11px] text-subtle">
                    Sample dataset link not yet configured.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ================= UPLOAD ================= */}
      <Section id="upload" tone="surface" className="py-14 sm:py-16">
        <SectionHeader
          eyebrow="Step 1"
          title="Upload the dual-view pair"
          description="Drag and drop, or click to browse. Images are sent for inference and are not stored by this site."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {(["macula", "disc"] as Slot[]).map((slot) => (
            <UploadDropzone
              key={slot}
              index={slotConfig[slot].index}
              label={slotConfig[slot].label}
              hint={slotConfig[slot].hint}
              variant={slot}
              value={images[slot]}
              error={errors[slot]}
              disabled={inference.isProcessing}
              onSelect={(file) => void handleSelect(slot, file)}
              onClear={() => handleClear(slot)}
              onZoom={() => setZoomSlot(slot)}
            />
          ))}
        </div>

        {/* Run control */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!bothReady || inference.isProcessing}
            loading={inference.isProcessing}
            className="w-full sm:w-auto"
          >
            {!inference.isProcessing && <Play className="h-4 w-4" aria-hidden="true" />}
            {inference.isProcessing ? "Analyzing…" : "Analyze with DR-VERGE"}
          </Button>

          {/* Always say why the button is disabled. */}
          {!bothReady && (
            <p className="text-center text-[12px] text-muted-foreground">
              {images.macula || images.disc
                ? `Add the ${images.macula ? "optic-disc" : "macula"}-centered image to continue.`
                : "Upload both images to enable analysis."}
            </p>
          )}
        </div>
      </Section>

      {/* ================= RESULT ================= */}
      <div ref={resultRef}>
        {inference.status === "processing" && (
          <Section className="py-14 sm:py-16">
            <ProcessingState
              stages={inference.stages}
              stageIndex={inference.stageIndex}
              onCancel={inference.cancel}
            />
          </Section>
        )}

        {inference.status === "error" && inference.error && (
          <Section className="py-14 sm:py-16">
            <ErrorState
              error={inference.error}
              onRetry={handleAnalyze}
              onReset={handleStartOver}
            />
          </Section>
        )}

        {inference.status === "success" && result && (
          <Section className="py-14 sm:py-16">
            <div className="flex flex-col gap-6">
              {/* Printed header — only visible on paper. */}
              <div className="print-only mb-4">
                <div className="text-2xl font-bold">DR-VERGE</div>
                <div className="mono mt-1 text-[11px] uppercase tracking-[0.14em]">
                  Research Prototype · Result Summary
                </div>
                <div className="mono mt-1 text-[11px]">
                  {formatTimestamp(new Date(result.receivedAt))}
                </div>
                {result.isMock && (
                  <div className="mono mt-2 border border-black px-2 py-1 text-[11px] uppercase tracking-[0.14em]">
                    Simulated output — no model was executed
                  </div>
                )}
              </div>

              <div className="no-print flex flex-wrap items-center justify-between gap-4">
                <SectionHeader eyebrow="Step 2" title="DR-VERGE Analysis" />
                <Badge tone={result.isMock ? "warn" : "outline"}>
                  {result.isMock ? "Simulated" : "Model output"}
                </Badge>
              </div>

              {/* Mock warning sits directly above the numbers it describes. */}
              {result.isMock && <DemoModeBanner />}

              <OutputHero result={result} />

              <div className="grid gap-6 lg:grid-cols-2">
                <OrdinalThresholdScores result={result} />
                <div className="flex flex-col gap-6">
                  <RelativeGradeScores result={result} />
                  <DualViewSummary
                    maculaName={images.macula?.file.name ?? "—"}
                    discName={images.disc?.file.name ?? "—"}
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <ModelInformation result={result} />
                <ResultInterpretation result={result} />
              </div>

              {/* Printed disclaimer — the last thing on the page. */}
              <div className="print-only mt-6 border-t border-black pt-4 text-[11px] leading-relaxed">
                DR-VERGE is a research prototype and is not intended as a standalone
                clinical diagnostic system. Ordinal threshold scores and relative grade
                scores are internal model outputs and are not calibrated clinical
                probabilities. Please consult an ophthalmologist for clinical
                interpretation.
              </div>

              {/* Actions */}
              <div className="no-print flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={handleStartOver}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Analyze Another Pair
                </Button>
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  Print / Save Result Summary
                </Button>
              </div>

              <p className="no-print text-center text-[11px] text-subtle">
                The printed summary contains the grade, scores, model configuration, and
                timestamp. Uploaded images are not included.
              </p>
            </div>
          </Section>
        )}
      </div>

      {/* ================= FOOTER CTA ================= */}
      {inference.status !== "success" && (
        <Section tone="surface" className="py-14 sm:py-16">
          <Reveal>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="eyebrow">Understand the method</span>
              <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                What do these outputs actually mean?
              </h2>
              <p className="max-w-prose text-[14px] leading-relaxed text-muted-foreground">
                The research page explains the CORAL ordinal head, the complementarity
                shift that DR-VERGE distils, and what the evaluation did and did not
                establish.
              </p>
              <LinkButton to="/research" variant="outline">
                Read the Research
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
            </div>
          </Reveal>
        </Section>
      )}

      {/* Zoom modal */}
      <ZoomModal
        image={zoomSlot ? images[zoomSlot] : null}
        label={zoomSlot ? slotConfig[zoomSlot].title : ""}
        onClose={() => setZoomSlot(null)}
      />

      {/* Screen-reader-only live summary of the final result. */}
      <div className="sr-only" aria-live="polite">
        {result
          ? `Analysis complete. Predicted grade ${result.grade}, ${result.gradeName}.` +
            (result.ordinalScores.length
              ? ` Ordinal threshold scores: ${result.ordinalScores
                  .map((s, i) => `P greater than ${i}, ${formatScore(s, 2)}`)
                  .join("; ")}.`
              : "") +
            (result.latencyMs !== null ? ` Inference latency ${formatMs(result.latencyMs)}.` : "") +
            (result.isMock ? " This is simulated output; no model was executed." : "")
          : ""}
      </div>
    </PageContainer>
  );
}
