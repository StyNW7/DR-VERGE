import { Check, Loader2, Sparkles, EyeOff, BadgeCheck, CircleSlash, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SampleEntry, SampleManifest } from "@/data/samples";
import { getGrade } from "@/data/drGrades";
import { Skeleton } from "@/components/common/Primitives";

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
  if (!loading && !manifest) return null;

  return (
    <div className="card-premium overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              Fastest way: load a sample eye
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              One click fills both slots with a real macula + optic-disc pair from the
              public DeepDRiD dataset.
            </p>
          </div>
        </div>
        <span className="mono inline-flex items-center gap-1.5 self-start rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:self-center">
          <EyeOff className="h-3 w-3" aria-hidden="true" />
          Grade hidden until analysed
        </span>
      </div>

      <div className="flex snap-x gap-3 overflow-x-auto scroll-px-5 p-5 sm:scroll-px-6 sm:p-6">
        {loading || !manifest
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-32 shrink-0 rounded-xl" />
            ))
          : manifest.samples.map((s) => {
              const active = s.sample_id === activeId;
              const pending = s.sample_id === pendingId;
              return (
                <button
                  key={s.sample_id}
                  type="button"
                  onClick={() => onPick(s)}
                  disabled={disabled || pending}
                  aria-pressed={active}
                  aria-label={`Load sample eye ${s.sample_id}, ${s.eye} eye`}
                  className={cn(
                    "group relative w-32 shrink-0 snap-start overflow-hidden rounded-xl border bg-card text-left transition-all duration-300 ease-editorial",
                    "disabled:cursor-not-allowed",
                    active
                      ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "border-border hover:-translate-y-0.5 hover:border-foreground/40",
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
                        active ? "grayscale-0" : "grayscale group-hover:scale-105 group-hover:grayscale-0",
                      )}
                    />
                    {(active || pending) && (
                      <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background shadow">
                        {pending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                    <span className="mono text-[11px] font-semibold">{s.sample_id}</span>
                    <span className="mono text-[9px] uppercase tracking-[0.12em] text-subtle">
                      {s.eye === "left" ? "Left" : "Right"}
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
  const ref = getGrade(sample.ground_truth_grade);
  const match = sample.ground_truth_grade === predictedGrade;
  const diff = Math.abs(sample.ground_truth_grade - predictedGrade);
  const measured = manifest?.measured_reference;

  return (
    <section className="print-block card-premium overflow-hidden">
      <div className="grid gap-px bg-border md:grid-cols-3">
        <div className="flex flex-col justify-between gap-6 bg-card p-6 sm:p-8">
          <span className="eyebrow">Reference grade · {sample.sample_id}</span>
          <div>
            <div className="display text-5xl">{ref?.display ?? sample.ground_truth_grade}</div>
            <div className="mt-2 text-sm font-semibold">{sample.ground_truth_name}</div>
            <div className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-subtle">
              DeepDRiD annotation
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 bg-card p-6 sm:p-8">
          <span className="eyebrow">Model vs reference</span>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full",
                match ? "bg-foreground text-background" : "border-2 border-dashed border-foreground",
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
                {match ? "Grades agree" : `Off by ${diff} grade${diff === 1 ? "" : "s"}`}
              </div>
              <div className="text-[12px] text-muted-foreground">
                Predicted {predictedGrade} · reference {sample.ground_truth_grade}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-surface p-6 sm:p-8">
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground">
            Read this before celebrating
          </span>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            These samples were curated <em>because</em> this model grades them correctly
            and robustly, so agreement here is not evidence of accuracy.
            {measured && (
              <>
                {" "}On all {measured.eyes} unfiltered DeepDRiD Set-C eyes, the same
                model scores QWK {measured.QWK.toFixed(4)} with{" "}
                {(measured.exact_accuracy * 100).toFixed(1)}% exact agreement.
              </>
            )}
          </p>
          {manifest?.source.url && (
            <a
              href={manifest.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="no-print mt-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground underline-offset-4 hover:underline"
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
