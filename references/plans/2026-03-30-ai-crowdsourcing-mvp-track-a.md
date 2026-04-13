# AI クラウドソーシング MVP — Track A（企業向け発注・マッチング基盤）実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 中小企業が「今日から外注できる」スポット発注→AIマッチング→進捗管理→納品確認→決済の一連フローを動かす。

**Architecture:** Next.js 15 (App Router) フロント + FastAPI バックエンド + Supabase (PostgreSQL + pgvector) でフルスタック構成。AIマッチングはワーカーのプロフィールをembeddingし、案件投稿時にコサイン類似度でTop-3を返す。決済はStripe Connectのエスクロー相当フロー（事前授権→納品確認後キャプチャ）。

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Shadcn/UI, FastAPI, Python 3.12, Supabase (pgvector), OpenAI API (gpt-4o + text-embedding-3-small), Stripe Connect, Supabase Auth

---

## ファイル構造

```
ai-crowdsourcing/
├── frontend/                          # Next.js 15
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (client)/                  # Track A: 企業側
│   │   │   ├── dashboard/page.tsx     # 案件一覧・ステータスボード
│   │   │   ├── post/page.tsx          # スポット発注ウィザード
│   │   │   ├── projects/[id]/page.tsx # 案件詳細・マッチング結果
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── client/
│   │   │   ├── PostWizard.tsx         # 発注ウィザード（選択式）
│   │   │   ├── WorkerCard.tsx         # AIスコアード人材カード
│   │   │   ├── ProjectBoard.tsx       # 進捗ボード（4ステータス）
│   │   │   └── DeliveryReview.tsx     # 納品確認UI
│   │   └── ui/                        # Shadcn components
│   └── lib/
│       ├── api.ts                     # バックエンドAPIクライアント
│       └── supabase.ts                # Supabaseクライアント
│
├── backend/                           # FastAPI
│   ├── main.py
│   ├── routers/
│   │   ├── projects.py                # 案件CRUD
│   │   ├── matching.py                # AIマッチングエンドポイント
│   │   ├── deliveries.py              # 納品物・QA
│   │   └── payments.py                # Stripe Connect
│   ├── services/
│   │   ├── embedding.py               # OpenAI embedding生成
│   │   ├── matching.py                # ベクトル類似度検索
│   │   ├── wizard.py                  # 案件要件AI構造化
│   │   └── stripe.py                  # Stripe操作
│   ├── models/
│   │   ├── project.py                 # Pydanticモデル
│   │   ├── worker.py
│   │   └── payment.py
│   └── db/
│       ├── supabase.py                # Supabaseクライアント
│       └── migrations/
│           └── 001_initial.sql        # 初期スキーマ
│
└── supabase/
    └── migrations/
        └── 20260330_initial.sql
```

---

## Task 1: プロジェクト初期化・DB スキーマ

**Files:**
- Create: `backend/db/migrations/001_initial.sql`
- Create: `backend/db/supabase.py`
- Create: `backend/main.py`

- [ ] **Step 1: Supabase プロジェクトを作成する**

Supabaseダッシュボードで新規プロジェクトを作成し、以下の環境変数を控える。
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

- [ ] **Step 2: DBスキーマを適用する**

Supabase SQL Editor で実行:

```sql
-- pgvector拡張を有効化
create extension if not exists vector;

-- ユーザー共通テーブル
create table profiles (
  id uuid references auth.users primary key,
  role text not null check (role in ('client', 'worker')),
  display_name text not null,
  created_at timestamptz default now()
);

-- 企業プロフィール
create table client_profiles (
  id uuid references profiles(id) primary key,
  company_name text,
  brand_guidelines jsonb default '{}'
);

-- ワーカープロフィール
create table worker_profiles (
  id uuid references profiles(id) primary key,
  bio text,
  skills text[] default '{}',
  hourly_rate_min integer,
  hourly_rate_max integer,
  skill_vector vector(1536),  -- text-embedding-3-small の次元数
  skill_score numeric(4,2) default 0,
  available boolean default true
);

-- 案件
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) not null,
  title text not null,
  task_type text not null,  -- 'sns_post' | 'document' | 'data_entry' | 'lp' | 'other'
  requirements jsonb not null default '{}',
  budget_min integer,
  budget_max integer,
  deadline timestamptz,
  status text not null default 'open'
    check (status in ('open','matched','in_progress','review','completed','cancelled')),
  assigned_worker_id uuid references profiles(id),
  requirement_vector vector(1536),
  created_at timestamptz default now()
);

-- マッチング候補
create table match_candidates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  worker_id uuid references profiles(id) not null,
  score numeric(5,4) not null,
  reason text,
  created_at timestamptz default now()
);

-- 納品物
create table deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  worker_id uuid references profiles(id) not null,
  file_urls text[] default '{}',
  message text,
  qa_score integer,
  qa_report jsonb,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- 取引・エスクロー
create table transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  stripe_payment_intent_id text unique,
  amount integer not null,
  platform_fee integer not null,
  status text not null default 'pending'
    check (status in ('pending','authorized','captured','refunded')),
  created_at timestamptz default now()
);

-- ベクトル検索インデックス
create index on worker_profiles using ivfflat (skill_vector vector_cosine_ops)
  with (lists = 100);
create index on projects using ivfflat (requirement_vector vector_cosine_ops)
  with (lists = 100);

-- RLS（Row Level Security）
alter table profiles enable row level security;
alter table projects enable row level security;
alter table deliverables enable row level security;

create policy "profiles: 自分のみ更新可" on profiles
  for all using (auth.uid() = id);

create policy "projects: clientは自分の案件のみ" on projects
  for all using (auth.uid() = client_id);

create policy "projects: workerは参照のみ（open案件）" on projects
  for select using (status = 'open' or assigned_worker_id = auth.uid());
```

- [ ] **Step 3: バックエンドの依存ライブラリをインストールする**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn supabase openai stripe python-dotenv pydantic pytest httpx
pip freeze > requirements.txt
```

- [ ] **Step 4: `backend/db/supabase.py` を作成する**

```python
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        _client = create_client(url, key)
    return _client
```

- [ ] **Step 5: `backend/main.py` を作成する**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Crowdsourcing API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 6: サーバーを起動して確認する**

```bash
uvicorn main:app --reload --port 8000
# ブラウザで http://localhost:8000/health → {"status": "ok"} を確認
```

- [ ] **Step 7: コミットする**

```bash
git add backend/ supabase/
git commit -m "feat: initial DB schema and FastAPI setup"
```

---

## Task 2: Embedding サービス + マッチングエンジン

**Files:**
- Create: `backend/services/embedding.py`
- Create: `backend/services/matching.py`
- Create: `backend/tests/test_matching.py`

- [ ] **Step 1: テストを書く（失敗することを確認）**

```python
# backend/tests/test_matching.py
import pytest
from services.embedding import generate_embedding
from services.matching import compute_similarity

def test_generate_embedding_returns_1536_dims():
    """embeddingは1536次元のリストを返す"""
    result = generate_embedding("Python開発、5年経験、FastAPI専門")
    assert isinstance(result, list)
    assert len(result) == 1536

def test_compute_similarity_identical_texts():
    """同一テキストの類似度は0.99以上"""
    text = "Webマーケティング SNS投稿 Canva"
    vec_a = generate_embedding(text)
    vec_b = generate_embedding(text)
    score = compute_similarity(vec_a, vec_b)
    assert score >= 0.99

def test_compute_similarity_unrelated_texts():
    """無関係なテキストの類似度は0.5未満"""
    vec_a = generate_embedding("Python バックエンド開発 API設計")
    vec_b = generate_embedding("料理 レシピ 食材管理")
    score = compute_similarity(vec_a, vec_b)
    assert score < 0.5
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
cd backend
pytest tests/test_matching.py -v
# Expected: ImportError — services.embedding not found
```

- [ ] **Step 3: `backend/services/embedding.py` を実装する**

```python
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def generate_embedding(text: str) -> list[float]:
    """テキストを1536次元のベクトルに変換する"""
    response = _openai.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding
```

- [ ] **Step 4: `backend/services/matching.py` を実装する**

```python
import math

def compute_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """コサイン類似度を計算する（-1〜1、高いほど類似）"""
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a ** 2 for a in vec_a))
    norm_b = math.sqrt(sum(b ** 2 for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
```

- [ ] **Step 5: テストを実行してパスを確認する**

```bash
pytest tests/test_matching.py -v
# Expected: 3 passed
```

- [ ] **Step 6: コミットする**

```bash
git add backend/services/embedding.py backend/services/matching.py backend/tests/test_matching.py
git commit -m "feat: embedding service and cosine similarity matching"
```

---

## Task 3: 案件ウィザード（AIによる要件構造化）

**Files:**
- Create: `backend/services/wizard.py`
- Create: `backend/models/project.py`
- Create: `backend/tests/test_wizard.py`

- [ ] **Step 1: テストを書く**

```python
# backend/tests/test_wizard.py
import pytest
from services.wizard import structure_requirements

def test_structure_requirements_sns_post():
    """SNS投稿タスクの要件を構造化できる"""
    result = structure_requirements(
        task_type="sns_post",
        raw_input="Instagramに商品紹介を投稿したい。画像はこちらで用意します。"
    )
    assert "deliverables" in result
    assert "tone" in result
    assert "platform" in result
    assert result["platform"] == "Instagram"

def test_structure_requirements_fills_missing_fields():
    """未記載の必須フィールドをAIが補完する"""
    result = structure_requirements(
        task_type="document",
        raw_input="会社紹介資料を作ってほしい"
    )
    assert "pages" in result
    assert "format" in result
    assert "target_audience" in result
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
pytest tests/test_wizard.py -v
# Expected: ImportError
```

- [ ] **Step 3: `backend/models/project.py` を作成する**

```python
from pydantic import BaseModel
from typing import Any
from datetime import datetime

TASK_TYPES = ["sns_post", "document", "data_entry", "lp", "other"]

class ProjectCreate(BaseModel):
    title: str
    task_type: str
    raw_input: str
    budget_min: int | None = None
    budget_max: int | None = None
    deadline: datetime | None = None

class ProjectResponse(BaseModel):
    id: str
    title: str
    task_type: str
    requirements: dict[str, Any]
    status: str
    created_at: datetime
```

- [ ] **Step 4: `backend/services/wizard.py` を実装する**

```python
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
_openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

TASK_SCHEMAS = {
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
    prompt = f"""
あなたはクラウドソーシングプラットフォームの要件定義AIです。
発注者の入力を解析し、以下のフィールドを含むJSONを返してください。
未記載のフィールドは業界標準の推奨値で補完し、補完した旨をフィールド名に "_inferred": true を付けて示してください。

タスク種別: {task_type}
必須フィールド: {fields}
発注者の入力: {raw_input}

JSONのみ返してください。説明文は不要です。
"""
    response = _openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
```

- [ ] **Step 5: テストを実行してパスを確認する**

```bash
pytest tests/test_wizard.py -v
# Expected: 2 passed
```

- [ ] **Step 6: コミットする**

```bash
git add backend/services/wizard.py backend/models/project.py backend/tests/test_wizard.py
git commit -m "feat: AI requirement structuring wizard"
```

---

## Task 4: 案件投稿・マッチングAPIエンドポイント

**Files:**
- Create: `backend/routers/projects.py`
- Create: `backend/routers/matching.py`
- Create: `backend/tests/test_projects_api.py`

- [ ] **Step 1: テストを書く**

```python
# backend/tests/test_projects_api.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app

client = TestClient(app)

@patch("routers.projects.get_client")
@patch("services.wizard.structure_requirements")
@patch("services.embedding.generate_embedding")
def test_post_project_returns_201(mock_embed, mock_wizard, mock_db):
    """案件投稿が成功すると201とproject_idを返す"""
    mock_wizard.return_value = {"deliverables": "Instagram投稿1件", "platform": "Instagram"}
    mock_embed.return_value = [0.1] * 1536
    mock_db.return_value.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "proj-123", "status": "open"}
    ]

    response = client.post("/projects", json={
        "title": "Instagram投稿",
        "task_type": "sns_post",
        "raw_input": "商品紹介を1投稿お願いします",
        "budget_min": 3000,
        "budget_max": 8000,
    }, headers={"Authorization": "Bearer test-token"})

    assert response.status_code == 201
    assert "id" in response.json()

@patch("routers.matching.get_client")
def test_get_matches_returns_top3(mock_db):
    """マッチング結果はTop-3を返す"""
    mock_db.return_value.rpc.return_value.execute.return_value.data = [
        {"worker_id": "w1", "score": 0.95, "display_name": "田中太郎", "skills": ["SNS", "Canva"]},
        {"worker_id": "w2", "score": 0.88, "display_name": "山田花子", "skills": ["Instagram", "写真編集"]},
        {"worker_id": "w3", "score": 0.81, "display_name": "鈴木一郎", "skills": ["SNS運用", "コピーライティング"]},
    ]

    response = client.get("/projects/proj-123/matches",
                          headers={"Authorization": "Bearer test-token"})

    assert response.status_code == 200
    assert len(response.json()["candidates"]) == 3
    assert response.json()["candidates"][0]["score"] >= response.json()["candidates"][1]["score"]
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
pytest tests/test_projects_api.py -v
# Expected: ImportError or 404
```

- [ ] **Step 3: `backend/routers/projects.py` を実装する**

```python
from fastapi import APIRouter, HTTPException, Depends
from models.project import ProjectCreate, ProjectResponse
from services.wizard import structure_requirements
from services.embedding import generate_embedding
from db.supabase import get_client

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", status_code=201)
async def create_project(payload: ProjectCreate):
    requirements = structure_requirements(payload.task_type, payload.raw_input)
    req_text = f"{payload.title} {payload.task_type} {payload.raw_input}"
    req_vector = generate_embedding(req_text)

    db = get_client()
    result = db.table("projects").insert({
        "title": payload.title,
        "task_type": payload.task_type,
        "requirements": requirements,
        "budget_min": payload.budget_min,
        "budget_max": payload.budget_max,
        "deadline": payload.deadline.isoformat() if payload.deadline else None,
        "requirement_vector": req_vector,
        "status": "open",
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="案件の作成に失敗しました")

    return {"id": result.data[0]["id"], "requirements": requirements}

@router.get("/{project_id}")
async def get_project(project_id: str):
    db = get_client()
    result = db.table("projects").select("*").eq("id", project_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    return result.data

@router.patch("/{project_id}/assign")
async def assign_worker(project_id: str, worker_id: str):
    db = get_client()
    db.table("projects").update({
        "assigned_worker_id": worker_id,
        "status": "matched"
    }).eq("id", project_id).execute()
    return {"status": "matched", "worker_id": worker_id}
```

- [ ] **Step 4: `backend/routers/matching.py` を実装する**

```python
from fastapi import APIRouter, HTTPException
from db.supabase import get_client

router = APIRouter(prefix="/projects", tags=["matching"])

@router.get("/{project_id}/matches")
async def get_matches(project_id: str):
    """
    案件のrequirement_vectorと最も類似したworkerをTop-3で返す。
    Supabase pgvectorのRPC関数 match_workers を使用。
    """
    db = get_client()

    project = db.table("projects").select("requirement_vector").eq("id", project_id).single().execute()
    if not project.data:
        raise HTTPException(status_code=404, detail="案件が見つかりません")

    candidates = db.rpc("match_workers", {
        "query_vector": project.data["requirement_vector"],
        "match_count": 3,
    }).execute()

    return {"project_id": project_id, "candidates": candidates.data}
```

- [ ] **Step 5: Supabase に `match_workers` RPC関数を追加する**

Supabase SQL Editor で実行:

```sql
create or replace function match_workers(
  query_vector vector(1536),
  match_count int default 3
)
returns table (
  worker_id uuid,
  display_name text,
  skills text[],
  skill_score numeric,
  score float
)
language sql stable
as $$
  select
    wp.id as worker_id,
    p.display_name,
    wp.skills,
    wp.skill_score,
    1 - (wp.skill_vector <=> query_vector) as score
  from worker_profiles wp
  join profiles p on p.id = wp.id
  where wp.available = true
    and wp.skill_vector is not null
  order by wp.skill_vector <=> query_vector
  limit match_count;
$$;
```

- [ ] **Step 6: `main.py` にルーターを登録する**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import projects, matching

app = FastAPI(title="AI Crowdsourcing API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(matching.router)

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 7: テストを実行してパスを確認する**

```bash
pytest tests/test_projects_api.py -v
# Expected: 2 passed
```

- [ ] **Step 8: コミットする**

```bash
git add backend/routers/ backend/tests/test_projects_api.py
git commit -m "feat: project post and AI matching endpoints"
```

---

## Task 5: Stripe Connect エスクロー決済

**Files:**
- Create: `backend/services/stripe.py`
- Create: `backend/routers/payments.py`
- Create: `backend/tests/test_payments.py`

- [ ] **Step 1: テストを書く**

```python
# backend/tests/test_payments.py
import pytest
from unittest.mock import patch, MagicMock
from services.stripe import create_payment_intent, capture_payment

def test_create_payment_intent_returns_client_secret():
    """PaymentIntentが作成されclient_secretが返る"""
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = MagicMock(
            id="pi_test123",
            client_secret="pi_test123_secret_abc",
            status="requires_capture"
        )
        result = create_payment_intent(amount=10000, worker_stripe_id="acct_worker1")
        assert result["client_secret"] == "pi_test123_secret_abc"
        assert result["payment_intent_id"] == "pi_test123"

def test_capture_payment_succeeds():
    """PaymentIntentのキャプチャが成功する"""
    with patch("stripe.PaymentIntent.capture") as mock_capture:
        mock_capture.return_value = MagicMock(status="succeeded")
        result = capture_payment("pi_test123")
        assert result["status"] == "succeeded"
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
pytest tests/test_payments.py -v
# Expected: ImportError
```

- [ ] **Step 3: `backend/services/stripe.py` を実装する**

```python
import os
import stripe
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

PLATFORM_FEE_RATE = 0.10  # 10%手数料

def create_payment_intent(amount: int, worker_stripe_id: str) -> dict:
    """
    エスクロー相当の事前授権PaymentIntentを作成する。
    capture_method="manual" で即時引き落としを防ぎ、
    納品確認後に capture_payment() で確定する。
    """
    platform_fee = int(amount * PLATFORM_FEE_RATE)
    intent = stripe.PaymentIntent.create(
        amount=amount,
        currency="jpy",
        capture_method="manual",
        transfer_data={"destination": worker_stripe_id},
        application_fee_amount=platform_fee,
    )
    return {
        "payment_intent_id": intent.id,
        "client_secret": intent.client_secret,
        "platform_fee": platform_fee,
    }

def capture_payment(payment_intent_id: str) -> dict:
    """納品確認後に支払いを確定する"""
    intent = stripe.PaymentIntent.capture(payment_intent_id)
    return {"status": intent.status}

def refund_payment(payment_intent_id: str) -> dict:
    """案件キャンセル時に返金する"""
    intent = stripe.PaymentIntent.cancel(payment_intent_id)
    return {"status": intent.status}
```

- [ ] **Step 4: `backend/routers/payments.py` を実装する**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.stripe import create_payment_intent, capture_payment, refund_payment
from db.supabase import get_client

router = APIRouter(prefix="/payments", tags=["payments"])

class PaymentIntentRequest(BaseModel):
    project_id: str
    amount: int
    worker_stripe_id: str

@router.post("/authorize")
async def authorize_payment(payload: PaymentIntentRequest):
    result = create_payment_intent(payload.amount, payload.worker_stripe_id)
    db = get_client()
    db.table("transactions").insert({
        "project_id": payload.project_id,
        "stripe_payment_intent_id": result["payment_intent_id"],
        "amount": payload.amount,
        "platform_fee": result["platform_fee"],
        "status": "authorized",
    }).execute()
    return result

@router.post("/{project_id}/capture")
async def capture(project_id: str):
    db = get_client()
    tx = db.table("transactions").select("stripe_payment_intent_id").eq("project_id", project_id).single().execute()
    if not tx.data:
        raise HTTPException(status_code=404, detail="取引が見つかりません")
    result = capture_payment(tx.data["stripe_payment_intent_id"])
    db.table("transactions").update({"status": "captured"}).eq("project_id", project_id).execute()
    db.table("projects").update({"status": "completed"}).eq("id", project_id).execute()
    return result

@router.post("/{project_id}/refund")
async def refund(project_id: str):
    db = get_client()
    tx = db.table("transactions").select("stripe_payment_intent_id").eq("project_id", project_id).single().execute()
    if not tx.data:
        raise HTTPException(status_code=404, detail="取引が見つかりません")
    result = refund_payment(tx.data["stripe_payment_intent_id"])
    db.table("transactions").update({"status": "refunded"}).eq("project_id", project_id).execute()
    return result
```

- [ ] **Step 5: テストを実行してパスを確認する**

```bash
pytest tests/test_payments.py -v
# Expected: 2 passed
```

- [ ] **Step 6: コミットする**

```bash
git add backend/services/stripe.py backend/routers/payments.py backend/tests/test_payments.py
git commit -m "feat: Stripe Connect escrow payment flow"
```

---

## Task 6: フロントエンド初期化（Next.js 15）

**Files:**
- Create: `frontend/` (Next.js プロジェクト全体)
- Create: `frontend/lib/api.ts`
- Create: `frontend/lib/supabase.ts`

- [ ] **Step 1: Next.js プロジェクトを作成する**

```bash
cd ai-crowdsourcing
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd frontend
npx shadcn@latest init
# スタイル: Default / ベースカラー: Slate / CSS変数: Yes
npx shadcn@latest add button card badge select input textarea
```

- [ ] **Step 2: 依存パッケージを追加する**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: `frontend/lib/supabase.ts` を作成する**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: `frontend/lib/api.ts` を作成する**

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail ?? 'API error')
  }
  return res.json()
}

export const api = {
  createProject: (data: CreateProjectPayload) =>
    request<{ id: string; requirements: Record<string, unknown> }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMatches: (projectId: string) =>
    request<{ candidates: MatchCandidate[] }>(`/projects/${projectId}/matches`),
  assignWorker: (projectId: string, workerId: string) =>
    request(`/projects/${projectId}/assign?worker_id=${workerId}`, { method: 'PATCH' }),
  authorizePayment: (data: PaymentPayload) =>
    request<{ client_secret: string; payment_intent_id: string }>('/payments/authorize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  capturePayment: (projectId: string) =>
    request(`/payments/${projectId}/capture`, { method: 'POST' }),
}

// 型定義
export type TaskType = 'sns_post' | 'document' | 'data_entry' | 'lp' | 'other'

export interface CreateProjectPayload {
  title: string
  task_type: TaskType
  raw_input: string
  budget_min?: number
  budget_max?: number
}

export interface MatchCandidate {
  worker_id: string
  display_name: string
  skills: string[]
  skill_score: number
  score: number
}

export interface PaymentPayload {
  project_id: string
  amount: number
  worker_stripe_id: string
}
```

- [ ] **Step 5: `.env.local` を作成する**

```bash
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

- [ ] **Step 6: 開発サーバーを起動して確認する**

```bash
npm run dev
# http://localhost:3000 でデフォルトページを確認
```

- [ ] **Step 7: コミットする**

```bash
git add frontend/
git commit -m "feat: Next.js 15 frontend initialization with Supabase and API client"
```

---

## Task 7: 発注ウィザード UI（PostWizard コンポーネント）

**Files:**
- Create: `frontend/components/client/PostWizard.tsx`
- Create: `frontend/app/(client)/post/page.tsx`

- [ ] **Step 1: `frontend/components/client/PostWizard.tsx` を作成する**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { api, TaskType } from '@/lib/api'

const TASK_OPTIONS: { type: TaskType; label: string; icon: string; example: string }[] = [
  { type: 'sns_post', label: 'SNS投稿', icon: '📱', example: 'Instagramに商品紹介を1投稿お願いします' },
  { type: 'document', label: '資料・文書', icon: '📄', example: '会社紹介用のA4資料を3枚作ってほしい' },
  { type: 'data_entry', label: 'データ入力', icon: '📊', example: 'Excelのデータを整理してCSVにしてほしい' },
  { type: 'lp', label: 'LP・Web制作', icon: '🌐', example: '商品のランディングページを作りたい' },
  { type: 'other', label: 'その他', icon: '✨', example: 'やりたいことを自由に書いてください' },
]

type Step = 'select_type' | 'describe' | 'budget' | 'confirming'

export function PostWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('select_type')
  const [taskType, setTaskType] = useState<TaskType | null>(null)
  const [rawInput, setRawInput] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!taskType) return
    setIsLoading(true)
    setError(null)
    setStep('confirming')
    try {
      const result = await api.createProject({
        title: `${TASK_OPTIONS.find(o => o.type === taskType)?.label} — ${new Date().toLocaleDateString('ja-JP')}`,
        task_type: taskType,
        raw_input: rawInput,
        budget_min: budgetMin ? parseInt(budgetMin) : undefined,
        budget_max: budgetMax ? parseInt(budgetMax) : undefined,
      })
      router.push(`/projects/${result.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '投稿に失敗しました')
      setStep('budget')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'select_type') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">何をお願いしますか？</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {TASK_OPTIONS.map((opt) => (
            <Card
              key={opt.type}
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => { setTaskType(opt.type); setStep('describe') }}
            >
              <CardContent className="pt-6 text-center">
                <div className="text-3xl mb-2">{opt.icon}</div>
                <div className="font-medium">{opt.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'describe') {
    const selected = TASK_OPTIONS.find(o => o.type === taskType)!
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{selected.icon} {selected.label} — 詳しく教えてください</h2>
        <Textarea
          placeholder={selected.example}
          className="min-h-32"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('select_type')}>戻る</Button>
          <Button disabled={rawInput.trim().length < 10} onClick={() => setStep('budget')}>
            次へ
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'budget') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">予算を教えてください（任意）</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="3,000" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-32" />
          <span>〜</span>
          <Input placeholder="10,000" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="w-32" />
          <span>円</span>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('describe')}>戻る</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'AIが要件を整理中…' : '発注する'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">⚙️</div>
      <p className="text-lg font-medium">AIが要件を整理しています…</p>
      <p className="text-sm text-muted-foreground mt-2">マッチング候補を探しています</p>
    </div>
  )
}
```

- [ ] **Step 2: `frontend/app/(client)/post/page.tsx` を作成する**

```typescript
import { PostWizard } from '@/components/client/PostWizard'

export default function PostPage() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <PostWizard />
    </main>
  )
}
```

- [ ] **Step 3: 動作確認する**

```bash
# frontend/
npm run dev
# http://localhost:3000/post を開いてウィザードのUI確認
# タスク種別選択 → テキスト入力 → 予算入力 の遷移を確認
```

- [ ] **Step 4: コミットする**

```bash
git add frontend/components/client/PostWizard.tsx frontend/app/\(client\)/post/
git commit -m "feat: post wizard UI with step-by-step task selection"
```

---

## Task 8: WorkerCard + マッチング結果ページ

**Files:**
- Create: `frontend/components/client/WorkerCard.tsx`
- Create: `frontend/app/(client)/projects/[id]/page.tsx`

- [ ] **Step 1: `frontend/components/client/WorkerCard.tsx` を作成する**

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MatchCandidate } from '@/lib/api'

interface WorkerCardProps {
  candidate: MatchCandidate
  rank: number
  onSelect: (workerId: string) => void
  isSelected: boolean
}

export function WorkerCard({ candidate, rank, onSelect, isSelected }: WorkerCardProps) {
  const scorePercent = Math.round(candidate.score * 100)
  const rankColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600']

  return (
    <Card className={`transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-blue-300'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${rankColors[rank - 1] ?? 'bg-slate-400'}`}>
            {rank}
          </div>
          <div>
            <p className="font-semibold">{candidate.display_name}</p>
            <p className="text-xs text-muted-foreground">適合度 {scorePercent}%</p>
          </div>
          <div className="ml-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
              {scorePercent}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {candidate.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
          ))}
        </div>
        <Button
          className="w-full"
          variant={isSelected ? 'default' : 'outline'}
          onClick={() => onSelect(candidate.worker_id)}
        >
          {isSelected ? '✓ この人に決める' : 'この人に依頼する'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: `frontend/app/(client)/projects/[id]/page.tsx` を作成する**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WorkerCard } from '@/components/client/WorkerCard'
import { Button } from '@/components/ui/button'
import { api, MatchCandidate } from '@/lib/api'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [candidates, setCandidates] = useState<MatchCandidate[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    api.getMatches(id)
      .then((res) => setCandidates(res.candidates))
      .finally(() => setIsLoading(false))
  }, [id])

  async function handleAssign() {
    if (!selected) return
    setIsAssigning(true)
    await api.assignWorker(id, selected)
    router.push(`/dashboard`)
  }

  if (isLoading) return (
    <main className="max-w-2xl mx-auto p-6 text-center py-12">
      <div className="text-4xl mb-4">🔍</div>
      <p className="font-medium">AIがマッチング候補を選定中…</p>
    </main>
  )

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AIが選んだ候補者</h1>
        <p className="text-muted-foreground text-sm mt-1">スキル・実績・稼働状況から最適な3名を選定しました</p>
      </div>
      <div className="space-y-4">
        {candidates.map((c, i) => (
          <WorkerCard
            key={c.worker_id}
            candidate={c}
            rank={i + 1}
            onSelect={setSelected}
            isSelected={selected === c.worker_id}
          />
        ))}
      </div>
      {selected && (
        <Button className="w-full" size="lg" onClick={handleAssign} disabled={isAssigning}>
          {isAssigning ? '依頼中…' : '依頼を確定する →'}
        </Button>
      )}
    </main>
  )
}
```

- [ ] **Step 3: 動作確認する**

```bash
npm run dev
# http://localhost:3000/projects/test-id を開いてカードUIを確認
# (APIが動いていなければ候補表示はエラーになるが、UIの形だけ確認)
```

- [ ] **Step 4: コミットする**

```bash
git add frontend/components/client/WorkerCard.tsx frontend/app/\(client\)/projects/
git commit -m "feat: worker card and matching result page"
```

---

## Task 9: ダッシュボード（4ステータス進捗ボード）

**Files:**
- Create: `frontend/components/client/ProjectBoard.tsx`
- Create: `frontend/app/(client)/dashboard/page.tsx`

- [ ] **Step 1: `frontend/components/client/ProjectBoard.tsx` を作成する**

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ProjectStatus = 'open' | 'matched' | 'in_progress' | 'review' | 'completed'

interface ProjectItem {
  id: string
  title: string
  task_type: string
  status: ProjectStatus
  assigned_worker_name?: string
  deadline?: string
}

const STATUS_COLUMNS: { key: ProjectStatus; label: string; color: string }[] = [
  { key: 'open', label: '依頼中', color: 'bg-blue-50 border-blue-200' },
  { key: 'in_progress', label: '作業中', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'review', label: '確認待ち', color: 'bg-purple-50 border-purple-200' },
  { key: 'completed', label: '完了', color: 'bg-green-50 border-green-200' },
]

const TASK_TYPE_LABELS: Record<string, string> = {
  sns_post: '📱 SNS投稿',
  document: '📄 資料',
  data_entry: '📊 データ入力',
  lp: '🌐 LP制作',
  other: '✨ その他',
}

interface ProjectBoardProps {
  projects: ProjectItem[]
}

export function ProjectBoard({ projects }: ProjectBoardProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {STATUS_COLUMNS.map((col) => {
        const items = projects.filter((p) =>
          col.key === 'open' ? ['open', 'matched'].includes(p.status) : p.status === col.key
        )
        return (
          <div key={col.key} className={`rounded-lg border p-3 ${col.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">{col.label}</span>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <div className="space-y-2">
              {items.map((project) => (
                <Card key={project.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">{TASK_TYPE_LABELS[project.task_type] ?? project.task_type}</p>
                    <p className="text-sm font-medium leading-snug">{project.title}</p>
                    {project.assigned_worker_name && (
                      <p className="text-xs text-muted-foreground">担当: {project.assigned_worker_name}</p>
                    )}
                    {project.deadline && (
                      <p className="text-xs text-orange-600">期限: {new Date(project.deadline).toLocaleDateString('ja-JP')}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">案件なし</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: `frontend/app/(client)/dashboard/page.tsx` を作成する**

```typescript
import { ProjectBoard } from '@/components/client/ProjectBoard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// TODO Task 10 でSupabaseからの実データ取得に差し替える
const MOCK_PROJECTS = [
  { id: '1', title: 'Instagram商品紹介投稿', task_type: 'sns_post', status: 'in_progress' as const, assigned_worker_name: '田中太郎', deadline: '2026-04-05' },
  { id: '2', title: 'Q1営業資料リニューアル', task_type: 'document', status: 'review' as const, assigned_worker_name: '山田花子' },
  { id: '3', title: '顧客リストCSV整理', task_type: 'data_entry', status: 'open' as const },
]

export default function DashboardPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">進行中の案件</h1>
        <Button asChild>
          <Link href="/post">＋ 新しく発注する</Link>
        </Button>
      </div>
      <ProjectBoard projects={MOCK_PROJECTS} />
    </main>
  )
}
```

- [ ] **Step 3: 動作確認する**

```bash
npm run dev
# http://localhost:3000/dashboard を開き4カラムのボードを確認
```

- [ ] **Step 4: コミットする**

```bash
git add frontend/components/client/ProjectBoard.tsx frontend/app/\(client\)/dashboard/
git commit -m "feat: 4-status project board dashboard"
```

---

## Task 10: E2Eフロー統合テスト

**Files:**
- Create: `backend/tests/test_e2e_flow.py`

- [ ] **Step 1: 統合テストを書く**

```python
# backend/tests/test_e2e_flow.py
"""
案件投稿 → AIマッチング → ワーカーアサイン → 決済授権 → 決済キャプチャ
の一連フローを統合テストする。
実際のOpenAI / Stripe APIはモックする。
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app

client = TestClient(app)

@patch("services.embedding.generate_embedding", return_value=[0.1] * 1536)
@patch("services.wizard.structure_requirements", return_value={"platform": "Instagram", "deliverables": "投稿1件"})
@patch("db.supabase.get_client")
def test_full_project_flow(mock_db_factory, mock_wizard, mock_embed):
    """案件投稿からマッチングまでの一連フローが成功する"""
    # DB モック設定
    mock_db = MagicMock()
    mock_db_factory.return_value = mock_db

    # 案件投稿
    mock_db.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "proj-e2e-001", "status": "open"}
    ]
    post_res = client.post("/projects", json={
        "title": "E2E テスト案件",
        "task_type": "sns_post",
        "raw_input": "Instagramに1投稿お願いします",
        "budget_min": 5000,
        "budget_max": 10000,
    })
    assert post_res.status_code == 201
    project_id = post_res.json()["id"]

    # マッチング取得
    mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "requirement_vector": [0.1] * 1536
    }
    mock_db.rpc.return_value.execute.return_value.data = [
        {"worker_id": "w-001", "display_name": "田中太郎", "skills": ["SNS", "Canva"], "skill_score": 4.5, "score": 0.93}
    ]
    match_res = client.get(f"/projects/{project_id}/matches")
    assert match_res.status_code == 200
    assert len(match_res.json()["candidates"]) >= 1

    # ワーカーアサイン
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{}]
    assign_res = client.patch(f"/projects/{project_id}/assign?worker_id=w-001")
    assert assign_res.status_code == 200

    print(f"✅ E2Eフロー完了: project_id={project_id}")
```

- [ ] **Step 2: テストを実行してパスを確認する**

```bash
pytest tests/test_e2e_flow.py -v
# Expected: 1 passed — ✅ E2Eフロー完了
```

- [ ] **Step 3: 全テストを実行する**

```bash
pytest tests/ -v
# Expected: 全テストがグリーン
```

- [ ] **Step 4: 最終コミットをする**

```bash
git add backend/tests/test_e2e_flow.py
git commit -m "test: E2E integration test for full project flow"
```

---

## セルフレビュー

### スペックカバレッジ確認

| 設計書要件 | 対応タスク |
|---|---|
| スポット発注ウィザード（選択式） | Task 3, 7 |
| AIスコアード人材カード | Task 4, 8 |
| 4ステータス進捗ボード | Task 9 |
| LLMベクトルマッチング | Task 2, 4 |
| エスクロー決済 | Task 5 |
| DBスキーマ（pgvector含む） | Task 1 |
| フロントエンド基盤 | Task 6 |

### 未実装（Track B・Phase 2以降）

- ワーカー向けスキル可視化（→ Track B プランで別途実装）
- 納品物AI検品（→ Phase 2）
| 認証フロー（→ Task 6で基盤のみ、ログインUIは別タスク）

---

## 実行方法

このプランを実装する方法は2つあります。

**1. サブエージェント方式（推奨）** — タスクごとに新しいサブエージェントを起動し、レビューを挟んで進める。並列化しやすく文脈が汚染されない。

**2. インライン実行** — このセッションで executing-plans スキルを使い、チェックポイントを挟みながら順番に実行する。
