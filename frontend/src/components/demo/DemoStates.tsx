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

/* -------------------------------------------------------------------------- */
/* Processing                                                                  */
/* -------------------------------------------------------------------------- */

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

  return (
    <div
      className="rounded-xl border border-border bg-card p-8 sm:p-12"
      role="status"
      aria-live="polite"
      aria-label="Running analysis"
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Indeterminate ring — no percentage, because none is measured. */}
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border border-border" />
          <span className="absolute inset-0 animate-spin rounded-full border-t-2 border-foreground" />
          <span className="absolute inset-3 rounded-full bg-foreground/5 animate-pulse-sweep" />
        </div>

        <h3 className="mt-8 text-lg font-bold tracking-tight">Analyzing dual-view pair</h3>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          This usually takes a few seconds.
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
                    active && "bg-muted",
                  )}
                  initial={reduce ? false : { opacity: 0.4 }}
                  animate={{ opacity: done || active ? 1 : 0.4 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {done ? (
                      <Check className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                    ) : active ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin text-foreground"
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
                    {stage}
                  </span>
                </motion.div>
              </li>
            );
          })}
        </ol>

        <Button variant="ghost" size="sm" onClick={onCancel} className="mt-8">
          Cancel
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

const errorTitles: Record<InferenceErrorKind, string> = {
  network: "Couldn't reach the service",
  timeout: "The request timed out",
  server: "The service couldn't complete this request",
  malformed: "Unexpected response",
  "not-configured": "Inference endpoint not configured",
  unknown: "Something went wrong",
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
  const Icon = errorIcons[error.kind] ?? CircleAlert;
  const canRetry = error.kind !== "not-configured";

  return (
    <div
      className="rounded-xl border-2 border-dashed border-foreground/40 bg-card p-8 sm:p-12"
      role="alert"
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border">
          <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
        </div>

        <h3 className="mt-7 text-lg font-bold tracking-tight">
          {errorTitles[error.kind]}
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          {error.message}
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
              Try Again
            </Button>
          )}
          <Button variant="outline" onClick={onReset}>
            Start Over
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
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border-2 border-dashed border-foreground bg-surface",
        compact ? "p-3.5" : "p-4 sm:p-5",
      )}
      role="status"
    >
      <FlaskConical
        className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="mono text-[10px] uppercase tracking-[0.16em] text-foreground">
          Demo Mode · Simulated Output
        </div>
        <p
          className={cn(
            "mt-1.5 leading-relaxed text-muted-foreground",
            compact ? "text-[12px]" : "text-[13px]",
          )}
        >
          The DR-VERGE model is <strong className="text-foreground">not deployed yet</strong>.
          Numbers shown here are generated locally to demonstrate the interface. They are{" "}
          <strong className="text-foreground">not model predictions</strong> and carry no
          meaning about any uploaded image.
        </p>
      </div>
    </div>
  );
}
