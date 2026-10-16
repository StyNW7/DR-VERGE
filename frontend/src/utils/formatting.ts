/** Small display helpers. No business logic here.
 *
 *  Every helper takes an optional language. Indonesian output uses the decimal
 *  comma and the dot as thousands separator, matching the paper. */

type Lang = "en" | "id";

const locale = (lang: Lang) => (lang === "id" ? "id-ID" : "en-US");

/** Swaps the decimal point for a comma in Indonesian. */
function dec(text: string, lang: Lang): string {
  return lang === "id" ? text.replace(/(\d)\.(\d)/g, "$1,$2") : text;
}

export function formatNumber(n: number, digits = 0, lang: Lang = "en"): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(locale(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Fixed decimals, with an em dash for anything non-finite. */
export function formatScore(
  n: number | null | undefined,
  digits = 4,
  lang: Lang = "en",
): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return dec(n.toFixed(digits), lang);
}

/** 0.91 -> "91.0%". For display of relative scores only, never called a probability. */
export function formatPercent(
  n: number | null | undefined,
  digits = 1,
  lang: Lang = "en",
): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `${dec((n * 100).toFixed(digits), lang)}%`;
}

export function formatMs(n: number | null | undefined, digits = 2, lang: Lang = "en"): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `${dec(n.toFixed(digits), lang)} ms`;
}

export function formatBytes(bytes: number, lang: Lang = "en"): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${dec(value.toFixed(value >= 10 ? 0 : 1), lang)} ${units[i]}`;
}

/** 40313932 -> "40.3M" ("40,3 jt" is avoided: M/K read the same in both). */
export function formatCompact(n: number, lang: Lang = "en"): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `${dec((n / 1_000_000).toFixed(1), lang)}M`;
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function formatTimestamp(d: Date = new Date(), lang: Lang = "en"): string {
  return d.toLocaleString(lang === "id" ? "id-ID" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Clamps to [0,1] so a malformed score can never overflow a progress bar. */
export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
