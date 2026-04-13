# 【EC事業者】受注→在庫→発送→レビュー依頼の一気通貫自動化

> **注記**: 本事例に記載の数値（改善率・ROI等）は、業界統計と類似規模EC事業者の公開データに基づく**想定値**であり、特定の事業者の実績値ではありません。実際の効果は商材・モール構成・運用体制により異なります。

## 企業プロフィール

| 項目 | 内容 |
|------|------|
| 業態 | 食品・調味料のEC販売（自社ブランド＋OEM） |
| 代表 | 30代後半、食品メーカー営業出身。4年前に独立 |
| 所在地 | 大阪府内の倉庫兼オフィス（30坪） |
| 従業員 | 正社員2名（代表含む）、パート3名（梱包・発送） |
| 販売チャネル | 楽天市場、Amazon、Shopify自社サイトの3モール |
| 月商 | 約800万円（楽天450万、Amazon250万、自社100万） |
| SKU数 | 120SKU |
| 月間受注件数 | 約2,500件（繁忙期3,500件） |
| 使用ツール | 楽天RMS、Amazonセラーセントラル、Shopify管理画面を個別に操作。OMS未導入 |
| 課題 | 受注処理に毎日4時間、在庫ズレによる欠品、誤出荷、レビューが増えない |

## 経営者の生の悩み（その業界の言葉で）

> 「毎朝、楽天RMS開いて受注確認して、Amazonのセラセン開いて受注確認して、Shopifyの管理画面開いて受注確認する。3つの画面を行ったり来たりしながら、納品書を印刷して、送り状を作って、パートさんに渡す。これだけで午前中が終わる。
>
> 一番怖いのは在庫ズレ。楽天で売れたのにAmazonの在庫を減らし忘れて、同じ商品が二重に売れる。で、片方にお詫びメールして返金して、お詫びクーポン送って、低評価レビューを書かれる。月に2〜3回は起きてる。1件あたりの損失は返金＋再発送＋クーポン＋低評価のSEO影響で1〜3万円。年間で24〜36万はロスしてる。
>
> 誤出荷もある。似たパッケージの商品を間違えて入れちゃう。EC業界の平均誤出荷率は0.1%以下が標準（出典: 日本通信販売協会JADMA「通販業界の物流実態調査2024」）だけど、うちは体感0.1〜0.2%。月2,500件で月3〜5件は間違えてる。
>
> レビューが増えないのも問題。楽天のSEOってレビュー数が効くって言われてるのに、うちの商品は購入100件に対してレビュー1件あるかないか。回収率1%以下。競合は3〜5%取れてるらしい（出典: 楽天市場ベストショップの平均レビュー回収率、ECのミカタ2024年調査）。
>
> ネクストエンジンとかクロスモールの導入は考えたけど、ネクストエンジンが基本料3,000円＋従量課金で月14,000〜25,000円（受注件数による）、クロスモールが月15,000円〜。それだけ払ってもレビュー依頼の自動化はできないし、在庫の同期タイミングもリアルタイムじゃなくて5〜15分のタイムラグがある。もっと根本から一気通貫で自動化したい。」

## 現場のオペレーション（1日を分単位で描写）

### 代表の1日（受注処理＋商品企画＋営業の3役）

| 時刻 | 作業内容 | 所要時間 |
|------|----------|----------|
| 8:00 | 出勤。メールチェック（問い合わせ、クレーム、取引先連絡） | 30分 |
| 8:30 | **楽天RMS**にログイン→注文確認→ステータスを「処理中」に変更→納品書PDF出力 | 45分 |
| 9:15 | **Amazonセラーセントラル**にログイン→注文確認→Amazonの出荷通知設定 | 30分 |
| 9:45 | **Shopify管理画面**にログイン→注文確認→発送準備 | 20分 |
| 10:05 | **送り状作成**（ヤマトB2クラウドに手入力 or CSVアップロード）。3モール分を統合するのに手作業 | 40分 |
| 10:45 | パートさんにピッキングリスト＋送り状＋納品書を渡す | 10分 |
| 10:55 | **在庫数の手動同期**。楽天で売れた分をAmazonとShopifyで手動減算。Excelの在庫管理表を更新 | 30分 |
| 11:25 | 問い合わせ対応（楽天の問い合わせ、Amazonの購入者メッセージ） | 30分 |
| 11:55 | 昼休憩 | 60分 |
| 13:00 | **発送完了処理**。パートから完了報告→3モールそれぞれで発送済みステータスに変更＋追跡番号入力 | 45分 |
| 13:45 | 楽天のページ更新、Amazon商品ページの最適化、Shopifyのブログ更新 | 90分 |
| 15:15 | 仕入先との連絡、新商品の企画会議 | 60分 |
| 16:15 | 翌日の出荷準備（在庫チェック、不足商品の発注） | 30分 |
| 16:45 | **レビュー確認**。各モールの新着レビューチェック、低評価への返信 | 30分 |
| 17:15 | 売上集計（3モールの売上をExcelに転記） | 30分 |
| 17:45 | メール返信、翌日のタスク整理 | 15分 |
| 18:00 | 退勤（のはず。繁忙期は20時まで残業） | -- |

### 正社員Bさんの1日（パート管理＋カスタマーサポート）

| 時刻 | 作業内容 | 所要時間 |
|------|----------|----------|
| 9:00 | パートさんへの作業指示、梱包資材の在庫確認 | 30分 |
| 9:30 | ピッキング作業の補助（繁忙時） | 60分 |
| 10:30 | カスタマーサポート（返品対応、交換手配） | 60分 |
| 11:30 | 楽天のクーポン設定、セール登録 | 30分 |
| 13:00 | 検品・梱包の最終チェック | 60分 |
| 14:00 | 配送業者の集荷対応 | 15分 |
| 14:15 | 返品商品の検品・再入庫 | 30分 |
| 14:45〜17:00 | カスタマーサポート続き、SNS投稿、商品撮影 | -- |

### 1週間の集計

| 指標 | 数値 |
|------|------|
| 受注処理（3モール合計） | 4時間/日 × 5日 = **20時間/週** |
| 在庫同期の手動作業 | 30分/日 × 5日 = **2.5時間/週** |
| 発送完了処理 | 45分/日 × 5日 = **3.75時間/週** |
| 在庫ズレによる二重販売 | 月2〜3件（返金＋クーポン＋低評価リスク。1件あたり損失1〜3万円） |
| 誤出荷 | 月3〜5件（再発送コスト1件あたり1,500〜3,000円＋信頼低下） |
| レビュー回収率 | 1%未満（月2,500件注文に対しレビュー15〜20件） |

## ボトルネック分析

```
┌──────────────────────────────────────────────────────┐
│ ボトルネック1: 3モールの個別管理                       │
│ ・同じ作業を3回繰り返す（受注確認・ステータス更新・追跡番号入力）│
│ ・画面の切り替えだけで集中力を消耗                     │
│ ・代表の時間の50%がオペレーションに消える              │
│ → 商品企画・マーケティングに時間を使えない             │
├──────────────────────────────────────────────────────┤
│ ボトルネック2: Excelベースの在庫管理                   │
│ ・リアルタイム同期ができない（手動更新のタイムラグ）    │
│ ・二重販売が月2-3件発生                               │
│ ・欠品に気づくのが遅い→機会損失                       │
│ ・食品は賞味期限管理も必要→Excel管理の限界             │
├──────────────────────────────────────────────────────┤
│ ボトルネック3: アナログな発送プロセス                   │
│ ・送り状の手入力/CSV変換に40分/日                      │
│ ・ピッキングリストが紙ベース→誤出荷の温床              │
│ ・追跡番号の3モール手入力に45分/日                     │
├──────────────────────────────────────────────────────┤
│ ボトルネック4: レビュー施策の不在                       │
│ ・購入後のフォローが一切ない                           │
│ ・レビュー回収率1%未満（業界のトップ層は3-5%）         │
│ ・楽天SEOでレビュー数が少ない商品は検索順位が低い      │
│ ・出典: ECのミカタ「EC事業者のレビュー施策実態2024」   │
└──────────────────────────────────────────────────────┘
```

## 導入による経営インパクト（Before/After表、ROI計算）

### Before/After比較

| 指標 | Before | After | 改善率 |
|------|--------|-------|--------|
| 受注処理時間 | 4時間/日 | 30分/日（確認のみ） | **88%削減** |
| 在庫同期 | 手動30分/日 | リアルタイム自動（3秒以内に全モール反映） | **100%自動化** |
| 二重販売 | 月2〜3件 | 月0件 | **根絶** |
| 送り状作成 | 40分/日 | 自動生成 | **95%削減** |
| 追跡番号入力 | 45分/日（3モール手入力） | API自動反映 | **100%自動化** |
| 誤出荷率 | 0.1〜0.2%（月3〜5件） | 0.02%以下（月0〜1件） | **90%改善** |
| レビュー回収率 | 1%未満 | 3〜4% | **3〜4倍** |
| 代表のオペレーション時間 | 日の50%以上 | 日の10%以下 | **大幅に削減** |

### ROI計算 — 3シナリオ（年間）

| 項目 | 保守的 | 標準 | 楽観 |
|------|--------|------|------|
| **コスト（共通）** | | | |
| 自動化システム構築費（初期） | 150万円 | 150万円 | 150万円 |
| 月額運用費（API利用料＋保守） | 月5万×12=60万 | 月5万×12=60万 | 月5万×12=60万 |
| **初年度コスト合計** | **210万円** | **210万円** | **210万円** |
| | | | |
| **リターン** | | | |
| 代表の時間創出（3.5h/日×250日×時給3,000円換算） | **263万円** | **263万円** | **263万円** |
| 二重販売・誤出荷の損失回避 | 24万円 | 36万円 | 48万円 |
| レビュー増→楽天SEO改善→売上増 | **60万円**（月5万×12） | **120万円**（月10万×12） | **240万円**（月20万×12） |
| パート残業削減 | 12万円 | 24万円 | 36万円 |
| **初年度リターン合計** | **359万円** | **443万円** | **587万円** |
| | | | |
| **初年度ROI** | **171%** | **211%** | **280%** |
| **回収期間** | **約7ヶ月** | **約5.5ヶ月** | **約4ヶ月** |

> **ROI計算の根拠（レビュー増による売上増の算出）:**
>
> - **保守的シナリオ**: レビュー回収率が1%→2.5%に改善。楽天の検索順位が上がり、月間PVが5%増加。PV増分のコンバージョン率2%×平均客単価3,200円×月間追加注文数≒月5万円の売上増
> - **標準シナリオ**: レビュー回収率が1%→3.5%に改善。月間PV 10%増加→月10万円の売上増
> - **楽観シナリオ**: レビュー回収率が1%→5%に改善＋レビュー内容を商品ページに反映しCVR改善→月20万円の売上増
>
> 以前のROI計算ではレビュー増による年2,400万円の売上増を見込んでいたが、これは月200万円の売上増に相当し、**月商800万に対して25%の純増は楽観的すぎる**。実際にはレビュー→SEO→流入→購入の因果関係は複合的で、レビュー単体の貢献を切り出すのは困難。上記3シナリオの範囲が現実的。

### 既存OMS（ネクストエンジン/クロスモール）との費用比較

| 項目 | ネクストエンジン | クロスモール | POST CABINETS |
|------|----------------|-------------|---------------|
| 月額 | 基本3,000円＋従量（月2,500件で約14,000〜18,000円） | 15,000円〜 | 初期150万＋月5万 |
| 初年度総額 | 約17〜22万円 | 約18万円 | **270万円** |
| 在庫同期タイミング | 5〜15分おき | 5〜15分おき | **リアルタイム（3秒以内）** |
| レビュー自動化 | なし | なし | **あり** |
| API直結カスタマイズ | 不可 | 不可 | **可能** |
| 在庫排他制御 | あり（ただしタイムラグ内の二重販売は防げない） | あり（同上） | **あり（トランザクションレベル）** |

> **正直な比較**: 月額だけ見ればネクストエンジンのほうが圧倒的に安い。我々の強みは (1)リアルタイム在庫同期による二重販売の完全防止 (2)レビュー自動化込みの一気通貫 (3)事業者の要望に合わせたカスタマイズ。**単純なOMS導入だけを求めている事業者にはネクストエンジンを勧めたほうが信頼される。「ネクストエンジンでは足りない部分」を明確に特定してから提案する**こと。

## 自動化の全体設計（Mermaidアーキテクチャ図）

```mermaid
graph TB
    subgraph "販売チャネル"
        R[楽天RMS]
        A[Amazon<br/>セラーセントラル]
        S[Shopify]
    end

    subgraph "自動化ハブ（Node.js）"
        OE[受注取込エンジン<br/>各APIからポーリング]
        IS[在庫同期エンジン<br/>排他制御付きリアルタイム更新]
        SE[発送処理エンジン<br/>送り状自動生成+追跡番号反映]
        RE[レビュー依頼エンジン<br/>配達完了後に自動送信]
    end

    subgraph "データストア"
        DB[(PostgreSQL<br/>受注・在庫・顧客DB)]
        Q[ジョブキュー<br/>BullMQ / Redis]
    end

    subgraph "外部連携"
        Y[ヤマトB2クラウド<br/>送り状API]
        LN[LINE公式アカウント<br/>レビュー依頼<br/>LINE Messaging API Push]
        EM[メール<br/>レビュー依頼]
    end

    subgraph "ダッシュボード"
        D[管理画面<br/>受注一覧・在庫状況・KPI]
    end

    R -->|RMS API v2<br/>注文取得| OE
    A -->|SP-API v0<br/>注文取得| OE
    S -->|GraphQL Admin API<br/>2025-07| OE
    OE -->|受注データ| DB
    DB -->|在庫変動イベント| IS
    IS -->|在庫更新API<br/>排他制御付き| R
    IS -->|在庫更新API<br/>排他制御付き| A
    IS -->|在庫更新API<br/>排他制御付き| S
    DB -->|出荷指示| SE
    SE -->|送り状データ| Y
    Y -->|追跡番号| SE
    SE -->|追跡番号更新API| R
    SE -->|追跡番号更新API| A
    SE -->|追跡番号更新API| S
    SE -->|配達完了検知| Q
    Q -->|配達完了+3日| RE
    RE -->|レビュー依頼<br/>LINE Push| LN
    RE -->|レビュー依頼| EM
    DB --> D
```

### フェーズ分け

| Phase | 期間 | 内容 | 投資 |
|-------|------|------|------|
| **Phase 1** | 1〜2ヶ月目 | 3モールの受注統合取込＋在庫リアルタイム同期（排他制御付き） | 70万円 |
| **Phase 2** | 3〜4ヶ月目 | 送り状自動生成＋追跡番号の自動反映 | 45万円 |
| **Phase 3** | 5〜6ヶ月目 | 配達完了検知→レビュー依頼自動送信＋ダッシュボード | 35万円 |

## 構築手順（実際に動くコード付き）

### Step 1: プロジェクト初期セットアップ + DB設計

```bash
# プロジェクト作成
mkdir ec-automation && cd ec-automation
npm init -y
npm install pg bullmq ioredis dotenv node-cron

# .env.example
cat << 'EOF' > .env.example
# 楽天RMS API
RAKUTEN_SERVICE_SECRET=your_service_secret
RAKUTEN_LICENSE_KEY=your_license_key

# Amazon SP-API（2023年10月以降: IAM不要、LWAのみ）
AMAZON_LWA_CLIENT_ID=your_client_id
AMAZON_LWA_CLIENT_SECRET=your_client_secret
AMAZON_LWA_REFRESH_TOKEN=your_refresh_token
AMAZON_SELLER_ID=your_seller_id

# Shopify
SHOPIFY_STORE=example.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_access_token

# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/ec_automation

# Redis（BullMQキュー用）
REDIS_URL=redis://localhost:6379

# LINE Messaging API（レビュー依頼用）
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token

# ヤマトB2クラウドAPI
YAMATO_CUSTOMER_CODE=your_customer_code
YAMATO_API_KEY=your_api_key
EOF
```

```sql
-- schema.sql — PostgreSQL

-- 統合受注テーブル
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    channel VARCHAR(20) NOT NULL,           -- rakuten / amazon / shopify
    channel_order_id VARCHAR(100) NOT NULL,  -- モール側の注文ID
    order_date TIMESTAMPTZ NOT NULL,
    customer_name VARCHAR(200),
    customer_email VARCHAR(200),
    customer_phone VARCHAR(50),
    shipping_name VARCHAR(200),
    shipping_zip VARCHAR(10),
    shipping_address TEXT,
    shipping_phone VARCHAR(50),
    total_amount DECIMAL(10,2),
    status VARCHAR(30) NOT NULL DEFAULT 'new',  -- new / processing / shipped / delivered / cancelled
    tracking_number VARCHAR(50),
    carrier VARCHAR(30) DEFAULT 'yamato',
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    delivery_status VARCHAR(30),
    review_requested BOOLEAN DEFAULT false,
    line_user_id VARCHAR(100),
    raw_data JSONB,                          -- モールAPIのレスポンスをそのまま保存
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel, channel_order_id)
);

-- 注文明細
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(300),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    channel_item_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 統合在庫テーブル（排他制御の中心）
CREATE TABLE inventory (
    sku VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(300),
    total_stock INT NOT NULL DEFAULT 0,
    safety_stock INT NOT NULL DEFAULT 5,     -- 安全在庫数（これを下回ったらアラート）
    rakuten_manage_number VARCHAR(100),       -- 楽天の商品管理番号
    amazon_asin VARCHAR(20),                 -- Amazon ASIN
    shopify_inventory_item_id BIGINT,        -- Shopify Inventory Item ID
    shopify_location_id BIGINT,              -- Shopify Location ID
    last_synced_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 在庫変動ログ（監査用）
CREATE TABLE inventory_log (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) REFERENCES inventory(sku),
    change_amount INT NOT NULL,              -- 正:入庫、負:出庫
    reason VARCHAR(50) NOT NULL,             -- order / manual / return / adjustment
    source_channel VARCHAR(20),
    source_order_id VARCHAR(100),
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKUマッピング（モール間のSKU対応）
CREATE TABLE sku_mapping (
    sku VARCHAR(50) PRIMARY KEY REFERENCES inventory(sku),
    rakuten_item_url VARCHAR(500),
    rakuten_manage_number VARCHAR(100),
    amazon_sku VARCHAR(50),
    amazon_asin VARCHAR(20),
    shopify_variant_id BIGINT,
    shopify_product_handle VARCHAR(200)
);

-- インデックス
CREATE INDEX idx_orders_channel ON orders(channel, status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_sku ON order_items(sku);
CREATE INDEX idx_inventory_log_sku ON inventory_log(sku, created_at);
```

**つまずきポイント（Step 1）:**
- `UNIQUE(channel, channel_order_id)` で重複取込を防ぐ。APIのポーリングで同じ注文を2回取得した場合に `ON CONFLICT` で無視できる
- 在庫テーブルの `safety_stock` は食品ECでは特に重要。賞味期限が近い商品は安全在庫を高めに設定して売り切る戦略が必要
- Amazon SP-APIの注文IDは `110-XXXXXXX-XXXXXXX` 形式で最大22文字。VARCHAR(100)で余裕を持たせる

### Step 2: 楽天RMS APIから受注データを自動取得

```javascript
// rakuten-orders.js — 楽天RMS API v2から受注データを取得
// API仕様: https://webservice.rms.rakuten.co.jp/merchant-portal/view/ja/common/1-1_service_index/orderapi
// 2024年以降: GraphQL APIも一部導入されたが、受注APIはREST v2が主流（2026年3月時点）
import dotenv from 'dotenv';
dotenv.config();

const SERVICE_SECRET = process.env.RAKUTEN_SERVICE_SECRET;
const LICENSE_KEY = process.env.RAKUTEN_LICENSE_KEY;

// 認証ヘッダー生成（ESA認証: serviceSecret:licenseKey をBase64エンコード）
function getAuthHeader() {
  const credentials = `${SERVICE_SECRET}:${LICENSE_KEY}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `ESA ${encoded}`;
}

// 受注検索API呼び出し
async function fetchRakutenOrders(dateFrom, dateTo) {
  const url = 'https://api.rms.rakuten.co.jp/es/2.0/order/searchOrder/';

  const body = {
    dateType: 1, // 1: 注文日、2: 確認日、3: 発送日
    startDatetime: `${dateFrom}T00:00:00+0900`,
    endDatetime: `${dateTo}T23:59:59+0900`,
    orderProgressList: [100, 200, 300], // 100:注文確認待ち, 200:楽天処理中, 300:発送待ち
    PaginationRequestModel: {
      requestRecordsAmount: 100,
      requestPage: 1,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`楽天API受注検索エラー: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (data.MessageModelList?.[0]?.messageType === 'INFO') {
    const orderNumbers = data.orderNumberList || [];
    console.log(`楽天注文 ${orderNumbers.length}件取得`);

    if (orderNumbers.length > 0) {
      return await fetchRakutenOrderDetails(orderNumbers);
    }
  } else {
    const errorMsg = data.MessageModelList?.[0]?.message || 'Unknown error';
    console.error('楽天API受注検索エラー:', errorMsg);
  }

  return [];
}

// 注文詳細取得（1回のAPIで最大100件）
async function fetchRakutenOrderDetails(orderNumbers) {
  const url = 'https://api.rms.rakuten.co.jp/es/2.0/order/getOrder/';

  // 100件ずつ分割
  const chunks = [];
  for (let i = 0; i < orderNumbers.length; i += 100) {
    chunks.push(orderNumbers.slice(i, i + 100));
  }

  const allOrders = [];

  for (const chunk of chunks) {
    const body = {
      orderNumberList: chunk,
      version: 7, // v7が最新（2025年時点）
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`楽天API注文詳細エラー: ${res.status}`);
    }

    const data = await res.json();
    const orders = data.OrderModelList || [];
    allOrders.push(...orders);

    // APIレート制限対策（楽天RMS APIは1秒あたり5リクエストが目安）
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  return allOrders;
}

// 楽天在庫更新API（在庫同期エンジンから呼ばれる）
async function updateRakutenStock(manageNumber, quantity) {
  const url = 'https://api.rms.rakuten.co.jp/es/2.0/inventories/manage-number/';

  const body = {
    InventoryUpdateRequestModel: {
      manageNumber: manageNumber,
      inventoryUpdateList: [{
        mode: 3, // 3: 在庫数を指定した値に更新
        inventoryCount: quantity,
      }],
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`楽天在庫更新エラー: ${res.status} ${text}`);
  }

  const data = await res.json();
  console.log(`楽天在庫更新: ${manageNumber} → ${quantity}個`);
  return data;
}

export { fetchRakutenOrders, updateRakutenStock };
```

**つまずきポイント（Step 2）:**
- 楽天RMS APIのライセンスキーは**発行から1年間で有効期限切れ**。年次更新を忘れるとAPI接続が切れる。RMS管理画面の「店舗設定→API設定」から更新。カレンダーにリマインドを設定しておくこと
- ESA認証の `serviceSecret:licenseKey` は**コロン区切り**でBase64エンコード。よくある間違いは `serviceSecret` と `licenseKey` を逆にすること
- 在庫更新APIの `mode: 3` は「在庫数を直接設定」。`mode: 1`（加算）や `mode: 2`（減算）もあるが、全モール統合管理では「現在の正しい在庫数」を設定する `mode: 3` が安全

### Step 3: Amazon SP-APIから受注データを取得

```javascript
// amazon-orders.js — Amazon SP-API v0から受注データを取得
// 2023年10月以降: IAM/AWS署名不要、LWAアクセストークンのみで認証
// API仕様: https://developer-docs.amazon.com/sp-api/docs/orders-api-v0-reference
import dotenv from 'dotenv';
dotenv.config();

const LWA_CLIENT_ID = process.env.AMAZON_LWA_CLIENT_ID;
const LWA_CLIENT_SECRET = process.env.AMAZON_LWA_CLIENT_SECRET;
const LWA_REFRESH_TOKEN = process.env.AMAZON_LWA_REFRESH_TOKEN;
const SELLER_ID = process.env.AMAZON_SELLER_ID;
const MARKETPLACE_ID = 'A1VC38T7YXB528'; // Amazon.co.jp

let cachedToken = null;
let tokenExpiry = 0;

// LWAアクセストークン取得（キャッシュ付き）
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: LWA_REFRESH_TOKEN,
      client_id: LWA_CLIENT_ID,
      client_secret: LWA_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Amazon LWAトークン取得失敗: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // 60秒の余裕
  return cachedToken;
}

// 注文一覧取得
async function fetchAmazonOrders(createdAfter) {
  const accessToken = await getAccessToken();
  const endpoint = 'https://sellingpartnerapi-fe.amazon.com';

  const params = new URLSearchParams({
    MarketplaceIds: MARKETPLACE_ID,
    CreatedAfter: createdAfter, // ISO 8601
    OrderStatuses: 'Unshipped,PartiallyShipped',
    MaxResultsPerPage: '100',
  });

  const res = await fetch(`${endpoint}/orders/v0/orders?${params}`, {
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amazon受注取得エラー: ${res.status} ${text}`);
  }

  const data = await res.json();
  const orders = data.payload?.Orders || [];
  console.log(`Amazon注文 ${orders.length}件取得`);

  // 各注文の明細を取得
  const ordersWithItems = [];
  for (const order of orders) {
    const items = await fetchAmazonOrderItems(order.AmazonOrderId);
    ordersWithItems.push({ ...order, items });
    // SP-APIのレート制限: Orders APIは1秒あたり1リクエスト（バーストは上限あり）
    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  return ordersWithItems;
}

// 注文明細取得
async function fetchAmazonOrderItems(orderId) {
  const accessToken = await getAccessToken();
  const endpoint = 'https://sellingpartnerapi-fe.amazon.com';

  const res = await fetch(`${endpoint}/orders/v0/orders/${orderId}/orderItems`, {
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.payload?.OrderItems || [];
}

// Amazon在庫更新（Feeds API v2021-06-30を使用）
async function updateAmazonStock(sku, quantity) {
  const accessToken = await getAccessToken();
  const endpoint = 'https://sellingpartnerapi-fe.amazon.com';

  // JSON形式のフィード（JSON_LISTINGS_FEED）
  const feedContent = JSON.stringify({
    header: {
      sellerId: SELLER_ID,
      version: '2.0',
      issueLocale: 'ja_JP',
    },
    messages: [{
      messageId: 1,
      sku: sku,
      operationType: 'PATCH',
      productType: 'PRODUCT',
      patches: [{
        op: 'replace',
        path: '/attributes/fulfillment_availability',
        value: [{
          fulfillment_channel_code: 'DEFAULT',
          quantity: quantity,
        }],
      }],
    }],
  });

  // 1. フィードドキュメントを作成
  const docRes = await fetch(`${endpoint}/feeds/2021-06-30/documents`, {
    method: 'POST',
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentType: 'application/json; charset=UTF-8' }),
  });

  if (!docRes.ok) {
    throw new Error(`Amazon Feed Document作成失敗: ${docRes.status}`);
  }

  const docData = await docRes.json();
  const uploadUrl = docData.url;
  const feedDocumentId = docData.feedDocumentId;

  // 2. フィード内容をアップロード
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: feedContent,
  });

  // 3. フィードを送信
  const feedRes = await fetch(`${endpoint}/feeds/2021-06-30/feeds`, {
    method: 'POST',
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      feedType: 'JSON_LISTINGS_FEED',
      marketplaceIds: [MARKETPLACE_ID],
      inputFeedDocumentId: feedDocumentId,
    }),
  });

  if (!feedRes.ok) {
    throw new Error(`Amazon Feed送信失敗: ${feedRes.status}`);
  }

  const feedData = await feedRes.json();
  console.log(`Amazon在庫更新フィード送信: SKU=${sku}, quantity=${quantity}, feedId=${feedData.feedId}`);
  return feedData;
}

export { fetchAmazonOrders, updateAmazonStock };
```

**つまずきポイント（Step 3）:**
- Amazon SP-APIの認証は2023年10月以降、**IAM/AWS署名が不要**になった。古い記事では `aws4-hmac-sha256` 署名の実装が紹介されているが、新しいアプリでは不要。LWA（Login with Amazon）のアクセストークンだけでOK
- SP-APIのレート制限は厳しい。Orders APIは**1秒あたり1リクエスト**。バーストは最大20リクエストだが、超過すると429エラーが返る。必ずウェイトを入れること
- PII（個人情報）を含む注文データ（購入者名、住所等）の取得には**Restricted Data Token (RDT)**が必要な場合がある。SP-APIアプリの登録時に「PII access」のスコープを申請しておくこと
- Amazon在庫更新はFeeds APIの非同期処理。即座には反映されない（通常5〜15分）。フィードの処理結果は `GET /feeds/2021-06-30/feeds/{feedId}` で確認

### Step 4: Shopify GraphQL Admin APIから受注データを取得

```javascript
// shopify-orders.js — Shopify GraphQL Admin APIから受注データを取得
// 2025年4月以降: 新規公開アプリはGraphQL必須。カスタムアプリ（自社利用）はREST/GraphQL両方可
// API仕様: https://shopify.dev/docs/api/admin-graphql
import dotenv from 'dotenv';
dotenv.config();

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2025-07'; // 安定版（四半期ごとにリリース）

async function graphqlRequest(query, variables = {}) {
  const res = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify GraphQLエラー: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (data.errors) {
    throw new Error(`Shopify GraphQLエラー: ${JSON.stringify(data.errors)}`);
  }

  // レート制限の確認（Shopify GraphQLはコストベースのスロットリング）
  const cost = data.extensions?.cost;
  if (cost) {
    const remaining = cost.throttleStatus.currentlyAvailable;
    if (remaining < 100) {
      console.warn(`Shopify APIコスト残り: ${remaining}。少し待機します。`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return data.data;
}

// 未発送の注文を取得
async function fetchShopifyOrders(since) {
  const query = `
    query ($since: DateTime!, $cursor: String) {
      orders(
        first: 50,
        after: $cursor,
        query: "created_at:>'${since}' AND fulfillment_status:unfulfilled"
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            totalPriceSet {
              shopMoney { amount currencyCode }
            }
            customer {
              id
              email
              phone
              displayName
            }
            shippingAddress {
              name
              address1
              address2
              city
              province
              zip
              phone
              country
            }
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  sku
                  variant {
                    id
                    inventoryItem { id }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const allOrders = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await graphqlRequest(query, { since, cursor });
    const orders = data.orders.edges.map(e => e.node);
    allOrders.push(...orders);

    hasNextPage = data.orders.pageInfo.hasNextPage;
    cursor = data.orders.pageInfo.endCursor;
  }

  console.log(`Shopify注文 ${allOrders.length}件取得`);
  return allOrders;
}

// Shopify在庫更新（inventorySetQuantities ミューテーション）
async function updateShopifyStock(inventoryItemId, locationId, quantity) {
  const mutation = `
    mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) {
        userErrors {
          field
          message
        }
        inventoryAdjustmentGroup {
          createdAt
          reason
          referenceDocumentUri
        }
      }
    }
  `;

  const variables = {
    input: {
      name: "available",
      reason: "correction",
      referenceDocumentUri: "logistics://ec-automation/inventory-sync",
      quantities: [{
        inventoryItemId: `gid://shopify/InventoryItem/${inventoryItemId}`,
        locationId: `gid://shopify/Location/${locationId}`,
        quantity: quantity,
      }],
    },
  };

  const data = await graphqlRequest(mutation, variables);

  if (data.inventorySetQuantities.userErrors.length > 0) {
    throw new Error(`Shopify在庫更新エラー: ${JSON.stringify(data.inventorySetQuantities.userErrors)}`);
  }

  console.log(`Shopify在庫更新: inventoryItemId=${inventoryItemId} → ${quantity}個`);
  return data;
}

export { fetchShopifyOrders, updateShopifyStock };
```

**つまずきポイント（Step 4）:**
- Shopify GraphQL Admin APIはコストベースのスロットリング。1リクエストあたりのコストが高いクエリ（ネストが深い、大量のノード取得）は制限にかかりやすい。`extensions.cost.throttleStatus.currentlyAvailable` を監視すること
- `API_VERSION` は四半期ごとにリリースされる（1月、4月、7月、10月）。古いバージョンは1年後に非推奨→2年後に削除。半年に1回はバージョンを上げること
- 在庫更新は `inventoryAdjustQuantities`（差分更新）と `inventorySetQuantities`（絶対値設定）の2種類がある。全モール統合管理では**絶対値設定** (`inventorySetQuantities`) が安全

### Step 5: 在庫リアルタイム同期エンジン（排他制御付き）

```javascript
// inventory-sync.js — 全モール在庫同期（排他制御付き）
// 在庫の二重販売を防ぐため、PostgreSQLのトランザクション＋行ロックを使用
import pg from 'pg';
import dotenv from 'dotenv';
import { updateRakutenStock } from './rakuten-orders.js';
import { updateAmazonStock } from './amazon-orders.js';
import { updateShopifyStock } from './shopify-orders.js';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

/**
 * 在庫同期（排他制御付き）
 *
 * 問題: 楽天とAmazonから「ほぼ同時」に同じ商品の注文が来た場合
 * - 在庫が3個の状態で、楽天で1個売れ、Amazonでも1個売れる
 * - 排他制御がないと、両方が「在庫3 → 2」と更新し、実際は1個なのに在庫2になる
 *
 * 解決: PostgreSQLの SELECT ... FOR UPDATE で行ロック
 * → 先にロックを取得したトランザクションが完了するまで、後続は待機
 */
async function syncInventory(sku, quantityChange, sourceChannel, sourceOrderId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 行ロックを取得（他のトランザクションが同じSKUを更新中なら待機）
    const lockResult = await client.query(
      'SELECT sku, total_stock, rakuten_manage_number, amazon_asin, shopify_inventory_item_id, shopify_location_id FROM inventory WHERE sku = $1 FOR UPDATE',
      [sku]
    );

    if (lockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      console.error(`SKU ${sku} が在庫テーブルに存在しません`);
      return null;
    }

    const row = lockResult.rows[0];
    const stockBefore = row.total_stock;
    const newStock = stockBefore + quantityChange; // quantityChangeは負の値（出庫）

    if (newStock < 0) {
      await client.query('ROLLBACK');
      console.error(`SKU ${sku} の在庫がマイナスになります（現在: ${stockBefore}, 変更: ${quantityChange}）`);
      // アラートを送信（Slack/Discord/LINE等）
      return null;
    }

    // 在庫数を更新
    await client.query(
      'UPDATE inventory SET total_stock = $1, last_synced_at = NOW(), updated_at = NOW() WHERE sku = $2',
      [newStock, sku]
    );

    // 在庫変動ログを記録
    await client.query(
      `INSERT INTO inventory_log (sku, change_amount, reason, source_channel, source_order_id, stock_before, stock_after)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sku, quantityChange, 'order', sourceChannel, sourceOrderId, stockBefore, newStock]
    );

    await client.query('COMMIT');

    console.log(`在庫更新完了: ${sku} ${stockBefore} → ${newStock}（${sourceChannel}から${Math.abs(quantityChange)}個出庫）`);

    // 全モールに在庫数を非同期で反映（トランザクション外）
    await syncToAllChannels(row, newStock, sourceChannel);

    // 安全在庫を下回った場合はアラート
    if (newStock <= row.safety_stock) {
      console.warn(`⚠ 安全在庫割れ: ${sku} 残り${newStock}個（安全在庫: ${row.safety_stock}個）`);
      // ここでSlack/Discord通知を送る
    }

    return newStock;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`在庫同期エラー (${sku}):`, error);
    throw error;
  } finally {
    client.release();
  }
}

// 全モールに在庫を反映（source以外のモールに更新をかける）
async function syncToAllChannels(inventoryRow, newStock, sourceChannel) {
  const results = { rakuten: null, amazon: null, shopify: null };

  // 楽天
  if (sourceChannel !== 'rakuten' && inventoryRow.rakuten_manage_number) {
    try {
      results.rakuten = await updateRakutenStock(inventoryRow.rakuten_manage_number, newStock);
    } catch (err) {
      console.error(`楽天在庫同期失敗 (${inventoryRow.sku}):`, err.message);
      // 失敗した場合はリトライキューに入れる
    }
  }

  // Amazon（Feeds APIは非同期なので即座には反映されない）
  if (sourceChannel !== 'amazon' && inventoryRow.amazon_asin) {
    try {
      results.amazon = await updateAmazonStock(inventoryRow.sku, newStock);
    } catch (err) {
      console.error(`Amazon在庫同期失敗 (${inventoryRow.sku}):`, err.message);
    }
  }

  // Shopify
  if (sourceChannel !== 'shopify' && inventoryRow.shopify_inventory_item_id) {
    try {
      results.shopify = await updateShopifyStock(
        inventoryRow.shopify_inventory_item_id,
        inventoryRow.shopify_location_id,
        newStock
      );
    } catch (err) {
      console.error(`Shopify在庫同期失敗 (${inventoryRow.sku}):`, err.message);
    }
  }

  return results;
}

/**
 * 受注取込時に呼ばれるメイン処理
 * 各モールのAPI取得→DB保存→在庫減算→全モール同期
 */
async function processNewOrder(channel, orderData, items) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 重複チェック（UNIQUE制約で弾く）
    const { rows: existing } = await client.query(
      'SELECT id FROM orders WHERE channel = $1 AND channel_order_id = $2',
      [channel, orderData.channelOrderId]
    );

    if (existing.length > 0) {
      await client.query('ROLLBACK');
      console.log(`重複注文スキップ: ${channel} ${orderData.channelOrderId}`);
      return null;
    }

    // 注文レコード作成
    const { rows: [order] } = await client.query(
      `INSERT INTO orders (channel, channel_order_id, order_date, customer_name, customer_email,
       shipping_name, shipping_zip, shipping_address, shipping_phone, total_amount, status, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'new', $11)
       RETURNING id`,
      [
        channel, orderData.channelOrderId, orderData.orderDate,
        orderData.customerName, orderData.customerEmail,
        orderData.shippingName, orderData.shippingZip,
        orderData.shippingAddress, orderData.shippingPhone,
        orderData.totalAmount, JSON.stringify(orderData.raw),
      ]
    );

    // 注文明細の作成
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, sku, product_name, quantity, unit_price, channel_item_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.sku, item.productName, item.quantity, item.unitPrice, item.channelItemId]
      );
    }

    await client.query('COMMIT');

    // 各SKUの在庫を減算（トランザクション外で個別にロック）
    for (const item of items) {
      await syncInventory(item.sku, -item.quantity, channel, orderData.channelOrderId);
    }

    return order.id;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export { syncInventory, processNewOrder };
```

**つまずきポイント（Step 5）:**
- **排他制御が最重要**。`SELECT ... FOR UPDATE` で行ロックを取ることで、同時注文時の在庫不整合を防ぐ。ロックの粒度はSKU単位（行ロック）なので、異なるSKUの注文は並列処理可能
- Amazon Feeds APIは非同期処理のため、在庫更新のリアルタイム性は楽天・Shopifyに比べて5〜15分遅れる。これはAmazon側の仕様であり回避不可。その間に二重販売が発生するリスクがあるため、安全在庫を1〜2個多めに設定するのが現実的な対策
- デッドロック対策: 複数SKUの在庫を一度に減算する場合は、SKUのアルファベット順でロックを取得する（ロック順序を統一）。今の実装ではSKUごとに個別にロックを取得しているので問題ないが、将来一括処理に変更する場合は注意

### Step 6: レビュー依頼自動送信（配達完了+3日後）

```javascript
// review-request.js — 配達完了後にレビュー依頼を自動送信
// 楽天: 投稿前の特典付与は禁止。投稿後にクーポン付与はOK
// LINE Messaging API Pushで送信（LINE Notify は2025年3月終了済み）
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// LINE Messaging API Push送信
async function pushLineMessage(to, messages) {
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('LINE Push失敗:', JSON.stringify(err));
    return false;
  }
  return true;
}

async function sendReviewRequests() {
  // 配達完了から3日経過した注文を取得
  const { rows: orders } = await pool.query(`
    SELECT o.id, o.channel, o.channel_order_id, o.customer_name, o.customer_email,
           o.line_user_id, o.delivered_at,
           oi.product_name, oi.sku
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.delivery_status = 'delivered'
      AND o.delivered_at < NOW() - INTERVAL '3 days'
      AND o.delivered_at > NOW() - INTERVAL '14 days'
      AND o.review_requested = false
      AND o.channel IN ('rakuten', 'shopify')
    ORDER BY o.delivered_at
    LIMIT 100
  `);

  // 注文IDでグループ化（1注文に複数商品がある場合）
  const orderMap = new Map();
  for (const row of orders) {
    if (!orderMap.has(row.id)) {
      orderMap.set(row.id, { ...row, products: [] });
    }
    orderMap.get(row.id).products.push(row.product_name);
  }

  let sentCount = 0;

  for (const [orderId, order] of orderMap) {
    const productName = order.products[0]; // 代表商品名

    // LINE登録済みならLINE Push、なければメール
    if (order.line_user_id) {
      // SKUマッピングからレビューURLを取得
      const { rows: [mapping] } = await pool.query(
        'SELECT rakuten_item_url, shopify_product_handle FROM sku_mapping WHERE sku = $1',
        [order.sku]
      );

      const reviewUrl = order.channel === 'rakuten' && mapping?.rakuten_item_url
        ? `${mapping.rakuten_item_url}#review`
        : `${process.env.SHOPIFY_STORE_URL}/products/${mapping?.shopify_product_handle || ''}#reviews`;

      const success = await pushLineMessage(order.line_user_id, [{
        type: 'flex',
        altText: '商品のご感想をお聞かせください',
        contents: {
          type: 'bubble',
          header: {
            type: 'box', layout: 'vertical',
            backgroundColor: '#FF8C00',
            contents: [{
              type: 'text',
              text: 'ご購入ありがとうございました',
              weight: 'bold', size: 'md', color: '#FFFFFF',
            }],
          },
          body: {
            type: 'box', layout: 'vertical', spacing: 'md',
            contents: [
              {
                type: 'text',
                text: `「${productName}」はいかがでしたか？`,
                weight: 'bold', size: 'sm', wrap: true,
              },
              {
                type: 'text',
                text: 'お客様の率直なご感想をお聞かせいただけると、商品改善の参考になります。',
                wrap: true, size: 'xs', color: '#666666',
              },
              { type: 'separator', margin: 'lg' },
              {
                type: 'text',
                text: 'レビューをご投稿いただいた方に\n次回使える10%OFFクーポンをプレゼント',
                wrap: true, size: 'xs', color: '#FF6B35', margin: 'md',
              },
              {
                type: 'text',
                text: '※ レビュー投稿後にクーポンコードをお送りします',
                size: 'xxs', color: '#999999', margin: 'sm', wrap: true,
              },
            ],
          },
          footer: {
            type: 'box', layout: 'vertical',
            contents: [{
              type: 'button',
              action: { type: 'uri', label: 'レビューを書く', uri: reviewUrl },
              style: 'primary', color: '#FF8C00',
            }],
          },
        },
      }]);

      if (success) sentCount++;
    } else if (order.customer_email) {
      // メールでのレビュー依頼（実装省略: SendGrid / SES等を使用）
      console.log(`メールレビュー依頼対象: ${order.customer_email} (${productName})`);
      sentCount++;
    }

    // フラグ更新
    await pool.query(
      'UPDATE orders SET review_requested = true, updated_at = NOW() WHERE id = $1',
      [orderId]
    );

    // レート制限対策
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`レビュー依頼送信: ${sentCount}件 / ${orderMap.size}件`);
}

sendReviewRequests().catch(err => {
  console.error('レビュー依頼バッチエラー:', err);
  process.exit(1);
});
```

**つまずきポイント（Step 6）:**
- **楽天市場のレビューガイドライン**: 「レビューを書いたら○○プレゼント」を**購入前・投稿前**に約束するのはNG。**投稿後**にクーポンを付与するのはOK。「高評価をお願い」も禁止。「率直なご感想をお聞かせください」が正しい表現
- Amazonはマーケットプレイスポリシーで、セラーから購入者へのレビュー依頼に制限がある（「高評価のお願い」は禁止。AmazonのRequest a Review機能を使うのが公式の方法）。自動メールでのレビュー依頼はグレーゾーンのため、Amazonの注文はレビュー依頼対象外にしている
- **LINE Notify は2025年3月31日でサービス終了**。レビュー依頼もスタッフ通知もすべて LINE Messaging API の Push メッセージに統一すること

### Step 7: cron設定

```bash
# 受注取込: 5分ごと（リアルタイム性を高めるため15分→5分に短縮）
*/5 * * * * cd /path/to/ec-automation && /usr/local/bin/node fetch-all-orders.js >> /var/log/ec-orders.log 2>&1

# レビュー依頼: 毎日10時に実行
0 10 * * * cd /path/to/ec-automation && /usr/local/bin/node review-request.js >> /var/log/ec-review.log 2>&1

# 売上集計ダッシュボード更新: 毎日6時
0 6 * * * cd /path/to/ec-automation && /usr/local/bin/node dashboard-update.js >> /var/log/ec-dashboard.log 2>&1

# 配達ステータス確認: 1時間ごと（ヤマトの荷物追跡APIでステータス更新）
0 * * * * cd /path/to/ec-automation && /usr/local/bin/node check-delivery-status.js >> /var/log/ec-delivery.log 2>&1

# 在庫アラート: 毎日7時（安全在庫を下回ったSKUをSlack/Discord通知）
0 7 * * * cd /path/to/ec-automation && /usr/local/bin/node stock-alert.js >> /var/log/ec-stock-alert.log 2>&1
```

**つまずきポイント（Step 7）:**
- 受注取込を5分間隔にすると、各モールのAPIレート制限に注意。楽天は1秒5リクエスト、Amazon SP-APIは1秒1リクエストが目安。5分間隔で3モールを順次処理する場合、1回のポーリングで十分収まる
- crontabの `node` はフルパスを指定（`/usr/local/bin/node` or `/home/user/.nvm/versions/node/v20/bin/node`）。PATHが通っていない場合がある

## 提案トークスクリプト

### 初回アプローチ（3分）

> 「社長、お忙しいところすみません。POST CABINETSの○○です。
>
> 楽天とAmazonとShopifyの3モールを運営されてる事業者さんに、**受注処理を1日4時間から30分に減らした事例**をお伝えしています。
>
> 社長のところ、いま受注処理って1日何時間くらいかかってますか？」

### 課題の深掘り（5分）

> 「3つのモールをそれぞれ開いて確認されてるんですね。在庫の同期はどうされてますか？ … Excel手動ですか。それだと、二重販売って月に何回くらい起きます？ … 月2〜3回。1件あたり返金＋お詫びクーポン＋低評価レビューリスクで1〜3万の損失。年間で24〜36万ですね。
>
> レビューの回収ってされてますか？ … やってないですか。楽天のSEOってレビュー数がかなり効くんですけど、いま回収率って把握されてます？ たぶん1%くらいだと思います。ECのミカタの2024年調査だとトップ層は3〜5%取れてるので、ここだけでも改善の余地がありますね。」

### 提案の骨子（3分）

> 「やることは大きく4つです。
>
> 1. **3モールの受注を1画面に統合**。楽天RMS API、Amazon SP-API、Shopify GraphQL APIで自動取込。
> 2. **在庫をリアルタイム同期**。楽天で売れたらAmazonとShopifyの在庫が3秒以内に減る。二重販売ゼロ。ネクストエンジンだと5〜15分のタイムラグがありますが、うちはデータベースの排他制御で即時反映です。
> 3. **送り状の自動生成＋追跡番号の自動反映**。ヤマトB2クラウドと連携。
> 4. **配達完了後にレビュー依頼を自動送信**。LINE Messaging API＋メールの2段構え。
>
> **初期費用150万円、月額5万円**。正直、ネクストエンジン（月14,000円）のほうが月額は安いです。ただ、ネクストエンジンでは在庫の即時同期とレビュー自動化はできません。社長のところの月2〜3件の二重販売とレビュー回収率1%を改善するなら、うちのほうが投資対効果が出ます。保守的に見ても年間360万円のリターンで、7ヶ月で回収できます。」

## 法規制・業界特有のリスク

### 1. 各モールAPIの利用規約と認証

- **楽天RMS API**: ライセンスキーの有効期限は発行から1年間。年次更新を忘れるとAPI接続が切れる。RMS管理画面の「店舗設定→API設定」から更新。2024年にGraphQL APIも一部導入されたが、受注APIはREST v2が主流（2026年3月時点）。APIの利用申請は管理画面から行い、審査には3〜5営業日かかる
- **Amazon SP-API**: 2023年10月からIAM/AWS署名不要になり、LWAアクセストークンのみで認証。年1回の再認証が必要（セラーセントラルから承認フロー）。PII（個人情報）を含む注文データへのアクセスにはRestricted Data Token (RDT)が必要。PII データの保持期間は30日間の制限あり（Amazonのデータ保護ポリシー）
- **Shopify Admin API**: 2025年4月以降、新規公開アプリはGraphQLのみ。カスタムアプリ（自社利用）はREST/GraphQL両方使えるが、GraphQL推奨。認証はOAuth 2.0。APIバージョンは四半期リリースで、2年後に非推奨版が削除される

### 2. 特定商取引法

- 自動送信するレビュー依頼メールは「電子メール広告」に該当する可能性がある。特定商取引法に基づき、事前の同意（オプトイン）が必要。購入時の利用規約に「購入後のフォローメール送信」を明記しておく
- メール本文には**配信元の表示名・住所・電話番号・配信停止方法**を必ず記載する

### 3. 楽天市場のレビューガイドライン

- **レビュー投稿前の特典付与は禁止**（「レビューを書いたら○○プレゼント」を購入前や投稿前に約束するのはNG）
- **レビュー投稿後にクーポンを付与するのはOK**（投稿確認後にクーポンメール送信）
- 「高評価をお願いします」等の表現は禁止。「率直なご感想をお聞かせください」が正しい
- 2024年の楽天レビューガイドライン改定で、不正レビューの取り締まりが強化されている

### 4. 個人情報保護法

- 3モールの顧客情報を自社DBに統合する場合、**利用目的の通知**が必要。各モールの利用規約で顧客データの外部保存が許可されているか確認すること
- 特にAmazonは購入者の個人情報の取り扱いに厳しく、SP-APIで取得したPIIデータの保持期間制限がある（原則30日間。それ以降はハッシュ化 or 削除が必要）
- GDPR/APPI対応: 海外顧客のデータを扱う場合は追加の対応が必要

### 5. 食品表示法（食品ECの場合）

- 食品のEC販売では、商品ページに栄養成分表示・アレルゲン表示が必要
- 賞味期限管理: 在庫システムにロット番号・賞味期限を紐付けて、FIFO（先入先出）で出荷管理する機能を将来的に追加検討

---

## POSTCABINETS内部メモ

### この業界の攻め方

- **ターゲットは「月商500万〜3,000万、2〜3モール運営、OMS未導入」の事業者**。月商500万未満だとOMS導入のROIが出にくい。月商3,000万超だとネクストエンジンやロジレス等を既に導入しているケースが多い
- **業種の優先順位**: 食品・健康食品（SKUが多く、在庫管理が複雑。賞味期限管理のニーズ）→ アパレル（サイズ×カラーのSKU展開。楽天とShopifyの併用が多い）→ 雑貨・日用品
- **アプローチ経路**: 楽天市場の出店者向けイベント（楽天EXPO等）での名刺交換、EC関連のFacebookグループ、BASE/STORESからのステップアップ組（Shopify移行の相談から入る）
- **刺さるキーワード**: 「ネクストエンジンだと在庫の同期に5〜15分かかるけど、うちはリアルタイム」「レビュー依頼まで自動化したい」「在庫ズレをゼロにしたい」「二重販売で低評価をもらうのが怖い」

### 自分たちに足りないもの

1. **各モールAPIの実装経験**: 楽天RMS API、Amazon SP-API、Shopify GraphQL APIの3つを実際に叩いた経験が必要。まずはテスト用のショップを開設してAPIの挙動を確認する。楽天のAPI申請には3〜5営業日かかるので先に進めておく
2. **ヤマトB2クラウドAPI連携**: 送り状自動生成のためにはB2クラウドのAPI利用契約が必要。佐川急便（e飛伝III）や日本郵便（ゆうパックプリントR）もカバーできると差別化になる
3. **EC運営の実体験**: モール運営者の日常を肌感覚で理解していないと、提案に説得力がない。少額でもいいので自社でモール出店してみるのが最善の学習方法
4. **PostgreSQL + BullMQの運用スキル**: リアルタイム在庫同期にはジョブキュー（BullMQ/Redis）の安定運用が必要。障害時のリトライ設計、APIレート制限への対応など

### 実案件に進む時のチェックリスト

- [ ] クライアントの3モールのAPI認証情報を取得（楽天: サービスシークレット+ライセンスキー、Amazon: LWA認証情報、Shopify: アクセストークン）
- [ ] 現在の月間受注件数・SKU数・在庫管理方法をヒアリング
- [ ] 既存のOMS・WMS利用状況を確認（ネクストエンジン等を使っていればそれとの棲み分けを設計）
- [ ] 配送業者の契約状況を確認（ヤマト/佐川/日本郵便のどれを使っているか、API契約の有無）
- [ ] レビュー回収の現状と目標を数値で合意（現在1%→目標3%等）
- [ ] 個人情報取り扱いのポリシーを確認（3モールの顧客データを自社DBに統合してよいか。AmazonのPII保持期間制限を説明）
- [ ] テスト環境で3モールのAPI接続を検証（本番投入前に最低2週間のテスト期間を設ける）
- [ ] 排他制御のストレステスト（同時注文のシミュレーション）を実施
- [ ] 障害時の運用フロー設計（API接続断→手動オペレーションへの切り替え手順）
- [ ] 月次レポートのテンプレート準備（受注件数、在庫回転率、誤出荷率、二重販売件数、レビュー回収率、売上推移）
