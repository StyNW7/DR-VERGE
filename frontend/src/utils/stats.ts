import { formatScore } from "./formatting";

type Lang = "en" | "id";

/** Signed value with an explicit sign, e.g. "+0.0077" / "−0,0143". */
export function signed(v: number, lang: Lang, digits = 4): string {
  return `${v < 0 ? "−" : "+"}${formatScore(Math.abs(v), digits, lang)}`;
}

/** "95% CI [a, b]" / "IK 95% [a; b]" — Indonesian uses ";" because "," is the decimal mark. */
export function ciText(low: number, high: number, lang: Lang): string {
  return lang === "id"
    ? `IK 95% [${signed(low, lang)}; ${signed(high, lang)}]`
    : `95% CI [${signed(low, lang)}, ${signed(high, lang)}]`;
}
