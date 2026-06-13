---
name: SQL設計は実DBで流して検証する
description: SQL/スキーマ設計書はローカルPostgreSQLで実際に流すと机上で見えない穴が出る
type: feedback
---

SQL・DBスキーマを含む設計書／実装は、**ローカルPostgreSQLで実際に流して検証する**。机上レビューだけでは見つからない破綻が出る。

**Why:** 安全完全万全フローの海外SCM設計（2026-06-06）で、quality-reviewerが机上で7つのSQL破綻を指摘。修正後、ローカルPG14で実際にロールスイッチ込みで流したら、**レビューでも気づかなかった8つ目の穴**（`user_role='admin'`の運送会社管理者が`is_admin()`で荷主原価を全部見られる）を発見した。実データINSERT→`SET ROLE`→`SET app.uid`でRLSをセッション別に再現したからこそ出た。

**How to apply:**
- 環境: `brew services`のpostgresql@14が常駐（`pg_isready`で確認）。Docker(OrbStack)は落ちてることがあるのでpsql直が速い。
- 手順: 検証用DB作成→auth.users/auth.uid()をスタブ化→001等の土台を流す→設計書のDDLを流す→`CREATE ROLE app_user NOLOGIN`+`SET ROLE`+`SET app.uid='...'`でRLSをユーザー別に検証→`DROP DATABASE`で後片付け。
- 特にRLS・粗利/原価の可視性・CHECK制約・トリガーは「期待挙動を1行ずつアサート」する（例: 運送会社で原価0行、過積載で制約違反）。
- `ALTER TYPE ADD VALUE`の同一tx制約、`security_invoker`のPGバージョン依存など、バージョン固有の罠も実機で確定できる。

例外: ロジックの無い純粋なドキュメントには不要。SQL/スキーマ/RLSが絡んだら必須。
