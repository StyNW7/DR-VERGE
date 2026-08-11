import torch
import torch.nn as nn
import torch.nn.functional as F


def coral_loss(logits, labels, num_thresholds=4, pos_weight=None):
    device = logits.device
    levels = torch.arange(num_thresholds, device=device).unsqueeze(0)
    y_k = (labels.unsqueeze(1) > levels).float()
    return F.binary_cross_entropy_with_logits(logits, y_k, pos_weight=pos_weight)


def aux_loss(student_out, labels, num_thresholds=4, pos_weight=None):
    l_m = coral_loss(student_out["logit_macula"], labels, num_thresholds, pos_weight=pos_weight)
    l_d = coral_loss(student_out["logit_disc"], labels, num_thresholds, pos_weight=pos_weight)
    return l_m + l_d


def logit_kd_loss(logit_dual_teacher, logit_dual_student, tau=2.0):
    """Standard soft-target KD with temperature scaling.

    judge.md Flag 17: standard KD literature scales this loss by tau^2 to keep gradient
    magnitude comparable across different tau values; this implementation deliberately
    does NOT apply tau^2, matching the technical doc's v2 spec. This means alpha and tau
    are coupled — do not tune tau independently of alpha and claim the two are decoupled
    in the paper. If you want the tau^2-corrected variant for comparison, multiply the
    returned value by tau**2 at the call site rather than changing this function, so both
    variants stay available for the ablation.
    """
    p_t = torch.sigmoid(logit_dual_teacher.detach() / tau)
    p_s = torch.sigmoid(logit_dual_student / tau)
    return F.binary_cross_entropy(p_s, p_t)


def _compute_delta(p_dual, p_macula, p_disc):
    p_agg = (p_macula + p_disc) / 2
    delta = p_dual - p_agg
    return delta


def csd_loss(
    p_dual_t, p_macula_t, p_disc_t,
    p_dual_s, p_macula_s, p_disc_s,
    variant="smoothl1", tau_csd=0.5,
):
    """Complementarity-Shift Distillation loss.

    delta = p_dual - mean(p_macula, p_disc): the shift in cumulative ordinal decision
    boundaries caused by moving from single-view aggregation to learned dual-view fusion.
    Teacher-side deltas are ALWAYS detached — gradient flows only to the student side.

    variant:
      'smoothl1'           — DEFAULT (technical doc v2). Signed SmoothL1 on delta,
                              preserves shift magnitude (v1's softmax-KL variant lost
                              magnitude information — judge.md/doc Critical Issue 4).
      'direction_magnitude' — cosine-direction loss + SmoothL1 magnitude, weighted 0.5/0.5.
      'kl_softmax'          — v1 formulation, kept ONLY as an ablation baseline, not default.

    Caller is responsible for which (p_dual, p_macula, p_disc) triple is passed in:
    - default head-based Delta: student_out["p_dual"/"p_macula"/"p_disc"] from forward()
    - same-head counterfactual Delta (judge.md Flag 1/3 fix): use
      counterfactual_forward()'s "p_dual"/"p_macula_cf"/"p_disc_cf"
    Run at least one training condition with the counterfactual triple before trusting
    that the default triple's Delta is measuring complementarity rather than head
    discrepancy (Gate 3 / judge.md Section F item 8).
    """
    delta_t = _compute_delta(p_dual_t.detach(), p_macula_t.detach(), p_disc_t.detach())
    delta_s = _compute_delta(p_dual_s, p_macula_s, p_disc_s)

    if variant == "smoothl1":
        return F.smooth_l1_loss(delta_s, delta_t)
    elif variant == "direction_magnitude":
        cos_sim = F.cosine_similarity(delta_s, delta_t, dim=1, eps=1e-6)
        l_dir = (1 - cos_sim).mean()
        l_mag = F.smooth_l1_loss(delta_s, delta_t)
        return 0.5 * l_dir + 0.5 * l_mag
    elif variant == "kl_softmax":
        log_q = F.log_softmax(delta_s / tau_csd, dim=1)
        p_target = F.softmax(delta_t / tau_csd, dim=1)
        return F.kl_div(log_q, p_target, reduction="batchmean")
    else:
        raise ValueError(f"unknown csd_variant: {variant}")


def csd_loss_no_aux_gradient(
    p_dual_t, p_macula_t, p_disc_t,
    p_dual_s, p_macula_s, p_disc_s,
    variant="smoothl1", tau_csd=0.5,
):
    """Same as csd_loss but with student aux-head outputs detached before computing
    delta_s (judge.md Flag 3 mitigation): CSD can then only be minimized by changing
    the dual head + backbone, not by drifting the auxiliary heads to make delta_s match
    delta_t 'for free' without the dual head actually improving. The backbone is still
    shared so aux heads are influenced indirectly, but they can no longer be a direct
    optimization shortcut for this specific loss term. Use as an ablation to check
    whether default csd_loss's gains survive this stricter formulation.
    """
    p_macula_s_d = p_macula_s.detach()
    p_disc_s_d = p_disc_s.detach()
    return csd_loss(
        p_dual_t, p_macula_t, p_disc_t,
        p_dual_s, p_macula_s_d, p_disc_s_d,
        variant=variant, tau_csd=tau_csd,
    )


def get_student_output(student, macula, disc, view_mode):
    """The ONE place forward-mode selection happens, for both training and evaluation
    (technical doc Section 5.5's Critical Issue 1 fix) — prevents the single-view
    baselines from silently training/evaluating the dual head."""
    if view_mode == "dual":
        return student(macula, disc)
    elif view_mode == "macula_only":
        return student.forward_single(macula, which="macula")
    elif view_mode == "disc_only":
        return student.forward_single(disc, which="disc")
    raise ValueError(f"unknown view_mode: {view_mode}")


def ordinal_violation_rate(p):
    """p: [B, K-1] cumulative probabilities, ideally non-increasing along dim=1.
    Sanity-check metric — with the v2 ordered-bias CORALHead this MUST be 0.0
    mathematically; a nonzero value means there's an implementation bug, not that the
    ordinal constraint is merely being violated occasionally."""
    diffs = p[:, 1:] - p[:, :-1]
    violations = (diffs > 0).float()
    return violations.mean().item()


def combined_student_loss(
    teacher_out, student_out, labels, view_mode,
    alpha=0.0, beta=0.0, lambda_aux=0.5,
    tau_kd=2.0, csd_variant="smoothl1", tau_csd=0.5,
    pos_weight=None, use_counterfactual_csd=False,
    teacher_cf_out=None, student_cf_out=None,
):
    if view_mode == "dual":
        task_logit = student_out["logit_dual"]
    else:
        task_logit = student_out["logit"]

    l_task = coral_loss(task_logit, labels, pos_weight=pos_weight)
    total = l_task
    log = {"L_task": l_task.item()}

    if view_mode == "dual":
        l_aux = aux_loss(student_out, labels, pos_weight=pos_weight)
        total = total + lambda_aux * l_aux
        log["L_aux"] = l_aux.item()

        if alpha > 0:
            l_kd = logit_kd_loss(teacher_out["logit_dual"], student_out["logit_dual"], tau_kd)
            total = total + alpha * l_kd
            log["L_logit_KD"] = l_kd.item()

        if beta > 0:
            if use_counterfactual_csd:
                assert teacher_cf_out is not None and student_cf_out is not None, (
                    "use_counterfactual_csd=True requires teacher_cf_out/student_cf_out "
                    "from counterfactual_forward()"
                )
                l_csd = csd_loss(
                    teacher_cf_out["p_dual"], teacher_cf_out["p_macula_cf"], teacher_cf_out["p_disc_cf"],
                    student_cf_out["p_dual"], student_cf_out["p_macula_cf"], student_cf_out["p_disc_cf"],
                    variant=csd_variant, tau_csd=tau_csd,
                )
            else:
                l_csd = csd_loss(
                    teacher_out["p_dual"], teacher_out["p_macula"], teacher_out["p_disc"],
                    student_out["p_dual"], student_out["p_macula"], student_out["p_disc"],
                    variant=csd_variant, tau_csd=tau_csd,
                )
            total = total + beta * l_csd
            log["L_CSD"] = l_csd.item()

    log["L_total"] = total.item()
    return total, log
