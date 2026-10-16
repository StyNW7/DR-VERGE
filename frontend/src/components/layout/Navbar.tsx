import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, FileText, ArrowUpRight, Moon, Sun, ArrowRight, Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, isLinkConfigured } from "@/config/siteConfig";
import { useTheme, type Palette } from "@/components/theme-provider";
import { LinkButton } from "@/components/common/Button";
import { ReadingProgress } from "@/components/common/SectionRail";
import { useI18n, useLang, type Lang } from "@/i18n/context";
import { transitionContent, transitionTheme } from "@/lib/viewTransition";

const navItems = [
  { label: { en: "Home", id: "Beranda" }, to: "/", hint: { en: "The research story", id: "Alur cerita penelitian" } },
  { label: { en: "Model Demo", id: "Demo Model" }, to: "/demo", hint: { en: "Grade a sample eye", id: "Uji model pada sampel mata" } },
  { label: { en: "Research", id: "Penelitian" }, to: "/research", hint: { en: "Method, results, limits", id: "Metode, hasil, dan keterbatasan" } },
];

/** The DR-VERGE mark: two overlapping view circles resolving into one engine. */
function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="16" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="16" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      {/* The lens-shaped intersection is the complementarity the method studies. */}
      <path
        d="M16 8.4a8.5 8.5 0 0 0 0 15.2 8.5 8.5 0 0 0 0-15.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function useIsDark() {
  const { theme } = useTheme();
  return (
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

/** Sun/moon toggle. The icon rotates out and in; the page itself is revealed
 *  as a circle growing from this button (see transitionTheme). */
function ThemeToggle() {
  const { setTheme } = useTheme();
  const isDark = useIsDark();
  const { ts } = useI18n();
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        transitionTheme(() => setTheme(isDark ? "light" : "dark"), {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        });
      }}
      aria-label={
        isDark
          ? ts("Switch to light theme", "Beralih ke tema terang")
          : ts("Switch to dark theme", "Beralih ke tema gelap")
      }
      title={isDark ? ts("Light theme", "Tema terang") : ts("Dark theme", "Tema gelap")}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground colorful:hover:border-brand-line colorful:hover:text-brand"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={reduce ? false : { rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={reduce ? undefined : { rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex"
        >
          {isDark ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/** The two swatches that stand for the palettes. */
function PaletteSwatch({ palette, className }: { palette: Palette; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/20",
        palette === "mono"
          ? "bg-[linear-gradient(135deg,#0a0a0a_0%,#0a0a0a_50%,#ffffff_50%,#ffffff_100%)]"
          : "bg-[conic-gradient(from_210deg,#0ea5e9,#2563eb,#1d4ed8,#e63946,#f59e0b,#38bdf8,#0ea5e9)]",
        className,
      )}
    />
  );
}

const paletteOptions: {
  value: Palette;
  label: { en: string; id: string };
  hint: { en: string; id: string };
}[] = [
  {
    value: "mono",
    label: { en: "Mono", id: "Mono" },
    hint: { en: "Black & white, editorial", id: "Hitam-putih, editorial" },
  },
  {
    value: "color",
    label: { en: "Colorful", id: "Colorful" },
    hint: { en: "Blue-led, high visibility", id: "Dominan biru, lebih jelas" },
  },
];

/** Origin of the circular reveal: the centre of the control that was pressed. */
function originOf(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Monochrome / colourful switch. Like the light/dark toggle, the new palette
 * is revealed as a circle growing from the button that was pressed.
 */
function PaletteToggle({ layoutId, className }: { layoutId: string; className?: string }) {
  const { palette, setPalette } = useTheme();
  const { ts, trs } = useI18n();

  return (
    <div
      role="radiogroup"
      aria-label={ts("Colour theme", "Tema warna")}
      className={cn(
        "relative h-9 shrink-0 items-center gap-0.5 rounded-full border border-border bg-card/60 p-1",
        className,
      )}
    >
      {paletteOptions.map((o) => {
        const active = o.value === palette;
        const label = trs(o.label);
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${ts("Colour theme", "Tema warna")}: ${label}`}
            title={`${label} · ${trs(o.hint)}`}
            onClick={(e) => {
              if (!active) transitionTheme(() => setPalette(o.value), originOf(e.currentTarget));
            }}
            className={cn(
              "relative flex h-7 items-center gap-1.5 rounded-full px-1.5 text-[11px] font-semibold transition-colors duration-200 xl:px-2.5",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-muted ring-1 ring-border colorful:bg-brand-soft colorful:ring-brand-line"
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
                aria-hidden="true"
              />
            )}
            <PaletteSwatch palette={o.value} className="relative h-4 w-4" />
            <span className="relative hidden xl:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Mobile sheet: both appearance controls, with room to say what they do. */
function AppearancePanel() {
  const { palette, setPalette, setTheme } = useTheme();
  const isDark = useIsDark();
  const { t, ts, trs } = useI18n();

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="eyebrow mb-3">{t("Appearance", "Tampilan")}</div>
      <div role="radiogroup" aria-label={ts("Colour theme", "Tema warna")} className="grid grid-cols-2 gap-2">
        {paletteOptions.map((o) => {
          const active = o.value === palette;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={(e) => {
                if (!active) transitionTheme(() => setPalette(o.value), originOf(e.currentTarget));
              }}
              className={cn(
                "relative flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-foreground bg-surface colorful:border-brand colorful:bg-brand-soft"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <PaletteSwatch palette={o.value} className="h-8 w-8" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{trs(o.label)}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">
                  {trs(o.hint)}
                </span>
              </span>
              {active && (
                <Check
                  className="absolute right-2 top-2 h-3.5 w-3.5 text-foreground colorful:text-brand"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
      <div
        role="radiogroup"
        aria-label={ts("Light or dark", "Terang atau gelap")}
        className="mt-2 grid grid-cols-2 gap-2"
      >
        {(["light", "dark"] as const).map((mode) => {
          const active = (mode === "dark") === isDark;
          const Icon = mode === "dark" ? Moon : Sun;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={(e) => {
                if (!active) transitionTheme(() => setTheme(mode), originOf(e.currentTarget));
              }}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-xl border text-[13px] font-medium transition-colors",
                active
                  ? "border-foreground bg-surface text-foreground colorful:border-brand colorful:bg-brand-soft colorful:text-brand"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {mode === "dark" ? t("Dark", "Gelap") : t("Light", "Terang")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** EN / ID segmented switch with a sliding indicator. */
function LanguageToggle({ layoutId, className }: { layoutId: string; className?: string }) {
  const { lang, setLang } = useLang();
  const { ts } = useI18n();
  const options: { value: Lang; label: string; full: string }[] = [
    { value: "id", label: "ID", full: "Bahasa Indonesia" },
    { value: "en", label: "EN", full: "English" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={ts("Language", "Bahasa")}
      className={cn(
        "relative flex h-9 items-center gap-0.5 rounded-full border border-border bg-card/60 p-1",
        className,
      )}
    >
      <Languages className="mx-1 hidden h-3.5 w-3.5 text-muted-foreground sm:block" aria-hidden="true" />
      {options.map((o) => {
        const active = o.value === lang;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.full}
            title={o.full}
            onClick={() => {
              if (!active) transitionContent(() => setLang(o.value));
            }}
            className={cn(
              "mono relative h-7 rounded-full px-2.5 text-[11px] font-semibold tracking-[0.08em] transition-colors duration-200",
              active ? "text-background colorful:text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="brand-fill absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
                aria-hidden="true"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t, ts, trs } = useI18n();

  // Compact the bar after a small scroll distance.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route change closes the mobile sheet.
  useEffect(() => setOpen(false), [location.pathname]);

  // While the sheet is open: lock body scroll and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Keyboard users land here first and can jump straight past the nav. */}
      <a
        href="#main"
        className="sr-only z-[60] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
      >
        {t("Skip to content", "Langsung ke konten")}
      </a>

      <ReadingProgress />

      <nav
        className={cn(
          "no-print fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-editorial",
          scrolled ? "px-3 pt-2.5 sm:px-6 sm:pt-3" : "px-0 pt-0",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-3 transition-all duration-500 ease-editorial",
            scrolled
              ? "glass h-14 max-w-[1120px] rounded-full border border-border pl-2 pr-2 shadow-[0_10px_40px_-16px_hsl(var(--shadow-color)/0.35)] sm:pl-3"
              : "h-16 max-w-[1440px] border border-transparent px-5 sm:h-20 sm:px-6 lg:px-8",
          )}
        >
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 rounded-full pr-2 transition-opacity hover:opacity-80"
            aria-label={ts(`${siteConfig.projectName} home`, `Beranda ${siteConfig.projectName}`)}
          >
            <span className="brand-fill flex h-9 w-9 items-center justify-center rounded-full colorful:shadow-[0_6px_16px_-6px_hsl(var(--brand-to)/0.7)]">
              <Logo className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight">
                {siteConfig.projectName}
              </span>
              <span
                className={cn(
                  "mono overflow-hidden text-[9px] uppercase tracking-[0.18em] text-muted-foreground transition-all duration-300",
                  scrolled ? "max-h-0 opacity-0" : "mt-1 max-h-4 opacity-100",
                )}
              >
                {siteConfig.competition}
              </span>
            </span>
          </Link>

          {/* Desktop: a segmented control whose active pill slides between items. */}
          <div className="hidden items-center gap-0.5 rounded-full border border-border bg-card/50 p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200",
                    isActive
                      ? "text-background colorful:text-white"
                      : "text-muted-foreground hover:text-foreground colorful:hover:text-brand",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="brand-fill absolute inset-0 rounded-full colorful:shadow-[0_4px_14px_-4px_hsl(var(--brand-to)/0.6)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative">{trs(item.label)}</span>
                  </>
                )}
              </NavLink>
            ))}
            {isLinkConfigured(siteConfig.paperUrl) && (
              <a
                href={siteConfig.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("Paper", "Makalah")}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle layoutId="lang-pill-desktop" />
            <PaletteToggle layoutId="palette-pill-desktop" className="hidden sm:flex" />
            <ThemeToggle />
            <LinkButton to="/demo" size="sm" className="group hidden lg:inline-flex">
              {t("Try DR-VERGE", "Coba DR-VERGE")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </LinkButton>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? ts("Close menu", "Tutup menu") : ts("Open menu", "Buka menu")}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-colors hover:border-foreground/40 md:hidden"
            >
              {open ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            className="no-print fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background pt-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col gap-1 px-5 pt-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between gap-4 border-b border-border py-5 transition-colors",
                        isActive ? "text-foreground colorful:text-brand" : "text-muted-foreground",
                      )
                    }
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="mono text-[11px] text-subtle">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-2xl font-semibold tracking-tight">
                          {trs(item.label)}
                        </span>
                        <span className="mt-1 text-[12px] text-muted-foreground">
                          {trs(item.hint)}
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </NavLink>
                </motion.div>
              ))}

              {isLinkConfigured(siteConfig.paperUrl) && (
                <a
                  href={siteConfig.paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border-b border-border py-5 text-2xl font-semibold tracking-tight text-muted-foreground"
                >
                  {t("Paper", "Makalah")}
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </a>
              )}

              <div className="mt-6">
                <AppearancePanel />
              </div>
            </div>

            <div className="mt-auto p-5 pb-10">
              <LinkButton to="/demo" size="lg" className="w-full">
                {t("Try DR-VERGE", "Coba DR-VERGE")}
              </LinkButton>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                {t(
                  "Research prototype. Not intended as a standalone clinical diagnostic system.",
                  "Prototipe penelitian. Tidak ditujukan sebagai sistem diagnosis klinis yang berdiri sendiri.",
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
