---
name: anzen-flow
description: 安全完全万全フロー3分割モノレポ(pnpm+Turborepo+Next16)の構造と、二重React型/proxy規約のハマりどころ
metadata: 
  node_type: memory
  type: reference
  originSessionId: d0a051fa-e9b9-415f-9f17-21c304310aae
---

`POSTCABINETS.co-ltd/anzen-manzen-flow` を3システム(driver/admin+warehouse/shipper)に分割したモノレポ。
かねひさ社→住友林業向け物流安全管理。設計書: `docs/superpowers/specs/2026-06-06-3system-split-design.md`、計画: `docs/superpowers/plans/2026-06-06-3system-split.md`。

## 構成
- `packages/config`(@anzen/config: tsconfig.base/postcss/globals.css/design-tokens)
- `packages/ui`(@anzen/ui: ds/ui/shared。`.`と`/shared`と`/lib/utils`の3エントリ)
- `packages/data`(@anzen/data: types優先export。mock生データは`@anzen/data/mock`サブパスで衝突回避。queriesがmock↔実DB切替)
- `apps/{driver,admin,shipper}` → Vercel独立3プロジェクト(Root Directory=apps/<name>)

## ハマったポイント（次回必ず再利用）
1. **二重React型でビルド失敗**: pnpm が peer の `next` を `@anzen/ui/node_modules` に重複インストールし、`next/link`のJSX型が別の@types/reactを見て `'Link' cannot be used as a JSX component` エラー。
   → `.npmrc` に `dedupe-peer-dependents=true` + `public-hoist-pattern[]=*react*` / `@types/react*` / `next` を追加し、`rm -rf node_modules && pnpm install` で単一化して解決。
2. **Next.js 16 は `proxy.ts` がミドルウェア規約**(従来の middleware.ts ではない)。ビルド出力に `ƒ Proxy (Middleware)` と出る。proxyが`@supabase/ssr`を直importするので各appのdepsに必要。
3. **ルートプレフィックスは維持**(/admin,/warehouse等)。剥がすと内部リンク(href="/admin/...")全書換でリスク大。独立アプリなのでURLにプレフィックスが残っても実害なし。
4. **Tailwind v4(CSS-first)**: app/globals.cssに `@source "../../../packages/ui/src"` を追加しないと共有UIのクラスがビルドに含まれず崩れる。
5. **mock型≠DB型**: UIは`MockShipment`(camelCase)、DBは`Shipment`(snake_case)。queries層(`@anzen/data`)が`getShipments()`等でdemo=mock/本番=Supabaseを切替、`toMockShipment(row)`でDB行→UI形にマッピング。代表2画面(admin/shipments, shipper/tracking)はServer Component化してqueries経由済み。残り画面の展開はPhase3。
6. **ShipmentStatusはtypes.tsが単一ソース**(7値, cancelled含む)。mock側の独自6値定義は削除済み。Record<ShipmentStatus>やswitchを書くとcancelled網羅が必要。
7. **認証proxyは`@anzen/data/auth`の`createRoleProxy({protectedRoutes,fallback,publicPrefixes})`に共通化**。ただしproxy.tsの`export const config={matcher:[...]}`はNextが静的解析するため各appにリテラルで置く(共通化不可)。
8. **認可はfail-closed**: proxyのRBACで`role && !allowed`の短絡はrole未設定ユーザーを素通りさせる(HIGH脆弱性)。role無し→拒否(/login)に。
9. **RLSのINSERT/UPDATEは所有権ガード必須**: incidents/breaks等で`driver_id = auth.uid() OR is_admin()`(NULL許容なら OR driver_id IS NULL)を入れないと他人になりすました虚偽帰属ができる(IDOR)。tenant一致だけでは不十分。自動セキュリティレビューが検出。

**Why:** Opus設計→Sonnet実装の前提で、Sonnetが同じ罠を踏まないよう記録。quality-reviewerの指摘で4→7を補強。
**How to apply:** このリポの実装継続、または他のNext16 pnpmモノレポ分割で同症状が出たら1→7を順に当てる。
Phase3-4の手操作手順(Supabase作成/Vercel接続)は `docs/PHASE3_SUPABASE_VERCEL_SETUP.md` に集約。003マイグレーション(不足: incidents/breaks/vehicles)は [[feedback_verify_sql_in_real_db]] に従い実DBで流して検証。原価秘匿等のSCM拡張は [[project_anzen_manzen_scm]] 参照。
