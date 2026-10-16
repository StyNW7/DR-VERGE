import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently being read.
 *
 * "Currently being read" is the last section whose top has crossed a line a
 * little below the navbar. That is more stable than IntersectionObserver
 * ratios, which flicker between two sections when both are partly visible.
 */
export function useScrollSpy(ids: readonly string[], offset = 240): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // `key` stands in for `ids`, which callers usually pass as a fresh array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, offset]);

  return active;
}

/** Smooth-scrolls to a section without leaving a hash in the URL history. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
