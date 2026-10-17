import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Accessibility, ALargeSmall, Check, Contrast, Type, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useA11y } from "@/components/theme-provider";
import { useI18n } from "@/i18n/context";
import { transitionContent } from "@/lib/viewTransition";

/**
 * The accessibility mode switch, in three shapes:
 *
 *   AccessibilityToggle  — the compact switch in the navbar
 *   AccessibilityCard    — the explained version in the mobile menu
 *   AccessibilityPrompt  — an inline invitation in the hero
 *
 * All three flip the same `a11y` flag, and every flip is confirmed by
 * <AccessibilityToast /> (mounted once in the root layout) so the reader sees
 * — and a screen reader hears — what just changed.
 */

type Listener = (on: boolean) => void;
const listeners = new Set<Listener>();

function useToggleA11y() {
  const { a11y, setA11y } = useA11y();
  const toggle = () => {
    const next = !a11y;
    // The type reflows the whole page; a soft cross-fade hides the jump.
    transitionContent(() => setA11y(next));
    listeners.forEach((l) => l(next));
  };
  return { a11y, toggle };
}

/** The little on/off track used by every variant. */
function SwitchTrack({ on, size = "md", className }: { on: boolean; size?: "md" | "lg"; className?: string }) {
  const lg = size === "lg";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-300",
        lg ? "h-7 w-12" : "h-5 w-9",
        on ? "brand-fill border-transparent" : "border-border-strong bg-muted",
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 rounded-full shadow-sm transition-transform duration-300 ease-editorial",
          lg ? "h-5 w-5" : "h-3.5 w-3.5",
          on ? cn("bg-background colorful:bg-white", lg ? "translate-x-5" : "translate-x-4") : "translate-x-0 bg-foreground/70",
        )}
      />
    </span>
  );
}

/** Navbar switch: "Aa" icon + a small track. Compact = icon-only circle. */
export function AccessibilityToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { a11y, toggle } = useToggleA11y();
  const { ts } = useI18n();
  const label = ts("Accessibility mode: larger, clearer text", "Mode aksesibilitas: teks lebih besar dan jelas");

  if (compact) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={a11y}
        aria-label={label}
        title={label}
        onClick={toggle}
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
          a11y
            ? "brand-fill border-transparent shadow-sm"
            : "border-border bg-card/60 text-foreground hover:border-foreground/40 colorful:hover:border-brand-line colorful:hover:text-brand",
          className,
        )}
      >
        <ALargeSmall className="h-[18px] w-[18px]" aria-hidden="true" />
        {a11y && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-background bg-foreground text-background colorful:bg-amber-solid colorful:text-white">
            <Check className="h-2 w-2" strokeWidth={4} aria-hidden="true" />
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={a11y}
      aria-label={label}
      title={label}
      onClick={toggle}
      className={cn(
        "group flex h-9 shrink-0 items-center gap-2 rounded-full border pl-2.5 pr-1.5 transition-colors",
        a11y
          ? "border-foreground/40 bg-surface colorful:border-brand-line colorful:bg-brand-soft"
          : "border-border bg-card/60 hover:border-foreground/40 colorful:hover:border-brand-line",
        className,
      )}
    >
      <ALargeSmall
        className={cn(
          "h-[18px] w-[18px] transition-colors",
          a11y ? "text-foreground colorful:text-brand" : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden="true"
      />
      <SwitchTrack on={a11y} />
    </button>
  );
}

const benefits = [
  { icon: Type, en: "Larger text everywhere", id: "Teks lebih besar di semua halaman" },
  { icon: Contrast, en: "Stronger contrast", id: "Kontras warna lebih tegas" },
  { icon: Eye, en: "Plain typefaces, calmer motion", id: "Huruf polos, animasi lebih tenang" },
];

/** Mobile menu: the switch with a plain-language explanation. */
export function AccessibilityCard({ className }: { className?: string }) {
  const { a11y, toggle } = useToggleA11y();
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        a11y ? "border-foreground/40 bg-surface colorful:border-brand-line colorful:bg-brand-soft" : "border-border bg-card",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={a11y}
        onClick={toggle}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="brand-fill flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          <Accessibility className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold leading-tight">
            {t("Accessibility mode", "Mode aksesibilitas")}
          </span>
          <span className="mt-0.5 block text-13 leading-snug text-muted-foreground">
            {a11y
              ? t("On · text is enlarged", "Aktif · teks diperbesar")
              : t("Easier reading for ageing eyes", "Lebih nyaman untuk mata lansia")}
          </span>
        </span>
        <SwitchTrack on={a11y} size="lg" />
      </button>
      <ul className="mt-4 grid gap-2 border-t border-border pt-3">
        {benefits.map(({ icon: Icon, en, id }) => (
          <li key={en} className="flex items-center gap-2.5 text-13 text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 text-foreground colorful:text-brand" aria-hidden="true" />
            {t(en, id)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Hero: a visible, labelled invitation for readers who need it most. */
export function AccessibilityPrompt({ className }: { className?: string }) {
  const { a11y, toggle } = useToggleA11y();
  const { t } = useI18n();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={a11y}
      onClick={toggle}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-4 text-left transition-all duration-300",
        a11y
          ? "border-foreground/40 bg-surface colorful:border-brand-line colorful:bg-brand-soft"
          : "border-border bg-card/70 hover:-translate-y-px hover:border-foreground/40 hover:shadow-md colorful:hover:border-brand-line",
        className,
      )}
    >
      <span className="brand-fill flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <Accessibility className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-14 font-semibold text-foreground">
          {a11y
            ? t("Accessibility mode is on", "Mode aksesibilitas aktif")
            : t("Text too small? Turn on accessibility mode", "Teks terlalu kecil? Aktifkan mode aksesibilitas")}
        </span>
        <span className="mt-0.5 text-12 text-muted-foreground">
          {a11y
            ? t("Tap again to return to normal text", "Ketuk lagi untuk kembali ke teks normal")
            : t("Larger text, stronger contrast — kinder to ageing eyes", "Teks lebih besar, kontras lebih tegas — ramah untuk mata lansia")}
        </span>
      </span>
      <SwitchTrack on={a11y} className="ml-1 hidden sm:inline-flex" />
    </button>
  );
}

/** Footer: a plain text link-style switch beside the other navigation. */
export function AccessibilityLink({ className }: { className?: string }) {
  const { a11y, toggle } = useToggleA11y();
  const { t } = useI18n();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={a11y}
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground colorful:hover:text-brand",
        className,
      )}
    >
      <Accessibility className="h-4 w-4" aria-hidden="true" />
      {t("Accessibility mode", "Mode aksesibilitas")}
      <span
        className={cn(
          "mono rounded-full px-2 py-0.5 text-10 font-semibold uppercase tracking-[0.12em]",
          a11y ? "brand-fill" : "bg-muted text-muted-foreground",
        )}
      >
        {a11y ? t("On", "Aktif") : t("Off", "Mati")}
      </span>
    </button>
  );
}

/**
 * Confirms each change. A polite live region for screen readers, and a small
 * pill at the bottom of the screen for everyone else.
 */
export function AccessibilityToast() {
  const [state, setState] = useState<{ on: boolean; key: number } | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const l: Listener = (on) => setState({ on, key: Date.now() });
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    const id = window.setTimeout(() => setState(null), 3200);
    return () => window.clearTimeout(id);
  }, [state]);

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {state && (
          <motion.div
            key={state.key}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass flex max-w-md items-center gap-3 rounded-full border border-border py-2 pl-2 pr-5 shadow-[0_18px_40px_-16px_hsl(var(--shadow-color)/0.45)]"
          >
            <span className="brand-fill flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              {state.on ? (
                <Accessibility className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ALargeSmall className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <span className="text-sm font-medium">
              {state.on
                ? t("Accessibility mode on — text enlarged", "Mode aksesibilitas aktif — teks diperbesar")
                : t("Back to normal text size", "Kembali ke ukuran teks normal")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
