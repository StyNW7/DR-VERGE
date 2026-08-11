import { motion, useReducedMotion } from "framer-motion";
import { Info, AlertTriangle, ShieldAlert, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

type BadgeTone = "default" | "solid" | "outline" | "warn";

const badgeTones: Record<BadgeTone, string> = {
  default: "bg-muted text-muted-foreground border-transparent",
  solid: "bg-foreground text-background border-transparent",
  outline: "bg-transparent text-foreground border-border",
  // "warn" stays monochrome: emphasis comes from a heavier border and weight,
  // never from colour. The site has no semantic palette by design.
  warn: "bg-transparent text-foreground border-foreground border-dashed font-semibold",
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
        "mono inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em]",
        badgeTones[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Divider                                                                     */
/* -------------------------------------------------------------------------- */

export function Divider({ className, label }: { className?: string; label?: string }) {
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
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-foreground" aria-hidden="true" />
          <span className="eyebrow">{eyebrow}</span>
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
            "max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg",
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
  label: string;
  detail?: string;
  className?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-6 transition-colors duration-300 sm:p-7",
        emphasis
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/40",
        className,
      )}
    >
      <div
        className={cn(
          "mono text-3xl font-semibold tracking-tight sm:text-4xl",
          emphasis ? "text-background" : "text-foreground",
        )}
      >
        {value}
      </div>
      <div className="mt-4">
        <div
          className={cn(
            "text-sm font-medium",
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

/**
 * The site's standard disclaimer block.
 *
 * All tones are monochrome; "medical" is distinguished by a heavier left rule
 * rather than by colour, because the design system has no semantic palette and
 * a red box would be the only coloured element on the page.
 */
export function Callout({
  tone = "note",
  title,
  children,
  className,
}: {
  tone?: CalloutTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = calloutIcons[tone];
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border bg-surface p-4 sm:gap-4 sm:p-5",
        tone === "medical"
          ? "border-border border-l-[3px] border-l-foreground"
          : "border-border",
        className,
      )}
      role="note"
    >
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0">
        {title && (
          <div className="mono mb-1 text-[10px] uppercase tracking-[0.16em] text-foreground">
            {title}
          </div>
        )}
        <div className="text-[13px] leading-relaxed text-muted-foreground">
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

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border border-border" />
        <span className="absolute inset-0 animate-spin rounded-full border-t-2 border-foreground" />
      </div>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ScoreBar — the monochrome horizontal bar used for all model scores          */
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
          emphasis ? "bg-foreground" : "bg-foreground/45",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
