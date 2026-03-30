import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


def test_post_project_returns_201():
    """案件投稿が成功すると201とidを返す"""
    with patch("routers.projects.get_client") as mock_db, \
         patch("routers.projects.structure_requirements") as mock_wizard, \
         patch("routers.projects.generate_embedding") as mock_embed:

        mock_wizard.return_value = {"deliverables": "Instagram投稿1件", "platform": "Instagram"}
        mock_embed.return_value = [0.1] * 1536
        mock_db.return_value.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": "proj-123", "status": "open"}
        ]

        from main import app
        client = TestClient(app)
        response = client.post("/projects", json={
            "title": "Instagram投稿",
            "task_type": "sns_post",
            "raw_input": "商品紹介を1投稿お願いします",
            "budget_min": 3000,
            "budget_max": 8000,
        })

    assert response.status_code == 201
    assert "id" in response.json()
    assert "requirements" in response.json()


def test_get_matches_returns_top3():
    """マッチング結果はTop-3を返す"""
    with patch("routers.matching.get_client") as mock_db:
        mock_db.return_value.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "requirement_vector": [0.1] * 1536
        }
        mock_db.return_value.rpc.return_value.execute.return_value.data = [
            {"worker_id": "w1", "score": 0.95, "display_name": "田中太郎", "skills": ["SNS", "Canva"]},
            {"worker_id": "w2", "score": 0.88, "display_name": "山田花子", "skills": ["Instagram", "写真編集"]},
            {"worker_id": "w3", "score": 0.81, "display_name": "鈴木一郎", "skills": ["SNS運用", "コピーライティング"]},
        ]

        from main import app
        client = TestClient(app)
        response = client.get("/projects/proj-123/matches")

    assert response.status_code == 200
    assert len(response.json()["candidates"]) == 3
    assert response.json()["candidates"][0]["score"] >= response.json()["candidates"][1]["score"]


def test_post_project_invalid_task_type_returns_422():
    """不正な task_type は 422 を返す"""
    from main import app
    client = TestClient(app)
    response = client.post("/projects", json={
        "title": "テスト",
        "task_type": "invalid_type",
        "raw_input": "テスト入力",
    })
    assert response.status_code == 422


def test_get_project_not_found_returns_404():
    """存在しない案件は 404 を返す"""
    with patch("routers.projects.get_client") as mock_db:
        mock_db.return_value.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = None

        from main import app
        client = TestClient(app)
        response = client.get("/projects/nonexistent-id")

    assert response.status_code == 404
