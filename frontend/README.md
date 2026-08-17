# DR-VERGE — Research Showcase Website

Frontend for **DR-VERGE** (View-Evidence Relational Grading Engine): dual-view diabetic
retinopathy grading through Complementarity-Shift Distillation and lightweight INT8
deployment. Built for **GEMASTIK XIX**, Karya Tulis Ilmiah TIK.

React · Vite · TypeScript · TailwindCSS · React Router · Recharts · lucide-react ·
Framer Motion. Frontend only — no backend, no database, no authentication.

---

## Quick start

```bash
npm install
cp .env.example .env      # optional; the demo runs without it
npm run dev               # http://localhost:5173
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Type-check then production build |
| `npm run preview` | Serve the production build |
| `npm run verify` | Inference-client contract tests (21 checks) |
| `npm run verify:model` | Model artifact checks (14 checks) |
| `npm run render-check` | Mounts the real app under jsdom in a dev build |
| `npm run cycles` | Detects circular imports |
| `npm run check` | All of the above |
| `npm run lint` | ESLint |
| `python scripts/audit-acceptance.py` | Acceptance audit against the spec (128 checks) |

---

## The model runs for real, in the browser

The exported DR-VERGE student ships with the site and is executed **client-side** with
`onnxruntime-web`. There is no server, no API key, and **no image ever leaves the
visitor's machine**.

```
public/models/best_student_fp32/
├── model.onnx        graph
├── model.onnx.data   external tensor data — required, the graph alone is inert
└── metadata.json     preprocessing constants and decision threshold
```

Two details make this faithful rather than merely functional:

- **Preprocessing constants are read from `metadata.json`**, not hardcoded in the client.
  If the exported model changes, the client follows it automatically.
- **The grade is the count of CORAL thresholds passed**, never an argmax — the same rule
  the notebook uses.

**Verified against the research.** Running this exact ONNX artifact over all 200 DeepDRiD
Set-C eyes produced **QWK 0.7307** against the notebook's **0.7298** for the same seed.
The 0.0009 gap is attributable to image resampling (PIL vs cv2), which confirms the
browser pipeline reproduces the experiment rather than approximating it.

`npm run verify:model` checks the artifacts are present and coherent — including that
`model.onnx.data` exists, since `model.onnx` is only ~190 kB of graph and silently
produces nothing without its sidecar.

### Mock mode still exists, as a fallback

If the model fails to load, the client can fall back to a clearly-labelled mock. A mock
result is **never** presentable as a real one: every response carries a `source` field
(`"onnx-local"` / `"model-api"` / `"mock"`) and an `isMock` flag, and mock output is
badged in six separate places in the UI. `npm run verify` asserts this rather than
assuming it.

---

## Environment variables

Every `VITE_*` value is **inlined into the browser bundle** and is therefore public.
Never put an API key or any other secret here. The inference endpoint must be public and
protected server-side (rate limiting / gateway).

| Variable | Purpose | Default when unset |
|---|---|---|
| `VITE_MODEL_API_URL` | Optional remote endpoint; `multipart/form-data` with `macula` and `optic_disc` | empty → the bundled in-browser ONNX model is used |
| `VITE_USE_MOCK_MODEL` | Force mock on/off | off — the local model is tried first |
| `VITE_SAMPLE_DATASET_URL` | Downloadable sample dual-view pairs | button renders disabled |
| `VITE_PAPER_URL` | Paper PDF | button renders disabled |
| `VITE_GITHUB_URL` | Repository | link renders as "soon" |
| `VITE_INSTITUTION` | Shown in footer/metadata | `BINUS University` |
| `VITE_REQUEST_TIMEOUT_MS` | Inference timeout | `45000` |

Unconfigured links render **visibly disabled** rather than as anchors that go nowhere.

### Expected API response

```json
{
  "success": true,
  "prediction": { "grade": 2, "grade_name": "Moderate NPDR" },
  "ordinal_scores": [0.91, 0.76, 0.32, 0.08],
  "grade_scores": [0.09, 0.15, 0.44, 0.24, 0.08],
  "uncalibrated_score": 0.44,
  "model": { "name": "DR-VERGE", "version": "1.0", "variant": "FT-PTQ INT8", "quantization": "INT8" },
  "runtime": { "latency_ms": 6.22 },
  "disclaimer": "Research prototype; not a standalone clinical diagnosis."
}
```

Only `prediction.grade` is required. Every other field is optional and degrades to an
em dash or a hidden panel — verified by `npm run verify`, which asserts that a response
containing nothing but a grade still renders, that non-finite scores are dropped, and
that malformed bodies produce a readable message rather than a crash.

---

## Structure

```
src/
├── components/
│   ├── layout/      Navbar (sticky, compacts on scroll), Footer, PageContainer, Seo
│   ├── common/      Button, Primitives (Badge/Callout/MetricCard/Reveal/ScoreBar/Skeleton),
│   │                MonoChart, LazyChart, Diagrams, FundusIllustration, ResearchFigure
│   ├── home/        Hero, Problem, TwoViews, Csd, Metrics, Rq1, Rq2, Sdg, Pipeline, Team, Cta
│   ├── demo/        UploadDropzone, ResultPanel, DemoStates
│   └── research/    ResearchSections
├── pages/           HomePage, DemoPage, ResearchPage, Utility/NotFound404
├── data/            researchMetrics · drGrades · team · researchContent
├── services/        inferenceApi (routing + contract) · onnxModel (in-browser inference)
├── hooks/           useInference
├── utils/           fileValidation · formatting
└── config/          siteConfig
```

**Every research number lives in `src/data/`.** No component contains a hardcoded metric,
so updating results is a single-file edit. The audit enforces this — it fails if a metric
value such as `0.3759` appears outside `src/data/`.

All site content is sourced from the **enhanced run** (`artifacts_enhanced_v1_20260811`),
the same run the paper uses. `researchMetrics.ts` records its provenance explicitly so the
numbers on screen can be traced back to the run that produced them.

---

## Design system

Strictly monochrome. Every HSL token has **0% saturation**; the audit fails if any
colourful Tailwind utility (`bg-red-500`, `text-blue-600`, …) appears anywhere in `src/`.

| | Light | Dark |
|---|---|---|
| Background | `#FFFFFF` | `#000000` |
| Surface | `#FAFAFA` / `#F5F5F5` | `#111111` / `#1A1A1A` |
| Border | `#E5E5E5` | `#262626` |
| Muted text | `#737373` | `#A3A3A3` |

Light and dark are exact inversions, so a component written once reads correctly in both.
Emphasis is carried by **fill and weight**, never by hue — charts distinguish the proposed
method from baselines with fill opacity, and the "medical" callout uses a heavier left
rule rather than a red box. Theme is applied before first paint by an inline script, so
dark-mode visitors never see a white flash.

**No emoji anywhere** — all icons are `lucide-react`, enforced by the audit.

### Imagery

- **Original SVG diagrams** — schematic fundus anatomy (macula-centered vs
  optic-disc-centered, with the field-of-view ring on the structure each is centred on),
  the dual-field overlap, the architecture, and the CSD shift. Drawn in `currentColor`, so
  they invert with the theme and stay sharp at any size.
- **15 real research figures** from the DR-VERGE evaluation run, converted to grayscale
  and downscaled (≈1 MB total, lazy-loaded). They are inverted in dark mode — lossless for
  a grayscale image, and it turns a glaring white matplotlib canvas into a native-looking
  dark chart. A figure that fails to load shows a labelled placeholder, not a broken image.

The fundus diagrams are **stylised anatomical illustrations**, not photographs and not any
real patient's retina.

---

## Research-safety rules

These are enforced by the acceptance audit, not just by convention:

- Model outputs are **"Ordinal Threshold Scores"** and **"Relative Grade Scores"** — never
  "probability distribution", "clinical confidence", or "93% chance you have DR".
- **CSD "transfers a decision-shift pattern"** — it is never said to "understand anatomical
  complementarity".
- **RQ1's null result is given equal visual weight to its positive one.** The mechanism
  finding and "did not translate into a statistically conclusive in-domain QWK
  improvement" sit side by side, in matching cards, on both the home and research pages.
- **INT8 reduces cost; it is never said to improve accuracy.**
- Novelty is *"based on the literature reviewed in this study, we did not identify prior
  work…"* — never "the first ever".
- SDG 3 is a **"potential contribution"**, never "proven impact".
- The abstract is flagged **Draft** until the real paper text replaces it.
- The limitations section lists all eight limitations in full, including the ones that
  weaken the headline result.
- "Research prototype · not for clinical use" appears in the nav, the demo hero, beside the
  results, in the printed summary, and in the footer.

---

## Verification

| Check | Result |
|---|---|
| `tsc -b` type-check | clean |
| `npm run build` | passes, no chunk over 600 kB |
| `npm run cycles` — circular imports | none |
| `npm run render-check` — real app under jsdom | **PASS** |
| `npm run verify` — inference contract | **21/21** |
| `npm run verify:model` — model artifacts | **14/14** |
| `scripts/audit-acceptance.py` — spec section 20 | **128/128** |

Two of these are worth understanding.

`npm run verify` bundles `inferenceApi.ts` and runs it in Node, asserting that partial and
malformed responses degrade gracefully, that error messages never leak internals, and that
**every mock result is flagged as mock**. A demo that silently presents fabricated numbers
as real inference would be the worst failure this site could have, so it is tested rather
than assumed.

`npm run render-check` exists because of a real production bug. A component list fell out
of sync with the data array it indexed, and since **TypeScript does not check array index
access**, the build emitted no warning — the deployed site died with a minified React
error #130 that names no component. This check bundles the app in development mode and
mounts it under jsdom, so React reports the offending component by name. It also refuses
to pass on an empty render, because a silent empty tree proves nothing.

### Bundle

| Chunk | gzip |
|---|---|
| `react-vendor` | 58 kB |
| `motion` | 39 kB |
| `index` | 33 kB |
| `charts` (recharts, deferred) | 108 kB |
| `icons` | 6 kB |
| CSS | 8 kB |

Recharts is larger than the rest of the application combined and every chart sits below
the fold, so it is lazy-loaded behind a correctly-sized skeleton — first paint does not
wait for it.

---

## Deploy

Vercel-ready. `vercel.json` already rewrites all paths to `/` for client-side routing.

```
Build command:      npm run build
Output directory:   dist
Install command:    npm install
```

Set the `VITE_*` variables in the deployment environment. They are public by nature —
put no secrets in them.

---

## Accessibility

Skip-to-content link · visible high-contrast focus rings · keyboard-operable dropzones
(they are real `<button>`s, so drag-and-drop is an enhancement rather than the only way
in) · `aria-live` result announcements including a spoken score summary · `role="alert"`
errors · labelled SVG diagrams · `prefers-reduced-motion` honoured throughout · no
horizontal overflow at any width from 375 px up (wide diagrams scroll inside their own
container).

---

DR-VERGE is a research prototype and is not intended for standalone clinical diagnosis.
Model outputs are research artifacts and must not replace evaluation by qualified
healthcare professionals.
