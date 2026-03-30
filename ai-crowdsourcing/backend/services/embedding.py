import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# モジュールレベルでインスタンス化（テストでモック可能）
_openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy-key-for-testing"))


def generate_embedding(text: str) -> list[float]:
    """
    テキストを1536次元のベクトルに変換する。
    使用モデル: text-embedding-3-small
    """
    response = _openai.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding
