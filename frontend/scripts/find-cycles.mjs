/**
 * Detect circular imports in src/.
 *
 * A cycle is usually harmless in dev, where Vite serves modules individually and
 * evaluation order follows the request order. In a production rollup bundle the
 * modules are concatenated in a fixed order, so one side of a cycle can read a
 * binding before it is initialised — which surfaces as a component that is
 * `undefined` at render time (React error #130) with no build warning at all.
 *
 * Type-only imports are ignored: they are erased before bundling and cannot
 * participate in a runtime cycle.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "src";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(p.split(path.sep).join("/"));
  }
  return out;
}

function resolve(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = "src/" + spec.slice(2);
  else if (spec.startsWith(".")) base = path.posix.join(path.posix.dirname(from), spec);
  else return null;
  for (const c of [base + ".tsx", base + ".ts", base + "/index.tsx", base + "/index.ts"]) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const files = walk(SRC);
const graph = Object.create(null);

for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  graph[f] = [];
  // Value imports only. `import type {...}` and `import { type X }` are erased.
  const re = /import\s+(?!type[\s{])([^;]*?)from\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    const target = resolve(f, m[2]);
    if (target && target !== f) graph[f].push(target);
  }
}

const WHITE = 0, GREY = 1, BLACK = 2;
const state = Object.create(null);
const cycles = [];

function dfs(node, stack) {
  state[node] = GREY;
  stack.push(node);
  for (const next of graph[node] ?? []) {
    if (state[next] === GREY) {
      cycles.push([...stack.slice(stack.indexOf(next)), next]);
    } else if (state[next] !== BLACK) {
      dfs(next, stack);
    }
  }
  stack.pop();
  state[node] = BLACK;
}

for (const f of files) if (!state[f]) dfs(f, []);

if (cycles.length === 0) {
  console.log("No circular imports found.");
  process.exit(0);
}

console.log(`${cycles.length} circular import chain(s):\n`);
for (const c of cycles) console.log("  " + c.join("\n    -> ") + "\n");
process.exit(1);
