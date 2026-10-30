import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the top on every route change — or, when the link carries a hash
 * ("/research#mechanism-evidence"), to that section. Pages are lazy-loaded, so
 * the target may not exist on the first frame; it is retried briefly.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (tries++ < 30) timer = window.setTimeout(tick, 100);
    };
    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
