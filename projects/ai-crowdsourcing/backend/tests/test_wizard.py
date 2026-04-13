import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import patch, MagicMock
import json


def _make_mock_openai(content: str) -> MagicMock:
    """OpenAI クライアントのモックを生成するヘルパー"""
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value.choices = [
        type("Choice", (), {
            "message": type("Msg", (), {"content": content})()
        })()
    ]
    return mock_client


def test_structure_requirements_returns_dict():
    """structure_requirements は dict を返す"""
    with patch("services.wizard._get_client") as mock_get_client:
        mock_get_client.return_value = _make_mock_openai(
            json.dumps({
                "platform": "Instagram",
                "deliverables": "投稿1件",
                "tone": "親しみやすい",
                "character_limit": 2200,
                "hashtag_policy": "5個以内"
            })
        )
        from services.wizard import structure_requirements
        result = structure_requirements("sns_post", "Instagramに商品紹介を投稿してほしい")

    assert isinstance(result, dict)
    assert "deliverables" in result


def test_structure_requirements_sns_post_has_platform():
    """sns_postタスクの結果にplatformが含まれる"""
    with patch("services.wizard._get_client") as mock_get_client:
        mock_get_client.return_value = _make_mock_openai(
            json.dumps({"platform": "Instagram", "deliverables": "投稿1件", "tone": "丁寧", "character_limit": 2200, "hashtag_policy": "5個以内"})
        )
        from services.wizard import structure_requirements
        result = structure_requirements("sns_post", "Instagramに投稿したい")

    assert "platform" in result


def test_structure_requirements_unknown_task_type_raises():
    """未知のタスク種別は ValueError を送出する（プロンプトインジェクション対策）"""
    from services.wizard import structure_requirements
    with pytest.raises(ValueError, match="不明なタスク種別"):
        structure_requirements("__injection__", "何か頼みたい")


def test_structure_requirements_input_too_long_raises():
    """4001文字以上の入力は ValueError を送出する"""
    from services.wizard import structure_requirements
    with pytest.raises(ValueError, match="入力が長すぎます"):
        structure_requirements("sns_post", "x" * 4001)


def test_structure_requirements_empty_response_raises():
    """OpenAI が空コンテンツを返した場合は ValueError を送出する"""
    with patch("services.wizard._get_client") as mock_get_client:
        mock_get_client.return_value = _make_mock_openai("")
        from services.wizard import structure_requirements
        with pytest.raises(ValueError, match="空のレスポンス"):
            structure_requirements("sns_post", "テスト入力")


def test_project_create_model_validation():
    """ProjectCreate は title と task_type が必須"""
    from models.project import ProjectCreate
    project = ProjectCreate(
        title="テスト案件",
        task_type="sns_post",
        raw_input="テスト入力"
    )
    assert project.title == "テスト案件"
    assert project.task_type == "sns_post"


def test_project_create_model_optional_fields():
    """budget と deadline は省略可能"""
    from models.project import ProjectCreate
    project = ProjectCreate(
        title="テスト",
        task_type="document",
        raw_input="資料を作ってほしい"
    )
    assert project.budget_min is None
    assert project.budget_max is None
    assert project.deadline is None


def test_project_create_invalid_task_type_raises():
    """ProjectCreate は不正な task_type をバリデーションエラーにする"""
    from models.project import ProjectCreate
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        ProjectCreate(title="テスト", task_type="invalid_type", raw_input="テスト")


def test_project_create_budget_range_validation():
    """budget_min > budget_max の場合はバリデーションエラー"""
    from models.project import ProjectCreate
    from pydantic import ValidationError
    with pytest.raises(ValidationError, match="budget_min"):
        ProjectCreate(
            title="テスト",
            task_type="document",
            raw_input="資料",
            budget_min=100000,
            budget_max=50000
        )
