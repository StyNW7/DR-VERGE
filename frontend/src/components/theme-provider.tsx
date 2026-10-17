import { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

type Theme = "dark" | "light" | "system";

/**
 * The site has two independent appearance axes:
 *
 *   theme   — light / dark (or follow the system)
 *   palette — "mono" (the original black-and-white identity) or "color"
 *             (blue-led, with coral and amber accents)
 *
 *   a11y    — the accessibility mode: larger type, higher contrast, plain
 *             typefaces and calmer motion, for readers with low or ageing
 *             vision (see "ACCESSIBILITY MODE" in index.css)
 *
 * All three are classes on <html> (`dark`, `colorful`, `a11y`), so every
 * combination is plain CSS and a component never needs to know which one is
 * active.
 */
export type Palette = "mono" | "color";

export const PALETTE_STORAGE_KEY = "dr-verge-palette";
export const DEFAULT_PALETTE: Palette = "color";
export const A11Y_STORAGE_KEY = "dr-verge-a11y";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
  a11y: boolean;
  setA11y: (on: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  palette: DEFAULT_PALETTE,
  setPalette: () => null,
  a11y: false,
  setA11y: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function resolve(theme: Theme): "dark" | "light" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Keeps the browser's own chrome (mobile address bar) on the page colour. */
function syncThemeColor() {
  const bg = getComputedStyle(document.body).backgroundColor;
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute("content", bg));
}

/** Writes the theme class straight onto <html>. Kept synchronous so a view
 *  transition can capture the "after" state inside its update callback. */
function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  const resolved = resolve(theme);
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  syncThemeColor();
}

function applyPalette(palette: Palette) {
  document.documentElement.classList.toggle("colorful", palette === "color");
  syncThemeColor();
}

function applyA11y(on: boolean) {
  document.documentElement.classList.toggle("a11y", on);
}

function readA11y(): boolean {
  try {
    return localStorage.getItem(A11Y_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function readPalette(): Palette {
  try {
    const v = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (v === "mono" || v === "color") return v;
  } catch {
    /* storage unavailable — fall back to the default */
  }
  return DEFAULT_PALETTE;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });
  const [palette, setPaletteState] = useState<Palette>(readPalette);
  const [a11y, setA11yState] = useState<boolean>(readA11y);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyPalette(palette);
  }, [palette]);

  useEffect(() => {
    applyA11y(a11y);
  }, [a11y]);

  const value = {
    theme,
    setTheme: (next: Theme) => {
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        /* not persisted, still applied */
      }
      applyTheme(next);
      setThemeState(next);
    },
    palette,
    setPalette: (next: Palette) => {
      try {
        localStorage.setItem(PALETTE_STORAGE_KEY, next);
      } catch {
        /* not persisted, still applied */
      }
      applyPalette(next);
      setPaletteState(next);
    },
    a11y,
    setA11y: (on: boolean) => {
      try {
        localStorage.setItem(A11Y_STORAGE_KEY, on ? "on" : "off");
      } catch {
        /* not persisted, still applied */
      }
      applyA11y(on);
      setA11yState(on);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {/* The accessibility mode also calms motion: transforms are skipped and
          only opacity fades remain. */}
      <MotionConfig reducedMotion={a11y ? "always" : "user"}>{children}</MotionConfig>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

/** True when the colourful palette is active. */
export const useIsColorful = () => useTheme().palette === "color";

/** The accessibility (large, high-contrast text) mode and its setter. */
export const useA11y = () => {
  const { a11y, setA11y } = useTheme();
  return { a11y, setA11y };
};
