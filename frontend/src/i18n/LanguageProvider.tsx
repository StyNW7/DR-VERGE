import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANG,
  LANG_STORAGE_KEY,
  LanguageContext,
  type Lang,
} from "./context";

function readStoredLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_STORAGE_KEY);
    if (v === "en" || v === "id") return v;
  } catch {
    /* storage unavailable — fall back to the default */
  }
  return DEFAULT_LANG;
}

/**
 * Holds the active language, persists it, and keeps `<html lang>` correct so
 * screen readers pronounce the page in the right language.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* not persisted, still applied */
    }
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "id" : "en");
  }, [lang, setLang]);

  const value = useMemo(() => ({ lang, setLang, toggleLang }), [lang, setLang, toggleLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
