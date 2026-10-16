import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";

/**
 * Bilingual support (English / Bahasa Indonesia).
 *
 * Every piece of copy on the site exists in both languages, written side by
 * side — either inline as `t("English", "Indonesia")` in a component, or as an
 * `l("English", "Indonesia")` pair in `src/data/`. Keeping the two versions next
 * to each other is what keeps their meaning identical when either one is edited.
 *
 * English technical terms that stay in English inside Indonesian text (teacher,
 * student, deployment, …) are wrapped in `*asterisks*` and rendered in italics,
 * following the convention of the paper.
 */

export type Lang = "en" | "id";

export const LANG_STORAGE_KEY = "dr-verge-lang";
export const DEFAULT_LANG: Lang = "id";

/** A bilingual value. */
export interface L<T = string> {
  readonly en: T;
  readonly id: T;
}

/** Declares a bilingual value in a data file. */
export function l<T>(en: T, id: T): L<T> {
  return { en, id };
}

export interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

export const LanguageContext = createContext<LangState>({
  lang: DEFAULT_LANG,
  setLang: () => undefined,
  toggleLang: () => undefined,
});

export function useLang(): LangState {
  return useContext(LanguageContext);
}

const ITALIC = /\*([^*]+)\*/g;

/**
 * Renders `*term*` markers as italic foreign-language terms.
 *
 * The result is wrapped in one inline <span>: inside a flex container (a badge,
 * an icon + label row) loose text runs and <i> elements would otherwise become
 * separate flex items with gaps between the words.
 */
export function rich(text: string): ReactNode {
  if (!text.includes("*")) return text;
  const parts = text.split(ITALIC);
  return createElement(
    "span",
    null,
    ...parts.map((part, i) =>
      i % 2 === 1 ? createElement("i", { key: i, className: "italic" }, part) : part,
    ),
  );
}

/** Strips the markers, for attributes that only accept plain text. */
export function plain(text: string): string {
  return text.replace(ITALIC, "$1");
}

/**
 * Numeric strings follow the reader's language: "0.7364" / "10,000" in English,
 * "0,7364" / "10.000" in Indonesian (decimal comma, dot for thousands), as in
 * the paper.
 */
export function localizeNumeric(text: string, lang: Lang): string {
  if (lang === "en") return text;
  // Swap "," and "." between digits in two passes, via an invisible placeholder.
  return text
    .replace(/(\d),(\d{3})/g, "$1⁣$2")
    .replace(/(\d)\.(\d)/g, "$1,$2")
    .split("⁣")
    .join(".");
}

export function formatNum(n: number, digits: number, lang: Lang): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(lang === "id" ? "id-ID" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * The translation toolkit for components.
 *
 *   t(en, id)   -> ReactNode (italic markers rendered)
 *   ts(en, id)  -> string    (for aria-label, alt, title, meta tags)
 *   tr(pair)    -> ReactNode from an `l(...)` data pair
 *   trs(pair)   -> string    from an `l(...)` data pair
 *   pick(en,id) -> either value as-is (for JSX fragments or any other type)
 *   num(n, d)   -> locale-formatted number
 *   n(str)      -> locale-formatted numeric string ("11.35 ms" -> "11,35 ms")
 */
export function useI18n() {
  const { lang } = useLang();
  return useMemo(() => {
    const isId = lang === "id";
    return {
      lang,
      isId,
      t: (en: string, id: string): ReactNode => rich(isId ? id : en),
      ts: (en: string, id: string): string => plain(isId ? id : en),
      tr: (v: L<string>): ReactNode => rich(v[lang]),
      trs: (v: L<string>): string => plain(v[lang]),
      pick: <T,>(en: T, id: T): T => (isId ? id : en),
      num: (value: number, digits = 0): string => formatNum(value, digits, lang),
      n: (text: string): string => localizeNumeric(text, lang),
    };
  }, [lang]);
}
