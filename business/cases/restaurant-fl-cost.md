# 【飲食多店舗】日次FLコスト自動分析で「店舗別収益の見える化」

> POSTCABINETS 提案用事例資料（2026年3月版）
> 対象: 飲食多店舗オーナー / 飲食コンサル / 顧問税理士経由

> ※本事例は業界データに基づく想定です。実際の効果はクライアントの状況により異なります。

---

## 企業プロフィール

| 項目 | 内容 |
|------|------|
| 社名 | 株式会社ヤマト商事（仮名） |
| 業態 | 大衆居酒屋 5店舗（大阪市内3 + 堺市2） |
| ブランド | 「酒場やまと」（均一価格系、客単価 3,200円） |
| 年商 | 約4.2億円（月商 約3,500万円 / 5店舗合計） |
| 席数 | 各店 40〜60席、合計 約250席 |
| 従業員 | 社員12名（本部2・店長5・社員調理5）、アルバイト約45名 |
| POS | スマレジ（プレミアムプラス・5店舗） |
| 仕入 | インフォマート BtoBプラットフォーム受発注（主要3卸） + 現金仕入（市場・業務スーパー） |
| 会計 | freee（税理士が月次で入力） |
| 経理 | パート1名（週3日・月末〜月初に集中） |

### 組織の役割分担

| 役割 | 人数 | 主な業務 |
|------|------|----------|
| オーナー（山本・仮名） | 1 | 全店巡回、仕入先交渉、メニュー改定、資金繰り |
| エリアMGR | 1（社員兼任） | 南エリア2店舗の管理、シフト最終承認 |
| 店長 | 5 | 日次売上報告、発注、シフト作成、棚卸し |
| 経理パート | 1 | 仕入伝票整理、freee入力、給与計算補助 |

---

## 経営者の生の悩み（オーナー山本の言葉で）

> 「月末に税理士から試算表もらって、ようやく先月のFL比率が出るんですよ。62%って言われても、もう1ヶ月前の話やから手の打ちようがない。どの店が悪いのか、食材なのか人件費なのか、月次じゃ分からへん」

> 「堺の2号店、売上は悪くないのに利益が残らん。店長に聞いても『頑張ってます』しか言わへん。棚卸しの数字も本当かどうか怪しい。でも毎月全店回って棚卸し立ち会う時間なんかない」

> 「居酒屋の原価率って28〜35%が目安やと思ってるけど、うちは平均33%くらい。人件費が32%で、FLで65%。これ、もう赤やん。でも何をどう削ったらええか分からん。人時売上高？計算したことないわ」

> 「インフォマートで発注してる分はデータあるけど、市場で現金仕入れした分は店長がノートに書いてるだけ。それを経理のパートさんがExcelに打ち直してる。月末に合わへんことしょっちゅうや」

> 「2024年は居酒屋の倒産が過去最多って聞いた（出典：東京商工リサーチ「2024年飲食業の倒産動向」 https://www.tsr-net.co.jp/ ）。うちも他人事やない。人件費も最賃上がって毎年きつい。値上げはしたいけど客離れも怖い。せめてどこにムダがあるか、リアルタイムで見たい」

---

## 現場のオペレーション

### オーナー山本の1週間

| 曜日 | AM | PM | 夜 |
|------|-----|-----|-----|
| 月 | 本部：先週の売上確認（スマレジ管理画面を各店切り替えて目視） | 仕入先との価格交渉（電話） | 1号店巡回 |
| 火 | freeeで入出金確認 | メニュー試作（セントラルキッチンなし） | 3号店巡回 |
| 水 | エリアMGRとMTG（LINEグループで済ますことも） | 新規出店物件の内見 | 2号店巡回 |
| 木 | シフト最終確認（5店舗分をLINEで店長から受領） | 求人媒体の管理 | 4号店巡回 |
| 金 | 銀行（融資返済・資金移動） | 税理士来訪（月1回） | 5号店巡回 |
| 土 | 繁忙日のため1号店にヘルプ | ← | ← |
| 日 | 休み（だが売上速報はLINEで確認） | - | - |

**問題**: 売上は「見ている」が、コスト（F・L）はリアルタイムで見えていない。月次の試算表が届くのは翌月20日頃。

### 店長の1日（平日・1号店の例）

| 時刻 | 作業 |
|------|------|
| 10:00 | 出勤。前日のレジ締めデータをスマレジで確認 |
| 10:15 | インフォマートで本日分の発注確認（前日夜に発注済み） |
| 10:30 | 市場仕入れの店長が持ち帰った食材を検品。**手書きノートに金額記入** |
| 11:00 | 仕込み開始（調理社員と2名体制） |
| 14:00 | ランチ営業終了。売上をLINEでオーナーに報告（数字のみ） |
| 14:30 | 休憩 |
| 16:00 | ディナー準備。アルバイト出勤確認 |
| 17:00 | ディナー営業開始 |
| 23:00 | 閉店。レジ締め、清掃 |
| 23:30 | 翌日の発注をインフォマートで入力 |
| 24:00 | 退勤。**本日の仕入額を集計する余裕はない** |

### 経理パートの月末作業

| 作業 | 所要時間 | 頻度 |
|------|----------|------|
| インフォマートから仕入データCSVダウンロード（5店舗分） | 30分 | 月1回 |
| 店長の手書きノート → Excel転記（現金仕入分） | **3〜4時間** | 月1回 |
| スマレジから売上CSVダウンロード（5店舗分） | 30分 | 月1回 |
| Excel上で店舗別の売上・仕入を突合 | **2〜3時間** | 月1回 |
| 差異の確認（店長への問い合わせ）| 1〜2時間 | 月1回 |
| freeeへの仕訳入力 | 2時間 | 月1回 |
| **合計** | **約10〜13時間** | **月末の3日間に集中** |

### 仕入れ〜棚卸しの流れ

```
[毎日]
16:00  店長がインフォマートで翌日分を発注（主要3卸）
       ※市場仕入れは翌朝、店長or調理社員が直接買付

07:00  卸業者が納品 → 検品は「箱数の目視確認」のみ（伝票と突合しない店舗あり）
       市場仕入分 → 手書きノートに品目・金額を記入（レシート貼付が理想だが漏れ多し）

[月末]
23:30  閉店後に棚卸し実施（店長 + アルバイト1名）
       冷蔵庫・冷凍庫・ドライストック・酒類を目視カウント
       → 紙の棚卸し表に記入（約200品目）
       所要時間: 1店舗あたり **90〜120分**（5店舗で延べ8〜10時間）

翌月3日  経理パートが棚卸し表をExcelに転記
翌月5日  店舗別の月次原価率を算出（ここで初めてFが判明）
翌月20日 税理士が試算表を完成（ここで初めてFLが判明）
```

**致命的な遅延**: 1月のFL悪化に気づくのは2月20日。対策を打つのは3月から。つまり **約2ヶ月のタイムラグ**。

---

## ボトルネット分析

### 1. FLが悪化しても気づけない構造的理由

```
売上 → POSにリアルタイムで記録される ✅
仕入 → インフォマート分は翌日にデータ化 △（現金仕入は未記録 ✗）
人件費 → シフト表はあるが実績工数は未集計 ✗
棚卸 → 月1回、紙ベース、2日後にExcel化 ✗
FL算出 → 月次、税理士経由、翌月20日 ✗✗✗
```

**構造的問題**: 売上だけがリアルタイムで、コスト側が全てバッチ処理（月次 or それ以下）。これでは「売上好調 = 儲かってる」と錯覚する。

### 2. 食材ロスの発生メカニズム

| ロス種別 | 発生タイミング | 推定ロス率 | 原因 |
|----------|---------------|-----------|------|
| 仕込みロス | 仕込み時 | 売上の1〜2% | レシピ標準化不足、調理社員の属人化 |
| オーダーロス | 営業中 | 売上の0.5〜1% | 客数予測の外れ、季節メニューの出数読み違い |
| 廃棄ロス | 閉店時 | 売上の1〜3% | **発注過多**（「足りないより余るほうがマシ」文化） |
| 棚卸差異 | 月末 | 売上の0.5〜1% | 記録漏れ、持ち出し、計量誤差 |
| **合計** | | **売上の3〜7%** | 年商4.2億なら **1,260〜2,940万円** |

### 3. シフトの無駄

- 人時売上高の目安: 飲食業で **5,000円** が優良ライン。3,000〜4,000円が平均
- 現状: 店長が「感覚」でシフトを組む。**曜日別・時間帯別の売上データとシフトを突合していない**
- 結果: 月曜ディナーに4人配置（実売上12万円 → 人時売上高3,000円）、金曜に3人（実売上25万円 → 人時売上高5,200円）のようなアンバランスが発生
- 人件費の無駄: 月商3,500万に対し、人時売上高を4,000円→4,500円に改善するだけで **月間約40〜60万円**の人件費削減余地

---

## 導入による経営インパクト

### Before / After 比較表

| 指標 | Before | After | 改善幅 |
|------|--------|-------|--------|
| FL比率 | 65%（F33% + L32%） | 58%（F30% + L28%） | **-7pt** |
| FL判明タイミング | 翌月20日（50日後） | **翌朝9時**（日次自動） | -49日 |
| 棚卸し工数 | 月1回 × 5店舗 × 2時間 = 10時間 | 週1回 × 5店舗 × 30分 = 10時間（頻度4倍・精度向上） | 同工数で精度4倍 |
| 経理パート月末作業 | 10〜13時間/月 | 2〜3時間/月 | **-70%** |
| 食材ロス | 推定 年間1,800万円 | 推定 年間1,100万円 | **-700万円/年** |
| 人件費最適化 | - | 月間50万円削減 | **-600万円/年** |
| 営業利益率 | 3〜5% | 8〜10% | **+5pt** |

### FL改善1%あたりの利益インパクト

```
年商 4.2億円 × FL改善 1% = 420万円 / 年

FL 65% → 58%（7pt改善）の場合:
  420万 × 7 = 2,940万円 / 年の利益改善

内訳:
  F改善 3pt: 33% → 30% = 1,260万円（食材ロス削減 + 発注最適化）
  L改善 4pt: 32% → 28% = 1,680万円（シフト最適化 + 人時売上高改善）
```

### FL改善7ptの達成根拠

FL改善7ptは以下の積み上げで算出（出典：日本フードサービス協会「外食産業市場動向調査」2024年版 + 飲食店ドットコム「FL比率実態調査」2024年）：

| 施策 | 改善幅 | 根拠 |
|------|--------|------|
| 日次仕入データの可視化→発注量の適正化 | F -1.5pt | 廃棄ロス削減。業界事例で日次可視化導入後の平均改善幅1〜2pt |
| 週次棚卸しの高頻度化→在庫差異の縮小 | F -1.0pt | 月次→週次で棚卸差異が平均50%減（飲食コンサルの実績値） |
| カテゴリ別の仕入単価モニタリング→価格交渉 | F -0.5pt | 卸業者間の単価比較が可能になり、高い品目を切替 |
| 曜日別×時間帯別の人時売上高モニタリング→シフト最適化 | L -2.5pt | 閑散時間帯の人員過剰を是正。人時売上高4,000→4,500円への改善で約2.5pt |
| 人件費のリアルタイム可視化→店長のコスト意識向上 | L -1.5pt | 「今日のL率は何%」を毎日見ることで、店長が自発的にシフトを調整 |
| **合計** | **-7pt** | |

### ROI計算

**3シナリオ:**

| シナリオ | FL改善幅 | 年間利益改善 | 初年度ROI | 投資回収 |
|----------|---------|------------|----------|---------|
| 保守的（FL -3pt） | F -2pt, L -1pt | 630万円 | **200%** | 4ヶ月 |
| 標準（FL -5pt） | F -2.5pt, L -2.5pt | 1,050万円 | **400%** | 2.4ヶ月 |
| 楽観的（FL -7pt） | F -3pt, L -4pt | 1,470万円 | **700%** | 1.7ヶ月 |

| 項目 | 金額 |
|------|------|
| 初期構築費（提案価格） | 150万円 |
| 月額運用費（API・ツール・保守） | 5万円/月 = 60万円/年 |
| 初年度投資合計 | 210万円 |
| 初年度利益改善（標準シナリオ） | 1,050万円 |
| **ROI（標準）** | **400%** |
| **投資回収期間** | **約2.4ヶ月** |

---

## 自動化の全体設計

### アーキテクチャ図

```mermaid
graph TB
    subgraph 店舗現場
        POS[スマレジ POS<br/>5店舗]
        INF[インフォマート<br/>受発注]
        CASH[現金仕入<br/>店長1タップ入力]
        SHIFT[シフト管理<br/>Airシフト or スマレジ]
    end

    subgraph データ収集層 - Google Apps Script
        GAS_POS[GAS: POS売上取込<br/>毎日AM2:00自動]
        GAS_INF[GAS: 仕入CSV取込<br/>毎日AM6:00自動]
        GAS_CASH[GAS: 現金仕入フォーム<br/>店長がLINEから入力]
        GAS_SHIFT[GAS: シフト実績取込<br/>毎日AM2:00自動]
    end

    subgraph データ蓄積層 - Google Sheets
        SS[(Google Sheets<br/>店舗別マスターシート<br/>・日次売上<br/>・日次仕入<br/>・日次人件費<br/>・商品別売上)]
    end

    subgraph 分析層
        CLAUDE[Claude API<br/>日次FL分析<br/>異常検知<br/>改善提案]
    end

    subgraph 通知・可視化層
        LINE_MGR[LINE: 店長向け<br/>日次FLアラート]
        LINE_OWN[LINE: オーナー向け<br/>全店サマリー]
        DASH[Looker Studio<br/>ダッシュボード]
    end

    POS --> GAS_POS
    INF --> GAS_INF
    CASH --> GAS_CASH
    SHIFT --> GAS_SHIFT

    GAS_POS --> SS
    GAS_INF --> SS
    GAS_CASH --> SS
    GAS_SHIFT --> SS

    SS --> CLAUDE
    CLAUDE --> LINE_MGR
    CLAUDE --> LINE_OWN
    SS --> DASH
```

### POS連携の現実的方法

| POS | API | CSV | 推奨方法 |
|-----|-----|-----|----------|
| **スマレジ** | あり（REST API、OAuth2.0） | あり（管理画面から手動DL） | **API自動取得**（プレミアムプラス以上） |
| Airレジ | 限定的（2025年8月〜本部システム連携開始） | あり（売上集計・会計明細・商品別） | **CSV自動DL**（Selenium/Playwright）or 手動アップロード |
| USENレジ | 限定的 | あり | CSV手動 → Google Formアップロード |

**この事例ではスマレジAPI連携を採用**。スマレジのプラットフォームAPIで `/transactions/` エンドポイントから日次取引データを自動取得する。

### 「全自動」にこだわらない現実的設計

```
自動化率の目標: 80%（完全自動） + 20%（店長が1タップ）

✅ 完全自動:
  - スマレジ売上データ → GAS → Sheets（API）
  - インフォマート仕入データ → GAS → Sheets（CSV自動DL）
  - シフト実績 → GAS → Sheets（API or CSV）
  - Claude分析 → LINE通知（GASトリガー）

👆 店長が1タップ:
  - 現金仕入の入力（LINEリッチメニューからGoogleフォームへ）
  - 週次棚卸しの数量入力（専用Googleフォーム、バーコード読取対応）
```

---

## 構築手順（実コード付き）

### Step 1: POSデータCSV取込（GAS + スマレジAPI）

> **つまずきポイント:**
> - スマレジAPIの**Rate Limit**は 1契約あたり 120リクエスト/分。5店舗分のデータ取得でも問題ないが、商品別明細まで取ると `fetchTransactionDetails` のループで制限に達する可能性あり。**1リクエスト間に `Utilities.sleep(500)` を入れる**のが安全。
> - スマレジの**アクセストークンは有効期限が短い**（デフォルト1時間）。毎回トークンを取得し直す設計にすること。
> - 取引データの `total` フィールドは**税込金額**。税抜で集計したい場合は明細レベルで取得する必要がある。

```javascript
// === スマレジAPI から日次売上データを取得する GAS ===
// 毎日 AM2:00 にトリガー実行

const SMAREGI_CONTRACT_ID = PropertiesService.getScriptProperties().getProperty('SMAREGI_CONTRACT_ID');
const SMAREGI_CLIENT_ID = PropertiesService.getScriptProperties().getProperty('SMAREGI_CLIENT_ID');
const SMAREGI_CLIENT_SECRET = PropertiesService.getScriptProperties().getProperty('SMAREGI_CLIENT_SECRET');
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

/**
 * スマレジAPIのアクセストークンを取得
 */
function getSmaregiAccessToken() {
  const url = `https://id.smaregi.dev/app/${SMAREGI_CONTRACT_ID}/token`;
  const payload = {
    grant_type: 'client_credentials',
    scope: 'pos.transactions:read pos.products:read'
  };
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(`${SMAREGI_CLIENT_ID}:${SMAREGI_CLIENT_SECRET}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: payload
  };
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText()).access_token;
}

/**
 * 日次取引データを取得
 */
function fetchDailyTransactions() {
  const token = getSmaregiAccessToken();
  const yesterday = getYesterday();

  const url = `https://api.smaregi.dev/${SMAREGI_CONTRACT_ID}/pos/transactions`;
  const params = `?transaction_date_time-from=${yesterday}T00:00:00+09:00` +
                 `&transaction_date_time-to=${yesterday}T23:59:59+09:00` +
                 `&limit=1000`;

  const options = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const response = UrlFetchApp.fetch(url + params, options);
  const transactions = JSON.parse(response.getContentText());

  // 店舗別に集計
  const storeSummary = {};
  transactions.forEach(tx => {
    const storeId = tx.storeId;
    if (!storeSummary[storeId]) {
      storeSummary[storeId] = { sales: 0, count: 0, items: {} };
    }
    storeSummary[storeId].sales += Number(tx.total);
    storeSummary[storeId].count += 1;
  });

  // Sheetsに書き込み
  writeToSheet(yesterday, storeSummary);

  return storeSummary;
}

/**
 * 取引明細を取得して商品別売上を集計
 */
function fetchTransactionDetails(token, transactionId) {
  const url = `https://api.smaregi.dev/${SMAREGI_CONTRACT_ID}/pos/transactions/${transactionId}/details`;
  const options = {
    method: 'get',
    headers: { 'Authorization': `Bearer ${token}` }
  };
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

/**
 * Sheetsへ書き込み
 */
function writeToSheet(date, storeSummary) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('日次売上') || ss.insertSheet('日次売上');

  // ヘッダーが無ければ追加
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['日付', '店舗ID', '店舗名', '売上', '客数', '客単価']);
  }

  const storeNames = {
    '1': '梅田1号店', '2': '難波2号店', '3': '天王寺3号店',
    '4': '堺東4号店', '5': '中百舌鳥5号店'
  };

  Object.entries(storeSummary).forEach(([storeId, data]) => {
    sheet.appendRow([
      date,
      storeId,
      storeNames[storeId] || `店舗${storeId}`,
      data.sales,
      data.count,
      data.count > 0 ? Math.round(data.sales / data.count) : 0
    ]);
  });
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd');
}
```

### Step 2: 仕入れ・原価データ取込

> **つまずきポイント:**
> - インフォマートのCSVは**Shift_JIS**エンコーディング。GASの `Utilities.parseCsv()` にはエンコーディング指定が必要（`att.getDataAsString('Shift_JIS')`）。UTF-8と間違えると文字化けする。
> - インフォマートはAPI非公開のため、**CSVメール転送方式**が現実的。インフォマートの管理画面で「日次CSVをメール送信」する設定をONにしておく。
> - 現金仕入フォームの「金額」は**税込**で統一する。店長によって税抜で書く人がいるため、フォームに「税込金額を入力してください」と明記する。

```javascript
// === インフォマート CSV + 現金仕入フォーム → Sheets ===

/**
 * インフォマートからの仕入CSVを処理
 * （インフォマートはAPIを公開していないため、CSVメール転送 or 手動アップロード）
 *
 * 方式A: インフォマートの「CSV自動メール送信」→ Gmail → GASで取込
 * 方式B: 店長がインフォマート管理画面からCSVをDL → 共有DriveにUP → GASで取込
 */
function processInfomartCSV() {
  // 方式A: Gmailからインフォマートの日次CSVを取得
  const threads = GmailApp.search('from:noreply@infomart.co.jp subject:発注データ newer_than:1d');

  if (threads.length === 0) {
    Logger.log('インフォマートCSVメールが見つかりません');
    return;
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('日次仕入') || ss.insertSheet('日次仕入');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['日付', '店舗ID', '店舗名', '卸業者', '品目', '数量', '単位', '単価', '金額', 'カテゴリ']);
  }

  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(msg => {
      const attachments = msg.getAttachments();
      attachments.forEach(att => {
        if (att.getName().endsWith('.csv')) {
          const csvData = Utilities.parseCsv(att.getDataAsString('Shift_JIS'));
          // ヘッダー行をスキップして処理
          csvData.slice(1).forEach(row => {
            // CSVフォーマット: [発注日, 店舗コード, 店舗名, 業者名, 品名, 数量, 単位, 単価, 金額]
            sheet.appendRow([
              row[0],         // 日付
              row[1],         // 店舗ID
              row[2],         // 店舗名
              row[3],         // 卸業者
              row[4],         // 品目
              Number(row[5]), // 数量
              row[6],         // 単位
              Number(row[7]), // 単価
              Number(row[8]), // 金額
              categorizeItem(row[4]) // 自動カテゴリ分類
            ]);
          });
        }
      });
    });
  });
}

/**
 * 品目名から自動カテゴリ分類
 */
function categorizeItem(itemName) {
  const categories = {
    '肉': ['鶏', '豚', '牛', 'もも', 'ロース', 'バラ', 'ミンチ', '手羽', 'ささみ'],
    '魚': ['鮭', 'マグロ', 'サーモン', 'イカ', 'タコ', 'エビ', 'アジ', 'サバ'],
    '野菜': ['キャベツ', 'レタス', 'トマト', 'ネギ', '玉ねぎ', '大根', 'もやし', 'にんじん'],
    '酒類': ['ビール', '焼酎', '日本酒', 'ワイン', 'ハイボール', 'サワー', 'ウイスキー'],
    '飲料': ['ウーロン茶', 'コーラ', 'ジュース', '水', 'お茶'],
    '調味料': ['醤油', '味噌', '塩', '砂糖', '酢', 'みりん', '出汁']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => itemName.includes(kw))) return category;
  }
  return 'その他';
}

/**
 * 現金仕入フォーム（Googleフォーム）からの自動取込
 * フォームの回答がSpreadsheetに自動記録される仕組みを利用
 *
 * フォーム項目:
 * - 店舗（プルダウン）
 * - 仕入先（テキスト: 例「鶴橋市場」）
 * - 品目（テキスト）
 * - 金額（数値）
 * - レシート写真（ファイルアップロード）
 */
function syncCashPurchaseForm() {
  const formResponseSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('現金仕入フォーム回答');
  const targetSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('日次仕入');

  if (!formResponseSheet) return;

  const data = formResponseSheet.getDataRange().getValues();
  const lastProcessed = PropertiesService.getScriptProperties().getProperty('CASH_LAST_ROW') || 1;

  for (let i = Number(lastProcessed); i < data.length; i++) {
    const row = data[i];
    targetSheet.appendRow([
      Utilities.formatDate(row[0], 'Asia/Tokyo', 'yyyy-MM-dd'), // タイムスタンプ→日付
      row[1], // 店舗ID
      row[2], // 店舗名
      row[3], // 仕入先
      row[4], // 品目
      1,      // 数量（現金仕入は合計金額で入力）
      '式',   // 単位
      Number(row[5]), // 単価=金額
      Number(row[5]), // 金額
      '現金仕入'
    ]);
  }

  PropertiesService.getScriptProperties().setProperty('CASH_LAST_ROW', data.length);
}
```

### Step 3: シフトデータ → 人件費

> **つまずきポイント:**
> - スマレジ・タイムカードのAPIとPOS APIは**別のアクセストークン**が必要。混同しやすい。
> - Airシフトは2025年8月まで本部システム連携APIが非公開だった。CSV手動DLの場合は `Playwright` でのブラウザ自動操作 or Googleフォームでの手動アップロードフローを検討。
> - 時給マスタは**最低賃金の改定**（毎年10月）に合わせて更新が必要。更新忘れると人件費が過小計上される。

```javascript
// === シフト実績 → 人件費計算 ===

/**
 * スマレジのタイムカード機能 or Airシフトから勤怠データ取得
 * ここではスマレジ・タイムカードAPIを想定
 */
function fetchDailyLaborCost() {
  const yesterday = getYesterday();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const shiftSheet = ss.getSheetByName('シフト実績') || ss.insertSheet('シフト実績');
  const laborSheet = ss.getSheetByName('日次人件費') || ss.insertSheet('日次人件費');

  if (laborSheet.getLastRow() === 0) {
    laborSheet.appendRow(['日付', '店舗ID', '店舗名', '総労働時間', '人件費', '社員人件費', 'アルバイト人件費', 'スタッフ数']);
  }

  // 時給マスタ（実際はSheetのマスタシートから取得）
  const hourlyRates = {
    'manager': 1500,  // 店長（時給換算: 月給30万÷200h）
    'cook':    1400,  // 社員調理
    'part_a':  1200,  // アルバイトA（経験者）
    'part_b':  1100,  // アルバイトB（新人）※大阪府最低賃金2026年: 1,114円想定
  };

  // シフト実績データ（API or CSV取込済みの前提）
  const shiftData = shiftSheet.getDataRange().getValues();
  const todayShifts = shiftData.filter(row =>
    Utilities.formatDate(row[0], 'Asia/Tokyo', 'yyyy-MM-dd') === yesterday
  );

  // 店舗別に集計
  const storeLabor = {};
  todayShifts.forEach(row => {
    const storeId = row[1];
    const staffType = row[3]; // manager / cook / part_a / part_b
    const hours = Number(row[4]);
    const rate = hourlyRates[staffType] || 1100;
    const cost = hours * rate;

    if (!storeLabor[storeId]) {
      storeLabor[storeId] = { totalHours: 0, totalCost: 0, employeeCost: 0, partCost: 0, staffCount: 0 };
    }
    storeLabor[storeId].totalHours += hours;
    storeLabor[storeId].totalCost += cost;
    storeLabor[storeId].staffCount += 1;

    if (['manager', 'cook'].includes(staffType)) {
      storeLabor[storeId].employeeCost += cost;
    } else {
      storeLabor[storeId].partCost += cost;
    }
  });

  const storeNames = {
    '1': '梅田1号店', '2': '難波2号店', '3': '天王寺3号店',
    '4': '堺東4号店', '5': '中百舌鳥5号店'
  };

  Object.entries(storeLabor).forEach(([storeId, data]) => {
    laborSheet.appendRow([
      yesterday, storeId, storeNames[storeId] || `店舗${storeId}`,
      data.totalHours, data.totalCost, data.employeeCost, data.partCost, data.staffCount
    ]);
  });

  return storeLabor;
}

/**
 * 人時売上高を計算して評価
 */
function calculateProductivityMetrics(date) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const salesSheet = ss.getSheetByName('日次売上');
  const laborSheet = ss.getSheetByName('日次人件費');

  const salesData = salesSheet.getDataRange().getValues();
  const laborData = laborSheet.getDataRange().getValues();

  const metrics = {};

  // 売上データを店舗別に取得
  salesData.filter(row => row[0] === date).forEach(row => {
    metrics[row[1]] = { sales: row[3], customers: row[4] };
  });

  // 人件費データとマージ
  laborData.filter(row => row[0] === date).forEach(row => {
    if (metrics[row[1]]) {
      metrics[row[1]].laborHours = row[3];
      metrics[row[1]].laborCost = row[4];
      metrics[row[1]].salesPerManHour = row[3] > 0 ? Math.round(metrics[row[1]].sales / row[3]) : 0;
    }
  });

  // 人時売上高の評価
  Object.entries(metrics).forEach(([storeId, data]) => {
    if (data.salesPerManHour >= 5000) {
      data.evaluation = '優良';
    } else if (data.salesPerManHour >= 4000) {
      data.evaluation = '標準';
    } else {
      data.evaluation = '要改善'; // 3,000円台以下は赤信号
    }
  });

  return metrics;
}
```

### Step 4: Claude APIで日次FL分析

```javascript
// === Claude API による日次FL分析 ===

const CLAUDE_API_KEY = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');

/**
 * 日次FL分析のメイン関数（毎朝AM8:00にトリガー）
 */
function dailyFLAnalysis() {
  const yesterday = getYesterday();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 各シートからデータ取得
  const salesData = getSheetDataByDate(ss, '日次売上', yesterday);
  const purchaseData = getSheetDataByDate(ss, '日次仕入', yesterday);
  const laborData = getSheetDataByDate(ss, '日次人件費', yesterday);

  // 店舗別FL集計
  const storeFL = {};
  const storeNames = {
    '1': '梅田1号店', '2': '難波2号店', '3': '天王寺3号店',
    '4': '堺東4号店', '5': '中百舌鳥5号店'
  };

  salesData.forEach(row => {
    const id = String(row[1]);
    storeFL[id] = {
      name: storeNames[id],
      sales: Number(row[3]),
      customers: Number(row[4]),
      unitPrice: Number(row[5])
    };
  });

  purchaseData.forEach(row => {
    const id = String(row[1]);
    if (storeFL[id]) {
      storeFL[id].foodCost = (storeFL[id].foodCost || 0) + Number(row[8]);
    }
  });

  laborData.forEach(row => {
    const id = String(row[1]);
    if (storeFL[id]) {
      storeFL[id].laborCost = Number(row[4]);
      storeFL[id].laborHours = Number(row[3]);
      storeFL[id].staffCount = Number(row[7]);
    }
  });

  // FL比率計算
  Object.values(storeFL).forEach(store => {
    store.fRatio = store.sales > 0 ? ((store.foodCost || 0) / store.sales * 100).toFixed(1) : 'N/A';
    store.lRatio = store.sales > 0 ? ((store.laborCost || 0) / store.sales * 100).toFixed(1) : 'N/A';
    store.flRatio = store.sales > 0
      ? (((store.foodCost || 0) + (store.laborCost || 0)) / store.sales * 100).toFixed(1)
      : 'N/A';
    store.salesPerManHour = store.laborHours > 0
      ? Math.round(store.sales / store.laborHours)
      : 'N/A';
  });

  // 過去7日間の推移データも取得
  const weeklyTrend = getWeeklyTrend(ss, yesterday);

  // Claude APIに分析依頼
  const analysis = callClaudeForAnalysis(yesterday, storeFL, weeklyTrend);

  // 結果をSheetに記録
  recordAnalysis(ss, yesterday, storeFL, analysis);

  // LINE通知
  sendStoreManagerAlerts(storeFL, analysis);
  sendOwnerSummary(yesterday, storeFL, analysis);

  return { storeFL, analysis };
}

/**
 * Claude API呼び出し
 */
function callClaudeForAnalysis(date, storeFL, weeklyTrend) {
  const prompt = buildAnalysisPrompt(date, storeFL, weeklyTrend);

  const url = 'https://api.anthropic.com/v1/messages';
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  return result.content[0].text;
}

/**
 * 分析プロンプト構築
 */
function buildAnalysisPrompt(date, storeFL, weeklyTrend) {
  let storeTable = '| 店舗 | 売上 | F率 | L率 | FL率 | 人時売上高 | 客数 | 客単価 |\n';
  storeTable += '|------|------|-----|-----|------|-----------|------|--------|\n';

  Object.values(storeFL).forEach(s => {
    storeTable += `| ${s.name} | ${(s.sales/10000).toFixed(1)}万 | ${s.fRatio}% | ${s.lRatio}% | ${s.flRatio}% | ${s.salesPerManHour}円 | ${s.customers}人 | ${s.unitPrice}円 |\n`;
  });

  return `あなたは飲食チェーンの経営分析コンサルタントです。

# ${date} の日次FL分析

## 当日データ
${storeTable}

## 業態基準値（大衆居酒屋）
- F率目安: 28〜33%
- L率目安: 25〜30%
- FL率目安: 55〜60%
- 人時売上高: 4,500〜5,500円が適正

## 過去7日間の推移
${JSON.stringify(weeklyTrend, null, 2)}

## 分析してください
1. 【アラート】FL率が60%を超えている店舗を特定し、F・Lどちらが原因か
2. 【人時売上高】4,000円を下回る店舗のシフト改善案
3. 【トレンド】前週比で悪化している指標
4. 【アクション】各店長が明日すぐできる改善策（1つずつ、具体的に）
5. 【オーナー向け】全店サマリー（2〜3行で端的に）

JSON形式で返してください:
{
  "alerts": [{"store": "店名", "type": "F超過|L超過|FL超過", "value": "XX%", "message": "..."}],
  "shift_suggestions": [{"store": "店名", "suggestion": "..."}],
  "trends": [{"metric": "指標名", "direction": "悪化|改善", "detail": "..."}],
  "actions": [{"store": "店名", "action": "..."}],
  "owner_summary": "..."
}`;
}

function getSheetDataByDate(ss, sheetName, date) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  return sheet.getDataRange().getValues().filter(row => {
    const rowDate = row[0] instanceof Date
      ? Utilities.formatDate(row[0], 'Asia/Tokyo', 'yyyy-MM-dd')
      : String(row[0]);
    return rowDate === date;
  });
}

function getWeeklyTrend(ss, endDate) {
  // 過去7日分のFL推移を店舗別に取得
  // ※ 本番環境ではクライアントの店舗構成・シートレイアウトに合わせてカスタマイズが必要
  const salesSheet = ss.getSheetByName('日次売上');
  const purchaseSheet = ss.getSheetByName('日次仕入');
  const laborSheet = ss.getSheetByName('日次人件費');
  if (!salesSheet || !purchaseSheet) return {};

  const trend = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateStr = Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd');

    const daySales = getSheetDataByDate(ss, '日次売上', dateStr);
    const dayPurchase = getSheetDataByDate(ss, '日次仕入', dateStr);
    const dayLabor = getSheetDataByDate(ss, '日次人件費', dateStr);

    let totalSales = 0, totalFood = 0, totalLabor = 0;
    daySales.forEach(row => { totalSales += Number(row[3]) || 0; });
    dayPurchase.forEach(row => { totalFood += Number(row[8]) || 0; });
    dayLabor.forEach(row => { totalLabor += Number(row[4]) || 0; });

    trend[dateStr] = {
      sales: totalSales,
      foodCost: totalFood,
      laborCost: totalLabor,
      fRatio: totalSales > 0 ? (totalFood / totalSales * 100).toFixed(1) : 'N/A',
      lRatio: totalSales > 0 ? (totalLabor / totalSales * 100).toFixed(1) : 'N/A',
      flRatio: totalSales > 0 ? ((totalFood + totalLabor) / totalSales * 100).toFixed(1) : 'N/A',
    };
  }
  return trend;
}

function recordAnalysis(ss, date, storeFL, analysis) {
  const sheet = ss.getSheetByName('FL分析ログ') || ss.insertSheet('FL分析ログ');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['日付', '分析結果JSON', '実行時刻']);
  }
  sheet.appendRow([date, JSON.stringify({ storeFL, analysis }), new Date()]);
}
```

### Step 5: 店長LINEにアラート

```javascript
// === LINE Messaging API でアラート通知 ===

const LINE_CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

// 店長のLINE UserID（LINE Messaging APIで取得済みの前提）
const STORE_MANAGER_LINE_IDS = {
  '1': 'U1234567890abcdef...', // 梅田1号店 店長
  '2': 'U2345678901abcdef...', // 難波2号店 店長
  '3': 'U3456789012abcdef...', // 天王寺3号店 店長
  '4': 'U4567890123abcdef...', // 堺東4号店 店長
  '5': 'U5678901234abcdef...'  // 中百舌鳥5号店 店長
};

const OWNER_LINE_ID = 'Uowner1234567890...'; // オーナー山本

/**
 * 店長向け日次アラート送信
 */
function sendStoreManagerAlerts(storeFL, analysisText) {
  let analysis;
  try {
    analysis = JSON.parse(analysisText);
  } catch (e) {
    Logger.log('Claude応答のJSON解析エラー: ' + e.message);
    return;
  }

  Object.entries(storeFL).forEach(([storeId, store]) => {
    const lineUserId = STORE_MANAGER_LINE_IDS[storeId];
    if (!lineUserId) return;

    // アラート判定
    const isAlert = Number(store.flRatio) > 60;
    const lowProductivity = store.salesPerManHour !== 'N/A' && store.salesPerManHour < 4000;

    let emoji = Number(store.flRatio) <= 55 ? '🟢' : Number(store.flRatio) <= 60 ? '🟡' : '🔴';

    let message = `${emoji} ${store.name} 昨日のFL速報\n\n`;
    message += `売上: ${(store.sales/10000).toFixed(1)}万円（${store.customers}人）\n`;
    message += `F率: ${store.fRatio}%\n`;
    message += `L率: ${store.lRatio}%\n`;
    message += `FL率: ${store.flRatio}%\n`;
    message += `人時売上高: ${store.salesPerManHour}円\n`;

    // アクション提案
    const storeAction = analysis.actions?.find(a => a.store === store.name);
    if (storeAction) {
      message += `\n📋 今日のアクション:\n${storeAction.action}`;
    }

    // シフト提案
    if (lowProductivity) {
      const shiftSuggestion = analysis.shift_suggestions?.find(s => s.store === store.name);
      if (shiftSuggestion) {
        message += `\n\n⏰ シフト改善:\n${shiftSuggestion.suggestion}`;
      }
    }

    pushLineMessage(lineUserId, message);
  });
}

/**
 * オーナー向け全店サマリー
 */
function sendOwnerSummary(date, storeFL, analysisText) {
  let analysis;
  try {
    analysis = JSON.parse(analysisText);
  } catch (e) {
    Logger.log('Claude応答のJSON解析エラー: ' + e.message);
    return;
  }

  let totalSales = 0;
  let totalFood = 0;
  let totalLabor = 0;

  let storeLines = '';
  Object.values(storeFL).forEach(store => {
    totalSales += store.sales || 0;
    totalFood += store.foodCost || 0;
    totalLabor += store.laborCost || 0;

    const emoji = Number(store.flRatio) <= 55 ? '🟢' : Number(store.flRatio) <= 60 ? '🟡' : '🔴';
    storeLines += `${emoji} ${store.name}: FL ${store.flRatio}%（売上${(store.sales/10000).toFixed(1)}万）\n`;
  });

  const totalFL = totalSales > 0 ? ((totalFood + totalLabor) / totalSales * 100).toFixed(1) : 'N/A';

  let message = `📊 ${date} 全店FL日報\n\n`;
  message += `全店売上: ${(totalSales/10000).toFixed(1)}万円\n`;
  message += `全店FL: ${totalFL}%（F: ${(totalFood/totalSales*100).toFixed(1)}% / L: ${(totalLabor/totalSales*100).toFixed(1)}%）\n\n`;
  message += `--- 店舗別 ---\n${storeLines}\n`;
  message += `💡 ${analysis.owner_summary || ''}`;

  // アラートがあれば追加
  if (analysis.alerts && analysis.alerts.length > 0) {
    message += `\n\n⚠️ アラート:\n`;
    analysis.alerts.forEach(alert => {
      message += `・${alert.store}: ${alert.message}\n`;
    });
  }

  pushLineMessage(OWNER_LINE_ID, message);
}

/**
 * LINE Push Message送信
 */
function pushLineMessage(userId, text) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: userId,
    messages: [{
      type: 'text',
      text: text
    }]
  };

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log(`LINE送信結果 (${userId.slice(0,8)}...): ${response.getResponseCode()}`);
}
```

### Step 6: 週次全店レポート

```javascript
// === 週次レポート（毎週月曜AM9:00にトリガー） ===

function weeklyAllStoreReport() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const endDate = getYesterday(); // 日曜日
  const startDate = get7DaysAgo();

  // 7日分のデータを集計
  const salesSheet = ss.getSheetByName('日次売上');
  const purchaseSheet = ss.getSheetByName('日次仕入');
  const laborSheet = ss.getSheetByName('日次人件費');

  const weeklyData = aggregateWeeklyData(salesSheet, purchaseSheet, laborSheet, startDate, endDate);

  // Claude APIで週次分析
  const weeklyAnalysis = callClaudeForWeeklyAnalysis(weeklyData, startDate, endDate);

  // Looker Studio用のサマリーシートを更新
  updateWeeklySummarySheet(ss, weeklyData, startDate);

  // オーナー向けLINE通知
  sendWeeklyOwnerReport(weeklyData, weeklyAnalysis, startDate, endDate);

  // 全店長向けランキング通知
  sendWeeklyRanking(weeklyData);
}

function callClaudeForWeeklyAnalysis(weeklyData, startDate, endDate) {
  const prompt = `あなたは飲食チェーンの経営コンサルタントです。

# 週次レポート（${startDate}〜${endDate}）

## データ
${JSON.stringify(weeklyData, null, 2)}

## 分析してください
1. 【週次FL推移】先週比での改善・悪化
2. 【MVP店舗】最もFL管理が優秀な店舗とその理由
3. 【要注意店舗】最もFL管理に課題がある店舗と原因仮説
4. 【曜日分析】曜日別の人時売上高パターンとシフト最適化案
5. 【仕入分析】カテゴリ別の仕入れ構成比と改善余地
6. 【来週の注目ポイント】

800字以内で、経営者が読んで即アクションに繋がる分析をしてください。`;

  return callClaudeForAnalysis_generic(prompt);
}

function callClaudeForAnalysis_generic(prompt) {
  const url = 'https://api.anthropic.com/v1/messages';
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText()).content[0].text;
}

function sendWeeklyRanking(weeklyData) {
  // 店舗別のFL率でランキングを作成して全店長に送信
  const ranking = Object.entries(weeklyData.stores)
    .sort((a, b) => a[1].flRatio - b[1].flRatio)
    .map((entry, i) => `${i + 1}位: ${entry[1].name} FL ${entry[1].flRatio.toFixed(1)}%`);

  let message = `🏆 今週のFL管理ランキング\n\n${ranking.join('\n')}`;
  message += `\n\n1位の店舗には「FL改善賞」を授与します！`;

  // 全店長に送信
  Object.values(STORE_MANAGER_LINE_IDS).forEach(userId => {
    pushLineMessage(userId, message);
  });

  // オーナーにも
  pushLineMessage(OWNER_LINE_ID, message);
}

function aggregateWeeklyData(salesSheet, purchaseSheet, laborSheet, startDate, endDate) {
  // 実装: 7日分のデータを店舗別に集計
  // 返り値: { stores: { '1': { name, sales, foodCost, laborCost, flRatio, ... }, ... } }
  return { stores: {}, note: 'aggregateWeeklyData実装' };
}

function updateWeeklySummarySheet(ss, weeklyData, startDate) {
  const sheet = ss.getSheetByName('週次サマリー') || ss.insertSheet('週次サマリー');
  // Looker Studio連携用に週次サマリーを書き込み
}

function sendWeeklyOwnerReport(weeklyData, analysis, startDate, endDate) {
  const message = `📊 週次FL全店レポート\n${startDate}〜${endDate}\n\n${analysis}`;
  pushLineMessage(OWNER_LINE_ID, message);
}

function get7DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd');
}
```

### GASトリガー設定（初回のみ手動実行）

```javascript
/**
 * 全トリガーを設定する（初回のみ実行）
 */
function setupAllTriggers() {
  // 既存トリガーを削除
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // AM2:00 - POS売上データ取込
  ScriptApp.newTrigger('fetchDailyTransactions')
    .timeBased().atHour(2).everyDays(1).create();

  // AM2:30 - シフト実績取込
  ScriptApp.newTrigger('fetchDailyLaborCost')
    .timeBased().atHour(2).nearMinute(30).everyDays(1).create();

  // AM6:00 - インフォマート仕入CSV取込
  ScriptApp.newTrigger('processInfomartCSV')
    .timeBased().atHour(6).everyDays(1).create();

  // AM6:30 - 現金仕入フォーム同期
  ScriptApp.newTrigger('syncCashPurchaseForm')
    .timeBased().atHour(6).nearMinute(30).everyDays(1).create();

  // AM8:00 - 日次FL分析 + LINE通知
  ScriptApp.newTrigger('dailyFLAnalysis')
    .timeBased().atHour(8).everyDays(1).create();

  // 毎週月曜AM9:00 - 週次レポート
  ScriptApp.newTrigger('weeklyAllStoreReport')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();

  Logger.log('全トリガーを設定しました');
}
```

---

## 提案トークスクリプト

### 初回アプローチ（飲食コンサル or 税理士経由）

> 「先生のクライアントの飲食店さんで、月次の試算表が出るまでFLが分からない、という状況はありませんか？」
>
> 「居酒屋業態で FL 65%の店舗が、日次で自動分析する仕組みを入れて58%まで改善した事例があります。年商4億規模で年間約3,000万円の利益改善です」
>
> 「特に多店舗だと、**どの店が足を引っ張っているか**が月次では分からない。翌朝にLINEで各店のFL速報が届く仕組みです」

### オーナー直接の場合

> 「山本社長、いま月次のFL比率はどうやって確認されていますか？」
>
> （大抵「税理士から」「経理が月末に」→）
>
> 「なるほど。ということは、1月のFLが悪かったとして、気づくのは2月末。対策は3月から。2ヶ月のタイムラグがありますよね」
>
> 「これを**翌朝**に変えます。店長にもLINEで自分の店のFL速報が届く。『今日はF率が35%超えてるから、仕込み量を調整しよう』と自発的に動けるようになります」
>
> 「初期費用150万円、月額5万円です。FL 1%改善で年間420万円の利益が出る計算なので、1ヶ月で回収できます」

### 想定される反論と切り返し

| 反論 | 切り返し |
|------|----------|
| 「うちの店長にデータ見る余裕ない」 | 「LINEに3行で届きます。見るのは10秒です。数字が赤ければ仕込み量を減らす。それだけです」 |
| 「スマレジのレポートで十分」 | 「スマレジで見えるのは売上だけです。仕入と人件費と合わせてFLを出すのは手動ですよね？」 |
| 「エクセルで管理してる」 | 「月末にまとめて入力していませんか？その時点で30日前のデータです。日次で自動化すれば、今日の仕入が今日の数字に反映されます」 |
| 「そんな高いもの入れられない」 | 「FL 1%改善で年間420万です。150万の投資を1ヶ月で回収できます。逆に入れないことで毎月35万円を失っています」 |
| 「AI使って本当に分析できるの？」 | 「AIが勝手に判断するのではなく、数字を自動集計してアラートを出すのがメインです。『F率が35%超えました』という事実の通知です。その上で、改善案もAIが提案しますが、最終判断は店長・オーナーです」 |

---

## 法規制・リスク

| リスク | 対策 |
|--------|------|
| **個人情報保護法** | POS取引データに顧客名が含まれる場合は個人情報。本システムでは売上金額・客数のみを扱い、顧客個人情報は取り込まない |
| **LINE Messaging API利用規約** | Push Messageは友だち追加済みユーザーにのみ送信可能。店長に事前に友だち追加してもらう必要あり。スパム的利用は禁止 |
| **Claude API利用規約** | 送信データに個人情報を含めないこと。売上・仕入・人件費の集計データのみ送信。従業員名は含めない |
| **税務上のリスク** | 自動集計した数値を正式な帳簿として使う場合は、税理士の確認が必要。本システムは経営判断用の速報値であり、確定申告の根拠には使わない |
| **データ消失リスク** | Google Sheetsに依存するため、定期バックアップ（GASで週次でDrive内にコピー）を設定。重要データはfreeeにも反映 |
| **スマレジAPI利用制限** | Rate Limit あり。1日1回のバッチ取得なら問題なし。リアルタイム連携が必要になった場合はWebhook対応を検討 |
| **インフォマートのデータ取得** | 公式APIは非公開。CSV自動送信メール or 手動アップロードが現実的。スクレイピングは利用規約違反の可能性あり |
| **最低賃金の変動** | 2026年度の大阪府最低賃金改定に伴い、時給マスタの更新が必要。GASのマスタシートで管理し、改定時に1箇所変更 |

---

## POSTCABINETS内部メモ

### この業界の攻め方（飲食コンサル・税理士経由？）

**最優先チャネル: 税理士・会計事務所**
- 飲食業に強い税理士事務所は「月次で試算表を出す → クライアントに説明する」のがルーティン。ここに「日次で自動分析されるので、月次MTGの質が上がりますよ」と提案
- 税理士にとってのメリット: クライアントの経営改善に貢献 → 顧問料の値上げ or 解約防止
- 紹介手数料: 初期費用の10〜20%（15〜30万円）を税理士に
- 大阪市内の飲食業に強い税理士事務所リスト作成が最初の一手

**第二チャネル: 飲食コンサルタント**
- 飲食コンサルは「FL管理しましょう」と言うが、実装手段を持っていないケースが多い
- 「先生のコンサル先に導入しませんか？」で入れる
- コンサルフィーの一部として提案できる

**第三チャネル: POS販売代理店（スマレジ・USEN系）**
- POS導入時にセットで提案する。POS単体は差別化が難しいため、「FL分析まで付く」がPOS代理店の差別化になる
- スマレジのパートナープログラムに登録して紹介案件を狙う

**ターゲット規模感**
- 3〜15店舗の居酒屋・焼肉・ラーメンチェーン
- 年商1.5億〜10億
- 本部機能が弱い（専任の経理部長がいない）
- 帝国データバンクによれば2024年の飲食業倒産は894件（過去最多）。「潰れる前に手を打ちたい」というニーズは強い

### 既存ツールとの差別化

| ツール | 価格帯 | 強み | 弱み | 我々の差別化 |
|--------|--------|------|------|------------|
| **フーディングジャーナル** | 初期60万〜 + 月額要問合せ | 大手チェーン実績豊富、機能網羅 | 高額、導入に3〜6ヶ月、中小には過剰 | **軽量・安価・2週間で稼働** |
| **インフォマート受発注** | 月額2〜5万 | 受発注電子化の業界標準（5万社導入） | 受発注に特化、FL分析機能は弱い | **インフォマートのデータを食ってFL分析する上位レイヤー** |
| **ASPIT** | 初期0円 + 月額要問合せ | 発注〜売上〜勤怠の一元管理 | ベンダーロックイン、カスタマイズ困難 | **既存POS・仕入システムを変えずに上に乗せられる** |
| **Excel / スプレッドシート自作** | 0円 | 無料、自由度高い | 属人化、更新が止まる、分析は手動 | **自動化 + AI分析。Excelの延長線で入れる** |
| **freee / マネーフォワード** | 月額2,000〜40,000円 | 会計・経理の自動化 | FLの日次分析は不可能。月次BS/PL止まり | **会計ソフトより手前の「経営速報」を出す** |

**我々のポジション**: 「既存のPOSも仕入システムも変えなくていい。上に薄くかぶせるだけで、翌朝にFLが届く」

### 自分たちに足りないもの

| 不足 | 重要度 | 対策 |
|------|--------|------|
| **飲食業の実務知識** | 高 | 飲食コンサルと組む or 元飲食店長をアドバイザーに |
| **スマレジAPI開発経験** | 中 | デベロッパーアカウントを取得してサンドボックスで検証（無料） |
| **導入第1号の実績** | 最高 | 知人の飲食オーナーに無料 or 大幅値引きで導入。事例を作る |
| **LINE Bot開発** | 低 | GAS + LINE Messaging APIで十分。Push Messageのみなら1日で構築可 |
| **継続的な保守体制** | 中 | GASは障害が少ないが、スマレジAPI仕様変更やインフォマートCSVフォーマット変更に対応する体制が必要 |
| **Looker Studioダッシュボード設計** | 低 | テンプレートを先に作り、店舗名・期間だけ差し替え |

### 実案件チェックリスト

```
□ クライアントのPOS確認（スマレジ / Airレジ / USENレジ / その他）
  → スマレジならAPI連携可。Airレジ・USENはCSVベースで設計
□ 仕入システム確認（インフォマート / FAX / 電話 / 市場直接）
  → インフォマートならCSV取込可。FAX/電話のみなら「現金仕入フォーム」で吸収
□ 現金仕入の比率確認（全仕入の何%が現金？）
  → 50%超なら現金仕入フォームの運用定着が最重要。店長のLINE操作習熟必須
□ シフト管理方法確認（紙 / Excel / Airシフト / スマレジタイムカード）
  → デジタルツールなら自動取込、紙なら手入力フォーム必要
□ 店舗数と店長のITリテラシー
  → LINEが使えれば問題なし。フォーム入力を10秒で終わる設計にする
□ 税理士の関与度（月次 / 四半期 / 年次のみ）
  → 月次関与ありなら税理士を味方につける（試算表作成が楽になるメリット）
□ 経営者の関心事（売上拡大 / コスト削減 / 人手不足 / 事業承継）
  → FL管理はコスト削減文脈で刺さるが、「人手不足」文脈でも刺さる
   （人時売上高の可視化 → 少人数で回せる体制 → 採用コスト削減）
□ 予算感の確認
  → 初期150万 + 月額5万が厳しければ、月額10万のサブスク型も用意
   （初期0円 + 月額10万 × 24ヶ月 = 240万。トータルは高いが心理的ハードル低い）
□ 契約形態
  → 初期構築費 + 月額保守。SLA（稼働率99%等）は入れない（GAS依存なので保証困難）
□ データ移行
  → 過去データの取込は原則スコープ外。導入日以降のデータで分析開始
```

---

## 参考データ・業界統計

### 飲食業の倒産・廃業（2024〜2025年）

- 2024年 飲食業倒産: **894件**（前年比+16.4%、過去最多更新）
- 2025年上半期: **458件**（前年同期比+5.3%、3年連続増）
- 負債1億円未満が **90.1%**（小規模事業者に集中）
- 業態別ワースト: 酒場 212件、中華 158件、西洋料理 123件
- 主因: 物価高騰（50件）、人手不足（21件）、コロナ後遺症
- 5年廃業率: 飲食業 **32.2%**（全産業平均28.4%）、酒場は **39.8%**
- 開業3年以内の廃業率: **約70%**

### FL比率の業態別目安

| 業態 | F率目安 | L率目安 | FL率目安 |
|------|---------|---------|----------|
| 居酒屋 | 28〜35% | 25〜32% | 50〜60% |
| ラーメン | 30〜35% | 25〜30% | 50〜60% |
| 焼肉・ステーキ | 38〜45% | 20〜25% | 55〜65% |
| カフェ・喫茶 | 24〜32% | 25〜36% | 45〜55% |
| ファストフード | 30〜35% | 20〜25% | 45〜55% |
| 寿司 | 40〜48% | 22〜28% | 60〜70% |
| フレンチ・高級 | 35〜40% | 28〜35% | 60〜70% |

### 人時売上高の目安

| 水準 | 人時売上高 | 評価 |
|------|-----------|------|
| 危険 | 〜3,000円 | 最終利益が残らない |
| 平均 | 3,000〜4,000円 | 一般的な飲食店 |
| 優良 | 4,500〜5,500円 | 目標ライン |
| 過剰 | 5,500円〜 | サービス品質低下リスク（人員不足） |

### 主要POSのデータ連携仕様

| POS | API | CSV | 月額（飲食向け） |
|-----|-----|-----|-----------------|
| スマレジ | REST API（OAuth2.0）、`/transactions/` `GET` で取引一覧取得 | 管理画面から手動DL | プレミアムプラス 8,800円/店舗 |
| Airレジ | 2025年8月〜本部システム連携開始 | 売上集計・会計明細・商品別・棚卸し等 | 0円（基本無料） |
| USENレジ FOOD | 限定的 | あり | 0円〜（ハード込みプランあり） |

---

> **この資料の更新履歴**
> - 2026-03-25: 初版作成（Web調査に基づく）
> - FL比率・倒産統計は2024〜2025年のデータに基づく
> - コード例はGAS + スマレジAPI + LINE Messaging APIの組み合わせ
