import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResearchFigure as FigureData } from "@/data/researchMetrics";
import { useI18n } from "@/i18n/context";

/**
 * A real figure from the DR-VERGE evaluation run.
 *
 * The source PNGs are the actual matplotlib output on a white canvas. The
 * monochrome palette shows them in grayscale and inverts them in dark mode (for
 * a grayscale image that is lossless and turns a glaring white canvas into a
 * native-looking dark chart); the colourful palette keeps their real colours —
 * see `.figure-invert` in index.css.
 *
 * Failure is handled explicitly. A missing figure shows a labelled placeholder
 * rather than a broken image icon, because a research page with a broken image
 * reads as an unfinished site.
 *
 * Matplotlib figures carry small axis text, so every figure opens full-size in a
 * lightbox on click.
 */
export function ResearchFigure({
  figure,
  className,
  priority = false,
}: {
  figure: FigureData;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const { t, ts, tr, trs } = useI18n();

  return (
    <figure className={cn("group flex flex-col", className)}>
      <div className="card-premium relative overflow-hidden">
        {failed ? (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 bg-surface text-muted-foreground">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            <span className="mono text-11 uppercase tracking-[0.16em]">
              {t("Figure unavailable", "Gambar tidak tersedia")}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block w-full cursor-zoom-in"
            aria-label={ts(`Enlarge ${trs(figure.title)}`, `Perbesar ${trs(figure.title)}`)}
          >
            <img
              src={figure.src}
              alt={`${trs(figure.title)}. ${trs(figure.caption)}`}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              onError={() => setFailed(true)}
              className="figure-invert w-full bg-white transition-transform duration-500 ease-editorial group-hover:scale-[1.015] dark:bg-transparent colorful:bg-white"
            />
            <span className="glass absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-12 font-medium text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
              <Maximize2 className="h-3 w-3" aria-hidden="true" />
              {t("Enlarge", "Perbesar")}
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-4 flex flex-col gap-1.5">
        <span className="mono text-12 uppercase tracking-[0.14em] text-foreground colorful:font-semibold colorful:text-brand">
          {tr(figure.title)}
        </span>
        <span className="max-w-prose text-14 leading-relaxed text-muted-foreground">
          {tr(figure.caption)}
        </span>
      </figcaption>

      <FigureLightbox figure={figure} open={open} onClose={() => setOpen(false)} />
    </figure>
  );
}

function FigureLightbox({
  figure,
  open,
  onClose,
}: {
  figure: FigureData;
  open: boolean;
  onClose: () => void;
}) {
  const { t, ts, tr, trs } = useI18n();
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="no-print fixed inset-0 z-[70] flex items-center justify-center bg-background/90 p-3 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={trs(figure.title)}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="card-premium flex max-h-full w-full max-w-6xl flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.97, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
              <span className="mono truncate text-12 uppercase tracking-[0.14em]">
                {tr(figure.title)}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={ts("Close figure", "Tutup gambar")}
                autoFocus
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-white p-2 dark:bg-transparent sm:p-4">
              <img
                src={figure.src}
                alt={`${trs(figure.title)}. ${trs(figure.caption)}`}
                className="figure-invert mx-auto max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
            <p className="border-t border-border px-5 py-3.5 text-14 leading-relaxed text-muted-foreground">
              {tr(figure.caption)}
              <span className="mono ml-2 text-11 uppercase tracking-[0.14em] text-subtle">
                {t("Esc to close", "Esc untuk menutup")}
              </span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
