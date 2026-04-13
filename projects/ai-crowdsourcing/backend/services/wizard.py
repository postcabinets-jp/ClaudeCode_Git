import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

TASK_SCHEMAS: dict[str, list[str]] = {
    "sns_post": ["platform", "tone", "deliverables", "character_limit", "hashtag_policy"],
    "document": ["format", "pages", "target_audience", "deliverables", "style"],
    "data_entry": ["source_format", "output_format", "row_count_estimate", "validation_rules"],
    "lp": ["sections", "target_audience", "cta", "style", "responsive"],
    "other": ["deliverables", "acceptance_criteria", "communication_style"],
}

RAW_INPUT_MAX_LEN = 4000


def _get_client() -> OpenAI:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise ValueError("OPENAI_API_KEY が設定されていません。")
    return OpenAI(api_key=key)


def structure_requirements(task_type: str, raw_input: str) -> dict:
    """
    発注者の自然言語入力をタスク種別に応じた構造化JSONに変換する。
    未記載のフィールドはAIが業界標準から補完する。
    """
    if task_type not in TASK_SCHEMAS:
        raise ValueError(f"不明なタスク種別: {task_type!r}")
    if len(raw_input) > RAW_INPUT_MAX_LEN:
        raise ValueError(f"入力が長すぎます（上限: {RAW_INPUT_MAX_LEN}文字）")

    fields = TASK_SCHEMAS[task_type]
    client = _get_client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "あなたはクラウドソーシングプラットフォームの要件定義AIです。\n"
                    f"タスク種別: {task_type}\n"
                    f"必須フィールド: {fields}\n"
                    "発注者の入力を解析し、指定フィールドを含むJSONのみ返してください。"
                    "未記載のフィールドは業界標準の推奨値で補完してください。"
                ),
            },
            {
                "role": "user",
                "content": raw_input,
            },
        ],
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("OpenAI から空のレスポンスが返されました。")
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"OpenAI レスポンスのJSON解析に失敗: {e}") from e
