import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, FileText, ArrowUpRight, Moon, Sun, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, isLinkConfigured } from "@/config/siteConfig";
import { useTheme } from "@/components/theme-provider";
import { LinkButton } from "@/components/common/Button";
import { ReadingProgress } from "@/components/common/SectionRail";

const navItems = [
  { label: "Home", to: "/", hint: "The research story" },
  { label: "Model Demo", to: "/demo", hint: "Grade a sample eye" },
  { label: "Research", to: "/research", hint: "Method, results, limits" },
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

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
        Skip to content
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
            "mx-auto flex items-center justify-between transition-all duration-500 ease-editorial",
            scrolled
              ? "glass h-14 max-w-[1120px] rounded-full border border-border pl-2 pr-2 shadow-[0_10px_40px_-16px_hsl(var(--shadow-color)/0.35)] sm:pl-3"
              : "h-16 max-w-[1440px] border border-transparent px-5 sm:h-20 sm:px-6 lg:px-8",
          )}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-full pr-2 transition-opacity hover:opacity-80"
            aria-label={`${siteConfig.projectName} home`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
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
                    "relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200",
                    isActive ? "text-background" : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative">{item.label}</span>
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
                Paper
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LinkButton to="/demo" size="sm" className="group hidden sm:inline-flex">
              Try DR-VERGE
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </LinkButton>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
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
            className="no-print fixed inset-0 z-40 flex flex-col bg-background pt-20 md:hidden"
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
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )
                    }
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="mono text-[11px] text-subtle">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-2xl font-semibold tracking-tight">
                          {item.label}
                        </span>
                        <span className="mt-1 text-[12px] text-muted-foreground">
                          {item.hint}
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
                  Paper
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
            </div>

            <div className="mt-auto p-5 pb-10">
              <LinkButton to="/demo" size="lg" className="w-full">
                Try DR-VERGE
              </LinkButton>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                Research prototype. Not intended as a standalone clinical diagnostic
                system.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
