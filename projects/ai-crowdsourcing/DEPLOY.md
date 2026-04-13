# デプロイ手順

## 1. Supabase — DBセットアップ

```bash
# プロジェクト作成後、ダッシュボードの「SQL Editor」で実行
cat supabase/migrations/20260330000000_initial.sql | pbcopy
# → Supabase SQL Editorにペーストして実行

# または Supabase CLI でリンク後にマイグレーション適用
supabase link --project-ref <PROJECT_REF>
supabase db push
```

控えるもの:
- `SUPABASE_URL` (例: https://xxxx.supabase.co)
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. バックエンド — Railway

```bash
# Railway CLIでログイン
railway login

# プロジェクト作成 & デプロイ
cd ai-crowdsourcing/backend
railway init          # 新規プロジェクト作成
railway up            # デプロイ

# 環境変数を設定（Railway ダッシュボード or CLI）
railway variables set OPENAI_API_KEY=sk-...
railway variables set SUPABASE_URL=https://xxxx.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJ...
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set FRONTEND_URL=https://your-app.vercel.app
```

デプロイ後のURL: `https://xxxx.railway.app`

---

## 3. バックエンド — Render（代替・無料枠あり）

1. [render.com](https://render.com) でアカウント作成
2. New → Web Service → GitHubリポジトリ接続
3. Root Directory: `ai-crowdsourcing/backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. 環境変数を Dashboard で設定（render.yaml 参照）

---

## 4. フロントエンド — Vercel

```bash
cd ai-crowdsourcing/frontend
vercel --prod

# 環境変数を設定
vercel env add NEXT_PUBLIC_API_URL        # → Railway/RenderのURL
vercel env add NEXT_PUBLIC_SUPABASE_URL   # → Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  # → Supabase Anon Key

# 再デプロイ（環境変数反映）
vercel --prod
```

---

## ローカル起動（確認用）

```bash
# バックエンド
cd ai-crowdsourcing/backend
cp .env.example .env  # → 実際のキーを記入
source venv/bin/activate
uvicorn main:app --reload --port 8000

# フロントエンド（別ターミナル）
cd ai-crowdsourcing/frontend
# .env.local に実際のキーを記入済みであることを確認
npm run dev
```
