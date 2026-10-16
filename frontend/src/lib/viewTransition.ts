import { flushSync } from "react-dom";

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type DocWithVT = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Runs `update` inside a view transition, with two safety nets:
 *
 *  - the update is idempotent, and a timer applies it directly if the browser
 *    has not started the transition within `fallbackMs` (a background tab or a
 *    throttled renderer can postpone it indefinitely — the switch must never
 *    feel stuck);
 *  - `data-vt` on <html> selects the CSS for this kind of transition and is
 *    removed only by the transition that set it.
 */
function runTransition(kind: "theme" | "content", update: () => void, fallbackMs = 400) {
  const doc = document as DocWithVT;
  const root = document.documentElement;

  let applied = false;
  const apply = () => {
    if (applied) return;
    applied = true;
    flushSync(update);
  };

  root.dataset.vt = kind;
  const vt = doc.startViewTransition!(apply);
  const timer = window.setTimeout(apply, fallbackMs);

  vt.finished
    .catch(() => undefined)
    .finally(() => {
      window.clearTimeout(timer);
      if (root.dataset.vt === kind) delete root.dataset.vt;
    });

  return vt;
}

/**
 * Theme change with a circular reveal that grows from the toggle button.
 *
 * Uses the View Transitions API where available. Elsewhere it falls back to a
 * short cross-fade of colours (the `theme-fade` class), and with reduced motion
 * it simply switches.
 */
export function transitionTheme(update: () => void, origin?: { x: number; y: number }) {
  const doc = document as DocWithVT;

  if (prefersReducedMotion() || document.visibilityState !== "visible") {
    update();
    return;
  }

  if (!doc.startViewTransition) {
    const root = document.documentElement;
    root.classList.add("theme-fade");
    update();
    window.setTimeout(() => root.classList.remove("theme-fade"), 520);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const vt = runTransition("theme", update);
  vt.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => undefined);
}

/** Language change as a soft cross-fade, so the page does not "jump". */
export function transitionContent(update: () => void) {
  const doc = document as DocWithVT;
  if (prefersReducedMotion() || !doc.startViewTransition || document.visibilityState !== "visible") {
    update();
    return;
  }
  runTransition("content", update);
}
