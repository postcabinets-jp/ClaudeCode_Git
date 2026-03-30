import math


def compute_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    コサイン類似度を計算する。
    返り値: -1.0〜1.0（高いほど類似）
    ゼロベクトルが含まれる場合は 0.0 を返す。
    """
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a ** 2 for a in vec_a))
    norm_b = math.sqrt(sum(b ** 2 for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
