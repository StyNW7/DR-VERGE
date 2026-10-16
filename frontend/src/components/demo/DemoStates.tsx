import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Loader2,
  WifiOff,
  ServerCrash,
  TimerOff,
  FileWarning,
  Settings2,
  CircleAlert,
  RotateCcw,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import type { InferenceErrorState } from "@/hooks/useInference";
import type { InferenceErrorKind } from "@/services/inferenceApi";
import { useI18n, type L } from "@/i18n/context";

/* -------------------------------------------------------------------------- */
/* Processing                                                                  */
/* -------------------------------------------------------------------------- */

/** Indonesian labels for `PROCESSING_STAGES`, by position. */
const STAGES_ID = [
  "Menyiapkan citra",
  "Mengekstraksi fitur *dual-view*",
  "Memfusikan bukti",
  "Menghitung ambang ordinal",
  "Menentukan *grade* DR",
];

/**
 * Staged processing animation.
 *
 * These stage labels are DECORATIVE. They describe the model's documented
 * pipeline so the wait has structure, but no intermediate model output is shown
 * and no stage timing is measured — inventing per-stage numbers would be
 * fabricated telemetry.
 */
export function ProcessingState({
  stages,
  stageIndex,
  onCancel,
}: {
  stages: readonly string[];
  stageIndex: number;
  onCancel: () => void;
}) {
  const reduce = useReducedMotion();
  const { t, ts } = useI18n();

  return (
    <div
      className="card-premium p-8 sm:p-12"
      role="status"
      aria-live="polite"
      aria-label={ts("Running analysis", "Analisis sedang berjalan")}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Indeterminate ring — no percentage, because none is measured. */}
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border border-border" />
          <span className="absolute inset-0 animate-spin rounded-full border-t-2 border-foreground colorful:border-brand" />
          <span className="absolute inset-3 rounded-full bg-foreground/5 animate-pulse-sweep colorful:bg-brand/20" />
        </div>

        <h3 className="mt-8 text-lg font-bold tracking-tight">
          {t("Analyzing dual-view pair", "Menganalisis pasangan *dual-view*")}
        </h3>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          {t(
            "The first run downloads the model once; after that it takes a few seconds.",
            "Pada percobaan pertama model diunduh satu kali; setelah itu hanya butuh beberapa detik.",
          )}
        </p>

        <ol className="mt-9 flex w-full flex-col gap-1">
          {stages.map((stage, i) => {
            const done = i < stageIndex;
            const active = i === stageIndex;
            return (
              <li key={stage}>
                <motion.div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-300",
                    active && "bg-muted colorful:bg-brand-soft",
                  )}
                  initial={reduce ? false : { opacity: 0.4 }}
                  animate={{ opacity: done || active ? 1 : 0.4 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {done ? (
                      <Check className="h-3.5 w-3.5 text-foreground colorful:text-brand" aria-hidden="true" />
                    ) : active ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin text-foreground colorful:text-brand"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-border"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[13px]",
                      active ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {t(stage, STAGES_ID[i] ?? stage)}
                  </span>
                </motion.div>
              </li>
            );
          })}
        </ol>

        <Button variant="ghost" size="sm" onClick={onCancel} className="mt-8">
          {t("Cancel", "Batalkan")}
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Error                                                                       */
/* -------------------------------------------------------------------------- */

const errorIcons: Record<InferenceErrorKind, React.ElementType> = {
  network: WifiOff,
  timeout: TimerOff,
  server: ServerCrash,
  malformed: FileWarning,
  "not-configured": Settings2,
  unknown: CircleAlert,
};

const errorTitles: Record<InferenceErrorKind, L> = {
  network: { en: "Couldn't reach the service", id: "Layanan tidak dapat dihubungi" },
  timeout: { en: "The request timed out", id: "Permintaan melewati batas waktu" },
  server: { en: "The service couldn't complete this request", id: "Layanan tidak dapat menyelesaikan permintaan ini" },
  malformed: { en: "Unexpected response", id: "Respons tidak terduga" },
  "not-configured": { en: "Inference endpoint not configured", id: "*Endpoint* inferensi belum dikonfigurasi" },
  unknown: { en: "Something went wrong", id: "Terjadi kesalahan" },
};

/**
 * Indonesian versions of the exact messages the inference layer produces. The
 * services stay in English (they are tested as such); anything not listed falls
 * back to a generic message for its error kind.
 */
const MESSAGES_ID: Record<string, string> = {
  "Analysis was cancelled.": "Analisis dibatalkan.",
  "The analysis could not be completed in this browser.":
    "Analisis tidak dapat diselesaikan di *browser* ini.",
  "The DR-VERGE service returned a response we could not read.":
    "Layanan DR-VERGE mengembalikan respons yang tidak dapat dibaca.",
  "The DR-VERGE service returned a result without a valid grade.":
    "Layanan DR-VERGE mengembalikan hasil tanpa *grade* yang valid.",
  "The DR-VERGE inference endpoint has not been configured for this deployment.":
    "*Endpoint* inferensi DR-VERGE belum dikonfigurasi untuk *deployment* ini.",
  "We couldn't reach the DR-VERGE inference service. Please check your connection and try again in a moment.":
    "Layanan inferensi DR-VERGE tidak dapat dihubungi. Periksa koneksi Anda, lalu coba lagi sesaat kemudian.",
  "The bundled model metadata is incomplete, so the demo cannot run safely.":
    "Metadata model yang disertakan tidak lengkap, sehingga demo tidak dapat dijalankan dengan aman.",
  "The DR-VERGE model could not be downloaded. Please check your connection and reload.":
    "Model DR-VERGE tidak dapat diunduh. Periksa koneksi Anda, lalu muat ulang halaman.",
  "A DR-VERGE model file is missing from this deployment, so the demo cannot run.":
    "Salah satu berkas model DR-VERGE tidak ditemukan pada *deployment* ini, sehingga demo tidak dapat dijalankan.",
  "The bundled model metadata could not be read, so the demo cannot run safely.":
    "Metadata model yang disertakan tidak dapat dibaca, sehingga demo tidak dapat dijalankan dengan aman.",
  "The DR-VERGE model could not be initialised in this browser.":
    "Model DR-VERGE tidak dapat diinisialisasi di *browser* ini.",
  "The bundled model does not expose the expected dual-view inputs.":
    "Model yang disertakan tidak menyediakan masukan *dual-view* yang diharapkan.",
  "This browser does not support the canvas APIs the demo needs.":
    "*Browser* ini tidak mendukung API *canvas* yang dibutuhkan demo.",
  "The model returned no output.": "Model tidak menghasilkan keluaran.",
};

const GENERIC_ID: Record<InferenceErrorKind, string> = {
  network: "Layanan inferensi tidak dapat dihubungi. Periksa koneksi Anda, lalu coba lagi.",
  timeout: "Layanan tidak merespons dalam batas waktu yang ditentukan. Silakan coba lagi.",
  server: "Layanan tidak dapat menyelesaikan permintaan ini. Silakan coba lagi sesaat kemudian.",
  malformed: "Layanan mengembalikan respons yang tidak dapat dibaca.",
  "not-configured": "*Endpoint* inferensi belum dikonfigurasi untuk *deployment* ini.",
  unknown: "Terjadi kesalahan saat menjalankan analisis. Silakan coba lagi sesaat kemudian.",
};

export function ErrorState({
  error,
  onRetry,
  onReset,
}: {
  error: InferenceErrorState;
  onRetry: () => void;
  onReset: () => void;
}) {
  const { t, tr, isId } = useI18n();
  const Icon = errorIcons[error.kind] ?? CircleAlert;
  const canRetry = error.kind !== "not-configured";
  const message = isId ? (MESSAGES_ID[error.message] ?? GENERIC_ID[error.kind]) : error.message;

  return (
    <div
      className="rounded-2xl border-2 border-dashed border-foreground/40 bg-card p-8 sm:p-12 colorful:border-coral-line colorful:bg-coral-soft/60"
      role="alert"
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border colorful:border-transparent colorful:bg-coral-solid">
          <Icon className="h-5 w-5 text-foreground colorful:text-white" aria-hidden="true" />
        </div>

        <h3 className="mt-7 text-lg font-bold tracking-tight">{tr(errorTitles[error.kind])}</h3>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          {t(message, message)}
        </p>

        {/* A short technical hint, never a stack trace. */}
        {error.detail && (
          <p className="mono mt-4 rounded-md border border-border bg-surface px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-subtle">
            {error.detail}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {canRetry && (
            <Button onClick={onRetry}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t("Try Again", "Coba Lagi")}
            </Button>
          )}
          <Button variant="outline" onClick={onReset}>
            {t("Start Over", "Mulai Ulang")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Demo mode banner                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Shown whenever the demo is running on simulated output.
 *
 * Deliberately unmissable and deliberately not dismissible. A visitor must never
 * be able to reach a result screen without having been told that no model ran.
 */
export function DemoModeBanner({ compact = false }: { compact?: boolean }) {
  const { t, pick } = useI18n();
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border-2 border-dashed border-foreground bg-surface colorful:border-amber-solid/70 colorful:bg-amber-soft",
        compact ? "p-3.5" : "p-4 sm:p-5",
      )}
      role="status"
    >
      <FlaskConical
        className="mt-0.5 h-4 w-4 shrink-0 text-foreground colorful:text-amber"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground colorful:text-amber">
          {t("Demo Mode · Simulated Output", "Mode Demo · Keluaran Simulasi")}
        </div>
        <p
          className={cn(
            "mt-1.5 leading-relaxed text-muted-foreground",
            compact ? "text-[12px]" : "text-[13px]",
          )}
        >
          {pick(
            <>
              The DR-VERGE model is <strong className="text-foreground">not deployed yet</strong>.
              Numbers shown here are generated locally to demonstrate the interface. They are{" "}
              <strong className="text-foreground">not model predictions</strong> and carry no
              meaning about any uploaded image.
            </>,
            <>
              Model DR-VERGE <strong className="text-foreground">belum di-<i>deploy</i></strong>.
              Angka yang ditampilkan di sini dibuat secara lokal untuk memperagakan antarmuka.
              Angka tersebut <strong className="text-foreground">bukan prediksi model</strong> dan
              tidak bermakna apa pun terhadap citra yang diunggah.
            </>,
          )}
        </p>
      </div>
    </div>
  );
}
