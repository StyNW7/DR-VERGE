import { useCallback, useEffect, useRef, useState } from "react";
import {
  InferenceError,
  runDRVergeInference,
  type InferenceErrorKind,
  type InferenceResult,
} from "@/services/inferenceApi";

/**
 * The demo page's inference state machine.
 *
 * Every interaction resolves to exactly one of these states, so the UI never has
 * an ambiguous blank moment:
 *
 *   idle        nothing uploaded yet
 *   ready       both images valid, waiting for the user
 *   processing  request in flight
 *   success     a result is available
 *   error       a failure with a human-readable message
 */
export type InferenceStatus = "idle" | "ready" | "processing" | "success" | "error";

export interface InferenceErrorState {
  kind: InferenceErrorKind;
  message: string;
  detail?: string;
}

/** Visual stages for the processing animation. Cosmetic only — these do NOT
 *  correspond to observed model internals and no intermediate output is shown. */
export const PROCESSING_STAGES = [
  "Preparing images",
  "Extracting dual-view features",
  "Fusing evidence",
  "Computing ordinal thresholds",
  "Generating DR grade",
] as const;

const STAGE_INTERVAL_MS = 520;

export function useInference() {
  const [status, setStatus] = useState<InferenceStatus>("idle");
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [error, setError] = useState<InferenceErrorState | null>(null);
  const [stageIndex, setStageIndex] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const stageTimerRef = useRef<number | null>(null);
  // Guards against setting state after unmount, and against a stale request
  // resolving over the top of a newer one.
  const mountedRef = useRef(true);
  const runIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      if (stageTimerRef.current !== null) window.clearInterval(stageTimerRef.current);
    };
  }, []);

  const stopStageTimer = useCallback(() => {
    if (stageTimerRef.current !== null) {
      window.clearInterval(stageTimerRef.current);
      stageTimerRef.current = null;
    }
  }, []);

  const analyze = useCallback(
    async (maculaFile: File, opticDiscFile: File) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const runId = runIdRef.current + 1;
      runIdRef.current = runId;

      setStatus("processing");
      setError(null);
      setResult(null);
      setStageIndex(0);

      // Advance through the stage labels, stopping at the last one rather than
      // looping — a loop would suggest progress that is not being measured.
      stopStageTimer();
      stageTimerRef.current = window.setInterval(() => {
        setStageIndex((i) => Math.min(i + 1, PROCESSING_STAGES.length - 1));
      }, STAGE_INTERVAL_MS);

      try {
        const res = await runDRVergeInference(
          { maculaFile, opticDiscFile },
          { signal: controller.signal },
        );
        if (!mountedRef.current || runIdRef.current !== runId) return;
        stopStageTimer();
        setResult(res);
        setStatus("success");
      } catch (err) {
        if (!mountedRef.current || runIdRef.current !== runId) return;
        stopStageTimer();
        if (err instanceof InferenceError) {
          setError({ kind: err.kind, message: err.message, detail: err.detail });
        } else {
          setError({
            kind: "unknown",
            message:
              "Something went wrong while running the analysis. Please try again in a moment.",
          });
        }
        setStatus("error");
      }
    },
    [stopStageTimer],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    stopStageTimer();
    setStatus("idle");
    setStageIndex(0);
  }, [stopStageTimer]);

  /** Clears the result but leaves uploads alone (caller decides about those). */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    stopStageTimer();
    runIdRef.current += 1;
    setStatus("idle");
    setResult(null);
    setError(null);
    setStageIndex(0);
  }, [stopStageTimer]);

  /** Called by the page when upload readiness changes, while no run is active. */
  const setReadiness = useCallback((isReady: boolean) => {
    setStatus((prev) => {
      if (prev === "processing" || prev === "success" || prev === "error") return prev;
      return isReady ? "ready" : "idle";
    });
  }, []);

  return {
    status,
    result,
    error,
    stageIndex,
    stages: PROCESSING_STAGES,
    analyze,
    cancel,
    reset,
    setReadiness,
    isProcessing: status === "processing",
  };
}
