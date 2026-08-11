import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResearchFigure as FigureData } from "@/data/researchMetrics";

/**
 * A real figure from the DR-VERGE evaluation run.
 *
 * The source PNGs are grayscale renders of the actual matplotlib output, so they
 * are inverted in dark mode: for a grayscale image that is lossless and turns a
 * glaring white canvas into a native-looking dark chart.
 *
 * Failure is handled explicitly. A missing figure shows a labelled placeholder
 * rather than a broken image icon, because a research page with a broken image
 * reads as an unfinished site.
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

  return (
    <figure className={cn("group flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        {failed ? (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 bg-surface text-muted-foreground">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            <span className="mono text-[10px] uppercase tracking-[0.16em]">
              Figure unavailable
            </span>
          </div>
        ) : (
          <img
            src={figure.src}
            alt={`${figure.title}. ${figure.caption}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
            className="figure-invert w-full bg-white transition-transform duration-500 ease-editorial group-hover:scale-[1.01] dark:bg-transparent"
          />
        )}
      </div>
      <figcaption className="mt-4 flex flex-col gap-1.5">
        <span className="mono text-[11px] uppercase tracking-[0.14em] text-foreground">
          {figure.title}
        </span>
        <span className="max-w-prose text-[13px] leading-relaxed text-muted-foreground">
          {figure.caption}
        </span>
      </figcaption>
    </figure>
  );
}
