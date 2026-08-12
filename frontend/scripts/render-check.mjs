/**
 * Render the real app once, in Node, to find components that resolve to
 * `undefined`.
 *
 * A production React build reports only "Minified React error #130" and does
 * not say which element was invalid. This bundles the same source graph with
 * `NODE_ENV=development` and no minification, then mounts it under jsdom, so
 * React's development build names the offending component.
 *
 * Bundling as a single IIFE deliberately removes code splitting: if this passes
 * but the production build fails, the fault is in chunking rather than in a
 * component.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { JSDOM } from "jsdom";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "drverge-render-"));
// The entry has to live inside the project so that bare imports such as "react"
// resolve against its node_modules.
const entry = path.join(root, ".render-entry.jsx");

fs.writeFileSync(
  entry,
  `import React from "react";
   import { createRoot } from "react-dom/client";
   import App from "@/App";
   const el = document.createElement("div");
   el.id = "root";
   document.body.appendChild(el);
   createRoot(el).render(React.createElement(App));
  `,
);

await build({
  root,
  configFile: false,
  logLevel: "error",
  resolve: { alias: { "@": path.resolve(root, "src") } },
  plugins: [(await import("@vitejs/plugin-react")).default()],
  define: { "process.env.NODE_ENV": '"development"' },
  build: {
    outDir,
    emptyOutDir: false,
    minify: false,
    cssCodeSplit: false,
    lib: { entry, formats: ["iife"], name: "DRVergeTest", fileName: () => "bundle.js" },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});

fs.rmSync(entry, { force: true });
const code = fs.readFileSync(path.join(outDir, "bundle.js"), "utf8");

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
  runScripts: "outside-only",
});
const { window } = dom;
window.matchMedia = (q) => ({
  matches: false, media: q, onchange: null,
  addListener() {}, removeListener() {},
  addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
});
class Obs { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
window.IntersectionObserver = Obs;
window.ResizeObserver = Obs;
window.scrollTo = () => {};

const problems = [];
const origError = window.console.error;
window.console.error = (...args) => {
  const text = args.map(String).join(" ");
  if (/Element type is invalid|is not defined|Cannot read/.test(text)) problems.push(text);
  origError.call(window.console, ...args);
};

try {
  window.eval(code);
} catch (err) {
  problems.push(String(err?.stack ?? err));
}

// createRoot().render() is concurrent, so the tree is not committed
// synchronously. Give React a few macrotasks to flush before inspecting.
for (let i = 0; i < 20; i += 1) await new Promise((r) => setTimeout(r, 25));

fs.rmSync(outDir, { recursive: true, force: true });

const html = window.document.getElementById("root")?.innerHTML ?? "";

if (problems.length === 0) {
  // A silent empty render is not a pass: it usually means the tree never
  // committed and the check proved nothing.
  if (html.length < 500) {
    console.error(`FAIL — app produced almost no markup (${html.length} chars).`);
    console.error("        The tree did not commit, so nothing was verified.");
    process.exit(1);
  }
  console.log(`PASS — app rendered (${html.length} chars of markup)`);
  process.exit(0);
}

console.error("FAIL — render problems:\n");
for (const p of problems.slice(0, 3)) console.error(p.split("\n").slice(0, 12).join("\n") + "\n");
process.exit(1);
