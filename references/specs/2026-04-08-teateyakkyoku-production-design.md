# てあて薬局 本番設計仕様書

**作成日**: 2026-04-08
**ステータス**: 実装待ち
**実装担当**: Sonnet（Claude Code）

---

## 1. 毎日チェックイン設計

### 1.1 概要

「初回体質診断」と「毎日チェックイン」を完全に分離する。

| 機能 | 目的 | 頻度 | 問数 |
|------|------|------|------|
| 体質診断 | 疲労タイプの判定 | 初回 + 数ヶ月に1回 | 20問（既存） |
| 毎日チェックイン | 「今日の状態」の記録 | 毎日1回 | 3〜5問 |

### 1.2 回答形式

毎日チェックインは既存の5段階（0〜4）を3段階に簡略化する。毎日やるものなので軽さが重要。

| スコア | ラベル | 意味 |
|--------|--------|------|
| 0 | 大丈夫 | 今日は気にならない |
| 1 | 少し気になる | やや感じる |
| 2 | つらい | はっきり感じる・困っている |

### 1.3 毎日チェックイン質問プール（50問）

#### 脳疲労（brain）: 10問

| ID | テキスト | 時間帯向き |
|----|----------|------------|
| dc-b01 | 今日は頭がぼーっとする感じがある | 朝・昼 |
| dc-b02 | 集中しようとしてもすぐ気が散ってしまう | 昼 |
| dc-b03 | 考えがまとまらない・判断に迷う | 昼 |
| dc-b04 | 頭が重い・締め付けられる感じがある | 全時間帯 |
| dc-b05 | 昨夜、考え事が止まらなかった | 朝 |
| dc-b06 | 今日は何かを覚えるのが難しそう | 朝・昼 |
| dc-b07 | 些細なことにイライラしやすい | 全時間帯 |
| dc-b08 | スマホやPCの画面を見ると目が疲れる | 昼・夜 |
| dc-b09 | 仕事や家事の段取りが頭に入ってこない | 朝・昼 |
| dc-b10 | 今日はぼんやり過ごしてしまった気がする | 夜 |

#### 血流不足（blood）: 10問

| ID | テキスト | 時間帯向き |
|----|----------|------------|
| dc-bl01 | 手足が冷たいと感じる | 全時間帯 |
| dc-bl02 | 肩や首がこっている | 全時間帯 |
| dc-bl03 | 顔色が悪い・くすんでいると感じる | 朝 |
| dc-bl04 | 体がむくんでいる気がする | 朝・夜 |
| dc-bl05 | 指先やつま先がしびれる感じがある | 全時間帯 |
| dc-bl06 | 頭痛がある、または頭痛が出そうな感じがする | 全時間帯 |
| dc-bl07 | 目の下にクマができている | 朝 |
| dc-bl08 | 体が重だるくて動きたくない | 朝・昼 |
| dc-bl09 | 肌が乾燥してカサカサする | 全時間帯 |
| dc-bl10 | 温かい飲み物が欲しいと感じる | 全時間帯 |

#### 自律神経（nerve）: 10問

| ID | テキスト | 時間帯向き |
|----|----------|------------|
| dc-n01 | 昨夜はよく眠れなかった | 朝 |
| dc-n02 | 朝スッキリ起きられなかった | 朝 |
| dc-n03 | 今日は気分が不安定な気がする | 全時間帯 |
| dc-n04 | 動悸やドキドキを感じることがあった | 全時間帯 |
| dc-n05 | 緊張して体がこわばっている | 昼 |
| dc-n06 | 天気や気温の変化で体調が悪い | 全時間帯 |
| dc-n07 | 呼吸が浅い・息苦しさを感じる | 全時間帯 |
| dc-n08 | 汗のかき方が変だと感じる（急に出る/出ない） | 全時間帯 |
| dc-n09 | めまいやふらつきを感じた | 全時間帯 |
| dc-n10 | 寝る前にリラックスできる自信がない | 夜 |

#### 内臓疲労（organ）: 10問

| ID | テキスト | 時間帯向き |
|----|----------|------------|
| dc-o01 | 胃が重い・もたれている感じがある | 全時間帯 |
| dc-o02 | 食欲がわかない | 朝・昼 |
| dc-o03 | お腹が張っている・ガスが溜まっている | 全時間帯 |
| dc-o04 | 便通が良くない（便秘・下痢） | 朝 |
| dc-o05 | 食後にすぐ眠くなる | 昼 |
| dc-o06 | 口の中が苦い・味が変な感じがする | 朝 |
| dc-o07 | 脂っこいものを想像すると気持ち悪い | 全時間帯 |
| dc-o08 | 昨日の食事が胃に残っている感じがする | 朝 |
| dc-o09 | お腹がゴロゴロ鳴る・不安定 | 全時間帯 |
| dc-o10 | 水分を摂っても喉の渇きが取れない | 全時間帯 |

#### エネルギー不足（energy）: 10問

| ID | テキスト | 時間帯向き |
|----|----------|------------|
| dc-e01 | 朝から体がだるくて重い | 朝 |
| dc-e02 | やる気が出ない・何もしたくない | 全時間帯 |
| dc-e03 | 少し動いただけで疲れを感じる | 全時間帯 |
| dc-e04 | 声に力が入らない・話すのがおっくう | 全時間帯 |
| dc-e05 | 階段を上ると息切れする | 昼 |
| dc-e06 | 昼前にもう疲れている | 昼 |
| dc-e07 | 休んでも疲れが取れた気がしない | 朝 |
| dc-e08 | 人と会うのがおっくうに感じる | 全時間帯 |
| dc-e09 | 免疫が落ちている気がする（喉が痛い等） | 全時間帯 |
| dc-e10 | 今日一日を乗り切れるか不安 | 朝 |

### 1.4 質問選択アルゴリズム

毎日3〜5問を以下のロジックで選出する。デフォルトは3問、初回チェックインのみ5問。

#### ステップ1: 候補プール作成

1. ユーザーの**primaryType**から2問を候補に入れる（重み: 高）
2. **secondaryType**から1問を候補に入れる（重み: 中）
3. 残り3タイプからランダムに0〜2問を候補に入れる（重み: 低）

#### ステップ2: 時間帯フィルタ

現在の時間帯（朝: 5-11時 / 昼: 11-17時 / 夜: 17-5時）に適合する質問のみ残す。
「全時間帯」はいつでも候補に入る。

#### ステップ3: 重複排除

直近3日間に出題された質問IDを除外する（`recent_question_ids`）。
候補が足りない場合は直近1日間の除外に緩和する。

#### ステップ4: 曜日・季節ボーナス

- **月曜朝**: エネルギー系の質問を+1問追加（週明けの倦怠感チェック）
- **金曜夜**: 自律神経系の質問を+1問追加（週末の睡眠準備）
- **季節変わり目**（3月・6月・9月・12月）: 自律神経系の質問出現率UP

#### ステップ5: 最終選出

候補プールからランダム選出。ただし同一タイプから3問以上は選ばない。

#### 実装用の擬似コード

```
function selectDailyQuestions(user, allQuestions):
  primaryType = user.diagnosisResult.primaryType
  secondaryType = user.diagnosisResult.secondaryType
  hour = currentHour()
  timeSlot = getTimeSlot(hour)  // "morning" | "afternoon" | "evening"
  recentIds = getRecentQuestionIds(user, days=3)
  
  // 時間帯フィルタ + 重複除外
  available = allQuestions
    .filter(q => q.timeSlot == "all" || q.timeSlot == timeSlot)
    .filter(q => q.id not in recentIds)
  
  // タイプ別にグループ化
  primaryPool = available.filter(q => q.category == primaryType)
  secondaryPool = available.filter(q => q.category == secondaryType)
  otherPool = available.filter(q => q.category not in [primaryType, secondaryType])
  
  selected = []
  selected.push(randomPick(primaryPool, 2))
  selected.push(randomPick(secondaryPool, 1))
  
  // 曜日ボーナス
  if (isMonday() && timeSlot == "morning"):
    energyExtra = otherPool.filter(q => q.category == "energy")
    if energyExtra.length > 0:
      selected.push(randomPick(energyExtra, 1))
  
  if (isFriday() && timeSlot == "evening"):
    nerveExtra = otherPool.filter(q => q.category == "nerve")
    if nerveExtra.length > 0:
      selected.push(randomPick(nerveExtra, 1))
  
  // 3〜5問に収める
  return selected.slice(0, 5)  // 最小3問は保証済み（primary2 + secondary1）
```

### 1.5 スコアリングとトレンド集計

#### 日次スコア

各チェックインで回答した質問のスコアをタイプ別に集計する。

```
dailyScore = {
  brain: sum of brain answers,     // 0〜4（2問 × max2）
  blood: sum of blood answers,
  nerve: sum of nerve answers,
  organ: sum of organ answers,
  energy: sum of energy answers,
  totalQuestions: 3〜5,
  maxPossible: totalQuestions * 2,
  overallPercent: (sum of all answers) / maxPossible * 100
}
```

#### 正規化

問数が日によって異なるため、トレンド表示では「タイプ別の平均スコア（0〜2スケール）」を使う。

```
normalizedScore[type] = typeScore / questionsOfThatType
```

#### 週次トレンド

直近7日間の日次スコアを集計し、以下を算出する:
- タイプ別平均（正規化済み）
- 前週比の増減（矢印アイコンで表示）
- 最も悪化したタイプ（キャラクターの一言に反映）

#### キャラクターの一言フィードバック

チェックイン回答後に即座に表示する。ロジック:

```
if overallPercent >= 70:
  "今日はちょっとしんどそうだね… 無理しないで"
elif overallPercent >= 40:
  "少し疲れが出てるみたい。お茶でも飲んで一息つこう"
elif overallPercent > 0:
  "まあまあの調子だね！ この調子でいこう"
else:
  "絶好調！ 今日も元気にいこう！"
```

加えて、最もスコアが高いタイプに応じた一言を追加する:
- brain: 「頭を使いすぎかも。5分だけ目を閉じてみて」
- blood: 「体が冷えてない？ 温かい飲み物がおすすめだよ」
- nerve: 「自律神経が乱れ気味。深呼吸を3回やってみよう」
- organ: 「お腹が疲れてるみたい。消化の良いものを選んでね」
- energy: 「エネルギーが足りてないかも。少し休憩しよう」

---

## 2. Supabaseテーブル設計

### 2.1 ER概要

```
users 1---* checkins
users 1---* diagnoses
users 1---* orders
orders *---* products (via order_items)
products (standalone)
```

### 2.2 CREATE TABLE SQL

```sql
-- ========================================
-- てあて薬局 Supabase Schema
-- ========================================

-- 拡張機能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------
-- users: ユーザーマスター
-- ----------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT,
  email TEXT UNIQUE,
  line_user_id TEXT UNIQUE,
  
  -- 診断結果（最新のスナップショット）
  primary_type TEXT CHECK (primary_type IN ('brain', 'blood', 'nerve', 'organ', 'energy')),
  secondary_type TEXT CHECK (secondary_type IN ('brain', 'blood', 'nerve', 'organ', 'energy')),
  
  -- キャラクター
  character_level INTEGER DEFAULT 1 CHECK (character_level IN (1, 2, 3)),
  
  -- 継続記録
  continuous_days INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  last_checkin_date DATE,
  
  -- PWA設定
  push_enabled BOOLEAN DEFAULT false,
  push_subscription JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------
-- diagnoses: 体質診断（初回 + 再診断）
-- ----------------------------------------
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 各タイプのスコア（0〜16）
  brain_score INTEGER NOT NULL DEFAULT 0,
  blood_score INTEGER NOT NULL DEFAULT 0,
  nerve_score INTEGER NOT NULL DEFAULT 0,
  organ_score INTEGER NOT NULL DEFAULT 0,
  energy_score INTEGER NOT NULL DEFAULT 0,
  
  -- 判定結果
  primary_type TEXT NOT NULL CHECK (primary_type IN ('brain', 'blood', 'nerve', 'organ', 'energy')),
  secondary_type TEXT NOT NULL CHECK (secondary_type IN ('brain', 'blood', 'nerve', 'organ', 'energy')),
  
  -- 全回答を保存（質問ID → スコアのJSON）
  answers JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagnoses_user ON diagnoses(user_id, created_at DESC);

-- ----------------------------------------
-- checkins: 毎日チェックイン
-- ----------------------------------------
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 出題された質問IDリスト
  question_ids TEXT[] NOT NULL,
  
  -- 各タイプの集計スコア
  brain_score INTEGER NOT NULL DEFAULT 0,
  blood_score INTEGER NOT NULL DEFAULT 0,
  nerve_score INTEGER NOT NULL DEFAULT 0,
  organ_score INTEGER NOT NULL DEFAULT 0,
  energy_score INTEGER NOT NULL DEFAULT 0,
  
  -- 全回答（質問ID → 0/1/2）
  answers JSONB NOT NULL DEFAULT '{}',
  
  -- 正規化スコア（表示・トレンド用）
  overall_percent REAL NOT NULL DEFAULT 0,
  
  -- キャラクターの一言（生成して保存）
  character_feedback TEXT,
  
  -- メタ情報
  time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkins_user ON checkins(user_id, created_at DESC);
CREATE INDEX idx_checkins_date ON checkins(user_id, (created_at::date));

-- 1日1回制約
CREATE UNIQUE INDEX idx_checkins_daily ON checkins(user_id, (created_at::date));

-- ----------------------------------------
-- products: 商品マスター
-- ----------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL CHECK (category IN ('kampo', 'supplement', 'herbal_tea')),
  
  -- ターゲット
  target_fatigue_types TEXT[] NOT NULL DEFAULT '{}',
  target_symptoms TEXT[] NOT NULL DEFAULT '{}',
  tag TEXT, -- "エネルギー補充" 等の表示用タグ
  
  description TEXT,
  price INTEGER NOT NULL, -- 円
  trial_price INTEGER, -- 初回お試し価格
  
  image_url TEXT,
  emoji TEXT, -- フォールバック表示用
  
  -- 評価
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------
-- orders: 注文
-- ----------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  is_subscription BOOLEAN DEFAULT false,
  
  -- 決済
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);

-- ----------------------------------------
-- order_items: 注文明細
-- ----------------------------------------
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ----------------------------------------
-- chat_sessions: チャット履歴（炭谷AI）
-- ----------------------------------------
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  messages JSONB NOT NULL DEFAULT '[]',
  -- [{ role: "user"|"assistant", content: "...", timestamp: "..." }]
  
  -- コンテキスト情報（セッション開始時のスナップショット）
  context_snapshot JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id, created_at DESC);

-- ----------------------------------------
-- RLS (Row Level Security)
-- ----------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- products は全ユーザーに読み取り公開
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (is_active = true);

-- 他テーブルは自分のデータのみ
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own diagnoses" ON diagnoses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own checkins" ON checkins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ----------------------------------------
-- updated_at トリガー
-- ----------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------
-- 初期商品データ投入
-- ----------------------------------------
INSERT INTO products (name, brand, category, target_fatigue_types, target_symptoms, tag, description, price, trial_price, emoji, rating, review_count, is_new, sort_order) VALUES
('補中益気湯エキス顆粒', 'クラシエ', 'kampo', ARRAY['energy', 'organ'], ARRAY['倦怠感', '食欲不振', '気力低下'], 'エネルギー補充', '気力・体力を回復する代表的な補気薬。慢性疲労・倦怠感に。', 2980, 980, '🌿', 4.8, 127, false, 1),
('加味逍遙散エキス顆粒', 'ツムラ', 'kampo', ARRAY['nerve', 'brain'], ARRAY['ストレス', '不安', '不眠'], '自律神経サポート', 'ストレス・不安・イライラをやわらげる。精神的疲労・不眠に。', 3200, 1200, '🌸', 4.7, 89, true, 2),
('桂枝茯苓丸エキス顆粒', 'クラシエ', 'kampo', ARRAY['blood'], ARRAY['冷え', '肩こり', 'のぼせ'], '血流改善', '血の滞りを改善。冷え・肩こり・のぼせが気になる方に。', 2750, NULL, '🔴', 4.6, 64, false, 3),
('六君子湯エキス顆粒', 'ツムラ', 'kampo', ARRAY['organ', 'energy'], ARRAY['胃もたれ', '食欲不振', '倦怠感'], '内臓ケア', '胃腸の働きを整え、食欲不振・胃もたれ・倦怠感をやわらげる。', 2500, NULL, '🌾', 4.5, 53, false, 4),
('酸棗仁湯エキス顆粒', 'クラシエ', 'kampo', ARRAY['nerve', 'brain'], ARRAY['不眠', '神経過敏', '心身疲労'], '睡眠サポート', '心身の疲労による不眠・神経過敏をやわらげる。', 3100, NULL, '🌙', 4.4, 41, false, 5);
```

### 2.3 localStorage との共存戦略

#### Phase 1（MVP / 現在の実装を壊さない）
- localStorage（Zustand persist）をそのまま使う
- Supabase Auth（Anonymous Auth）を有効化
- ユーザーがアカウント作成前でもlocalStorageで動く

#### Phase 2（ログイン導入後）
- Supabase Authでメール or LINE ログイン
- ログイン時にlocalStorageのデータをSupabaseにマイグレーション:

```typescript
async function migrateLocalToSupabase(localProfile: UserProfile, supabaseUser: User) {
  // 1. usersテーブルにupsert
  await supabase.from('users').upsert({
    id: supabaseUser.id,
    nickname: localProfile.nickname,
    primary_type: localProfile.character?.type,
    continuous_days: localProfile.continuousDays,
    total_checkins: localProfile.totalCheckins,
  });

  // 2. diagnosisHistoryをdiagnosesテーブルに投入
  for (const diag of localProfile.diagnosisHistory) {
    await supabase.from('diagnoses').insert({
      user_id: supabaseUser.id,
      brain_score: diag.scores.brain,
      blood_score: diag.scores.blood,
      nerve_score: diag.scores.nerve,
      organ_score: diag.scores.organ,
      energy_score: diag.scores.energy,
      primary_type: diag.primaryType,
      secondary_type: diag.secondaryType,
      created_at: diag.createdAt,
    });
  }

  // 3. localStorageをクリア
  localStorage.removeItem('teateyakkyoku-user');
}
```

#### オフライン対応
- チェックイン回答はまずlocalStorageに保存
- オンライン復帰時にSupabaseへ同期（background sync）
- 競合時はサーバー側を正とする（最終書き込み優先）

---

## 3. 炭谷AIシステムプロンプト改善版

### 3.1 改善版プロンプト（実際のテキスト）

以下をそのまま `src/app/api/chat/route.ts` の `SYSTEM_PROMPT` に置き換える。

```
あなたは「てあて薬局」の漢方アドバイザー、炭谷 薫です。

## キャラクター設定
- 温かく親しみやすい漢方専門家（30年以上の経験）
- 難しい漢方の知識をやさしく、わかりやすく伝えることが得意
- ユーザーの悩みに寄り添い、具体的なアドバイスをする
- 季節の養生にも詳しく、旬の食材や生活習慣のアドバイスが得意

## 回答スタイル
- 親しみやすい敬語（「〜ですよ」「〜しましょうね」）
- 100〜200文字程度（長すぎない。質問が複雑な場合のみ300文字まで）
- 共感から始める → 原因の簡単な説明 → 具体的なアドバイス（1〜2個）
- 専門用語は避け、使う場合は簡単に説明する
- 漢方の提案時は「てあて薬局のショップ」を自然に案内する

## ユーザーコンテキスト（動的に挿入）
{USER_CONTEXT}

## 回答時の判断基準
- ユーザーの疲労タイプに合わせたアドバイスを優先する
- 直近のチェックインで悪化しているタイプがあれば、そのケアを提案する
- トレンドが改善傾向なら「良くなってきてますね」と励ます
- 季節に合った養生を織り交ぜる（例: 梅雨時は湿気対策、冬は温活）
- キャラクター（ユーザーの相棒動物）の調子にも触れる

## 注意事項
- 医療的な診断・治療の保証はしない
- 重篤な症状（胸の痛み、激しいめまい、高熱等）は必ず医療機関を勧める
- 「漢方で治る」とは絶対に言わない。「和らげる」「サポートする」という表現を使う
- ユーザーが落ち込んでいる場合は、まず気持ちに寄り添い、無理にアドバイスしない
```

### 3.2 動的コンテキスト生成ロジック

API Route で `{USER_CONTEXT}` を以下の形式で生成して挿入する:

```typescript
function buildUserContext(
  fatigueType: string | undefined,
  recentCheckins: CheckinData[],  // 直近7日分
  currentMonth: number,
): string {
  const parts: string[] = [];

  // 疲労タイプ
  if (fatigueType) {
    parts.push(`### 疲労タイプ\n${FATIGUE_CONTEXT[fatigueType]}`);
  }

  // 直近チェックインサマリー
  if (recentCheckins.length > 0) {
    const latest = recentCheckins[0];
    const typeScores = ['brain', 'blood', 'nerve', 'organ', 'energy']
      .map(t => `${TYPE_LABELS[t]}: ${latest[`${t}_score`]}`)
      .join('、');
    
    parts.push(`### 今日の状態\n${typeScores}\n全体的な疲労度: ${latest.overall_percent}%`);

    // トレンド
    if (recentCheckins.length >= 3) {
      const recent3Avg = avg(recentCheckins.slice(0, 3).map(c => c.overall_percent));
      const older3Avg = recentCheckins.length >= 6
        ? avg(recentCheckins.slice(3, 6).map(c => c.overall_percent))
        : null;
      
      if (older3Avg !== null) {
        const trend = recent3Avg > older3Avg ? '悪化傾向' : recent3Avg < older3Avg ? '改善傾向' : '横ばい';
        parts.push(`### トレンド\n直近3日 vs 前3日: ${trend}（${recent3Avg.toFixed(0)}% → ${older3Avg.toFixed(0)}%）`);
      }
    }
  }

  // 季節情報
  const season = getSeason(currentMonth);
  parts.push(`### 季節\n${season.name}（${season.advice}）`);

  // 継続記録
  // parts.push(`### 継続記録\n${user.continuous_days}日連続チェックイン中`);

  return parts.join('\n\n');
}

const SEASONS: Record<string, { name: string; advice: string }> = {
  spring: { name: '春', advice: '肝の養生。ストレスを溜めず、のびのびと過ごすことが大切。酸味のある食材（梅干し・柑橘類）がおすすめ' },
  rainy: { name: '梅雨', advice: '湿気による体のだるさに注意。胃腸を整え、水分代謝を促す食材（はと麦・小豆）がおすすめ' },
  summer: { name: '夏', advice: '暑さによる消耗に注意。冷たいものの摂りすぎは胃腸を弱める。スイカ・きゅうり等の体を冷ます食材を適度に' },
  autumn: { name: '秋', advice: '乾燥に注意。肺を潤す食材（梨・白きくらげ・蜂蜜）がおすすめ。早寝早起きで秋の養生を' },
  winter: { name: '冬', advice: '腎の養生。体を温め、エネルギーを蓄える時期。黒ごま・黒豆・くるみ等の黒い食材がおすすめ' },
};

function getSeason(month: number) {
  if (month >= 3 && month <= 4) return SEASONS.spring;
  if (month >= 5 && month <= 6) return SEASONS.rainy;
  if (month >= 7 && month <= 8) return SEASONS.summer;
  if (month >= 9 && month <= 10) return SEASONS.autumn;
  return SEASONS.winter;
}
```

### 3.3 API Route変更点

現在の `POST` ハンドラを以下のように拡張する:

```typescript
export async function POST(req: NextRequest) {
  const { messages, fatigueType, userId } = await req.json();

  // Supabase Phase 2以降: ユーザーIDがあればDBからチェックイン履歴を取得
  let recentCheckins: any[] = [];
  if (userId) {
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(7);
    recentCheckins = data ?? [];
  }

  const userContext = buildUserContext(
    fatigueType,
    recentCheckins,
    new Date().getMonth() + 1,
  );

  const systemContent = SYSTEM_PROMPT.replace('{USER_CONTEXT}', userContext || '（初回利用・データなし）');

  // ...既存のOpenAI呼び出し
}
```

---

## 4. 実装順序（推奨）

### Phase 1: チェックイン機能（最優先）

1. `src/lib/daily-checkin.ts` — 質問プール + 選択アルゴリズム + スコアリング
2. `src/app/checkin/page.tsx` — 毎日チェックインUI（3問、3択、フィードバック表示）
3. `src/store/userStore.ts` — checkinHistory追加、体質診断とチェックインを分離
4. `src/app/home/page.tsx` — 「今日の疲労チェック」ボタンの遷移先を `/checkin` に変更
5. `src/app/diagnosis/page.tsx` — 「体質診断」として残す（初回 or マイページから再診断）

### Phase 2: Supabase統合

1. Supabase Migration SQLを実行
2. 商品データをSupabaseに移行（`products`テーブル）
3. `src/app/shop/page.tsx` — Supabaseから商品取得に変更
4. 認証なしでもAnonymous Authで動く構成

### Phase 3: データ永続化

1. Supabase Auth導入（メール or LINE）
2. localStorage → Supabaseマイグレーション
3. チェックイン・診断データのSupabase保存
4. オフライン→オンライン同期

### Phase 4: AI強化

1. 炭谷AIプロンプト改善版の適用
2. チェックイン履歴をチャットコンテキストに注入
3. 季節情報の動的生成

---

## 5. 新規ファイル構成（Phase 1完了後）

```
src/
├── lib/
│   ├── diagnosis.ts          # 既存: 体質診断（20問）
│   ├── daily-checkin.ts      # 新規: チェックイン質問プール + 選択アルゴリズム
│   └── supabase/
│       ├── client.ts         # 既存
│       └── server.ts         # 既存
├── store/
│   └── userStore.ts          # 改修: checkinHistory追加
├── types/
│   └── index.ts              # 改修: CheckinResult型追加
├── app/
│   ├── checkin/
│   │   └── page.tsx          # 新規: 毎日チェックインUI
│   ├── diagnosis/
│   │   └── page.tsx          # 既存: 体質診断（初回・再診断用）
│   └── api/
│       └── chat/
│           └── route.ts      # 改修: コンテキスト強化
└── ...
```

---

## 6. 型定義の追加（types/index.ts）

```typescript
// ===== 毎日チェックイン =====
export interface DailyCheckinQuestion {
  id: string;                    // "dc-b01" 等
  text: string;
  category: FatigueType;
  timeSlot: "morning" | "afternoon" | "evening" | "all";
}

export interface CheckinResult {
  scores: Record<FatigueType, number>;  // 各タイプの合計（0〜4程度）
  questionIds: string[];                // 出題された質問ID
  answers: Record<string, number>;      // 質問ID → 0/1/2
  overallPercent: number;               // 全体疲労度 0〜100
  feedback: string;                     // キャラクターの一言
  createdAt: string;
}
```
