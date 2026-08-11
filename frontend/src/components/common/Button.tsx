import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-all duration-200 ease-editorial select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  // Inverted fill: black on light, white on dark. The core monochrome CTA.
  primary:
    "bg-foreground text-background hover:opacity-85 active:scale-[0.98] shadow-sm",
  secondary:
    "bg-surface-2 text-foreground border border-border hover:border-foreground/40 hover:bg-muted active:scale-[0.98]",
  outline:
    "border border-border text-foreground hover:border-foreground hover:bg-muted active:scale-[0.98]",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
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
  disabledTitle = "This link has not been configured yet.",
}: ExternalButtonProps) {
  if (!enabled || !href) {
    return (
      <span
        role="link"
        aria-disabled="true"
        title={disabledTitle}
        className={cn(base, variants[variant], sizes[size], "opacity-40 cursor-not-allowed", className)}
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
