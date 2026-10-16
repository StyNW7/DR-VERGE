import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n, type L } from "@/i18n/context";
import { scrollToSection, useScrollSpy } from "@/hooks/useScrollSpy";

export interface RailItem {
  id: string;
  label: L;
}

/**
 * Fixed chapter rail for long pages (desktop only).
 *
 * A row of short ticks on the right edge; the current chapter's tick widens and
 * its label is shown. Every label appears on hover or focus, so the rail doubles
 * as a table of contents without taking any layout space.
 */
export function SectionRail({ items }: { items: readonly RailItem[] }) {
  const active = useScrollSpy(items.map((i) => i.id));
  const reduce = useReducedMotion();
  const { ts, trs } = useI18n();

  return (
    <nav
      aria-label={ts("Page sections", "Bagian halaman")}
      className={cn(
        "no-print fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 xl:block 2xl:right-6",
        "transition-opacity duration-500",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <ol className="group/rail flex flex-col items-end gap-1">
        {items.map((item, i) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollToSection(item.id)}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center gap-3 py-1.5 pl-3"
              >
                <span
                  className={cn(
                    "mono whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] transition-all duration-300",
                    isActive
                      ? "glass translate-x-1 border border-border text-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100 2xl:translate-x-0 2xl:opacity-100"
                      : "translate-x-1 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-hover/rail:opacity-60",
                  )}
                >
                  <span className="mr-1.5 text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  {trs(item.label)}
                </span>
                <motion.span
                  className={cn(
                    "block h-[2px] rounded-full",
                    isActive ? "bg-foreground" : "bg-foreground/25 group-hover:bg-foreground/60",
                  )}
                  animate={{ width: isActive ? 28 : 12 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Thin reading-progress bar pinned to the top edge of the viewport. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      className="no-print fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-foreground"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
