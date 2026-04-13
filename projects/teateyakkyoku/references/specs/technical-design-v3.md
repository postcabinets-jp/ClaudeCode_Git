# てあて薬局アプリ 技術設計書 v3.0

**作成日**: 2026-04-08
**ステータス**: 設計確定 -- 実装着手可能
**前提ドキュメント**: business-plan.md / platform-proposal.md / pricing-proposal.md / technical-design-v2.md
**変更点**: v2.0で指摘された5つの課題（UX体験設計、キャラクター分岐、漢方DB連携、認証設計、データベース設計）を全て解決

---

## 0. プロダクト定義

### 0.1 このアプリは何か

法人の社員が毎日使う体調管理PWA。漢方の体質診断と日次チェックインで疲労傾向を可視化し、薬局（炭谷さん）への相談・漢方の自己学習につなげる。

### 0.2 BtoB2C構造

```
炭谷さん（薬局オーナー）
  └─ 法人（人事・経営者）← 月額サブスクで契約
        └─ 社員（エンドユーザー）← 毎日アプリを使う
```

### 0.3 コアバリュー

1. **自分の疲労タイプがわかる** -- 5分の診断で「なぜ疲れるか」の解像度が上がる
2. **毎日30秒で体調を記録できる** -- チェックインで自分の変化に気づける
3. **漢方の知識が身につく** -- 140種の漢方辞典でセルフケアの選択肢が広がる
4. **キャラクターが育つ** -- 継続のモチベーション設計

### 0.4 MVPで「やらないこと」

| 機能 | 理由 |
|------|------|
| AIチャット | 免責事項整備・APIコスト検証が先 |
| EC（購入機能） | 薬局の店頭/オンライン相談で対応 |
| LINE連携 | 公式アカウント未開設。継続率データを見てから判断 |
| 法人管理画面 | パイロット法人獲得後に設計 |
| プッシュ通知 | メール通知で代替。Phase 2で検討 |
| ポイント制度 | 使途がない。v2で削除決定済み |

---

## 1. UX設計判断（v2課題の解決）

### 1.1 課題1: オンボーディング → 診断の体験設計

**問題**: 「無料で始める」直後に20問の質問攻めが発生する。離脱リスクが高い。

**設計判断: 20問を維持する。ただしUXで体感負荷を下げる。**

**根拠**:
- 5タイプ x 4問 = 20問は分類精度の最低ライン。10問に減らすとタイプ判定が不安定になる（各タイプ2問では1問のブレで結果が変わる）
- 競合の性格診断アプリ（16Personalities等）は60問以上で成立している。20問は相対的に短い
- 問題は「問数」ではなく「体感の重さ」。UIの工夫で解決する

**具体的な体感軽減策**:

1. **オンボーディングで期待値を設定する**: 「10の質問」ではなく「5分の疲労診断」と表記する（現在の実装で既にそうなっている）
2. **1問1画面のカード形式**: 全問一覧ではなく、1問ずつ表示（現在の実装で既にそうなっている）
3. **自動進行**: 回答タップで180ms後に次の問へ自動遷移（現在の実装で既にそうなっている）
4. **カテゴリドット表示**: 5つのドットで「今どのセクションか」を可視化（現在の実装で既にそうなっている）
5. **プログレスバー**: 残り何%かを常に表示（現在の実装で既にそうなっている）
6. **戻るボタン**: 前の問に戻れる安心感（現在の実装で既にそうなっている）

**追加する改善**:

7. **セクション間の区切り画面を追加する**: 4問ごとに「脳疲労チェック完了! 次は血流チェックだよ」のような1秒のインタースティシャルを表示する。20問が「5セクション x 4問」に分割され、体感が軽くなる
8. **免責事項の同意チェックをオンボーディングに追加する**: 現在は同意なしで進める実装になっている。法的に必須

**フロー変更**:

```
変更前:
  ウェルカム → ニックネーム入力 → 診断20問（一気通貫）→ 結果

変更後:
  ウェルカム → ニックネーム入力 + 免責同意チェック → 診断（4問 → 区切り → 4問 → 区切り → ...）→ 結果
```

### 1.2 課題2: キャラクター選択のルート設計

**問題**: 20問の回答パターンで5キャラにバランスよく分散するか？ 同点の場合は？

**分析結果**:

現在の `calcDiagnosisResult()` の実装:
- 各タイプ4問、0-4点のスケールで最大16点/タイプ
- `sorted[0][0]` が primaryType、`sorted[1][0]` が secondaryType
- **同点の場合**: `Array.sort()` は安定ソートだが、同点のタイプ間の順序は配列定義順（brain > blood > nerve > organ > energy）になる

**設計判断: 同点処理を明示的に実装する。分布バランスは許容する。**

**根拠**:
- 質問の内容が偏りを生む（例: 「冷え」は血流、「だるさ」はエネルギーに集中しやすい）。完全均等は目標ではない
- 重要なのは「ユーザーが自分の結果に納得するか」。分布の均等さよりも質問と結果の整合性が優先
- 同点の場合に暗黙の優先順位（配列順）で決まるのはバグに近い。ユーザーに選ばせるか、ランダムにする

**具体的な変更**:

```typescript
// diagnosis.ts に同点処理を追加
// 同点が2つ以上ある場合: ランダムに選択（Math.random()でシャッフル）
// 理由: ユーザーに選ばせるUIは診断感を損なう。ランダム選択 + 再診断で対応
const sorted = (Object.entries(scores) as [FatigueType, number][])
  .sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return Math.random() - 0.5; // 同点はランダム
  });
```

**キャラ選択後の画面構成**: 現在の `/result` ページの構成は適切。変更不要。

- タイプ名 + キャラクター表示
- 5タイプのスコアバー（全体像が見える）
- キャラクター説明
- シェアボタン
- ホームへのCTA

### 1.3 課題3: 漢方データベース連携

**問題**: kampo-master.json（140件）がアプリで正しく機能するか。疲労タイプとのマッピングは正確か。

**分析結果**:

`products-data.ts` の `resolveTypes()` は二段階マッピングを実装済み:
1. **薬効分類ベース**: `CLASSIFICATION_MAP` で classification 配列 → FatigueType[]
2. **症状ベース補完**: `SYMPTOM_MAP` で symptoms 配列 → FatigueType[]
3. **フォールバック**: どちらにも該当しない場合は `energy` をデフォルト割り当て

**検証が必要な項目と対応**:

| 項目 | 状態 | 対応 |
|------|------|------|
| 140件全てにtypesが割り当てられるか | `resolveTypes` のフォールバックで保証される | 問題なし |
| タイプ別件数の偏り | 薬効分類の分布に依存。偏り自体は問題ではない | 各タイプ最低10件以上あることを確認する検証スクリプトを実装時に実行する |
| 「皮膚疾患」のみの漢方がenergyに割り当てられる | SYMPTOM_MAPに「皮膚疾患」がない | 皮膚疾患は5タイプのどれにも直接対応しない。energyフォールバックで許容 |
| 検索機能 | 未実装 | v3で追加（名前・読み・症状の部分一致検索） |

**設計判断: kampo-master.json はMVP期間中はJSONバンドルのまま維持する。Supabaseへの移行はPhase 2。**

**根拠**:
- 140件は静的データ。更新頻度は月1回以下
- JSONバンドルならオフラインでも動作する（PWAと相性が良い）
- Supabaseに移すメリット（動的更新・検索クエリ）はMVP段階では不要
- 炭谷さんがNotionで管理 → JSONエクスポート → アプリ更新のフローで十分

**漢方詳細ページの仕様**: v2で定義済み。kampo-master.json の全フィールドを表示する。

```
/kampo/[id] に表示するフィールド:
  - name（処方名）
  - reading（読み仮名）
  - tsumuraNo（ツムラ番号、空欄の場合は非表示）
  - oneLiner（効能一言）
  - constitution（対象の体質）
  - classification（薬効分類）
  - symptoms（適応症状）
  - ingredients（主な構成生薬）
  - source（出典）
  - caution（注意・禁忌）
  - insurance（保険適用）
  - otc（市販品情報）
  - alias（別名）
  + 免責事項フッター
  + 「薬局に相談する」ボタン
```

### 1.4 課題4: 認証・顧客管理

**問題**: 現在は `crypto.randomUUID()` のみ。将来の認証移行パスは？

**設計判断: 3段階で進化させる。MVP → Phase 2 → Phase 3。**

#### MVP（現在）: 匿名ID方式を維持

```
ユーザー識別: crypto.randomUUID() → localStorage + Supabase users.anon_id
認証: なし
データ永続化: localStorage (primary) + Supabase (backup, fire-and-forget)
```

**この方式の限界**:
- ブラウザを変えるとデータが消える
- LocalStorage削除でデータが消える
- 同一ユーザーの重複カウントが発生する

**許容する理由**: パイロット法人の社員は「会社から共有されたURL」でアクセスする。端末固定で使う想定。データロスのリスクよりも、ログインの障壁を排除する方がDAUに効く。

#### Phase 2（法人3社以上）: Supabase Auth導入

```
認証方法: メールマジックリンク + Google OAuth
移行方式: 既存anon_id → 認証ユーザーにマージ

実装:
  1. Supabase Auth を有効化
  2. /auth/login ページを追加
  3. 初回ログイン時に既存anon_idを検索し、auth.user.id に紐付ける
  4. 以後はauth.user.idをキーにデータアクセス
  5. RLS（Row Level Security）を有効化
```

**マージロジック**:
```typescript
async function migrateAnonUser(anonId: string, authUserId: string) {
  // users テーブルの anon_id 行に auth_user_id を書き込む
  await supabase.from('users')
    .update({ auth_user_id: authUserId })
    .eq('anon_id', anonId);
  // localStorage から anon_id を削除し、以後は auth_user_id で識別
}
```

#### Phase 3（法人10社以上）: LINE認証追加 + マルチテナント

```
認証方法: LINE Login（LIFF SDK）を追加
マルチテナント: users テーブルに organization_id を追加

法人管理:
  organizations テーブル:
    id, name, plan, admin_user_id, created_at

  users テーブルに追加:
    organization_id (nullable, FK → organizations.id)
    role ('member' | 'admin')
```

### 1.5 課題5: データベース設計

**問題**: 現在のテーブル（users/checkins/diagnoses）は十分か？

**設計判断: MVPでは現在の3テーブルで十分。Phase 2で拡張する。**

#### MVP: 現在のスキーマ（変更点あり）

```sql
-- users テーブル（既存 + 変更）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id TEXT UNIQUE NOT NULL,          -- crypto.randomUUID()
  auth_user_id UUID REFERENCES auth.users(id),  -- Phase 2で使用。NULLable
  nickname TEXT,
  fatigue_type TEXT,                      -- 'brain' | 'blood' | 'nerve' | 'organ' | 'energy'
  character_level INTEGER DEFAULT 1,
  continuous_days INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  agreed_disclaimer BOOLEAN DEFAULT false, -- NEW: 免責同意フラグ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- checkins テーブル（既存、変更なし）
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_ids TEXT[] NOT NULL,
  answers JSONB NOT NULL,
  scores JSONB NOT NULL,
  overall_percent INTEGER NOT NULL,
  feedback TEXT,
  time_slot TEXT,                         -- 'morning' | 'afternoon' | 'evening'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- diagnoses テーブル（既存、変更なし）
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  primary_type TEXT NOT NULL,
  secondary_type TEXT NOT NULL,
  scores JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**変更点**: `agreed_disclaimer` カラムを users テーブルに追加。オンボーディングで免責同意を記録する。

#### Phase 2 追加テーブル

```sql
-- organizations（法人テーブル）
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'starter',            -- 'starter' | 'growth' | 'enterprise'
  admin_user_id UUID REFERENCES users(id),
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- users テーブルへの追加カラム
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member';  -- 'member' | 'admin'
```

**漢方マスターのSupabase移行（Phase 2以降）**:

```sql
-- kampo_master（漢方マスターテーブル）
CREATE TABLE kampo_master (
  id TEXT PRIMARY KEY,                    -- 'k001' 形式
  name TEXT NOT NULL,
  reading TEXT NOT NULL,
  tsumura_no TEXT,
  category TEXT,
  one_liner TEXT,
  symptoms TEXT[],
  constitution TEXT[],
  classification TEXT[],
  ingredients TEXT,
  source TEXT,
  caution TEXT,
  insurance BOOLEAN DEFAULT false,
  otc TEXT,
  alias TEXT,
  fatigue_types TEXT[],                   -- resolveTypes() の結果を保存
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**移行するタイミング**: 炭谷さんが漢方データを頻繁に更新するようになったとき、またはデータ件数が200件を超えたとき。

#### Zustand Store（クライアント側）のスキーマ

```typescript
// 変更点: lineUserId を削除、agreedDisclaimer を追加
interface UserProfile {
  id: string;                  // crypto.randomUUID()
  nickname?: string;
  character?: Character;
  diagnosisHistory: DiagnosisResult[];
  continuousDays: number;
  totalCheckins: number;
  agreedDisclaimer: boolean;   // NEW
  createdAt: string;
}
```

**削除する項目**:
- `lineUserId` -- LINE統合は Phase 3
- ポイント関連の計算ロジック -- ポイント制度を廃止

---

## 2. 画面一覧と遷移

### 2.1 画面マップ

```
/ (ルート)
  │  プロファイル有無チェック
  ├─ プロファイルなし → /onboarding
  └─ プロファイルあり → /home

/onboarding
  │  ウェルカム → ニックネーム入力 + 免責同意 → 開始
  ▼
/diagnosis
  │  20問（5セクション x 4問、セクション区切りあり）
  ▼
/result
  │  疲労タイプ発表 + キャラクター誕生 + シェア
  ▼
/home  ← メイン画面（TabBar付き）
  ├─ 今日の体調チェック → /checkin
  ├─ おすすめ漢方 → /kampo
  └─ キャラクター → /character

┌──────── TabBar ─────────┐
│ ホーム │ チェック │ 漢方 │ マイページ │
│ /home  │ /checkin │ /kampo│ /mypage    │
└─────────────────────────┘

/kampo（漢方辞典）
  └─ /kampo/[id]（漢方詳細）← NEW

/checkin
  │  3-5問 x 3段階 → フィードバック
  ▼
  チェックイン結果（同ページ内）

/character（キャラクター詳細）

/mypage
  ├─ プロフィール編集（インライン）
  ├─ 健康レポート → /report
  ├─ 再診断 → /diagnosis
  └─ データリセット

/report（健康レポート）
```

### 2.2 削除する画面・機能（v2から継続）

| 対象 | 理由 | 対象ファイル |
|------|------|-------------|
| `/chat` | 保留。画面・タブ・導線を完全に削除 | `app/chat/page.tsx`, `app/api/chat/route.ts` |
| `/shop` → `/kampo` に改名 | 「購入」は存在しない。「漢方辞典」に再設計 | `app/shop/page.tsx` → `app/kampo/page.tsx` |
| ポイント制度 | 使途がない。全表示を削除 | `home/page.tsx`, `mypage/page.tsx`, `checkin/page.tsx` |
| 回復進捗バー | 計算根拠が不明（`calcRecovery` 関数）。削除 | `home/page.tsx` |
| liff.ts | 未使用。削除 | `lib/liff.ts` |
| v1.0.0 表記 | ユーザーに見せる必要なし | `mypage/page.tsx` |
| 「LINEで続きを見る」ボタン | LINE未連携。削除 | `onboarding/page.tsx` |
| 購入履歴・定期便・設定メニュー | EC機能なし | `mypage/page.tsx` |

---

## 3. 各画面の詳細仕様

### 3.1 オンボーディング (/onboarding)

**目的**: ユーザー登録 + 免責事項への明示的な同意

**変更点（v2からの差分）**:
- 免責事項チェックを必須にする
- 「LINEで続きを見る」ボタンを削除する
- 「利用規約・プライバシーポリシーに同意して開始」のテキストをチェックボックスに変更する

**画面構成**:

```
Step 1: ウェルカム
  ┌─────────────────────────┐
  │ 🌿 てあて薬局            │
  │ あなたの健康パートナー     │
  │                           │
  │ 🔍 5分の疲労診断          │
  │ 🌱 キャラクターを育てる   │
  │ 💊 専門家が選ぶ漢方       │
  │                           │
  │ [無料で始める →]           │
  └─────────────────────────┘

Step 2: ニックネーム + 同意
  ┌─────────────────────────┐
  │ はじめまして！             │
  │ 呼び名を教えてください     │
  │                           │
  │ [ニックネーム入力]         │
  │ ※ 入力しなくてもOK        │
  │                           │
  │ ☑ このアプリは医学的な     │  ← NEW: 必須チェック
  │   診断を行うものではあり   │
  │   ません。体調に不安が     │
  │   ある場合は医療機関を     │
  │   受診してください。       │
  │                           │
  │ [診断を始める →]           │  ← チェック未入力時は非活性
  │ [戻る]                    │
  └─────────────────────────┘
```

**データ操作**:
- `setProfile()` に `agreedDisclaimer: true` を追加
- Supabase users テーブルの `agreed_disclaimer` カラムに `true` を書き込む
- 「診断を始める」ボタンはチェック未入力時に `disabled` にする（opacity 0.5 + pointer-events: none）

### 3.2 初回体質診断 (/diagnosis)

**目的**: 5つの疲労タイプのうち、主要タイプと副次タイプを判定

**変更点（v2からの差分）**:
- セクション区切り画面を追加する
- 同点処理を明示的に実装する

**診断フロー**:

```
Q1-Q4  脳疲労セクション
  ↓
区切り画面「脳疲労チェック完了! 次は血流チェック」（1.2秒自動遷移）
  ↓
Q5-Q8  血流不足セクション
  ↓
区切り画面「血流チェック完了! 次は自律神経チェック」
  ↓
Q9-Q12  自律神経セクション
  ↓
区切り画面「自律神経チェック完了! 次は内臓チェック」
  ↓
Q13-Q16  内臓疲労セクション
  ↓
区切り画面「内臓チェック完了! あと少し」
  ↓
Q17-Q20  エネルギー不足セクション
  ↓
結果計算 → /result
```

**区切り画面のUI**:

```
┌─────────────────────────┐
│                           │
│     ✅                    │
│                           │
│  脳疲労チェック完了!       │
│  次は「血流」チェック      │
│                           │
│  ●●○○○                   │  ← 5セクション中の進捗
│                           │
└─────────────────────────┘
(1.2秒後に自動で次のセクションへ)
```

**実装**: `diagnosis/page.tsx` に `phase` ステートを追加。`"question" | "section-break"` で切り替える。`currentIndex % 4 === 0 && currentIndex > 0` のタイミングで区切りを表示。

**質問データ**: 変更なし。`DIAGNOSIS_QUESTIONS` の20問をそのまま使用。

**スコア計算**: `calcDiagnosisResult()` に同点処理を追加。

### 3.3 診断結果 (/result)

**変更点**: なし。現在の実装で問題ない。

### 3.4 ホーム (/home)

**変更点**:
- 回復進捗バーを削除する（`calcRecovery` 関数と関連UI）
- おすすめ漢方の遷移先を `/shop` → `/kampo` に変更する
- アドバイスの「もっと見る」リンクを `/chat` → 削除（または `/character` に変更）
- 通知ベル（🔔）はMVPでは機能しない。タップ時に「準備中です」モーダルを表示する

**キャラクターカードの構成（変更後）**:

```
┌─────────────────────────┐ (背景: #2C4A3E)
│ [脳疲労タイプ]      38/100│  ← 疲労スコア
│           疲労スコア      │
│                           │
│  🦊          たまご期     │
│              シロ         │
│              「少し疲れ..」│
│              [詳細を見る]  │
│                           │  ← 回復進捗バーを削除
└─────────────────────────┘
```

### 3.5 チェックイン (/checkin)

**変更点**:
- 結果画面から「+50pt獲得！」セクションを削除する
- 結果画面から「炭谷さんに相談する」ボタンを削除する
- 「ホームに戻る」ボタンのみ残す

**継続日数ロジックのバグ修正**:

現在の `incrementCheckin()` は「1日以上空いた場合のリセット」が実装されていない。

```typescript
// 現在の実装（バグあり）
const alreadyToday = lastCheckinDate === today;
const newDays = alreadyToday ? profile.continuousDays : profile.continuousDays + 1;
// ↑ 3日空いても +1 される

// 修正後
incrementCheckin: () => {
  const { profile, lastCheckinDate } = get();
  if (!profile) return;

  const today = toJSTDateString(new Date());
  const yesterday = toJSTDateString(new Date(Date.now() - 86400000));

  let newDays: number;
  if (lastCheckinDate === today) {
    // 同日2回目以降: 日数は増やさない
    newDays = profile.continuousDays;
  } else if (lastCheckinDate === yesterday) {
    // 昨日もチェックインした: 継続 +1
    newDays = profile.continuousDays + 1;
  } else {
    // 1日以上空いた: リセットして1から
    newDays = 1;
  }

  const newTotal = profile.totalCheckins + 1;
  // ... 以下同じ
}
```

**ヘルパー関数**:

```typescript
function toJSTDateString(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}
```

**注意**: 現在の `hasCheckedInToday()` も `new Date().toISOString().slice(0, 10)` を使っているが、これはUTCベース。JSTに変換する必要がある。

### 3.6 漢方辞典 (/kampo) -- 旧 /shop を改名

**目的**: 140種の漢方を検索・閲覧できる辞典

**変更点（v2からの差分）**:
- ページ名: 「ショップ」→「漢方辞典」
- パス: `/shop` → `/kampo`
- 「購入」ボタン → 「詳しく見る」→ `/kampo/[id]` へ遷移
- テキスト検索を追加する

**画面構成**:

```
┌─────────────────────────┐
│ 漢方辞典                   │
│ 140種類の漢方を紹介         │
│                           │
│ [おすすめ] [すべて]          │ ← タブ切り替え
│                           │
│ 検索: [________________]   │ ← NEW: テキスト検索
│                           │
│ タイプ別フィルタ:（すべてタブのみ）│
│ [脳疲労][血流][自律神経]...  │
│                           │
│ ┌───────────────────┐    │
│ │ 🧠 補中益気湯 (No.41)    │    │
│ │ ほちゅうえっきとう        │    │
│ │ 気力・体力を回復する...   │    │
│ │ [保険適用]               │    │
│ │              [詳しく見る] │    │ ← /kampo/k001 へ
│ └───────────────────┘    │
└─────────────────────────┘
```

**テキスト検索の実装**:

```typescript
function searchKampo(query: string, products: KampoProduct[]): KampoProduct[] {
  if (!query.trim()) return products;
  const q = query.trim().toLowerCase();
  return products.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.reading.toLowerCase().includes(q) ||
    p.symptoms.some((s) => s.includes(q)) ||
    p.oneLiner.toLowerCase().includes(q) ||
    p.ingredients.toLowerCase().includes(q)
  );
}
```

検索はクライアントサイドで実行する。140件のフィルタリングはパフォーマンスの問題にならない。

### 3.7 漢方詳細 (/kampo/[id]) -- NEW

**目的**: 個別の漢方の詳細情報を表示する

**画面構成**:

```
┌─────────────────────────┐
│ ← 戻る                    │
│                           │
│ 🧠 補中益気湯              │
│ ほちゅうえっきとう          │
│ ツムラ 41番                │
│                           │
│ ────────────────         │
│ 効能                       │
│ 気力・体力を回復する代表的な  │
│ 補気薬。慢性疲労・倦怠感... │
│                           │
│ ────────────────         │
│ 対象の体質                  │
│ [虚証] [気虚]              │
│                           │
│ 薬効分類                    │
│ [補気（ほき）]              │
│                           │
│ 適応症状                    │
│ [疲労・倦怠感] [風邪・感冒]  │
│                           │
│ 主な構成生薬                │
│ 人参、黄耆、朮、当帰、...   │
│                           │
│ 出典                       │
│ 脾胃論                     │
│                           │
│ 別名                       │
│ Hochu-ekki-to / Bu Zhong...│
│                           │
│ 注意・禁忌                  │
│ 特になし。                  │
│                           │
│ [保険適用: ✅] [市販: 調剤のみ]│
│                           │
│ ────────────────         │
│ ⚠ この情報は一般的な漢方の   │
│ 解説です。個人の体質や症状に │
│ より適切な処方は異なります。 │
│ 服用の際は必ず薬剤師にご相談│
│ ください。                  │
│                           │
│ [🏥 薬局に相談する]          │
└─────────────────────────┘
```

**「薬局に相談する」ボタン**: MVP時点ではモーダル表示。

```
モーダル内容:
  てあて薬局にご相談ください
  店頭またはお電話でお気軽にどうぞ
  [閉じる]
```

**実装ファイル**: `app/kampo/[id]/page.tsx`

**データ取得**: `PRODUCTS_DATA.find(p => p.id === id)` でクライアントサイド検索。kampo-master.json の全フィールドにアクセスするため、`KampoProduct` インターフェースを拡張して `constitution`, `classification`, `source`, `caution`, `alias` を追加する。

```typescript
// products-data.ts の KampoProduct インターフェースに追加
export interface KampoProduct {
  id: string;
  name: string;
  reading: string;
  tsumuraNo: string;
  oneLiner: string;
  types: FatigueType[];
  symptoms: string[];
  ingredients: string;
  insurance: boolean;
  otc: string;
  // NEW: 詳細ページ用フィールド
  constitution: string[];
  classification: string[];
  source: string;
  caution: string;
  alias: string;
}
```

### 3.8 キャラクター (/character)

**変更点**: ケアルーティンのチェックボックスのスタイルを変更。丸い枠だけの現状から、「おすすめ」ラベルに変更する。保存はしない。

### 3.9 マイページ (/mypage)

**変更点**:
- ポイント表示を削除（`⭐ {points}pt 獲得済み` を削除）
- 購入履歴メニューを削除
- 定期便メニューを削除
- 設定メニューを削除
- v1.0.0 表記を削除
- 「健康レポート」メニューを維持

**変更後のメニュー構成**:

```
┌─ メニュー ─────────────┐
│ 🔍 再診断する             │
│ 📊 健康レポート           │
├─────────────────────────┤
│ [データをリセットする]     │ ← 赤テキスト
├─────────────────────────┤
│ てあて薬局                │ ← フッター（v1.0.0削除）
└─────────────────────────┘
```

### 3.10 健康レポート (/report)

**変更点**: なし。現在の実装を維持。

---

## 4. TabBar構成

```
4タブ構成（変更後）:
  ホーム (/home)    │ チェック (/checkin)  │ 漢方 (/kampo)  │ マイページ (/mypage)
  🏠               │ 📋                  │ 🌿             │ 👤
```

**変更点**:
- 旧5タブ → 4タブ
- 「ショップ 💊 /shop」→「漢方 🌿 /kampo」
- 「チャット 💬 /chat」を完全削除

**実装**: `components/TabBar.tsx` の `TABS` 配列を更新。

```typescript
const TABS = [
  { label: "ホーム", emoji: "🏠", path: "/home" },
  { label: "チェック", emoji: "📋", path: "/checkin" },
  { label: "漢方", emoji: "🌿", path: "/kampo" },
  { label: "マイページ", emoji: "👤", path: "/mypage" },
];
```

---

## 5. 型定義の変更

### 5.1 types/index.ts

```typescript
// ===== 削除 =====
// lineUserId フィールドを UserProfile から削除
// Product インターフェースを削除（KampoProduct に統一）
// Order インターフェースを削除（EC機能なし）
// OrderStatus 型を削除

// ===== 変更 =====
export interface UserProfile {
  id: string;
  nickname?: string;
  character?: Character;
  diagnosisHistory: DiagnosisResult[];
  continuousDays: number;
  totalCheckins: number;
  agreedDisclaimer: boolean;   // NEW
  createdAt: string;
}
```

### 5.2 products-data.ts の KampoProduct 拡張

```typescript
export interface KampoProduct {
  id: string;
  name: string;
  reading: string;
  tsumuraNo: string;
  oneLiner: string;
  types: FatigueType[];
  symptoms: string[];
  ingredients: string;
  insurance: boolean;
  otc: string;
  constitution: string[];      // NEW
  classification: string[];    // NEW
  source: string;              // NEW
  caution: string;             // NEW
  alias: string;               // NEW
}
```

`convertToKampoProducts()` を更新して全フィールドをコピーする。

---

## 6. 免責事項・法的対応

### 6.1 表示必須テキスト

**オンボーディング（チェックボックス付き、必須）**:
> このアプリは漢方の一般的な知識を提供するものであり、医学的な診断・治療を行うものではありません。体調に不安がある場合は、必ず医師または薬剤師にご相談ください。

**漢方詳細ページ フッター**:
> この情報は一般的な漢方の解説です。個人の体質や症状により適切な処方は異なります。服用の際は必ず薬剤師にご相談ください。

**チェックイン結果画面**:
> 体調記録は健康管理の目安です。体調に変化を感じたら医療機関を受診してください。

**アプリ全体 フッター（マイページ下部）**:
> てあて薬局 -- 漢方の知恵であなたの疲れをケアします

### 6.2 同意記録

- `users.agreed_disclaimer` に `true` を保存
- タイムスタンプは `users.created_at` で代替（同意と登録は同時）
- Phase 2で利用規約・プライバシーポリシーの正式なテキストを用意し、同意履歴テーブルを追加する

---

## 7. PWA設定

### 7.1 manifest.json（既存、変更なし）

```json
{
  "name": "てあて薬局",
  "short_name": "てあて薬局",
  "description": "漢方の知恵であなたの疲れをケアします",
  "start_url": "/home",
  "display": "standalone",
  "background_color": "#FDF8F2",
  "theme_color": "#2C4A3E",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 7.2 アイコン

192x192 と 512x512 の PNG を `/public` に配置。デザイン: 緑（#2C4A3E）背景にシンプルな葉のアイコン。

### 7.3 Service Worker

Next.js の `next-pwa` パッケージ、または `@serwist/next` を使用する。

```
設定:
  - プリキャッシュ: 全ページ + kampo-master.json
  - ランタイムキャッシュ: Supabase APIはNetworkFirst
  - オフライン対応: ホーム・漢方辞典はオフラインで閲覧可能
```

**MVP段階では Service Worker の設定は最小限にする**。PWAとしてホーム画面に追加できることが最優先。高度なオフライン対応はPhase 2。

---

## 8. 漢方データ連携パイプライン

### 8.1 現在のフロー

```
Notion DB（炭谷さん管理）
  ↓ 手動エクスポート（JSON形式）
kampo-master.json（140件、アプリにバンドル）
  ↓ products-data.ts の convertToKampoProducts()
PRODUCTS_DATA（KampoProduct[]）
  ↓ getProductsByType() / getRecommendedProducts()
各画面で使用
```

### 8.2 マッピングの信頼性

| マッピング | カバレッジ | 根拠 |
|-----------|-----------|------|
| 薬効分類 → FatigueType | 12分類をカバー | 東洋医学の標準的な分類に基づく |
| 症状 → FatigueType | 18症状をカバー | 5つの疲労タイプと直接対応する症状のみ |
| フォールバック | energy | 該当なしの漢方は「エネルギー不足」に分類 |

**注意点**: `CLASSIFICATION_MAP` と `SYMPTOM_MAP` に含まれない分類・症状が kampo-master.json に存在する可能性がある。実装時に以下の検証スクリプトを実行する:

```typescript
// 検証用（ビルド時に実行）
const unmapped = kampoMaster.filter(r => {
  const types = resolveTypes(r);
  return types.length === 1 && types[0] === 'energy' && 
    !r.classification.some(c => CLASSIFICATION_MAP[c]) &&
    !r.symptoms.some(s => SYMPTOM_MAP[s]);
});
console.log(`フォールバックで energy に割り当てられた件数: ${unmapped.length}`);
unmapped.forEach(r => console.log(`  - ${r.name}: ${r.classification.join(', ')} / ${r.symptoms.join(', ')}`));
```

### 8.3 Phase 2での改善

- Notion API → Supabase の自動同期スクリプト
- 炭谷さんが Notion で更新 → 自動で kampo_master テーブルに反映
- マッピングの精度を炭谷さんにレビューしてもらい調整

---

## 9. 環境構成

### 9.1 本番環境

| サービス | 用途 |
|---------|------|
| Vercel | ホスティング |
| Supabase | DB + 認証（Phase 2） |
| Notion | 漢方マスターのソース（管理用） |

### 9.2 環境変数

```
NEXT_PUBLIC_SUPABASE_URL=https://mzeazhkqrdsovqbwelnj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://app-bay-zeta-25.vercel.app
```

MVPで不要:
- OPENAI_API_KEY（AIチャットは保留）
- STRIPE_*（EC機能なし）
- LINE_*（LINE連携は Phase 3）

---

## 10. デザインシステム

### 10.1 カラー

| 用途 | 色 | HEX |
|------|----|----|
| メイン | 深緑 | #2C4A3E |
| アクセント | オレンジ | #E8956D |
| 背景 | オフホワイト | #FDF8F2 |
| テキスト（主） | ダークグリーン | #1E2D2A |
| テキスト（副） | セージグリーン | #6B9E8F |
| テキスト（薄） | グレーグリーン | #A8C5BB |
| ボーダー | ベージュ | #F0EAE0 |
| 成功 | グリーン | #4CAF8A |
| 警告 | オレンジ | #E8956D |
| 危険 | レッド | #C05050 |

### 10.2 タイポグラフィ

- フォント: `'Inter', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif`
- 見出し: 18-32px, fontWeight 700-800
- 本文: 13-15px, fontWeight 400-500
- キャプション: 10-12px

### 10.3 コンポーネント規約

- 角丸: カード 20-24px / ボタン 28px / 入力 12-16px / バッジ 20px
- インラインスタイル: Tailwind未使用。全てインラインスタイルで統一（既存実装を維持）
- モーダル: ボトムシート形式（`Modal.tsx` コンポーネント）
- 最大幅: 430px（`layout.tsx` で制約済み）

---

## 11. 実装タスク（完成形からの逆算）

### Phase A: 破壊的変更（構造整理）

| # | タスク | 対象ファイル | 依存 | 複雑度 |
|---|--------|------------|------|--------|
| A1 | `/chat` 関連を完全削除 | `app/chat/page.tsx`, `app/api/chat/route.ts`, home内リンク | なし | 低 |
| A2 | `lib/liff.ts` を削除 | `lib/liff.ts` | なし | 低 |
| A3 | `/shop` → `/kampo` に改名 | `app/shop/` → `app/kampo/`, TabBar, home内リンク | なし | 中 |
| A4 | TabBar を4タブに変更 | `components/TabBar.tsx` | A1, A3 | 低 |
| A5 | ポイント表示を全削除 | `home/page.tsx`, `mypage/page.tsx`, `checkin/page.tsx` | なし | 低 |
| A6 | 回復進捗バーを削除 | `home/page.tsx`（`calcRecovery` 関数とUI） | なし | 低 |
| A7 | マイページメニュー整理 | `mypage/page.tsx`（購入履歴・定期便・設定・v1.0.0削除） | なし | 低 |
| A8 | オンボーディングから「LINEで続きを見る」を削除 | `onboarding/page.tsx` | なし | 低 |
| A9 | 型定義を整理（Product/Order/lineUserId削除） | `types/index.ts` | A1, A3 | 低 |

### Phase B: 機能追加

| # | タスク | 対象ファイル | 依存 | 複雑度 |
|---|--------|------------|------|--------|
| B1 | オンボーディングに免責事項チェックを追加 | `onboarding/page.tsx`, `types/index.ts`, `store/userStore.ts` | A8, A9 | 中 |
| B2 | Supabase users に agreed_disclaimer カラム追加 | Supabase migration | B1 | 低 |
| B3 | 診断にセクション区切り画面を追加 | `diagnosis/page.tsx` | なし | 中 |
| B4 | 診断の同点処理を実装 | `lib/diagnosis.ts` | なし | 低 |
| B5 | 継続日数ロジックのバグ修正（JSTベース + リセット処理） | `store/userStore.ts` | なし | 中 |
| B6 | hasCheckedInToday() をJSTベースに修正 | `store/userStore.ts` | B5 | 低 |
| B7 | KampoProduct インターフェース拡張（詳細ページ用フィールド追加） | `lib/products-data.ts` | なし | 低 |
| B8 | `/kampo/[id]` 漢方詳細ページ新規作成 | `app/kampo/[id]/page.tsx` | A3, B7 | 中 |
| B9 | 漢方辞典にテキスト検索を追加 | `app/kampo/page.tsx` | A3 | 中 |
| B10 | 漢方辞典の「詳しく見る」を詳細ページへのリンクに変更 | `app/kampo/page.tsx` | B8 | 低 |
| B11 | チェックイン結果からポイント・チャット導線を削除 | `checkin/page.tsx` | A5 | 低 |
| B12 | ホームのおすすめ漢方リンクを `/kampo` に変更 | `home/page.tsx` | A3 | 低 |
| B13 | ホームのアドバイス「もっと見る」を `/character` に変更 | `home/page.tsx` | A1 | 低 |
| B14 | 漢方詳細ページに免責事項フッターを追加 | `app/kampo/[id]/page.tsx` | B8 | 低 |

### Phase C: 品質向上

| # | タスク | 対象ファイル | 依存 | 複雑度 |
|---|--------|------------|------|--------|
| C1 | 通知ベルに「準備中」モーダルを追加 | `home/page.tsx` | なし | 低 |
| C2 | キャラクターページのケアチェックボックスを「おすすめ」ラベルに変更 | `character/page.tsx` | なし | 低 |
| C3 | PWAアイコン生成・配置 | `public/icon-192.png`, `public/icon-512.png` | なし | 低 |
| C4 | 漢方マッピング検証スクリプトの実行・結果確認 | スクリプト | B7 | 低 |
| C5 | チェックイン結果に免責フッターテキストを追加 | `checkin/page.tsx` | B11 | 低 |

### Phase D: デプロイ

| # | タスク | 依存 |
|---|--------|------|
| D1 | ビルド確認（`npm run build` が通ること） | A全て + B全て + C全て |
| D2 | Supabase マイグレーション実行 | B2 |
| D3 | Vercel再デプロイ | D1, D2 |
| D4 | 本番URL動作確認（全画面の手動テスト） | D3 |

### 実装順序の推奨

```
Day 1: Phase A（破壊的変更を一気に）
  A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9
  ビルド確認

Day 2: Phase B前半（コア機能）
  B4 → B5 → B6 → B1 → B2 → B3 → B7

Day 3: Phase B後半 + Phase C
  B8 → B9 → B10 → B11 → B12 → B13 → B14
  C1 → C2 → C3 → C4 → C5

Day 4: Phase D（デプロイ）
  D1 → D2 → D3 → D4
```

---

## 12. 将来拡張ロードマップ

| 機能 | フェーズ | トリガー | 概要 |
|------|---------|---------|------|
| Supabase Auth（メール + Google） | Phase 2 | 法人3社到達 | 匿名ID → 認証ユーザーへのマイグレーション |
| 法人管理画面 | Phase 2 | パイロット法人獲得後 | 利用率・チェックイン率のダッシュボード |
| 健康経営レポート自動生成 | Phase 2 | 法人管理画面完成後 | 月次PDF出力 |
| LINE認証 + 通知連携 | Phase 3 | 継続率データが低い場合 | LIFF SDK + メッセージング |
| AIチャット | Phase 2-3 | APIキー + 免責整備後 | 漢方の一般的な質問への回答 |
| EC（漢方購入） | Phase 3 | Stripe導入後 | アプリ内購入 + 定期便 |
| 漢方マスターのSupabase移行 | Phase 2 | データ更新頻度が上がった時 | Notion → Supabase自動同期 |
| ネイティブアプリ | Phase 3+ | 法人数・ユーザー規模次第 | React Native or Flutter |
| マルチテナント | Phase 3 | 法人10社到達 | organizations テーブル + RLS |

---

## 13. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| LocalStorage削除でデータロス | ユーザーの診断履歴が消える | Supabase にバックアップ済み。Phase 2で認証導入により完全解決 |
| 漢方マッピングの精度が低い | 不適切な漢方がおすすめされる | 炭谷さんによるレビュー + フォールバックの明示 + 免責事項表示 |
| 20問診断での離脱 | DAUが下がる | セクション区切りで体感を軽減。離脱率を計測し10問版を検討 |
| JSTとUTCの混在バグ | 継続日数が正しくカウントされない | toJSTDateString() ヘルパーに統一 |
| kampo-master.json の肥大化 | 初回ロードが遅くなる | 140件x15フィールドで約150KB。gzip圧縮後30KB程度。問題なし |
| 免責事項の不備 | 法的リスク | 全画面に免責テキスト表示。Phase 2で正式な利用規約を用意 |

---

## 14. 成功基準（MVP）

- [ ] オンボーディング → 診断 → ホームの一連のフローがエラーなく動作する
- [ ] 免責事項への同意なしでは診断に進めない
- [ ] 20問診断でセクション区切りが表示される
- [ ] 5タイプ全てに正しくキャラクターが割り当てられる（同点処理含む）
- [ ] 毎日のチェックインで継続日数が正しくカウントされる（JST基準、1日空いたらリセット）
- [ ] 漢方辞典で140件が閲覧・検索・フィルタできる
- [ ] 漢方詳細ページが全フィールドを表示する
- [ ] ポイント・EC・チャット関連のUIが完全に削除されている
- [ ] TabBarが4タブ構成で正しく動作する
- [ ] PWAとしてホーム画面に追加できる
- [ ] Vercelにデプロイされ、本番URLでアクセスできる
