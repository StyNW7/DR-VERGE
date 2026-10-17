import {
  Check,
  Loader2,
  Sparkles,
  EyeOff,
  BadgeCheck,
  CircleSlash,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gradeTone } from "@/lib/gradeTone";
import type { SampleEntry, SampleManifest } from "@/data/samples";
import { getGrade, gradeText } from "@/data/drGrades";
import { Skeleton } from "@/components/common/Primitives";
import { useI18n } from "@/i18n/context";
import { ExternalButton } from "@/components/common/Button";
import { siteConfig, isLinkConfigured } from "@/config/siteConfig";

/**
 * One-click sample eyes.
 *
 * The picker is deliberately blind: tiles show the eye id and side only. The
 * reference grade is revealed after the model has run (see ReferenceCheck), so
 * a visitor cannot anchor on the answer first.
 */
export function SamplePicker({
  manifest,
  loading,
  activeId,
  pendingId,
  disabled,
  onPick,
}: {
  manifest: SampleManifest | null;
  loading: boolean;
  activeId: string | null;
  pendingId: string | null;
  disabled?: boolean;
  onPick: (sample: SampleEntry) => void;
}) {
  const { t, ts } = useI18n();
  if (!loading && !manifest) return null;

  return (
    <div className="card-premium overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3.5">
          <span className="brand-fill flex h-10 w-10 shrink-0 items-center justify-center rounded-xl colorful:shadow-[0_8px_18px_-8px_hsl(var(--brand-to)/0.7)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              {t("Fastest way: load a sample eye", "Cara tercepat: muat sampel mata")}
            </h3>
            <p className="mt-1 text-14 leading-relaxed text-muted-foreground">
              {t(
                "One click fills both slots with a real macula + optic-disc pair from the public DeepDRiD dataset.",
                "Satu klik langsung mengisi kedua slot dengan pasangan citra makula + diskus optik asli dari dataset publik DeepDRiD.",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
          <span className="mono inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-11 uppercase tracking-[0.12em] text-muted-foreground colorful:border-amber-line colorful:bg-amber-soft colorful:font-semibold colorful:text-amber">
            <EyeOff className="h-3 w-3" aria-hidden="true" />
            {t("Grade hidden until analysed", "*Grade* disembunyikan hingga dianalisis")}
          </span>
          {/* The full sample set, for downloading or testing outside the demo. */}
          <ExternalButton
            href={siteConfig.sampleDatasetUrl}
            enabled={isLinkConfigured(siteConfig.sampleDatasetUrl)}
            variant="outline"
            size="sm"
            ariaLabel={ts(
              "Open the sample images folder on Google Drive (new tab)",
              "Buka folder citra sampel di Google Drive (tab baru)",
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {t("Open in Google Drive", "Buka di Google Drive")}
            <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
          </ExternalButton>
        </div>
      </div>

      <div className="flex snap-x gap-3 overflow-x-auto scroll-px-5 p-5 sm:scroll-px-6 sm:p-6">
        {loading || !manifest
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-32 shrink-0 rounded-xl" />
            ))
          : manifest.samples.map((s) => {
              const active = s.sample_id === activeId;
              const pending = s.sample_id === pendingId;
              const side = s.eye === "left" ? ts("Left", "Kiri") : ts("Right", "Kanan");
              return (
                <button
                  key={s.sample_id}
                  type="button"
                  onClick={() => onPick(s)}
                  disabled={disabled || pending}
                  aria-pressed={active}
                  aria-label={ts(
                    `Load sample eye ${s.sample_id}, ${s.eye} eye`,
                    `Muat sampel mata ${s.sample_id}, mata ${side.toLowerCase()}`,
                  )}
                  className={cn(
                    "group relative w-32 shrink-0 snap-start overflow-hidden rounded-xl border bg-card text-left transition-all duration-300 ease-editorial",
                    "disabled:cursor-not-allowed",
                    active
                      ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background colorful:border-brand colorful:ring-brand"
                      : "border-border hover:-translate-y-0.5 hover:border-foreground/40 colorful:hover:border-brand-line colorful:hover:shadow-[0_12px_24px_-14px_hsl(var(--brand-to)/0.6)]",
                  )}
                >
                  <div className="relative aspect-square overflow-hidden bg-black">
                    <img
                      src={s.macula}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "h-full w-full object-cover transition-all duration-500 ease-editorial",
                        active
                          ? "grayscale-0"
                          : "grayscale group-hover:scale-105 group-hover:grayscale-0 colorful:grayscale-0",
                      )}
                    />
                    {(active || pending) && (
                      // Always white on the black photo frame, in both themes.
                      <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow">
                        {pending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-2.5 py-2">
                    <span className={cn("mono whitespace-nowrap text-12 font-semibold", active && "colorful:text-brand")}>
                      {s.sample_id}
                    </span>
                    <span className="mono whitespace-nowrap text-10 uppercase tracking-[0.12em] text-subtle">
                      {side}
                    </span>
                  </div>
                </button>
              );
            })}
      </div>
    </div>
  );
}

/**
 * Shown under a real result when the analysed pair was a sample: the reference
 * grade, whether the model agreed, and — every time — why agreement here says
 * nothing about accuracy.
 */
export function ReferenceCheck({
  sample,
  predictedGrade,
  manifest,
}: {
  sample: SampleEntry;
  predictedGrade: number;
  manifest: SampleManifest | null;
}) {
  const { t, lang, num, pick } = useI18n();
  const ref = getGrade(sample.ground_truth_grade);
  const match = sample.ground_truth_grade === predictedGrade;
  const diff = Math.abs(sample.ground_truth_grade - predictedGrade);
  const measured = manifest?.measured_reference;

  return (
    <section className="print-block card-premium overflow-hidden">
      <div className="grid gap-px bg-border md:grid-cols-3">
        <div className="flex flex-col justify-between gap-6 bg-card p-6 sm:p-8">
          <span className="eyebrow">
            {t("Reference grade", "*Grade* referensi")} · {sample.sample_id}
          </span>
          <div>
            <div className="display flex items-baseline text-5xl">
              <span className="colorful:text-brand-gradient">{ref?.grade ?? sample.ground_truth_grade}</span>
              <span className="ml-2 text-xl font-semibold tracking-normal text-subtle">/ 4</span>
            </div>
            <div className="mt-2 text-sm font-semibold">
              {ref ? gradeText(ref, lang).name : sample.ground_truth_name}
            </div>
            <div className="mono mt-1 text-11 uppercase tracking-[0.12em] text-subtle">
              {t("DeepDRiD annotation", "Anotasi DeepDRiD")}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 bg-card p-6 sm:p-8">
          <span className="eyebrow">{t("Model vs reference", "Model vs referensi")}</span>

          {/* Both grades on the same 0–4 scale, so the distance between them
              is seen rather than read. */}
          <div className="flex flex-col gap-2.5" aria-hidden="true">
            {[
              { label: t("Model", "Model"), value: predictedGrade },
              { label: t("Reference", "Referensi"), value: sample.ground_truth_grade },
            ].map((row, r) => (
              <div key={r} className="grid grid-cols-[4.75rem_1fr] items-center gap-3">
                <span className="text-12 font-medium text-muted-foreground">{row.label}</span>
                <span className="grid grid-cols-5 gap-1">
                  {[0, 1, 2, 3, 4].map((g) => (
                    <span
                      key={g}
                      className={cn(
                        "mono flex h-6 items-center justify-center rounded-md text-11 font-semibold transition-colors",
                        g === row.value
                          ? cn("bg-foreground text-background", gradeTone(g).fill)
                          : "bg-muted text-subtle",
                      )}
                    >
                      {g}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                match
                  ? "brand-fill"
                  : "border-2 border-dashed border-foreground colorful:border-amber-solid colorful:bg-amber-soft colorful:text-amber",
              )}
            >
              {match ? (
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              ) : (
                <CircleSlash className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <div>
              <div className="text-lg font-bold tracking-tight">
                {match
                  ? t("Grades agree", "*Grade* sesuai")
                  : t(
                      `Off by ${diff} grade${diff === 1 ? "" : "s"}`,
                      `Selisih ${diff} *grade*`,
                    )}
              </div>
              <div className="text-12 text-muted-foreground">
                {t("Predicted", "Prediksi")} {predictedGrade} · {t("reference", "referensi")}{" "}
                {sample.ground_truth_grade}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-surface p-6 sm:p-8 colorful:bg-amber-soft">
          <span className="mono text-11 uppercase tracking-[0.16em] text-foreground colorful:font-semibold colorful:text-amber">
            {t("Read this before celebrating", "Baca ini sebelum menyimpulkan")}
          </span>
          <p className="text-13 leading-relaxed text-muted-foreground">
            {pick(
              <>
                These samples were curated <em>because</em> this model grades them correctly
                and robustly, so agreement here is not evidence of accuracy.
              </>,
              <>
                Sampel-sampel ini dikurasi <em>justru karena</em> model ini menilainya dengan
                benar dan stabil, sehingga kesesuaian di sini bukan bukti akurasi.
              </>,
            )}
            {measured && (
              <>
                {" "}
                {pick(
                  `On all ${measured.eyes} unfiltered DeepDRiD Set-C eyes, the same model scores QWK ${num(measured.QWK, 4)} with ${num(measured.exact_accuracy * 100, 1)}% exact agreement.`,
                  `Pada seluruh ${measured.eyes} mata DeepDRiD Set-C tanpa penyaringan, model yang sama memperoleh QWK ${num(measured.QWK, 4)} dengan kesesuaian tepat ${num(measured.exact_accuracy * 100, 1)}%.`,
                )}
              </>
            )}
          </p>
          {manifest?.source.url && (
            <a
              href={manifest.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="no-print mt-auto inline-flex items-center gap-1.5 text-12 font-medium text-foreground underline-offset-4 hover:underline"
            >
              {manifest.source.dataset} · {manifest.source.license}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
