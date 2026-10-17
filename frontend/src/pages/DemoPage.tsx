import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  Play,
  Printer,
  RotateCcw,
  ScanEye,
  ArrowRight,
  Cpu,
  Lock,
  ImageIcon,
} from "lucide-react";
import { PageContainer, Section, Seo, Container } from "@/components/layout/PageContainer";
import { Button, ExternalButton, LinkButton } from "@/components/common/Button";
import { Badge, Callout, Divider, Reveal, SectionHeader } from "@/components/common/Primitives";
import { UploadDropzone, ZoomModal } from "@/components/demo/UploadDropzone";
import { SamplePicker, ReferenceCheck } from "@/components/demo/SamplePicker";
import { DemoStepper, type DemoStep } from "@/components/demo/DemoStepper";
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
import { useSampleManifest, fetchSampleFile } from "@/hooks/useSamples";
import { isMockMode } from "@/services/inferenceApi";
import { siteConfig, isLinkConfigured, runsOnDevice } from "@/config/siteConfig";
import { DISCLAIMER_CLINICAL } from "@/data/researchMetrics";
import { getGrade, gradeText } from "@/data/drGrades";
import type { SampleEntry } from "@/data/samples";
import {
  readImageMeta,
  validateImageFile,
  type UploadedImage,
  type ValidationCode,
} from "@/utils/fileValidation";
import { formatBytes, formatScore, formatMs, formatTimestamp } from "@/utils/formatting";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";

type Slot = "macula" | "disc";

const slotConfig = {
  macula: {
    index: "01",
    label: { en: "Macula", id: "Makula" },
    title: { en: "Macula-Centered Fundus Image", id: "Citra Fundus Berpusat Makula" },
    hint: {
      en: "Centred on the macula — the field most single-view systems use.",
      id: "Berpusat pada makula — *field* yang digunakan oleh sebagian besar sistem *single-view*.",
    },
  },
  disc: {
    index: "02",
    label: { en: "Optic Disc", id: "Diskus Optik" },
    title: { en: "Optic-Disc-Centered Fundus Image", id: "Citra Fundus Berpusat Diskus Optik" },
    hint: {
      en: "Centred on the optic disc, capturing complementary retinal territory.",
      id: "Berpusat pada diskus optik, menangkap area retina pelengkap.",
    },
  },
} as const;

interface SlotError {
  code?: ValidationCode;
  /** English message from the validator, used for English and as a fallback. */
  message: string;
  size?: number;
}

export default function DemoPage() {
  const { t, ts, trs, tr, lang, pick } = useI18n();

  const [images, setImages] = useState<Record<Slot, UploadedImage | null>>({
    macula: null,
    disc: null,
  });
  const [errors, setErrors] = useState<Record<Slot, SlotError | null>>({
    macula: null,
    disc: null,
  });
  const [zoomSlot, setZoomSlot] = useState<Slot | null>(null);

  // Sample eyes. `activeSample` is the pair currently in the slots (cleared as
  // soon as the visitor changes either slot by hand); `analyzedSample` is the
  // pair the shown result was produced from.
  const { manifest, loading: manifestLoading } = useSampleManifest();
  const [activeSample, setActiveSample] = useState<SampleEntry | null>(null);
  const [pendingSample, setPendingSample] = useState<string | null>(null);
  const [sampleError, setSampleError] = useState(false);
  const [analyzedSample, setAnalyzedSample] = useState<SampleEntry | null>(null);

  const inference = useInference();
  const resultRef = useRef<HTMLDivElement>(null);
  const mock = isMockMode();

  const bothReady = Boolean(images.macula && images.disc);
  const readyCount = Number(Boolean(images.macula)) + Number(Boolean(images.disc));

  /** Validation messages in the reader's language. */
  const errorText = (e: SlotError | null): string | null => {
    if (!e) return null;
    if (lang === "en" || !e.code) return e.message;
    switch (e.code) {
      case "no-file":
        return "Tidak ada berkas yang dipilih.";
      case "type":
        return "Jenis berkas tidak didukung. Silakan unggah citra JPG, JPEG, atau PNG.";
      case "empty":
        return "Berkas tersebut tampaknya kosong. Silakan pilih citra lain.";
      case "size":
        return `Berkas terlalu besar (${formatBytes(e.size ?? 0, "id")}). Batas maksimumnya ${formatBytes(siteConfig.maxUploadBytes, "id")}.`;
    }
  };

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
      setErrors((e) => ({
        ...e,
        [slot]: {
          code: validation.code,
          message: validation.error ?? "That file could not be used.",
          size: file.size,
        },
      }));
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

  /** A manual upload breaks the link to whichever sample was loaded. */
  const handleManualSelect = useCallback(
    (slot: Slot, file: File) => {
      setActiveSample(null);
      void handleSelect(slot, file);
    },
    [handleSelect],
  );

  const handleClear = useCallback((slot: Slot) => {
    setImages((prev) => {
      const old = prev[slot];
      if (old) URL.revokeObjectURL(old.previewUrl);
      return { ...prev, [slot]: null };
    });
    setErrors((e) => ({ ...e, [slot]: null }));
    setActiveSample(null);
  }, []);

  const handlePickSample = useCallback(
    async (sample: SampleEntry) => {
      setPendingSample(sample.sample_id);
      setSampleError(false);
      try {
        const [macula, disc] = await Promise.all([
          fetchSampleFile(sample, "macula"),
          fetchSampleFile(sample, "disc"),
        ]);
        await Promise.all([handleSelect("macula", macula), handleSelect("disc", disc)]);
        setActiveSample(sample);
        // A new pair invalidates any previous result.
        if (inference.status === "success" || inference.status === "error") inference.reset();
      } catch {
        setSampleError(true);
      } finally {
        setPendingSample(null);
      }
    },
    [handleSelect, inference],
  );

  const handleAnalyze = useCallback(() => {
    if (!images.macula || !images.disc) return;
    setAnalyzedSample(activeSample);
    void inference.analyze(images.macula.file, images.disc.file);
  }, [images, inference, activeSample]);

  const handleStartOver = useCallback(() => {
    revokeAll();
    setImages({ macula: null, disc: null });
    setErrors({ macula: null, disc: null });
    setActiveSample(null);
    setAnalyzedSample(null);
    inference.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [inference, revokeAll]);

  // Bring the result (or the processing state) into view once it starts.
  useEffect(() => {
    if (
      (inference.status === "success" || inference.status === "processing") &&
      resultRef.current
    ) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [inference.status]);

  const result = inference.result;
  const resultGrade = result ? getGrade(result.grade) : null;
  const resultGradeName = result
    ? resultGrade
      ? gradeText(resultGrade, lang).name
      : result.gradeName
    : "";

  // Stepper state mirrors the page, never the other way round.
  const stepDone = [bothReady, inference.status === "success", inference.status === "success"];
  const currentStep: DemoStep = !bothReady ? 0 : inference.status === "success" ? 2 : 1;

  const missingSlot = images.macula ? ts("optic-disc", "diskus optik") : ts("macula", "makula");

  return (
    <PageContainer>
      <Seo
        title={ts("Model Demo", "Demo Model")}
        description={ts(
          "Upload a macula-centered and optic-disc-centered retinal fundus image pair and inspect the DR-VERGE ordinal grading output. Research prototype; not for clinical use.",
          "Unggah pasangan citra fundus retina berpusat makula dan berpusat diskus optik, lalu periksa keluaran grading ordinal DR-VERGE. Prototipe penelitian; bukan untuk penggunaan klinis.",
        )}
      />

      {/* ================= HERO ================= */}
      <section className="grain relative overflow-hidden border-b border-border pb-12 pt-10 sm:pb-14 sm:pt-14">
        <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="grid-bg fade-mask-b pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="flex flex-col gap-10">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge tone="outline" icon={ScanEye}>
                  {t("Research Prototype", "Prototipe Penelitian")}
                </Badge>
                {mock && <Badge tone="warn">{t("Demo Mode", "Mode Demo")}</Badge>}
                {runsOnDevice && (
                  <Badge tone="outline" icon={Cpu}>
                    {t("Runs on your device", "Berjalan di perangkat Anda")}
                  </Badge>
                )}
              </div>

              <h1 className="display mt-7 text-display-md">
                {pick(
                  <>
                    Test <em>DR-VERGE</em>
                  </>,
                  <>
                    Uji <em>DR-VERGE</em>
                  </>,
                )}
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t(
                  "Give the model two views of the same eye and inspect its ordinal grading output. Pick a sample eye for the fastest start.",
                  "Berikan model dua citra dari mata yang sama, lalu periksa keluaran *grading* ordinalnya. Pilih sampel mata untuk memulai dengan cepat.",
                )}
              </p>
            </div>

            <DemoStepper current={currentStep} done={stepDone} />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Callout
              tone="medical"
              title={t("Research and educational use only", "Hanya untuk penelitian dan edukasi")}
            >
              {tr(DISCLAIMER_CLINICAL)}{" "}
              {t(
                "Do not upload images expecting a medical answer, and do not upload identifiable patient data.",
                "Jangan mengunggah citra dengan harapan memperoleh jawaban medis, dan jangan mengunggah data pasien yang dapat diidentifikasi.",
              )}
            </Callout>

            {/* Two things a visitor cannot infer and should not have to guess:
                where their images go, and which artifact actually produced the
                number they are about to read. */}
            {runsOnDevice && (
              <Callout
                tone="note"
                title={t("Inference runs entirely in your browser", "Inferensi berjalan sepenuhnya di *browser* Anda")}
              >
                {t(
                  `Your images are never uploaded — the model is downloaded once and executed on this device. The demo runs the ${siteConfig.localModelVariant} student; the deployment model reported in the paper is the ${siteConfig.paperDeploymentVariant} variant of the same method, which cannot be executed in a browser.`,
                  `Citra Anda tidak pernah diunggah — model diunduh satu kali lalu dijalankan di perangkat ini. Demo ini menjalankan *student* ${siteConfig.localModelVariant}; model *deployment* yang dilaporkan dalam makalah adalah varian ${siteConfig.paperDeploymentVariant} dari metode yang sama, yang tidak dapat dijalankan di *browser*.`,
                )}
              </Callout>
            )}
          </div>

          {mock && (
            <div className="mt-3">
              <DemoModeBanner />
            </div>
          )}
        </Container>
      </section>

      {/* ================= STEP 1: INPUT ================= */}
      <Section id="upload" tone="surface" className="py-14 sm:py-20">
        <SectionHeader
          eyebrow={t("Step 1", "Langkah 1")}
          index="01"
          title={pick(
            <>
              Choose a <em>dual-view</em> pair
            </>,
            <>
              Pilih pasangan <em>dual-view</em>
            </>,
          )}
          description={t(
            "DR-VERGE needs both fields of the same eye — that pairing is the premise of the method, so analysis stays disabled until both are provided.",
            "DR-VERGE membutuhkan kedua *field* dari mata yang sama — pasangan inilah premis metodenya, sehingga analisis tetap nonaktif sampai keduanya tersedia.",
          )}
        />

        <div className="mt-10">
          <SamplePicker
            manifest={manifest}
            loading={manifestLoading}
            activeId={activeSample?.sample_id ?? null}
            pendingId={pendingSample}
            disabled={inference.isProcessing}
            onPick={(s) => void handlePickSample(s)}
          />
          {sampleError && (
            <p role="alert" className="mt-3 text-12 text-foreground">
              {t(
                "That sample could not be loaded. Please try another one, or upload your own pair.",
                "Sampel tersebut tidak dapat dimuat. Silakan coba sampel lain, atau unggah pasangan citra Anda sendiri.",
              )}
            </p>
          )}
        </div>

        <Divider
          label={t("or upload your own pair", "atau unggah pasangan citra sendiri")}
          className="my-10"
        />

        {/* What a valid upload looks like, said once and briefly. */}
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-12 text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
            {t(
              `JPG · JPEG · PNG, up to ${formatBytes(siteConfig.maxUploadBytes)} each`,
              `JPG · JPEG · PNG, maksimum ${formatBytes(siteConfig.maxUploadBytes, "id")} per berkas`,
            )}
          </span>
          <span className="inline-flex items-center gap-2">
            <ScanEye className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
            {pick(
              <span>
                Two fields of the <strong className="font-semibold text-foreground">same</strong> eye
              </span>,
              <span>
                Dua <i>field</i> dari mata yang <strong className="font-semibold text-foreground">sama</strong>
              </span>,
            )}
          </span>
          {runsOnDevice && (
            <span className="inline-flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
              {t("Images stay on this device", "Citra tetap berada di perangkat ini")}
            </span>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {(["macula", "disc"] as Slot[]).map((slot) => (
            <UploadDropzone
              key={slot}
              index={slotConfig[slot].index}
              label={trs(slotConfig[slot].label)}
              hint={tr(slotConfig[slot].hint)}
              variant={slot}
              value={images[slot]}
              error={errorText(errors[slot])}
              disabled={inference.isProcessing}
              onSelect={(file) => handleManualSelect(slot, file)}
              onClear={() => handleClear(slot)}
              onZoom={() => setZoomSlot(slot)}
            />
          ))}
        </div>

        {/* Run control. Sticky once something is selected, so it stays
            reachable below two tall dropzones. */}
        <div className={cn("z-20 mt-8", readyCount > 0 && "sticky bottom-4")}>
          <div
            className={cn(
              "glass flex flex-col items-stretch gap-4 rounded-2xl border p-3 shadow-[0_18px_50px_-20px_hsl(var(--shadow-color)/0.45)] transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between sm:p-3 sm:pl-5",
              bothReady ? "border-foreground/30 colorful:border-brand" : "border-border",
            )}
          >
            <div className="flex items-center gap-3">
              {/* Two-segment readiness meter. */}
              <div className="flex gap-1" aria-hidden="true">
                {[0, 1].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-6 rounded-full transition-colors duration-300",
                      i < readyCount ? "brand-fill" : "bg-foreground/15 colorful:bg-brand/15",
                    )}
                  />
                ))}
              </div>
              {/* Always say why the button is disabled. */}
              <p className="text-13 text-muted-foreground" aria-live="polite">
                {bothReady ? (
                  <span className="font-medium text-foreground">
                    {activeSample
                      ? t(
                          `Sample eye ${activeSample.sample_id} ready.`,
                          `Sampel mata ${activeSample.sample_id} siap.`,
                        )
                      : t("Both views ready.", "Kedua citra siap.")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("Run the analysis.", "Jalankan analisis.")}
                    </span>
                  </span>
                ) : images.macula || images.disc ? (
                  t(
                    `Add the ${missingSlot}-centered image to continue.`,
                    `Tambahkan citra berpusat ${missingSlot} untuk melanjutkan.`,
                  )
                ) : (
                  t(
                    "Pick a sample or upload both images to enable analysis.",
                    "Pilih sampel atau unggah kedua citra untuk mengaktifkan analisis.",
                  )
                )}
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!bothReady || inference.isProcessing}
              loading={inference.isProcessing}
              className="w-full sm:w-auto"
            >
              {!inference.isProcessing && <Play className="h-4 w-4" aria-hidden="true" />}
              {inference.isProcessing
                ? t("Analyzing…", "Menganalisis…")
                : t("Analyze with DR-VERGE", "Analisis dengan DR-VERGE")}
            </Button>
          </div>
        </div>
      </Section>

      {/* ================= RESULT ================= */}
      <div ref={resultRef} className="scroll-mt-20">
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
          <Section className="py-14 sm:py-20">
            <div className="flex flex-col gap-6">
              {/* Printed header — only visible on paper. */}
              <div className="print-only mb-4">
                <div className="text-2xl font-bold">DR-VERGE</div>
                <div className="mono mt-1 text-12 uppercase tracking-[0.14em]">
                  {t("Research Prototype · Result Summary", "Prototipe Penelitian · Ringkasan Hasil")}
                </div>
                <div className="mono mt-1 text-12">
                  {formatTimestamp(new Date(result.receivedAt), lang)}
                </div>
                {result.isMock && (
                  <div className="mono mt-2 border border-black px-2 py-1 text-12 uppercase tracking-[0.14em]">
                    {t(
                      "Simulated output — no model was executed",
                      "Keluaran simulasi — tidak ada model yang dijalankan",
                    )}
                  </div>
                )}
              </div>

              <div className="no-print flex flex-wrap items-end justify-between gap-4">
                <SectionHeader
                  eyebrow={t("Step 3 · Result", "Langkah 3 · Hasil")}
                  index="03"
                  title={pick(
                    <>
                      DR-VERGE <em>Analysis</em>
                    </>,
                    <>
                      <em>Hasil Analisis</em> DR-VERGE
                    </>,
                  )}
                />
                <Badge tone={result.isMock ? "warn" : "outline"}>
                  {result.isMock
                    ? t("Simulated", "Simulasi")
                    : result.source === "onnx-local"
                      ? t("Model output · on-device", "Keluaran model · di perangkat")
                      : t("Model output", "Keluaran model")}
                </Badge>
              </div>

              {/* Mock warning sits directly above the numbers it describes. */}
              {result.isMock && <DemoModeBanner />}

              <OutputHero result={result} />

              {/* Sample pairs carry a reference grade; real output only. */}
              {analyzedSample && !result.isMock && (
                <ReferenceCheck
                  sample={analyzedSample}
                  predictedGrade={result.grade}
                  manifest={manifest}
                />
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <OrdinalThresholdScores result={result} />
                <div className="flex flex-col gap-6">
                  <RelativeGradeScores result={result} />
                  <DualViewSummary
                    maculaName={images.macula?.file.name ?? "—"}
                    discName={images.disc?.file.name ?? "—"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ModelInformation result={result} />
                <ResultInterpretation result={result} />
              </div>

              {/* Printed disclaimer — the last thing on the page. */}
              <div className="print-only mt-6 border-t border-black pt-4 text-12 leading-relaxed">
                {t(
                  "DR-VERGE is a research prototype and is not intended as a standalone clinical diagnostic system. Ordinal threshold scores and relative grade scores are internal model outputs and are not calibrated clinical probabilities. Please consult an ophthalmologist for clinical interpretation.",
                  "DR-VERGE adalah prototipe penelitian dan tidak ditujukan sebagai sistem diagnosis klinis yang berdiri sendiri. Skor ambang ordinal dan skor relatif per *grade* merupakan keluaran internal model dan bukan probabilitas klinis yang terkalibrasi. Silakan berkonsultasi dengan dokter spesialis mata untuk interpretasi klinis.",
                )}
              </div>

              {/* Actions */}
              <div className="no-print card-premium flex flex-col items-center gap-5 p-6 text-center sm:p-8">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {t("What next?", "Selanjutnya?")}
                  </h3>
                  <p className="mt-1 text-13 text-muted-foreground">
                    {t(
                      "Try another eye, keep a copy of this summary, or see how the model was evaluated.",
                      "Coba mata lain, simpan salinan ringkasan ini, atau lihat bagaimana model dievaluasi.",
                    )}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Button onClick={handleStartOver}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    {t("Analyze Another Pair", "Analisis Pasangan Lain")}
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    {t("Print / Save Result Summary", "Cetak / Simpan Ringkasan Hasil")}
                  </Button>
                  <LinkButton to="/research" variant="ghost">
                    {t("How it was evaluated", "Cara model dievaluasi")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </LinkButton>
                </div>
                <p className="text-12 text-subtle">
                  {t(
                    "The printed summary contains the grade, scores, model configuration, and timestamp. Uploaded images are not included.",
                    "Ringkasan cetak memuat *grade*, skor, konfigurasi model, dan waktu analisis. Citra yang diunggah tidak disertakan.",
                  )}
                </p>
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* ================= FOOTER CTA ================= */}
      {inference.status !== "success" && (
        <Section className="py-14 sm:py-20">
          <Reveal>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="card-premium flex flex-col gap-4 p-7 sm:p-9">
                <span className="eyebrow">{t("Understand the method", "Pahami metodenya")}</span>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t("What do these outputs actually mean?", "Apa sebenarnya arti keluaran ini?")}
                </h2>
                <p className="text-14 leading-relaxed text-muted-foreground">
                  {t(
                    "The research page explains the CORAL ordinal head, the complementarity shift that DR-VERGE distils, and what the evaluation did and did not establish.",
                    "Halaman penelitian menjelaskan *head* ordinal CORAL, *complementarity shift* yang didistilasi DR-VERGE, serta apa saja yang berhasil dan belum berhasil dibuktikan oleh evaluasi.",
                  )}
                </p>
                <div className="mt-auto pt-2">
                  <LinkButton to="/research" variant="outline">
                    {t("Read the Research", "Baca Penelitian")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </LinkButton>
                </div>
              </div>

              <div className="card-premium flex flex-col gap-4 p-7 sm:p-9">
                <span className="eyebrow">{t("More test images", "Citra uji lainnya")}</span>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t("Want to test offline or in bulk?", "Ingin menguji secara luring atau dalam jumlah banyak?")}
                </h2>
                <p className="text-14 leading-relaxed text-muted-foreground">
                  {t(
                    "Download sample dual-view fundus image pairs prepared for research demonstration. The samples open in a new tab.",
                    "Unduh pasangan citra fundus *dual-view* contoh yang disiapkan untuk demonstrasi penelitian. Sampel akan terbuka di tab baru.",
                  )}
                </p>
                <div className="mt-auto pt-2">
                  <ExternalButton
                    href={siteConfig.sampleDatasetUrl}
                    enabled={isLinkConfigured(siteConfig.sampleDatasetUrl)}
                    variant="outline"
                    disabledTitle={ts(
                      "The sample dataset link has not been configured for this deployment yet.",
                      "Tautan dataset sampel belum dikonfigurasi untuk deployment ini.",
                    )}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t("Get Sample Images", "Unduh Citra Sampel")}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  </ExternalButton>
                  {!isLinkConfigured(siteConfig.sampleDatasetUrl) && (
                    <p className="mt-3 text-12 text-subtle">
                      {t(
                        "Sample dataset link not yet configured.",
                        "Tautan dataset sampel belum dikonfigurasi.",
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </Section>
      )}

      {/* Zoom modal */}
      <ZoomModal
        image={zoomSlot ? images[zoomSlot] : null}
        label={zoomSlot ? trs(slotConfig[zoomSlot].title) : ""}
        onClose={() => setZoomSlot(null)}
      />

      {/* Screen-reader-only live summary of the final result. */}
      <div className="sr-only" aria-live="polite">
        {result
          ? ts(
              `Analysis complete. Predicted grade ${result.grade}, ${resultGradeName}.`,
              `Analisis selesai. Prediksi grade ${result.grade}, ${resultGradeName}.`,
            ) +
            (result.ordinalScores.length
              ? ts(" Ordinal threshold scores: ", " Skor ambang ordinal: ") +
                result.ordinalScores
                  .map(
                    (s, i) =>
                      `${ts("P greater than", "P lebih dari")} ${i}, ${formatScore(s, 2, lang)}`,
                  )
                  .join("; ") +
                "."
              : "") +
            (result.latencyMs !== null
              ? ts(" Inference latency ", " Latensi inferensi ") +
                formatMs(result.latencyMs, 2, lang) +
                "."
              : "") +
            (result.isMock
              ? ts(
                  " This is simulated output; no model was executed.",
                  " Ini adalah keluaran simulasi; tidak ada model yang dijalankan.",
                )
              : "")
          : ""}
      </div>
    </PageContainer>
  );
}
