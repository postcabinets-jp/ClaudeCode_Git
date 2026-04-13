import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


def _get_client() -> OpenAI:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise ValueError("OPENAI_API_KEY が設定されていません。.env ファイルを確認してください。")
    return OpenAI(api_key=key)


def generate_embedding(text: str) -> list[float]:
    """
    テキストを1536次元のベクトルに変換する。
    使用モデル: text-embedding-3-small
    """
    response = _get_client().embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding
