"""Behavioural checks on DR-VERGE_enhanced.ipynb.

The compile / name-order / unbound checks prove the notebook RUNS. These check that it runs in the
order the method requires -- which is the class of bug that does not crash.
"""
import json, sys, re, io

NB = sys.argv[1] if len(sys.argv) > 1 else "DR-VERGE_enhanced.ipynb"
cells = json.load(io.open(NB, encoding="utf-8"))["cells"]
code = [("".join(c["source"]), i) for i, c in enumerate(cells) if c["cell_type"] == "code"]
FULL = "\n".join(src for src, _ in code)

def pos(pat, label=None, must=True):
    """A monotone (cell, offset) position for the first source match -- comparable across cells,
    and still ordered correctly when two milestones live in the SAME cell (Stage A and the freeze
    it performs are deliberately one cell)."""
    for src, i in code:
        m = re.search(pat, src, re.M)
        if m:
            return (i, m.start())
    if must: FAIL.append(f"pattern never found: {label or pat}")
    return None

OK, FAIL = [], []
def check(name, cond, detail=""):
    (OK if cond else FAIL).append(f"{name}{(' -- ' + detail) if detail else ''}")

# ---------------------------------------------------------------- 1. ordering
p_stageA   = pos(r"Stage A: recipe selection on VALIDATION only", "Stage A")
p_freeze   = pos(r"recipe FROZEN:", "recipe freeze")
p_pretrain = pos(r"^R50_CKPT\s*=\s*pretrain_backbone", "backbone pretraining call")
p_teacher  = pos(r"^TEACHER_CKPT\s*=\s*train_teacher", "teacher training call")
p_gate3    = pos(r"Gate3_TeacherDualView", "Gate 3")
p_scale    = pos(r"^CSD_SCALE\s*=", "CSD scale")
p_grids    = pos(r"GRID_KD\s*=", "logit-KD grid")
p_thresh   = pos(r"THRESHOLDS, _thr_rows", "threshold calibration")
p_select   = pos(r"BEST_CONDITION\s*=", "model selection")
p_test     = pos(r"^evaluate\(TEACHER", "internal test evaluation")
p_ext      = pos(r"ext_models = \[", "external evaluation")
p_audit    = pos(r"Gate12b_ResultsConsistent", "results audit")

order = [("Stage A", p_stageA), ("freeze", p_freeze), ("pretrain", p_pretrain),
         ("teacher", p_teacher), ("Gate3", p_gate3), ("CSD scale", p_scale),
         ("grids", p_grids), ("threshold", p_thresh), ("selection", p_select),
         ("test", p_test), ("external", p_ext), ("audit", p_audit)]
for (na, a), (nb, b) in zip(order, order[1:]):
    check(f"order: {na} before {nb}", a is not None and b is not None and a < b,
          f"{a} vs {b}")

# ---------------------------------------------------------------- 2. Stage A needs no teacher
sa = next(src for src, i in code if i == p_stageA[0])
check("Stage A trains with no distillation term",
      re.search(r'train_student\(f"stageA_\{_res\}_\{_samp\}", sd, view="dual"\)', sa) is not None,
      "must not pass alpha/beta/gamma -- the teacher does not exist yet")
check("Stage A pretrains the backbone at its own resolution",
      "LIGHT_CKPT = pretrain_backbone" in sa)
check("Stage A scores on validation only",
      "VAL_CSV" in sa and "TEST_CSV" not in sa, "the test set must play no part in recipe choice")

# ---------------------------------------------------------------- 3. checkpoints keyed by recipe
check("backbone checkpoint path carries the resolution",
      'backbone_{kind}_{IMG_SIZE}.pt' in FULL)
check("backbone reuse config carries the resolution",
      re.search(r"expect_config=dict\(kind=kind, img_size=IMG_SIZE", FULL) is not None)
check("teacher checkpoint path carries the recipe",
      'teacher_{IMG_SIZE}_{SAMPLING}.pt' in FULL)
check("teacher reuse config carries the recipe",
      re.search(r"cfg = dict\(cfg, img_size=IMG_SIZE, sampling=SAMPLING\)", FULL) is not None)

# ---------------------------------------------------------------- 4. one place decides a grade
bad = [m for m in re.findall(r"\(p[a-z_]*\s*>\s*0\.5\)\.sum\(1\)", FULL)]
check("no hand-rolled '> 0.5' grade decision outside grade_from",
      len(bad) <= 1, f"found {len(bad)}: {bad}")   # the APTOS pretrain probe is allowed
check("grade_from exists and defaults to the calibrated threshold",
      "def grade_from(p_cum, t=None)" in FULL and "t = DECISION_THRESHOLD if t is None else t" in FULL)

# ---------------------------------------------------------------- 5. threshold is chosen AND used
check("threshold calibrated on validation only",
      "def calibrate_threshold" in FULL and "VAL_LOADER" in FULL and
      "TEST" not in re.sub(r"#.*", "", next(src for src, i in code if i == p_thresh[0])))
check("thr_for() exists as the single lookup", "def thr_for(cond):" in FULL)
for site in ("collect_val_scores", "evaluate", "score_val", "external"):
    pass
check("evaluate() applies the calibrated threshold",
      re.search(r"_t = thr_for\(cond\)\n    if on_cpu:", FULL) is not None)
check("the applied threshold is recorded in the results row",
      '"decision_threshold": _t' in FULL)
n_thr = len(re.findall(r"thr_for\(cond\)", FULL))
check("every prediction path goes through thr_for", n_thr >= 4, f"{n_thr} call sites")

# ---------------------------------------------------------------- 6. external is seed-matched
ext = next(src for src, i in code if i == p_ext[0])
check("external evaluates every core seed of M*",
      re.search(r'for s_ in SEEDS_CORE:\s*\n\s*ck = f"\{CKPT_DIR\}/student/\{BEST_CONDITION\}', ext)
      is not None)
check("external evaluates every core seed of dual_csd",
      'student/dual_csd/seed{s_}.pt' in ext)
check("external includes the FP32 fine-tune control",
      '"fp32_ft_control"' in ext)
check("external paired bootstrap resamples seed pairs",
      "sel = rng.integers(0, len(shared), len(shared))" in FULL)
check("the degenerate self-comparison is guarded",
      'if BEST_CONDITION == "dual_csd":' in FULL and "SKIPPED" in FULL)

# ---------------------------------------------------------------- 7. the audit really recomputes
aud = next(src for src, i in code if i == p_audit[0])
check("audit recomputes QWK from saved per-sample predictions",
      'fast_qwk(d["true_grade"].values, d["pred_grade"].values)' in aud)
check("audit cross-checks the deployed model against sklearn",
      "cohen_kappa_score" in aud)
check("audit is blocking", 'gate("Gate12b_ResultsConsistent"' in aud and "blocking=BLOCK" in aud)
check("CI/permutation disagreement is reported but non-blocking",
      'Gate12c_CIPermutationAgreement' in aud and "blocking=False" in aud)

# ---------------------------------------------------------------- 8. gradient accumulation
n_acc = len(re.findall(r"\(loss / (?:_acc|ACCUM_STEPS)\)\.backward\(\)", FULL))
check("gradient accumulation in every trainer", n_acc >= 4, f"{n_acc} trainers")
n_flush = len(re.findall(r"if len\(\w+\) % (?:_acc|ACCUM_STEPS):", FULL))
check("every accumulating trainer flushes a partial final group", n_flush == n_acc,
      f"{n_acc} accumulate, {n_flush} flush")

# ---------------------------------------------------------------- 9. sampler discipline
check("balanced sampling is applied to TRAIN loaders only",
      len(re.findall(r'balanced=\(SAMPLING == "balanced"\)', FULL)) >= 3)
check("validation loader is never balanced",
      re.search(r'loader\(DualViewDataset\(VAL_CSV\)[^)]*balanced=True', FULL) is None)
check("class weights use sqrt, not full inverse frequency",
      '1.0 / math.sqrt(n)' in FULL)

# ---------------------------------------------------------------- report
print("=" * 84)
print(f"BEHAVIOURAL CHECKS -> {NB}")
print("=" * 84)
for x in OK:   print(f"  PASS  {x}")
for x in FAIL: print(f"  FAIL  {x}")
print("=" * 84)
print(f"{len(OK)}/{len(OK) + len(FAIL)} passed")
sys.exit(1 if FAIL else 0)
