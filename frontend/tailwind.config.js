const defaultTheme = require("tailwindcss/defaultTheme");

/**
 * Every text size resolves through a CSS variable (see `--fs-*` in index.css),
 * so the accessibility mode can enlarge the type alone — spacing, breakpoints
 * and layout stay where they are. `--lh-*` does the same for line height.
 */
const fs = (name) => [`var(--fs-${name})`, { lineHeight: `var(--lh-${name})` }];

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    // `xs` sits below `sm` for the narrowest phones' navbar.
    screens: { xs: "370px", ...defaultTheme.screens },
    // The whole scale is replaced (not extended) so that every size is
    // variable-driven. The numeric tokens are the old pixel sizes (`text-13` is
    // 13px at normal size) and carry no line height, like the arbitrary
    // `text-[13px]` values they replaced.
    fontSize: {
      10: "var(--fs-10)",
      11: "var(--fs-11)",
      12: "var(--fs-12)",
      13: "var(--fs-13)",
      14: "var(--fs-14)",
      15: "var(--fs-15)",
      xs: fs("xs"),
      sm: fs("sm"),
      base: fs("base"),
      lg: fs("lg"),
      xl: fs("xl"),
      "2xl": fs("2xl"),
      "3xl": fs("3xl"),
      "4xl": fs("4xl"),
      "5xl": fs("5xl"),
      "6xl": fs("6xl"),
      "7xl": fs("7xl"),
      // Fluid editorial display sizes. clamp() means the hero never needs a
      // breakpoint to stay proportionate between 375px and 1920px.
      "display-sm": ["clamp(2rem,6vw,3rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
      "display-md": ["clamp(2.5rem,8vw,4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.04em" }],
      "display-lg": ["clamp(3rem,11vw,7rem)", { lineHeight: "0.92", letterSpacing: "-0.045em" }],
      "display-xl": ["clamp(4rem,16vw,12rem)", { lineHeight: "0.86", letterSpacing: "-0.05em" }],
    },
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        subtle: "hsl(var(--subtle-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic accents. Grey in the monochrome palette, hued in colourful.
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          from: "hsl(var(--brand-from) / <alpha-value>)",
          to: "hsl(var(--brand-to) / <alpha-value>)",
          glow: "hsl(var(--brand-glow) / <alpha-value>)",
          foreground: "hsl(var(--brand-foreground) / <alpha-value>)",
          soft: "hsl(var(--brand-soft) / <alpha-value>)",
          line: "hsl(var(--brand-line) / <alpha-value>)",
        },
        coral: {
          DEFAULT: "hsl(var(--coral) / <alpha-value>)",
          solid: "hsl(var(--coral-solid) / <alpha-value>)",
          soft: "hsl(var(--coral-soft) / <alpha-value>)",
          line: "hsl(var(--coral-line) / <alpha-value>)",
        },
        amber: {
          DEFAULT: "hsl(var(--amber) / <alpha-value>)",
          solid: "hsl(var(--amber-solid) / <alpha-value>)",
          soft: "hsl(var(--amber-soft) / <alpha-value>)",
          line: "hsl(var(--amber-line) / <alpha-value>)",
        },
        // The accent chosen by an `.accent-*` parent.
        acc: {
          DEFAULT: "hsl(var(--acc) / <alpha-value>)",
          solid: "hsl(var(--acc-solid) / <alpha-value>)",
          fg: "hsl(var(--acc-fg) / <alpha-value>)",
          soft: "hsl(var(--acc-soft) / <alpha-value>)",
          line: "hsl(var(--acc-line) / <alpha-value>)",
        },
        grade: {
          0: "hsl(var(--grade-0) / <alpha-value>)",
          1: "hsl(var(--grade-1) / <alpha-value>)",
          2: "hsl(var(--grade-2) / <alpha-value>)",
          3: "hsl(var(--grade-3) / <alpha-value>)",
          4: "hsl(var(--grade-4) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["Instrument Serif", "ui-serif", "Georgia", "serif"],
      },
      maxWidth: { content: "1440px", prose: "68ch" },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-sweep": {
          "0%,100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
        "dash-flow": {
          to: { strokeDashoffset: "-24" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.8s infinite",
        "pulse-sweep": "pulse-sweep 2s ease-in-out infinite",
        "dash-flow": "dash-flow 1s linear infinite",
        marquee: "marquee 40s linear infinite",
        "spin-slow": "spin-slow 24s linear infinite",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // `colorful:` applies a class only in the colourful palette (html.colorful),
    // so a component can add hue without changing its monochrome look at all.
    // `.colorful` and `.dark` sit on the same element, so the combined case has
    // its own variant (`colorful:dark:` would look for one inside the other).
    function ({ addVariant }) {
      addVariant("colorful", ".colorful &");
      addVariant("colorful-dark", ".colorful.dark &");
      addVariant("mono", "html:not(.colorful) &");
      // `a11y:` applies only in the accessibility (large text) mode.
      addVariant("a11y", ".a11y &");
    },
  ],
};
