import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { l, useI18n } from "@/i18n/context";

export type DemoStep = 0 | 1 | 2;

const steps = [
  { title: l("Choose an eye", "Pilih mata"), hint: l("Sample or your own pair", "Sampel atau pasangan citra sendiri") },
  { title: l("Run the analysis", "Jalankan analisis"), hint: l("On-device, a few seconds", "Di perangkat, beberapa detik") },
  { title: l("Read the result", "Baca hasilnya"), hint: l("Grade, scores, context", "*Grade*, skor, dan konteks") },
] as const;

/**
 * The demo's three-step progress indicator.
 *
 * It mirrors the real state of the page (not a wizard the visitor must click
 * through), so at any moment it answers "what do I do next?".
 */
export function DemoStepper({ current, done }: { current: DemoStep; done: boolean[] }) {
  const reduce = useReducedMotion();
  const { ts, tr } = useI18n();

  return (
    <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label={ts("Demo progress", "Progres demo")}>
      {steps.map((s, i) => {
        const isDone = done[i];
        const isCurrent = current === i && !isDone;
        return (
          <li
            key={s.title.en}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-3 transition-colors duration-500 sm:p-4",
              isCurrent
                ? "border-foreground bg-card shadow-lg colorful:border-brand colorful:shadow-[0_14px_30px_-16px_hsl(var(--brand-to)/0.55)]"
                : isDone
                  ? "border-border bg-card colorful:border-brand-line colorful:bg-brand-soft/60"
                  : "border-dashed border-border bg-transparent",
            )}
          >
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span
                className={cn(
                  "mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-500",
                  isDone || isCurrent
                    ? "brand-fill"
                    : "border border-border text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <div className="min-w-0">
                <div
                  className={cn(
                    "text-[12px] font-semibold leading-tight sm:truncate sm:text-sm",
                    isDone || isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {tr(s.title)}
                </div>
                <div className="hidden truncate text-[11px] text-muted-foreground sm:block">
                  {tr(s.hint)}
                </div>
              </div>
            </div>
            {isCurrent && !reduce && (
              <motion.span
                layoutId="demo-step-glow"
                className="brand-fill absolute inset-x-0 bottom-0 h-[2px] colorful:h-[3px]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
