import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from services.matching import compute_similarity


def test_compute_similarity_identical_vectors():
    """同一ベクトルの類似度は1.0"""
    vec = [1.0, 0.0, 0.0]
    score = compute_similarity(vec, vec)
    assert abs(score - 1.0) < 1e-6


def test_compute_similarity_orthogonal_vectors():
    """直交ベクトルの類似度は0.0"""
    vec_a = [1.0, 0.0, 0.0]
    vec_b = [0.0, 1.0, 0.0]
    score = compute_similarity(vec_a, vec_b)
    assert abs(score - 0.0) < 1e-6


def test_compute_similarity_opposite_vectors():
    """逆向きベクトルの類似度は-1.0"""
    vec_a = [1.0, 0.0]
    vec_b = [-1.0, 0.0]
    score = compute_similarity(vec_a, vec_b)
    assert abs(score - (-1.0)) < 1e-6


def test_compute_similarity_zero_vector_returns_zero():
    """ゼロベクトルが含まれる場合は0.0を返す（ゼロ除算を防ぐ）"""
    vec_a = [0.0, 0.0, 0.0]
    vec_b = [1.0, 2.0, 3.0]
    score = compute_similarity(vec_a, vec_b)
    assert score == 0.0


def test_generate_embedding_is_mocked():
    """embedding生成はOpenAI APIをモックして1536次元を返す"""
    from unittest.mock import patch, MagicMock
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1] * 1536)]

    with patch("services.embedding._openai") as mock_openai:
        mock_openai.embeddings.create.return_value = mock_response
        from services.embedding import generate_embedding
        result = generate_embedding("テストテキスト")

    assert isinstance(result, list)
    assert len(result) == 1536
