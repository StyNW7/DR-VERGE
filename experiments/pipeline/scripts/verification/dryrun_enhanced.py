"""Numerical dry-run of the logic that is NEW in the enhanced notebook.

Static checks prove the code is reachable and well-ordered. These execute the actual decision rules
against synthetic data with a KNOWN right answer, because a selection rule that runs is not the same
as a selection rule that selects correctly.
"""
import numpy as np, pandas as pd, torch, math, sys

OK, FAIL = [], []
def check(name, cond, detail=""):
    (OK if cond else FAIL).append(f"{name}{(' -- ' + detail) if detail else ''}")

NUM_CLASSES = 5

# ======================================================================= the code under test
def grade_from(p_cum, t=None, DECISION_THRESHOLD=0.5):
    t = DECISION_THRESHOLD if t is None else t
    return (p_cum > t).sum(1)

def fast_qwk(y_true, y_pred, K=NUM_CLASSES):
    y_true, y_pred = np.asarray(y_true, int), np.asarray(y_pred, int)
    O = np.zeros((K, K))
    for a, b in zip(y_true, y_pred): O[a, b] += 1
    w = (np.arange(K)[:, None] - np.arange(K)[None, :]) ** 2 / (K - 1) ** 2
    h1 = np.bincount(y_true, minlength=K); h2 = np.bincount(y_pred, minlength=K)
    E = np.outer(h1, h2) / max(len(y_true), 1)
    E *= O.sum() / max(E.sum(), 1e-12)
    return float(1 - (w * O).sum() / max((w * E).sum(), 1e-12))

STAGE_A_MIN_GAIN = 0.01
def stage_a_select(rows):
    """Verbatim transcription of the notebook's Stage A rule."""
    df = pd.DataFrame(rows)
    base = df[(df.resolution == 224) & (df.sampling == "standard")]
    base_q = float(base["val_QWK"].iloc[0]) if len(base) else -np.inf
    cand = df[df.val_QWK > base_q + STAGE_A_MIN_GAIN]
    if len(cand):
        cand = cand.sort_values(["val_MacroF1", "val_Recall_Grade1", "val_SER", "resolution"],
                                ascending=[False, False, True, True])
        return int(cand.iloc[0]["resolution"]), str(cand.iloc[0]["sampling"])
    return 224, "standard"

THRESHOLD_GRID = [0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65]
def calibrate(y, pc):
    rows = []
    for t in THRESHOLD_GRID:
        yp = grade_from(pc, t).numpy()
        rows.append({"t": t, "val_QWK": fast_qwk(y, yp),
                     "val_MacroF1": float(np.mean([
                         (2 * ((yp == g) & (y == g)).sum()) / max((yp == g).sum() + (y == g).sum(), 1)
                         for g in range(NUM_CLASSES)])),
                     "val_SER": float(np.mean(np.abs(y - yp) >= 2))})
    d = pd.DataFrame(rows).sort_values(["val_QWK", "val_MacroF1", "val_SER"],
                                       ascending=[False, False, True])
    return float(d.iloc[0]["t"]), d

def make_thr_for(THRESHOLDS, BEST_CONDITION):
    def thr_for(cond):
        if cond in THRESHOLDS: return THRESHOLDS[cond]
        if cond in ("best_fp32", "fp32_ft_control", "fp32_ft_plain",
                    "ptq_int8", "qat_int8", "ft_ptq_int8"):
            return THRESHOLDS.get(BEST_CONDITION, 0.5)
        if cond.startswith("csd_fp32") or cond == "best_csd_fp32":
            return THRESHOLDS.get("dual_csd", 0.5)
        return 0.5
    return thr_for

def paired_seed_bootstrap(pa, pb, B=2000, rng_seed=13):
    shared = sorted(set(pa) & set(pb), key=str)
    if not shared: return None
    yt = pa[shared[0]]["y_true"]; cl = pa[shared[0]]["cluster_ids"]
    uniq = np.unique(cl); idx = {c: np.where(cl == c)[0] for c in uniq}
    rng = np.random.default_rng(rng_seed); draws = np.empty(B)
    for i in range(B):
        pick = np.concatenate([idx[c] for c in rng.choice(uniq, len(uniq), replace=True)])
        sel = rng.integers(0, len(shared), len(shared))
        draws[i] = float(np.mean([fast_qwk(yt[pick], pa[shared[j]]["y_pred"][pick])
                                  - fast_qwk(yt[pick], pb[shared[j]]["y_pred"][pick]) for j in sel]))
    lo, hi = np.percentile(draws, [2.5, 97.5])
    obs = float(np.mean([fast_qwk(yt, pa[s]["y_pred"]) - fast_qwk(yt, pb[s]["y_pred"])
                         for s in shared]))
    return {"n_seed_pairs": len(shared), "observed_diff": obs, "ci_low": float(lo),
            "ci_high": float(hi), "excludes_zero": bool(lo > 0 or hi < 0)}

# ======================================================================= 1. Stage A rule
base = {"resolution": 224, "sampling": "standard", "val_QWK": 0.60, "val_MacroF1": 0.40,
        "val_Recall_Grade1": 0.30, "val_SER": 0.05}
def row(r, s, q, f=0.40, g1=0.30, ser=0.05):
    return {"resolution": r, "sampling": s, "val_QWK": q, "val_MacroF1": f,
            "val_Recall_Grade1": g1, "val_SER": ser}

# a hairline win must NOT buy the expensive recipe
res = stage_a_select([base, row(384, "standard", 0.6099), row(224, "balanced", 0.605),
                      row(384, "balanced", 0.608)])
check("Stage A keeps 224/standard when every gain is under the 0.01 band", res == (224, "standard"),
      f"got {res}")

# a clear win must be taken
res = stage_a_select([base, row(384, "standard", 0.65), row(224, "balanced", 0.605),
                      row(384, "balanced", 0.61)])
check("Stage A adopts a recipe that clears the band", res == (384, "standard"), f"got {res}")

# exactly at the boundary is NOT a win (strict >)
res = stage_a_select([base, row(384, "standard", 0.61), row(224, "balanced", 0.60),
                      row(384, "balanced", 0.60)])
check("Stage A treats an exactly-0.01 gain as no gain (strict inequality)",
      res == (224, "standard"), f"got {res}")

# among qualifiers, the tie-break must prefer Macro-F1 -- not the top QWK
res = stage_a_select([base, row(384, "standard", 0.70, f=0.41),
                      row(224, "balanced", 0.66, f=0.52), row(384, "balanced", 0.65, f=0.45)])
check("Stage A tie-break prefers Macro-F1 among qualifying recipes", res == (224, "balanced"),
      f"got {res}")

# with Macro-F1 and Grade-1 recall and SER all tied, the CHEAPER recipe wins
res = stage_a_select([base, row(384, "standard", 0.70), row(224, "balanced", 0.66),
                      row(384, "balanced", 0.68)])
check("Stage A breaks a full tie toward the cheaper resolution", res[0] == 224, f"got {res}")

# no incumbent row at all must not crash
res = stage_a_select([row(384, "standard", 0.7, f=0.5), row(384, "balanced", 0.6)])
check("Stage A survives a grid with no 224/standard incumbent", res == (384, "standard"), f"got {res}")

# ======================================================================= 2. grade_from
p = torch.tensor([[0.9, 0.8, 0.7, 0.6],      # all four passed at 0.5 -> grade 4
                  [0.9, 0.4, 0.2, 0.1],      # one passed             -> grade 1
                  [0.1, 0.1, 0.1, 0.1]])     # none                   -> grade 0
check("grade_from counts thresholds passed (CORAL), not argmax",
      grade_from(p).tolist() == [4, 1, 0], str(grade_from(p).tolist()))
check("a higher threshold can only lower the grade",
      grade_from(p, 0.65).tolist() == [3, 1, 0], str(grade_from(p, 0.65).tolist()))
check("a lower threshold can only raise the grade",
      grade_from(p, 0.15).tolist() == [4, 3, 0], str(grade_from(p, 0.15).tolist()))
mono = all((grade_from(p, a) >= grade_from(p, b)).all()
           for a, b in zip(THRESHOLD_GRID, THRESHOLD_GRID[1:]))
check("grade is monotone non-increasing in the threshold", mono)

# ======================================================================= 3. threshold calibration
rng = np.random.default_rng(0)
n = 400
y = rng.choice(NUM_CLASSES, n, p=[.45, .12, .25, .10, .08])
# scores deliberately biased LOW, so 0.5 under-grades and the best operating point is below 0.5
pc = np.zeros((n, NUM_CLASSES - 1))
for i, g in enumerate(y):
    for k in range(NUM_CLASSES - 1):
        pc[i, k] = (0.62 if k < g else 0.16) + rng.normal(0, 0.05)
pc = torch.tensor(np.clip(pc, 0, 1), dtype=torch.float32)
t_star, tab = calibrate(y, pc)
q_default = fast_qwk(y, grade_from(pc, 0.5).numpy())
q_star = fast_qwk(y, grade_from(pc, t_star).numpy())
check("calibration finds a threshold at least as good as 0.5 on validation", q_star >= q_default,
      f"t*={t_star} QWK={q_star:.4f} vs 0.5 -> {q_default:.4f}")
check("calibration picks the grid's true argmax",
      abs(t_star - float(tab.iloc[0]["t"])) < 1e-12 and
      q_star >= tab["val_QWK"].max() - 1e-12, f"t*={t_star}")
check("the calibrated threshold comes from the declared grid", t_star in THRESHOLD_GRID)
check("calibration is monotone-consistent: every grid point was scored", len(tab) == len(THRESHOLD_GRID))

# ======================================================================= 4. thr_for inheritance
T = {"dual_no_distill": 0.45, "dual_logitkd": 0.55, "dual_featkd": 0.50, "dual_csd": 0.40}
f = make_thr_for(T, "dual_logitkd")
check("a core condition uses its own calibrated threshold", f("dual_csd") == 0.40)
check("best_fp32 inherits M*'s threshold", f("best_fp32") == 0.55)
for q in ("ptq_int8", "qat_int8", "ft_ptq_int8", "fp32_ft_control"):
    check(f"{q} inherits M*'s threshold (quantization must not re-pick its operating point)",
          f(q) == 0.55)
check("csd_fp32 inherits dual_csd's threshold", f("csd_fp32") == 0.40)
check("an unknown condition falls back to the CORAL default", f("teacher") == 0.5)
f2 = make_thr_for({}, "dual_logitkd")
check("an empty calibration falls back to 0.5 everywhere rather than crashing",
      f2("best_fp32") == 0.5 and f2("csd_fp32") == 0.5)

# ======================================================================= 5. seed-matched bootstrap
npat, per = 100, 2
cl = np.repeat(np.arange(npat), per)
yt = rng.choice(NUM_CLASSES, npat * per, p=[.45, .12, .25, .10, .08])
def preds(err, seed):
    r = np.random.default_rng(seed)
    flip = r.random(len(yt)) < err
    out = yt.copy()
    out[flip] = r.choice(NUM_CLASSES, flip.sum())
    return {"y_true": yt, "y_pred": out, "cluster_ids": cl}

A = {s: preds(0.10, s) for s in (42, 123, 2026, 3407, 8888)}   # clearly better
B = {s: preds(0.40, s) for s in (42, 123, 2026, 3407, 8888)}
r = paired_seed_bootstrap(A, B)
check("paired bootstrap uses all five matched seed pairs", r["n_seed_pairs"] == 5, str(r))
check("a real advantage produces a CI excluding zero", r["excludes_zero"] and r["ci_low"] > 0,
      str(r))
check("the observed difference lies inside its own CI",
      r["ci_low"] <= r["observed_diff"] <= r["ci_high"], str(r))

C = {s: preds(0.25, s) for s in (42, 123, 2026, 3407, 8888)}
D = {s: preds(0.25, s + 500) for s in (42, 123, 2026, 3407, 8888)}
r0 = paired_seed_bootstrap(C, D)
check("two equivalent methods do NOT produce a credible difference", not r0["excludes_zero"],
      str(r0))

r1 = paired_seed_bootstrap(A, {42: B[42]})
check("unmatched seeds are intersected, not silently mispaired", r1["n_seed_pairs"] == 1, str(r1))
check("no shared seeds returns None rather than a fabricated interval",
      paired_seed_bootstrap({1: preds(0.1, 1)}, {2: preds(0.1, 2)}) is None)

# ======================================================================= 6. the audit catches things
AUDIT = []
def _audit(name, reported, recomputed, tol=1e-6):
    ok = abs(float(reported) - float(recomputed)) <= tol
    AUDIT.append({"check": name, "match": bool(ok)}); return ok

truth = fast_qwk(yt, A[42]["y_pred"])
check("the audit passes a number that IS reproducible", _audit("good", truth, truth))
check("the audit FAILS a number that is not reproducible",
      not _audit("stale", truth + 0.02, truth))
check("the audit tolerance is tight enough to catch a 4th-decimal drift",
      not _audit("drift", truth + 1e-4, truth))
check("the audit does not flag pure float noise", _audit("noise", truth + 1e-9, truth))

# ======================================================================= 7. sqrt class weights
counts = {0: 1000, 1: 50, 2: 300, 3: 80, 4: 40}
w_sqrt = {g: 1.0 / math.sqrt(n) for g, n in counts.items()}
w_inv = {g: 1.0 / n for g, n in counts.items()}
exp_sqrt = w_sqrt[4] * counts[4] / (w_sqrt[0] * counts[0])
exp_inv = w_inv[4] * counts[4] / (w_inv[0] * counts[0])
check("sqrt weighting rebalances toward minority grades", exp_sqrt > counts[4] / counts[0],
      f"exposure ratio {exp_sqrt:.3f} vs natural {counts[4]/counts[0]:.3f}")
check("sqrt weighting is strictly gentler than full inverse frequency", exp_sqrt < exp_inv,
      f"sqrt {exp_sqrt:.3f} vs inv {exp_inv:.3f} (inv would equalise at 1.0)")
check("full inverse frequency would fully equalise (which is why it is not used)",
      abs(exp_inv - 1.0) < 1e-9)

# ======================================================================= 8. batch plan
def batch_plan(img_size, target=16):
    per_step = 8 if img_size > 256 else 16
    return per_step, max(1, target // per_step)
for sz in (224, 384):
    bs, acc = batch_plan(sz)
    check(f"effective batch is 16 at {sz}", bs * acc == 16, f"{bs}x{acc}")
check("384 halves the per-step batch", batch_plan(384)[0] == 8)
check("APTOS keeps its own target batch", batch_plan(384, 32) == (8, 4))

# ======================================================================= report
print("=" * 84); print("DRY RUN -> enhanced-notebook logic"); print("=" * 84)
for x in OK:   print(f"  PASS  {x}")
for x in FAIL: print(f"  FAIL  {x}")
print("=" * 84); print(f"{len(OK)}/{len(OK) + len(FAIL)} passed")
sys.exit(1 if FAIL else 0)
