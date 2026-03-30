import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import patch
import json


def test_structure_requirements_returns_dict():
    """structure_requirements は dict を返す"""
    with patch("services.wizard._openai") as mock_openai:
        mock_openai.chat.completions.create.return_value.choices = [
            type("Choice", (), {
                "message": type("Msg", (), {
                    "content": json.dumps({
                        "platform": "Instagram",
                        "deliverables": "投稿1件",
                        "tone": "親しみやすい",
                        "character_limit": 2200,
                        "hashtag_policy": "5個以内"
                    })
                })()
            })()
        ]
        from services.wizard import structure_requirements
        result = structure_requirements("sns_post", "Instagramに商品紹介を投稿してほしい")

    assert isinstance(result, dict)
    assert "deliverables" in result


def test_structure_requirements_sns_post_has_platform():
    """sns_postタスクの結果にplatformが含まれる"""
    with patch("services.wizard._openai") as mock_openai:
        mock_openai.chat.completions.create.return_value.choices = [
            type("Choice", (), {
                "message": type("Msg", (), {
                    "content": json.dumps({"platform": "Instagram", "deliverables": "投稿1件", "tone": "丁寧", "character_limit": 2200, "hashtag_policy": "5個以内"})
                })()
            })()
        ]
        from services.wizard import structure_requirements
        result = structure_requirements("sns_post", "Instagramに投稿したい")

    assert "platform" in result


def test_structure_requirements_unknown_task_type_uses_other_schema():
    """未知のタスク種別はotherスキーマにフォールバックする"""
    with patch("services.wizard._openai") as mock_openai:
        mock_openai.chat.completions.create.return_value.choices = [
            type("Choice", (), {
                "message": type("Msg", (), {
                    "content": json.dumps({"deliverables": "成果物", "acceptance_criteria": "確認OK", "communication_style": "メール"})
                })()
            })()
        ]
        from services.wizard import structure_requirements
        result = structure_requirements("unknown_type", "何か頼みたい")

    assert isinstance(result, dict)


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
