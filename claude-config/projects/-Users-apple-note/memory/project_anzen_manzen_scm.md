---
name: 安全完全万全フロー 海外SCM拡張
description: かねひさ×住友林業の物流アプリ。海外SCM拡張設計書の場所と設計判断の核
type: project
---

**安全完全万全フロー**（=「安全完全万全（プロ）」）= かねひさ株式会社（久々山大樹社長）発注・POSTCABINETS開発・住友林業（荷主）向けの物流管理Webアプリ。Next.js 16 + Supabase(PG15+) + RLS。

- 本体: `/Users/apple/POSTCABINETS.co-ltd/anzen-manzen-flow/`（既存001スキーマ: tenants/users/shipments/photos/status_logs 等、RLS済）
- 海外SCM拡張設計書: `docs/GLOBAL_SCM_DESIGN.md`（2026-06-06作成、機能仕様＋データモデル粒度）

**設計の核（商談②由来）**:
- 国内配送アプリを起点に「海外調達→海上輸送→通関→国内」を1本のトレーサビリティで貫く。`shipment`を親、`leg`(物流区間)を子に分解。
- 最重要要件＝**粗利・原価は荷主だけに見せ、運送会社には見せない**。デモでこれが漏れるのが最悪の事故。
- 過積載は「警告」でなく「本当に走れない」=DBのCHECK制約で物理抑止。

**実装時の地雷（検証で確定）**:
1. `ALTER TYPE ADD VALUE` は同一トランザクションで使うと落ちる→enum追加は別マイグレーションで単独コミット
2. 原価秘匿はPostgreSQL列RLS非対応のため、原価を`lot_costs`別テーブルに分離して行RLSで遮断（API層で列を落とす方式は不可）
3. `v_shipment_margin`は`security_invoker=true`(PG15+)必須。GRANTは行を絞らない
4. `user_role='admin'`はプラットフォーム運営専用。運送会社の管理者をadminにすると`is_admin()`で原価が全部見える→`tenant_admin`を別途新設

**未確定（要ヒアリング）**: 請求額の源泉(invoices)、incoterms運用、本船トラッキングのデータソース。

関連: [[feedback_verify_sql_in_real_db]]
