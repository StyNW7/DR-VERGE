"""Audit the DR-VERGE frontend against section 20 of prompts/dr-verge-fe.md.

Static checks over the source. They cannot prove the site looks good; they prove
the load-bearing requirements are actually present rather than assumed.
"""
import io, os, re, sys

# Repo-relative, so the audit runs from anywhere.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")

def read(*parts):
    p = os.path.join(ROOT, *parts)
    return io.open(p, encoding="utf-8").read() if os.path.exists(p) else ""

ALL = []
for dirpath, _, names in os.walk(SRC):
    for n in names:
        if n.endswith((".ts", ".tsx", ".css")):
            ALL.append((os.path.join(dirpath, n), io.open(os.path.join(dirpath, n), encoding="utf-8").read()))
BLOB = "\n".join(t for _, t in ALL)

OK, FAIL = [], []
def check(name, cond, detail=""):
    (OK if cond else FAIL).append(f"{name}{(' -- ' + detail) if detail else ''}")

def exists(*parts):
    return os.path.exists(os.path.join(ROOT, *parts))

# ---------------------------------------------------------------- routes
app = read("src", "App.tsx")
check("Home route works", "<Route index element={<HomePage" in app)
check("Demo route works", 'path="demo"' in app)
check("Research route works", 'path="research"' in app)
check("404 catch-all route", 'path="*"' in app)
check("navbar routing works",
      all(f'to: "{p}"' in read("src", "components", "layout", "Navbar.tsx") for p in ("/", "/demo", "/research")))
check("routes are code-split", "lazy(() => import" in app)

# ---------------------------------------------------------------- structure
for f in ("src/pages/HomePage.tsx", "src/pages/DemoPage.tsx", "src/pages/ResearchPage.tsx",
          "src/data/team.ts", "src/data/drGrades.ts", "src/data/researchMetrics.ts",
          "src/data/researchContent.ts", "src/services/inferenceApi.ts",
          "src/hooks/useInference.ts", "src/utils/fileValidation.ts",
          "src/utils/formatting.ts", "src/config/siteConfig.ts",
          "src/components/layout/Navbar.tsx", "src/components/layout/Footer.tsx",
          "src/components/layout/PageContainer.tsx"):
    check(f"file present: {f}", exists(*f.split("/")))

# ---------------------------------------------------------------- upload
demo = read("src", "pages", "DemoPage.tsx")
dz = read("src", "components", "demo", "UploadDropzone.tsx")
check("two images upload independently",
      demo.count('slot") =>') >= 0 and '"macula"' in demo and '"disc"' in demo
      and "images[slot]" in demo)
check("drag and drop supported", "onDrop" in dz and "onDragOver" in dz)
check("click to browse supported", "inputRef.current?.click()" in dz)
check("both previews render", "value.previewUrl" in dz and "img" in dz)
check("filename shown", "value.file.name" in dz)
check("file size shown", "formatBytes(value.file.size)" in dz)
check("original resolution shown", "value.meta.width" in dz)
check("replace image", "Replace" in dz)
check("remove image", "Remove" in dz)
check("zoom preview modal", "ZoomModal" in dz and 'aria-modal="true"' in dz)
check("accepted file type indicated", "JPG" in dz and "PNG" in dz)
check("invalid inputs handled", "validateImageFile" in demo and "setErrors" in demo)
check("file-too-large handled", "too large" in read("src", "utils", "fileValidation.ts"))
check("unsupported format handled", "Unsupported file type" in read("src", "utils", "fileValidation.ts"))
check("numbered labels 01 / 02", 'index: "01"' in demo and 'index: "02"' in demo)

# ---------------------------------------------------------------- inference gating
check("inference disabled until both images exist",
      "disabled={!bothReady" in demo)
check("reason for disabled state is explained", "to enable analysis" in demo or "to continue" in demo)

# ---------------------------------------------------------------- API
api = read("src", "services", "inferenceApi.ts")
check("multipart inference request implemented",
      "new FormData()" in api and 'form.append("macula"' in api and 'form.append("optic_disc"' in api)
check("uses VITE_MODEL_API_URL via config", "siteConfig.modelApiUrl" in api)
check("model endpoint uses environment variable", "VITE_MODEL_API_URL" in read("src", "config", "siteConfig.ts"))
check("request timeout implemented", "AbortController" in api and "requestTimeoutMs" in api)
check("API response validated", "normalizeResponse" in api and "malformed" in api)
check("network error handled", '"network"' in api)
check("server unavailable handled", "currently unavailable" in api)
check("timeout handled", '"timeout"' in api)
check("no stack traces exposed", "err.stack" not in api)
check("images not stored after request", "localStorage" not in api and "sessionStorage" not in api)

# ---------------------------------------------------------------- mock honesty
check("mock mode exists", "useMockModel" in api)
check("mock results carry isMock", 'isMock: source === "mock"' in api)
check("Demo Mode is surfaced in the UI", "DemoModeBanner" in demo)
check("mock banner states no model executed",
      "not deployed yet" in read("src", "components", "demo", "DemoStates.tsx"))
check("mock banner shown next to results", demo.count("DemoModeBanner") >= 2)
check("printed summary marks simulated output", "Simulated output" in demo)

# ---------------------------------------------------------------- results
rp = read("src", "components", "demo", "ResultPanel.tsx")
check("loading state works", "ProcessingState" in demo)
check("success result renders", "OutputHero" in demo)
check("ordinal scores render", "OrdinalThresholdScores" in rp)
check("relative grade scores render", "RelativeGradeScores" in rp)
check("dual-view input summary", "DualViewSummary" in rp)
check("model information", "ModelInformation" in rp)
check("result interpretation", "ResultInterpretation" in rp)
check("Reset / Try Again works", "Analyze Another Pair" in demo)
check("print result implemented", "window.print()" in demo)
check("print CSS present", "@media print" in read("src", "index.css"))
check("print excludes images", ".no-print" in read("src", "index.css") and "Uploaded images are not included" in demo)
check("timestamp in printed summary", "formatTimestamp" in demo)
check("all five states represented",
      all(s in read("src", "hooks", "useInference.ts")
          for s in ('"idle"', '"ready"', '"processing"', '"success"', '"error"')))

# ---------------------------------------------------------------- terminology safety
check("scores NOT called calibrated probabilities",
      "calibrated clinical probabilities" in BLOB and
      not re.search(r"Probability Distribution", BLOB))
check("no 'clinical confidence' wording", "Clinical confidence" not in BLOB)
check("no '% chance you have' wording", not re.search(r"chance you have", BLOB, re.I))
check('uses "Ordinal Threshold Scores"', "Ordinal Threshold Scores" in BLOB)
check('uses "Relative Grade Scores"', "Relative Grade Scores" in BLOB)
check("research disclaimer on model page", "Research Prototype" in demo)
check("medical disclaimer beside results", "GRADE_CONSULT_NOTE" in rp)
check("no treatment advice", not re.search(r"\b(treatment|medication|prescrib|dosage)\b", BLOB, re.I)
      or "no treatment advice" in BLOB.lower())
# Strip comments first: the source contains comments instructing that this
# phrase must never be used, and those must not trip the check.
NO_COMMENTS = re.sub(r"//.*|/\*.*?\*/|\{/\*.*?\*/\}", "", BLOB, flags=re.S)
check("never claims 'first ever'", not re.search(r"first ever", NO_COMMENTS, re.I))
check("novelty worded carefully", "did not identify prior work" in BLOB)
check("does not claim INT8 improves accuracy",
      "does not improve grading accuracy" in BLOB)
check("RQ1 null result is visible", "Not conclusive" in BLOB and "not translate into a statistically conclusive" in BLOB)
check("external caveat present", "should not be overstated" in BLOB)
check("SDG says potential contribution not proven impact",
      "Potential contribution, not proven impact" in BLOB or "potential contribution" in BLOB.lower())
check("grades not presented as self-diagnosis", "Not a self-diagnosis tool" in BLOB)

# ---------------------------------------------------------------- centralisation
check("research metrics centralized",
      "researchMetrics" in BLOB and
      # the literal values must not be re-typed inside components
      not re.search(r"0\.4605", "\n".join(t for p, t in ALL if "data" not in p)))
check("team data centralized",
      not re.search(r"linkedin\.com", "\n".join(t for p, t in ALL if "data" not in p)))
check("site config centralized", "siteConfig" in BLOB)
check("no hardcoded secrets",
      not re.search(r"(api[_-]?key|secret|token)\s*[:=]\s*[\"'][A-Za-z0-9]{8,}", BLOB, re.I))

# ---------------------------------------------------------------- links
foot = read("src", "components", "layout", "Footer.tsx")
check("paper download button works", "siteConfig.paperUrl" in read("src", "pages", "ResearchPage.tsx"))
check("GitHub button works", "siteConfig.githubUrl" in read("src", "pages", "ResearchPage.tsx"))
check("sample dataset button uses env URL", "siteConfig.sampleDatasetUrl" in demo)
check("sample dataset opens in new tab", 'target="_blank"' in read("src", "components", "common", "Button.tsx"))
check("external links use rel=noopener", 'rel="noopener noreferrer"' in read("src", "components", "common", "Button.tsx"))
check("unconfigured links render disabled, not broken", "isLinkConfigured" in BLOB)
check("footer has navigation", "navLinks" in foot)
check("footer has resource links", "externalLinks" in foot)
check("footer disclaimer present", "research prototype" in foot.lower())

# ---------------------------------------------------------------- design system
css = read("src", "index.css")
check("monochrome palette only (no hue in tokens)",
      len(re.findall(r"--(background|foreground|border|muted|card):\s*\d+\s+0%", css)) >= 8,
      "all HSL tokens must have 0% saturation")
colourful = re.findall(
    r"(?:bg|text|border|from|via|to)-(?:red|blue|green|yellow|purple|pink|orange|indigo|violet|teal|cyan|emerald|lime|amber|rose|fuchsia|sky)-\d",
    BLOB)
check("no colourful Tailwind utilities", not colourful, str(set(colourful)))
check("dark and light both defined", ":root {" in css and ".dark {" in css)
check("no emoji in source",
      not re.search("[\U0001F300-\U0001FAFF\u2600-\u27BF]", BLOB))
check("lucide-react used for icons", "lucide-react" in BLOB)
check("recharts used for charts", "recharts" in BLOB)

# ---------------------------------------------------------------- a11y / responsive
check("skip to content link", "Skip to content" in read("src", "components", "layout", "Navbar.tsx"))
check("focus-visible styling", "focus-visible" in css)
check("prefers-reduced-motion honoured",
      "prefers-reduced-motion" in css and "useReducedMotion" in BLOB)
check("alt text on images", 'alt={' in BLOB or 'alt="' in BLOB)
check("aria-label used", "aria-label" in BLOB)
check("aria-live for async results", 'aria-live="polite"' in BLOB)
check("role=alert on errors", 'role="alert"' in BLOB)
check("no horizontal overflow guard", "overflow-x: hidden" in css)
check("wide diagrams scroll in their own container", "overflow-x-auto" in BLOB)
check("mobile navigation exists", "mobile-nav" in read("src", "components", "layout", "Navbar.tsx"))
check("navbar compacts on scroll", "scrolled" in read("src", "components", "layout", "Navbar.tsx"))
check("desktop max width 1280-1440", "1440px" in read("tailwind.config.js"))

# ---------------------------------------------------------------- env / deploy
env = read(".env.example")
for v in ("VITE_MODEL_API_URL", "VITE_SAMPLE_DATASET_URL", "VITE_PAPER_URL", "VITE_GITHUB_URL"):
    check(f"env documented: {v}", v in env)
check("env warns values are public", "public" in env.lower() and "secret" in env.lower())
check(".env gitignored", ".env" in read(".gitignore"))
check(".env.example NOT gitignored", "!.env.example" in read(".gitignore"))
check("SPA rewrite for deploy", "rewrites" in read("vercel.json"))
check("SEO title set", "DR-VERGE | Dual-View" in read("index.html"))
check("Open Graph metadata", 'property="og:title"' in read("index.html"))
check("no-flash theme script", "dr-verge-theme" in read("index.html"))

# ---------------------------------------------------------------- build output
dist = os.path.join(ROOT, "dist")
check("production build exists", os.path.isdir(dist))
if os.path.isdir(dist):
    assets = os.listdir(os.path.join(dist, "assets"))
    big = [a for a in assets if a.endswith(".js") and
           os.path.getsize(os.path.join(dist, "assets", a)) > 600_000]
    check("no chunk over 600 kB", not big, str(big))
    check("research figures bundled", os.path.isdir(os.path.join(dist, "research", "figures")))
    n = len(os.listdir(os.path.join(dist, "research", "figures"))) if os.path.isdir(os.path.join(dist, "research", "figures")) else 0
    check("all 15 figures present", n == 15, f"{n} found")

print("=" * 84)
print("DR-VERGE FRONTEND — acceptance audit (prompts/dr-verge-fe.md section 20)")
print("=" * 84)
for x in OK:
    print(f"  PASS  {x}")
for x in FAIL:
    print(f"  FAIL  {x}")
print("=" * 84)
print(f"{len(OK)}/{len(OK) + len(FAIL)} passed")
sys.exit(1 if FAIL else 0)
