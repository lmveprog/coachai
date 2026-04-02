"""Shared rank threshold constants — imported by both models and services."""

RANK_THRESHOLDS = [
    (2200, "Grand Master"),
    (1800, "Master"),
    (1500, "Expert"),
    (1200, "Analyst"),
    (0, "Rookie"),
]


def compute_rank(elo: int) -> str:
    for threshold, rank in RANK_THRESHOLDS:
        if elo >= threshold:
            return rank
    return "Rookie"
