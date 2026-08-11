import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/siteConfig";

/** Centred content column. `wide` opts into the full 1440px measure. */
export function Container({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        wide ? "max-w-[1440px]" : "max-w-[1200px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A page section with consistent vertical rhythm. */
export function Section({
  children,
  className,
  id,
  bleed = false,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Skips the container, for sections that manage their own layout. */
  bleed?: boolean;
  tone?: "default" | "surface" | "inverted";
}) {
  const tones = {
    default: "",
    surface: "bg-surface",
    // Full inversion — the strongest emphasis available in a monochrome system.
    inverted: "bg-foreground text-background",
  } as const;

  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 py-20 sm:py-24 lg:py-32",
        tones[tone],
        className,
      )}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}

/** Wraps a route with an entrance transition. */
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <main className={cn("min-h-svh", className)}>{children}</main>;

  return (
    <motion.main
      className={cn("min-h-svh", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}

/**
 * Per-route document metadata.
 *
 * A tiny effect rather than a helmet dependency: this site has three routes, and
 * the only tags that need to change per route are the title and description.
 */
export function Seo({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    const full = `${title} | ${siteConfig.projectName}`;
    document.title = full;

    const setMeta = (selector: string, attr: string, key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = description ?? siteConfig.description;
    setMeta('meta[name="description"]', "name", "description", desc);
    setMeta('meta[property="og:title"]', "property", "og:title", full);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", full);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
  }, [title, description]);

  return null;
}
