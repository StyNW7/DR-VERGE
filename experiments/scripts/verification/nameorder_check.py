"""Cross-cell name resolution check.

The blocker rev-final-2 found was structural, not syntactic: a name was `del`-ed at the end of one
cell and still referenced by a later cell, so every code cell compiled and Run All died at runtime.
This walks the notebook in execution order and reports

  A. global names referenced anywhere but never bound in ANY cell   -> guaranteed NameError
  B. names deleted in one cell and referenced by a later cell       -> the exact rev-final-2 bug
  C. names read at MODULE level before any earlier cell binds them  -> forward reference; the cell
     runs top-to-bottom, so unlike a function body this fails immediately on Run All
"""
import ast, builtins, json, symtable, sys
from collections import defaultdict

NB = sys.argv[1] if len(sys.argv) > 1 else "DR-VERGE_full_pipeline_final.ipynb"
nb = json.load(open(NB, encoding="utf-8"))
cells = [c for c in nb["cells"] if c["cell_type"] == "code"]
srcs = ["\n".join(l for l in "".join(c["source"]).splitlines()
                  if not l.lstrip().startswith(("!", "%"))) for c in cells]

BUILTINS = set(dir(builtins)) | {"__name__", "__file__", "__doc__", "_", "__builtins__"}

def referenced_globals(src):
    """Names a cell reads from module scope (module-level reads + globals read inside functions)."""
    out = set()
    def walk(tbl, top):
        for sym in tbl.get_symbols():
            n = sym.get_name()
            if top:
                if sym.is_referenced() and not (sym.is_assigned() or sym.is_imported()):
                    out.add(n)
            else:
                # only true module-global reads; is_free() means a CLOSURE variable from an
                # enclosing function, which is not a cross-cell dependency at all
                if sym.is_referenced() and sym.is_global() and n != "__class__":
                    out.add(n)
        for child in tbl.get_children():
            walk(child, False)
    walk(symtable.symtable(src, "<cell>", "exec"), True)
    return out

def module_level_reads(src):
    """Names the cell needs BY THE TIME IT FINISHES RUNNING.

    Two sources, because a cell fails on Run All in both cases:
      1. names read directly at the cell's top level;
      2. globals read inside a function that this same cell both defines AND calls at top level --
         e.g. `def _score_val(): ... _predict_cpu_all(...)` followed by `_score_val(...)`. The
         function body is a legitimate forward reference at DEFINITION time, but the call happens
         immediately, so a later-defined global still raises NameError.
    """
    tbl = symtable.symtable(src, "<cell>", "exec")
    out = {sym.get_name() for sym in tbl.get_symbols()
           if sym.is_referenced() and not (sym.is_assigned() or sym.is_imported())}

    tree = ast.parse(src)
    called_at_top = set()
    for node in tree.body:                      # top level only
        for sub in ast.walk(node):
            if isinstance(sub, ast.Call) and isinstance(sub.func, ast.Name):
                called_at_top.add(sub.func.id)
    funcs = {c.get_name(): c for c in tbl.get_children() if c.get_type() == "function"}

    seen, queue = set(), [n for n in called_at_top if n in funcs]
    while queue:                                 # follow helper -> helper chains
        fname = queue.pop()
        if fname in seen: continue
        seen.add(fname)
        blk = funcs.get(fname)
        if blk is None: continue
        for sym in blk.get_symbols():
            if sym.is_referenced() and sym.is_global():
                out.add(sym.get_name())
                if sym.get_name() in funcs:
                    queue.append(sym.get_name())
    return out

def bound_names(src):
    out = set()
    def walk(tbl, top):
        for sym in tbl.get_symbols():
            if top and (sym.is_assigned() or sym.is_imported() or sym.is_parameter()):
                out.add(sym.get_name())
            if not top and sym.is_global() and sym.is_assigned():
                out.add(sym.get_name())          # `global x; x = ...` inside a function
        for child in tbl.get_children():
            walk(child, False)
    walk(symtable.symtable(src, "<cell>", "exec"), True)
    return out

def deleted_names(src):
    out = set()
    for node in ast.walk(ast.parse(src)):
        if isinstance(node, ast.Delete):
            for t in node.targets:
                if isinstance(t, ast.Name):
                    out.add(t.id)
    return out

ALL_BOUND = set()
for s in srcs:
    ALL_BOUND |= bound_names(s)

problems_a, problems_b, problems_c = [], [], []
live = set()                      # names currently bound, in execution order
deleted_at = {}                   # name -> cell index where it was last deleted

for i, s in enumerate(srcs):
    refs, binds, dels = referenced_globals(s), bound_names(s), deleted_names(s)

    for n in sorted(refs):
        if n in BUILTINS or n in ALL_BOUND:
            pass
        else:
            problems_a.append((i, n))
        if n in deleted_at and n not in live and n not in binds:
            problems_b.append((i, n, deleted_at[n]))

    for n in sorted(module_level_reads(s) - BUILTINS - binds):
        if n in ALL_BOUND and n not in live:
            problems_c.append((i, n))

    live |= binds
    for n in binds:
        deleted_at.pop(n, None)
    for n in dels:
        live.discard(n)
        deleted_at[n] = i

print("=" * 84)
print(f"CROSS-CELL NAME RESOLUTION -> {NB}  ({len(srcs)} code cells)")
print("=" * 84)

if problems_a:
    print("\nA. referenced but NEVER bound in any cell (guaranteed NameError):")
    for i, n in problems_a:
        print(f"   cell {i:>2}: {n}")
else:
    print("  A. every referenced global is bound somewhere            OK")

if problems_b:
    print("\nB. DELETED in an earlier cell, then referenced again (the rev-final-2 blocker):")
    for i, n, j in problems_b:
        print(f"   cell {i:>2} uses `{n}`, deleted in cell {j}")
else:
    print("  B. no name is used after being deleted                   OK")

if problems_c:
    print(chr(10) + "C. read at MODULE level before any earlier cell defines them (Run All fails here):")
    for i, n in problems_c:
        print(f"   cell {i:>2}: {n}")
else:
    print("  C. no module-level forward references                    OK")

print("=" * 84)
if problems_a or problems_b or problems_c:
    raise SystemExit(1)
print("clean")
