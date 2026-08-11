import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** Back-to-top control, monochrome and hidden from print. */
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 600);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll back to top"
      // Kept mounted but inert when hidden, so it fades rather than popping.
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      className={cn(
        "no-print fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full",
        "border border-border bg-background/90 text-foreground backdrop-blur",
        "transition-all duration-300 ease-editorial hover:border-foreground hover:bg-muted",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};

export default ScrollToTopButton;
