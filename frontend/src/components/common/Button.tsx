import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full text-center font-medium leading-tight " +
  "transition-all duration-200 ease-editorial select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  // Monochrome: inverted fill, black on light and white on dark.
  // Colourful: the brand gradient, lifted by a soft blue glow on hover.
  primary:
    "brand-fill hover:opacity-85 active:scale-[0.98] shadow-sm " +
    "colorful:shadow-[0_8px_22px_-10px_hsl(var(--brand-to)/0.75)] colorful:hover:opacity-100 " +
    "colorful:hover:-translate-y-px colorful:hover:shadow-[0_14px_30px_-12px_hsl(var(--brand-to)/0.85)]",
  secondary:
    "bg-surface-2 text-foreground border border-border hover:border-foreground/40 hover:bg-muted active:scale-[0.98] " +
    "colorful:hover:border-brand-line colorful:hover:bg-brand-soft",
  outline:
    "border border-border text-foreground hover:border-foreground hover:bg-muted active:scale-[0.98] " +
    "colorful:border-brand-line colorful:bg-card/70 colorful:text-brand colorful:hover:border-brand colorful:hover:bg-brand-soft",
  ghost:
    "text-muted-foreground hover:text-foreground hover:bg-muted colorful:hover:bg-brand-soft colorful:hover:text-brand",
};

const sizes: Record<Size, string> = {
  // Accessibility mode: taller targets for the larger type and for less
  // precise pointing. A minimum rather than a fixed height there, so a long
  // label that wraps on a phone still has room for both lines.
  sm: "h-9 px-4 text-13 a11y:h-auto a11y:min-h-11 a11y:py-2",
  md: "h-11 px-6 text-sm a11y:h-auto a11y:min-h-[3.25rem] a11y:py-2.5",
  lg: "h-14 px-8 text-base a11y:h-auto a11y:min-h-16 a11y:py-3",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

type LinkButtonProps = CommonProps & {
  to: string;
  ariaLabel?: string;
};

/** Internal navigation styled as a button. */
export function LinkButton({
  to,
  variant = "primary",
  size = "md",
  className,
  children,
  ariaLabel,
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}

type ExternalButtonProps = CommonProps & {
  href: string;
  ariaLabel?: string;
  /** When false the control renders disabled — used for unconfigured links. */
  enabled?: boolean;
  disabledTitle?: string;
};

/**
 * External link styled as a button.
 *
 * When `enabled` is false it renders a real disabled element rather than a dead
 * anchor, so an unconfigured link is visibly unavailable instead of silently
 * doing nothing when clicked.
 */
export function ExternalButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ariaLabel,
  enabled = true,
  disabledTitle,
}: ExternalButtonProps) {
  const { ts } = useI18n();
  if (!enabled || !href) {
    return (
      <span
        role="link"
        aria-disabled="true"
        title={
          disabledTitle ??
          ts("This link has not been configured yet.", "Tautan ini belum dikonfigurasi.")
        }
        className={cn(base, variants[variant], sizes[size], "cursor-not-allowed opacity-60 hover:bg-transparent", className)}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </a>
  );
}
