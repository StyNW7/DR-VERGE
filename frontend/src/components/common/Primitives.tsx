import { motion, useReducedMotion } from "framer-motion";
import { Info, AlertTriangle, ShieldAlert, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

type BadgeTone = "default" | "solid" | "outline" | "warn";

const badgeTones: Record<BadgeTone, string> = {
  default:
    "bg-muted text-muted-foreground border-transparent colorful:bg-brand-soft colorful:text-brand",
  solid: "brand-fill border-transparent",
  outline:
    "bg-transparent text-foreground border-border colorful:border-brand-line colorful:text-brand",
  // In monochrome, "warn" gets its emphasis from a heavier dashed border and
  // weight. The colourful palette adds the amber accent on top of that.
  warn:
    "bg-transparent text-foreground border-foreground border-dashed font-semibold " +
    "colorful:border-amber-line colorful:bg-amber-soft colorful:text-amber",
};

export function Badge({
  children,
  tone = "default",
  className,
  icon: Icon,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: React.ElementType;
}) {
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-11 uppercase leading-none tracking-[0.14em]",
        badgeTones[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Divider                                                                     */
/* -------------------------------------------------------------------------- */

export function Divider({ className, label }: { className?: string; label?: React.ReactNode }) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <span className="h-px flex-1 bg-border" />
        <span className="eyebrow shrink-0">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }
  return <hr className={cn("border-0 border-t border-border", className)} />;
}

/* -------------------------------------------------------------------------- */
/* Reveal — scroll-in animation                                                */
/* -------------------------------------------------------------------------- */

/**
 * Fades content up as it scrolls into view.
 *
 * Honours prefers-reduced-motion by rendering the final state immediately —
 * `once` also means content never re-animates on scroll-back, which is
 * distracting on a long editorial page.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 16,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* SectionHeader                                                               */
/* -------------------------------------------------------------------------- */

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  size = "md",
  index,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  size?: "md" | "lg";
  /** Optional chapter number, shown in front of the eyebrow ("02"). */
  index?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "inline-flex items-center gap-2.5 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3.5 shadow-sm backdrop-blur",
            "colorful:border-brand-line colorful:bg-brand-soft/80",
            align === "center" ? "self-center" : "self-start",
          )}
        >
          <span className="brand-fill mono flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-11 font-semibold">
            {index ?? <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          <span className="eyebrow text-foreground/80">{eyebrow}</span>
        </div>
      )}
      <h2
        className={cn(
          "display text-balance",
          size === "lg" ? "text-display-md" : "text-display-sm",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-prose text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MetricCard                                                                  */
/* -------------------------------------------------------------------------- */

export function MetricCard({
  value,
  label,
  detail,
  className,
  emphasis = false,
}: {
  value: string;
  label: React.ReactNode;
  detail?: React.ReactNode;
  className?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 ease-editorial sm:p-7",
        emphasis
          ? "grain inverse border-transparent shadow-xl"
          : "card-premium card-lift",
        className,
      )}
    >
      {/* Corner glow, foreground at low alpha — monochrome by construction. */}
      <span
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-2xl transition-opacity duration-500",
          emphasis ? "bg-background/10" : "bg-foreground/[0.04] opacity-0 group-hover:opacity-100",
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative text-4xl font-bold tracking-[-0.04em] tabular-nums sm:text-5xl",
          emphasis ? "text-background" : "ink-gradient",
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "relative mt-6 border-t pt-4",
          emphasis ? "border-background/15" : "border-border",
        )}
      >
        <div
          className={cn(
            "text-sm font-semibold",
            emphasis ? "text-background" : "text-foreground",
          )}
        >
          {label}
        </div>
        {detail && (
          <div
            className={cn(
              "mt-1 text-xs leading-relaxed",
              emphasis ? "text-background/70" : "text-muted-foreground",
            )}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Callout / Disclaimer                                                        */
/* -------------------------------------------------------------------------- */

type CalloutTone = "note" | "caution" | "medical" | "research";

const calloutIcons: Record<CalloutTone, React.ElementType> = {
  note: Info,
  caution: AlertTriangle,
  medical: ShieldAlert,
  research: FlaskConical,
};

/** Accent per tone in the colourful palette: blue for information, amber for
 *  caution, coral for the medical disclaimer. */
const calloutAccents: Record<CalloutTone, string> = {
  note: "accent-blue",
  caution: "accent-amber",
  medical: "accent-coral",
  research: "accent-blue",
};

/**
 * The site's standard disclaimer block.
 *
 * In monochrome every tone is grey and "medical" is distinguished by a heavier
 * left rule rather than by colour. The colourful palette tints each tone with
 * its accent (`calloutAccents`) and keeps the same left rule for "medical".
 */
export function Callout({
  tone = "note",
  title,
  children,
  className,
}: {
  tone?: CalloutTone;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = calloutIcons[tone];
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border bg-surface/80 p-4 sm:gap-4 sm:p-5",
        "colorful:border-acc-line colorful:bg-acc-soft",
        calloutAccents[tone],
        tone === "medical"
          ? "border-border border-l-[3px] border-l-foreground colorful:border-l-acc-solid"
          : "border-border",
        className,
      )}
      role="note"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card colorful:border-transparent colorful:bg-acc-solid colorful:shadow-sm">
        <Icon className="h-3.5 w-3.5 text-foreground/70 colorful:text-acc-fg" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        {title && (
          <div className="mono mb-1 pt-1 text-11 font-semibold uppercase tracking-[0.16em] text-foreground colorful:text-acc">
            {title}
          </div>
        )}
        <div
          className={cn(
            "text-14 leading-relaxed text-muted-foreground",
            !title && "pt-1",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LoadingState                                                                */
/* -------------------------------------------------------------------------- */

/** Shimmering skeleton block. */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "after:absolute after:inset-0 after:animate-shimmer",
        "after:bg-gradient-to-r after:from-transparent after:via-foreground/[0.06] after:to-transparent",
        className,
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

export function LoadingState({ label }: { label?: string }) {
  const { ts } = useI18n();
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border border-border" />
        <span className="absolute inset-0 animate-spin rounded-full border-t-2 border-foreground colorful:border-brand" />
      </div>
      <span className="eyebrow">{label ?? ts("Loading", "Memuat")}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ScoreBar — the horizontal bar used for all model scores                     */
/* -------------------------------------------------------------------------- */

export function ScoreBar({
  value,
  emphasis = false,
  className,
}: {
  /** Already clamped to [0,1] by the caller. */
  value: number;
  emphasis?: boolean;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-editorial",
          emphasis ? "brand-fill" : "bg-foreground/45 colorful:bg-brand/30",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
