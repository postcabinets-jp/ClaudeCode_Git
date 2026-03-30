import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

"""
案件投稿 → AIマッチング → ワーカーアサイン → 決済授権 → 決済キャプチャ
の一連フローを統合テストする。
実際のOpenAI / Stripe APIはモックする。
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


def test_full_project_flow():
    """案件投稿からマッチングまでの一連フローが成功する"""
    with patch("routers.projects.structure_requirements", return_value={"platform": "Instagram", "deliverables": "投稿1件"}), \
         patch("routers.projects.generate_embedding", return_value=[0.1] * 1536), \
         patch("routers.projects.get_client") as mock_proj_db, \
         patch("routers.matching.get_client") as mock_match_db, \
         patch("routers.payments.get_client") as mock_pay_db, \
         patch("stripe.PaymentIntent.create") as mock_pi_create, \
         patch("stripe.PaymentIntent.capture") as mock_pi_capture:

        from main import app
        client = TestClient(app)

        # --- Step 1: 案件投稿 ---
        mock_proj_db.return_value.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": "proj-e2e-001", "status": "open"}
        ]
        post_res = client.post("/projects", json={
            "title": "E2E テスト案件",
            "task_type": "sns_post",
            "raw_input": "Instagramに1投稿お願いします",
            "budget_min": 5000,
            "budget_max": 10000,
        })
        assert post_res.status_code == 201, f"投稿失敗: {post_res.json()}"
        assert "id" in post_res.json()
        assert "requirements" in post_res.json()
        project_id = post_res.json()["id"]

        # --- Step 2: マッチング取得 ---
        mock_match_db.return_value.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "requirement_vector": [0.1] * 1536
        }
        mock_match_db.return_value.rpc.return_value.execute.return_value.data = [
            {"worker_id": "w-001", "display_name": "田中太郎", "skills": ["SNS", "Canva"], "skill_score": 4.5, "score": 0.93},
            {"worker_id": "w-002", "display_name": "山田花子", "skills": ["Instagram"], "skill_score": 4.2, "score": 0.87},
            {"worker_id": "w-003", "display_name": "鈴木一郎", "skills": ["コピー"], "skill_score": 3.9, "score": 0.81},
        ]
        match_res = client.get(f"/projects/{project_id}/matches")
        assert match_res.status_code == 200, f"マッチング失敗: {match_res.json()}"
        candidates = match_res.json()["candidates"]
        assert len(candidates) == 3
        assert candidates[0]["score"] >= candidates[1]["score"]

        # --- Step 3: ワーカーアサイン ---
        mock_proj_db.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{}]
        assign_res = client.patch(f"/projects/{project_id}/assign?worker_id=w-001")
        assert assign_res.status_code == 200, f"アサイン失敗: {assign_res.json()}"
        assert assign_res.json()["status"] == "matched"

        # --- Step 4: 決済授権 ---
        mock_pi_create.return_value = MagicMock(
            id="pi-e2e-001",
            client_secret="pi-e2e-001_secret",
            status="requires_capture"
        )
        mock_pay_db.return_value.table.return_value.insert.return_value.execute.return_value.data = [{}]
        pay_res = client.post("/payments/authorize", json={
            "project_id": project_id,
            "amount": 8000,
            "worker_stripe_id": "acct_worker001",
        })
        assert pay_res.status_code == 200, f"決済授権失敗: {pay_res.json()}"
        assert "client_secret" in pay_res.json()
        assert pay_res.json()["platform_fee"] == 800  # 10%

        # --- Step 5: 決済キャプチャ（納品確認後） ---
        mock_pay_db.return_value.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "stripe_payment_intent_id": "pi-e2e-001"
        }
        mock_pay_db.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{}]
        mock_pi_capture.return_value = MagicMock(status="succeeded")
        cap_res = client.post(f"/payments/{project_id}/capture")
        assert cap_res.status_code == 200, f"キャプチャ失敗: {cap_res.json()}"
        assert cap_res.json()["status"] == "succeeded"
