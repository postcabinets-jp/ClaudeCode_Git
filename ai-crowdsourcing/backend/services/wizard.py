import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_api_key = os.environ.get("OPENAI_API_KEY")
if not _api_key:
    raise ValueError("OPENAI_API_KEY が設定されていません。")

_openai = OpenAI(api_key=_api_key)

TASK_SCHEMAS: dict[str, list[str]] = {
    "sns_post": ["platform", "tone", "deliverables", "character_limit", "hashtag_policy"],
    "document": ["format", "pages", "target_audience", "deliverables", "style"],
    "data_entry": ["source_format", "output_format", "row_count_estimate", "validation_rules"],
    "lp": ["sections", "target_audience", "cta", "style", "responsive"],
    "other": ["deliverables", "acceptance_criteria", "communication_style"],
}


def structure_requirements(task_type: str, raw_input: str) -> dict:
    """
    発注者の自然言語入力をタスク種別に応じた構造化JSONに変換する。
    未記載のフィールドはAIが業界標準から補完する。
    """
    fields = TASK_SCHEMAS.get(task_type, TASK_SCHEMAS["other"])
    prompt = (
        f"あなたはクラウドソーシングプラットフォームの要件定義AIです。\n"
        f"発注者の入力を解析し、以下のフィールドを含むJSONを返してください。\n"
        f"未記載のフィールドは業界標準の推奨値で補完してください。\n\n"
        f"タスク種別: {task_type}\n"
        f"必須フィールド: {fields}\n"
        f"発注者の入力: {raw_input}\n\n"
        f"JSONのみ返してください。説明文は不要です。"
    )
    response = _openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
