"""Detect use-before-assignment INSIDE a function -- the UnboundLocalError class of bug.

compile() does not catch it (it is a runtime error, not a syntax error) and nameorder_check.py only
looks at module scope, which is why `conf` shipped broken.

Precision matters or the report is noise: names bound by comprehensions, for-targets, `with ... as`,
`except ... as`, lambda/nested-function parameters and walrus all live in their own scope or are
bound before the loop body runs, so they are excluded. What remains is a plain local read on a line
strictly before its only binding, at the same statement nesting level.
"""
import json, ast, sys

def inner_scopes(node):
    """Names bound in a scope that is NOT the function body proper."""
    out = set()
    for n in ast.walk(node):
        if isinstance(n, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
            for g in n.generators:
                for t in ast.walk(g.target):
                    if isinstance(t, ast.Name): out.add(t.id)
        elif isinstance(n, (ast.Lambda, ast.FunctionDef, ast.AsyncFunctionDef)):
            a = n.args
            for x in list(a.args) + list(a.kwonlyargs) + list(getattr(a, "posonlyargs", [])):
                out.add(x.arg)
            if a.vararg: out.add(a.vararg.arg)
            if a.kwarg:  out.add(a.kwarg.arg)
            if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)): out.add(n.name)
        elif isinstance(n, (ast.For, ast.AsyncFor)):
            for t in ast.walk(n.target):
                if isinstance(t, ast.Name): out.add(t.id)
        elif isinstance(n, ast.With):
            for it in n.items:
                if it.optional_vars:
                    for t in ast.walk(it.optional_vars):
                        if isinstance(t, ast.Name): out.add(t.id)
        elif isinstance(n, ast.ExceptHandler) and n.name:
            out.add(n.name)
        elif isinstance(n, ast.NamedExpr):
            for t in ast.walk(n.target):
                if isinstance(t, ast.Name): out.add(t.id)
    return out

def scan(nb_path):
    CODE = ["".join(c["source"]) for c in json.load(open(nb_path, encoding="utf-8"))["cells"]
            if c["cell_type"] == "code"]
    bad = []
    for ci, src in enumerate(CODE):
        s = "\n".join(l for l in src.splitlines() if not l.lstrip().startswith(("!", "%")))
        try: tree = ast.parse(s)
        except SyntaxError: continue
        for fn in [n for n in ast.walk(tree)
                   if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]:
            skip = inner_scopes(fn)
            params = {a.arg for a in list(fn.args.args) + list(fn.args.kwonlyargs)
                      + list(getattr(fn.args, "posonlyargs", []))}
            if fn.args.vararg: params.add(fn.args.vararg.arg)
            if fn.args.kwarg:  params.add(fn.args.kwarg.arg)
            globals_ = {t for n in ast.walk(fn) if isinstance(n, ast.Global) for t in n.names}
            binds = {}
            for n in ast.walk(fn):
                if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store):
                    binds.setdefault(n.id, []).append(n.lineno)
            for n in ast.walk(fn):
                if not (isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load)): continue
                if n.id in params or n.id in globals_ or n.id in skip: continue
                lines = binds.get(n.id)
                if lines and n.lineno < min(lines):
                    bad.append((ci, fn.name, n.id, n.lineno, min(lines)))
    return bad

rc = 0
for p in sys.argv[1:]:
    b = scan(p)
    name = p.split("/")[-1].split("\\")[-1]
    if b:
        rc = 1
        print(f"!! {name}: {len(b)} use-before-assignment site(s)")
        for ci, fn, nm, used, asg in b:
            print(f"     cell {ci:>2}  {fn}()  reads `{nm}` at line {used}, bound at {asg}")
    else:
        print(f"OK  {name}: no use-before-assignment inside any function")
sys.exit(rc)
