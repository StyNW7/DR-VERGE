# 🖼️ docs/screenshots/

[🇮🇩 Bahasa Indonesia](README.md) · **🇬🇧 English**

Screenshots of the DR-VERGE web prototype used in the main README. Every image is available in both interface languages:

```text
docs/screenshots/
├── id/    Bahasa Indonesia interface  → used in README.md
└── en/    English interface           → used in README.en.md
```

| File | Contents |
|---|---|
| `hero-light-dark.webp` | Banner: Home in light mode (left) and dark mode (right) |
| `hero-light.webp` · `hero-dark.webp` | Home, Colorful palette |
| `hero-mono-light.webp` · `hero-mono-dark.webp` | Home, Monochrome palette |
| `home-<section>-<mode>.webp` | Home sections: `problem`, `two-views`, `csd`, `pipeline`, `findings`, `rq1`, `rq2`, `sdg`, `team` |
| `demo-upload-light.webp` | Demo, step 1 — choosing a dual-view pair |
| `demo-result-light.webp` · `demo-result-dark.webp` | Demo, step 3 — a real inference result (sample p24-R) |
| `demo-detail-light.webp` | Result details: threshold scores, per-grade scores, reference comparison |
| `research-*.webp` | Research page |
| `mobile-light.webp` · `mobile-dark.webp` | Mobile view (390 × 844) |

**How they were made:** headless Chrome via the Chrome DevTools Protocol, a 1440 × 900 viewport (mobile 390 × 844), `prefers-reduced-motion: reduce` so animations render in their final state, WebP format. The demo results come from the real ONNX model running in the browser, not mock data.
