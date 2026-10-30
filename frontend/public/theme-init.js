// Runs synchronously from <head>, before first paint. Kept as a same-origin file
// (not an inline <script>) so the Content-Security-Policy in vercel.json can
// forbid inline scripts.
// Apply the stored theme before first paint so a dark-mode visitor never
// sees a white flash on load.
(function () {
  try {
    var stored = localStorage.getItem("dr-verge-theme");
    var dark =
      stored === "dark" ||
      ((!stored || stored === "system") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
    // Colour palette: "color" (default) or the original "mono".
    if (localStorage.getItem("dr-verge-palette") !== "mono")
      document.documentElement.classList.add("colorful");
    // Accessibility mode (large, high-contrast text).
    if (localStorage.getItem("dr-verge-a11y") === "on")
      document.documentElement.classList.add("a11y");
    // Same for the language, so the first paint is already correct.
    var lang = localStorage.getItem("dr-verge-lang");
    document.documentElement.lang = lang === "en" ? "en" : "id";
  } catch (e) {
    /* localStorage unavailable — fall back to the default palette */
    document.documentElement.classList.add("colorful");
  }
})();
