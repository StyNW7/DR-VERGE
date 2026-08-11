import os
import random

import numpy as np
import pandas as pd
import torch
import yaml


def set_seed(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def seed_worker(worker_id):
    worker_seed = torch.initial_seed() % 2**32
    np.random.seed(worker_seed)
    random.seed(worker_seed)


def make_generator(seed: int) -> torch.Generator:
    g = torch.Generator()
    g.manual_seed(seed)
    return g


def load_config(config_path: str) -> dict:
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def get_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def ensure_dir(path: str):
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)


def compute_pos_weights(train_csv: str, num_thresholds: int = 4, grade_col: str = "grade") -> torch.Tensor:
    """For threshold k, pos_weight_k = N_negative_k / N_positive_k.
    Used as `pos_weight` in F.binary_cross_entropy_with_logits (see losses.py).
    Computed ONCE from the training split, reused for every condition/seed so that
    performance differences come purely from the distillation method, not from some
    conditions accidentally getting better imbalance handling than others.

    judge.md Code issue 8: guard against a threshold with zero positives or zero
    negatives, which would otherwise silently produce a meaningless huge weight.
    """
    df = pd.read_csv(train_csv)
    grades = df[grade_col].values
    weights = []
    for k in range(num_thresholds):
        pos = int((grades > k).sum())
        neg = int((grades <= k).sum())
        if pos == 0 or neg == 0:
            raise ValueError(
                f"pos_weight threshold k={k} has pos={pos}, neg={neg} — "
                f"a zero count here means this threshold is degenerate on this split. "
                f"Check the grade distribution before training (Gate 1)."
            )
        weights.append(neg / pos)
    return torch.tensor(weights, dtype=torch.float32)
