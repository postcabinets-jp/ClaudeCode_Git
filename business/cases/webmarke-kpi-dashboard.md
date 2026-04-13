# 【Webマーケティング支援会社】KPIダッシュボード自動生成で「提案が後手」を解消

> POSTCABINETS 事例設計 v1.0（2026-03-25作成）
> 対象読者: 従業員10〜30名規模のWebマーケ支援会社の経営者・ディレクター

> ※本事例は業界データに基づく想定です。実際の効果はクライアントの状況により異なります。

---

## 企業プロフィール

| 項目 | 内容 |
|------|------|
| 社名 | 株式会社デジタルブリッジ（架空） |
| 業種 | Webマーケティング支援（リスティング広告運用・SEO・SNS広告） |
| 設立 | 2018年 |
| 年商 | 2.4億円（広告運用手数料＋コンサル） |
| 従業員数 | 18名 |
| クライアント数 | 常時42社（月額リテイナー35社＋スポット7社） |
| 月間広告費総額 | 約8,000万円（クライアント平均190万円/社） |

### 組織構成（18名の内訳）

| 役割 | 人数 | 主な業務 |
|------|------|----------|
| 代表取締役 | 1名 | 経営・大手クライアント対応・採用 |
| 営業（兼アカウントマネージャー） | 3名 | 新規開拓・既存フォロー・契約更新 |
| ディレクター（兼運用責任者） | 4名 | 戦略設計・レポート作成・クライアント報告・改善提案 |
| 広告運用担当 | 5名 | 入稿・入札調整・クリエイティブ管理・日次モニタリング |
| SEOコンサルタント | 2名 | 技術SEO・コンテンツ企画・Search Console分析 |
| デザイナー（LP・バナー） | 2名 | バナー制作・LP制作・ABテスト素材 |
| 総務・経理 | 1名 | バックオフィス全般 |

### 使っているツール

- **広告管理**: Google Ads・Yahoo!広告・Meta広告マネージャー・LINE Ads Platform
- **分析**: GA4・Google Search Console・Looker Studio
- **レポート**: Excel・PowerPoint（手動作成）
- **コミュニケーション**: Slack・Chatwork（クライアントにより使い分け）
- **タスク管理**: Backlog
- **請求**: freee

---

## 経営者の生の悩み（代表・山田の言葉で）

> 「ウチは年商2.4億。悪くないと思うでしょ？　でもな、中身を見てくれよ。ディレクター4人が42社を回してる。1人あたり10社以上。月初になると何が起きるか。**全員が3日間レポート地獄に入る**んだよ。
>
> その3日間、提案書はゼロ。改善施策もゼロ。クライアントから"今月どうでしたか"って聞かれて初めて動く。**こっちから先に"こういう手を打ちましょう"って言えたことがここ半年で何回あった？**　正直、数えるほどだ。
>
> PPC（リスティング広告）の業界チャーンレートは年間49%って記事を見た。ウチは年間で8社失ってる。42社中8社。**約19%**だから"マシ"に見えるかもしれない。でもな、失った8社のうち5社は"成果が見えない"じゃなくて、**"他社の方が提案が早かった"**が理由だ。つまり運用の問題じゃない。**レポートに時間を食われて、提案する時間が物理的にない**ことが原因なんだ。
>
> 1社失うと月の手数料30万円。年間で1,800万円の売上が消える。これが5社分だから**年間900万円は"提案が後手"のせいで飛んでる**計算になる。
>
> 採用して人を増やす？　この業界、運用できる人間は取り合いだ。年収500万出しても来ない。来ても育つまで1年かかる。**人を増やす前に、人がやらなくていい作業をゼロにする方が先だろ。**」

---

## 現場のオペレーション（ディレクター・佐藤の1週間を分単位で描写）

### 前提条件
- 担当クライアント: 11社
- 各社の広告出稿媒体: 平均2.8媒体（Google Ads＋Meta広告が最多の組合せ）
- 月次レポート提出: 毎月5営業日目まで（＝月初の1週間がデッドライン）

### 月初1日目（月曜日）の業務フロー

| 時間 | 作業内容 | 所要時間 |
|------|----------|----------|
| 9:00 | Slack・Chatworkの未読確認、緊急対応の有無チェック | 15分 |
| 9:15 | **Google Ads管理画面にログイン** → A社のキャンペーンを選択 → 期間を前月に設定 → カスタムレポートで「キャンペーン別」「日別」「デバイス別」のデータをCSVエクスポート | 12分 |
| 9:27 | **Meta広告マネージャーにログイン** → A社の広告アカウント → 列をカスタマイズ（CPC・CTR・CPA・ROAS等を選択）→ CSV出力 → **読み込みが遅く2回リロード** | 18分 |
| 9:45 | **GA4にログイン** → A社のプロパティ → 「レポート」→「集客」→「トラフィック獲得」→ 期間設定 → 「探索」でファネルレポート作成 → **共有リンクをコピーしようとしてエラー、やり直し** | 25分 |
| 10:10 | **Search Console** → A社のプロパティ → 検索パフォーマンス → 期間設定 → フィルタ（国:日本）→ CSVエクスポート → **16ヶ月以上前のデータが必要でAPI経由でないと取れないことに気づく** | 15分 |
| 10:25 | **Excelを開く** → 先月のレポートテンプレート（A社用）をコピー → 4つのCSVデータを手動でコピー＆ペースト → セル参照がズレていないか目視チェック → **VLOOKUP関数のエラー発見、修正に8分** | 35分 |
| 11:00 | **PowerPointに転記** → グラフ更新（データソース再指定）→ コメント・考察を前月から書き換え → **"前月比"の数字を電卓で計算** | 40分 |
| 11:40 | A社レポート一次完成。**合計: 2時間40分**（A社1社分） | - |
| 11:40〜12:00 | B社のGoogle Adsデータ取得開始 | 20分 |
| 12:00〜13:00 | 昼休憩 | - |
| 13:00〜15:20 | B社レポート完成（2時間20分）※媒体がGoogle Adsのみで比較的早い | - |
| 15:20〜18:00 | C社レポート作成（2時間40分） | - |
| 18:00〜18:30 | Slackでクライアント3社からの問い合わせ対応 | 30分 |

**1日目の成果: 3社分のレポート完成。残り8社。**

### 月初2日目〜3日目

同じ作業の繰り返し。ただし以下の"割り込み"が発生:

- D社「先月のCPAが上がってるけど何が原因？」→ 電話30分
- E社「来月の予算を150万に増額したい。シミュレーション出して」→ 1時間
- Meta広告マネージャーのUIが変更されており、レポートカラムの場所が変わっている → 全社分のテンプレート修正に45分

**3日目終了時点: 8社完了。残り3社。**

### 月初4日目

- 残り3社のレポート作成（午前中で完了）
- **午後: ようやく「改善提案」に着手**
- しかし11社分のデータを見直す時間がなく、**提案は「前月踏襲＋微調整」に**

### 月初5日目（金曜日）

- クライアントへのレポート送付（メール・Chatwork添付）
- レポートへの質問対応で午後が潰れる

### 結果: 佐藤の月初1週間の時間配分

| 業務 | 時間 | 割合 |
|------|------|------|
| レポート作成（データ取得＋加工＋PowerPoint） | 28時間 | **70%** |
| クライアント対応（質問・電話） | 6時間 | 15% |
| 改善提案の作成 | 3時間 | 7.5% |
| 社内ミーティング | 2時間 | 5% |
| その他（事務・移動） | 1時間 | 2.5% |
| **合計** | **40時間** | 100% |

> **本来ディレクターの価値が出る「改善提案」に使える時間は、わずか7.5%。**

---

## ボトルネック分析

### 1. 時間の浪費（分単位の積み上げ）

| 作業 | 1社あたり | 11社/月 | 4ディレクター合計 |
|------|-----------|---------|-------------------|
| 各媒体へのログイン＆データCSV取得 | 45分 | 8.25時間 | 33時間 |
| CSVデータのExcel転記＆整形 | 35分 | 6.4時間 | 25.7時間 |
| PowerPoint作成＆グラフ更新 | 40分 | 7.3時間 | 29.3時間 |
| 前月比・目標比の手計算 | 15分 | 2.75時間 | 11時間 |
| 考察コメント記述 | 25分 | 4.6時間 | 18.3時間 |
| **合計** | **2時間40分** | **29.3時間** | **117.3時間/月** |

**ディレクター4人が月間117時間をレポート作成に費やしている。** これはフルタイム換算で約0.73人分の労働力に相当する。

### 2. ミスの発生

| ミスの種類 | 発生頻度 | 影響 |
|------------|----------|------|
| CSVコピペ時のセルずれ | 月3〜5件 | クライアントから指摘→信頼低下 |
| 前月テンプレの日付・社名書き換え漏れ | 月1〜2件 | 「別の会社のレポートが混ざってる」→重大クレーム |
| GA4の期間設定ミス（前月と当月の混同） | 月2件 | 数値の不一致→再作成で2時間ロス |
| Meta広告のアトリビューション設定の見落とし | 月1件 | CV数の過大/過小報告 |

**月間ミス合計: 7〜10件。うち1〜2件はクライアント対面で発覚し、信頼に直結。**

### 3. 機会損失の金額換算

```
■ 提案遅延による解約（実績ベース）
  年間解約 8社のうち「提案が遅い」起因 = 5社
  × 平均月額手数料 30万円 × 12ヶ月
  = 年間 1,800万円の逸失売上

■ アップセル機会の喪失
  月初にトレンド変化を検知できていれば提案できたケース = 月2件推定
  × 追加予算の手数料 月10万円 × 12ヶ月
  = 年間 240万円の機会損失

■ レポート工数の人件費換算
  117.3時間/月 × 12ヶ月 × ディレクター時給 3,500円
  = 年間 約493万円

■ 合計: 年間 約2,533万円の損失
```

### 4.「提案が後手」になるメカニズム（構造図）

```
月末: 広告の数値が変動 ──→ 気づくのは月初のレポート作成時
                              │
                              ▼
                    月初1〜4日: レポート地獄（データ取得→加工→体裁整え）
                              │
                              ▼
                    月初5日: レポート送付（過去の報告）
                              │
                              ▼
                    月初2週目: ようやく数値を「分析」する余裕
                              │
                              ▼
                    月初3週目: 「改善提案」を作成
                              │
                              ▼
                    月初4週目: クライアントに提案 → しかしもう月末
                              │
                              ▼
                    提案実行は「翌月」→ 効果が出るのは「翌々月」
                              │
                              ▼
              クライアント:「2ヶ月前の話をされても…」→ 競合に相談 → 解約
```

**根本原因: 「報告」と「提案」が同じ人間の同じ時間枠で行われているため、報告が終わらない限り提案に着手できない。レポート作成は"価値を生まない必須作業"であり、ここを自動化しない限り構造は変わらない。**

---

## 導入による経営インパクト

### Before / After 比較表

| 指標 | Before（手動） | After（自動化） | 改善幅 |
|------|----------------|-----------------|--------|
| レポート作成時間/社 | 2時間40分 | 5分（自動生成＋人の確認） | **-97%** |
| ディレクター4人の月間レポート工数 | 117.3時間 | 8.5時間 | **-93%** |
| レポート内のデータミス | 7〜10件/月 | 0〜1件/月 | **-90%** |
| クライアントへの報告タイミング | 月初5営業日目 | **翌月1日の朝9時に自動送信** | **4日前倒し** |
| ディレクターの「提案」に使える時間/月 | 12時間（3h×4人） | **120時間以上** | **10倍** |
| 異常値検知 → アラート | なし（月次で初めて気づく） | **日次でSlack通知** | リアルタイム化 |
| 年間解約（提案遅延起因） | 5社 | 1〜2社（推定） | **-60〜80%** |

### ROI計算

**3シナリオ:**

| シナリオ | 解約防止 | アップセル | 工数削減 | 年間効果 | 初年度ROI |
|----------|---------|-----------|---------|---------|----------|
| 保守的（解約1社防止） | 360万円 | 60万円 | 493万円 | **913万円** | **425%** |
| 標準（解約3社防止） | 1,080万円 | 240万円 | 493万円 | **1,813万円** | **941%** |
| 楽観的（解約5社防止＋アップセル倍増） | 1,800万円 | 480万円 | 493万円 | **2,773万円** | **1,493%** |

```
【コスト】
  開発・構築費（初期）:        150万円（外注の場合。自社構築なら工数のみ）
  月額ランニング:
    - Google Cloud（API・GAS実行）:  0円（無料枠内）
    - Claude API:                   月2万円（42社×月1回分析）
    - Slack:                        既存利用（追加費用なし）
  年間ランニング合計:           24万円

【効果（標準シナリオ）】
  ① レポート工数削減:            493万円/年（人件費換算）
  ② 解約防止（3社分と仮定）:    1,080万円/年（30万×12ヶ月×3社）
  ③ アップセル創出:             240万円/年
  ──────────────────────────
  年間効果合計:                  1,813万円/年

【ROI（標準）】
  初年度: (1,813 - 150 - 24) / 174 = 約941%
  2年目以降: 1,813 / 24 = 約7,554%
```

**初期投資を2ヶ月で回収（標準シナリオ）。**

---

## 自動化の全体設計

### アーキテクチャ図

```mermaid
graph TB
    subgraph データソース
        GA4[GA4 Data API]
        GSC[Search Console API]
        GADS[Google Ads API]
        META[Meta Marketing API]
        YAHOO[Yahoo!広告 API]
    end

    subgraph 自動収集レイヤー（GAS / Cloud Functions）
        TRIGGER[Cloud Scheduler<br/>毎日 AM6:00]
        FETCHER[データ取得スクリプト<br/>GAS or Cloud Functions]
        TRIGGER --> FETCHER
        FETCHER --> GA4
        FETCHER --> GSC
        FETCHER --> GADS
        FETCHER --> META
        FETCHER --> YAHOO
    end

    subgraph データ蓄積レイヤー
        SS[Google Spreadsheet<br/>クライアント別シート]
        BQ[BigQuery<br/>（大規模時のオプション）]
        FETCHER --> SS
        FETCHER -.-> BQ
    end

    subgraph 分析・生成レイヤー
        CLAUDE[Claude API<br/>トレンド分析・考察生成]
        SS --> CLAUDE
    end

    subgraph 出力レイヤー
        PDF[PDF自動生成<br/>GAS + Googleスライド]
        SLACK[Slack通知<br/>日次アラート＋月次レポート]
        EMAIL[メール自動送信<br/>GAS MailApp]
        CLAUDE --> PDF
        CLAUDE --> SLACK
        SS --> SLACK
        PDF --> EMAIL
    end

    subgraph 異常検知
        ALERT[閾値超過アラート<br/>CPA +20%、CV -30% etc.]
        SS --> ALERT
        ALERT --> SLACK
    end
```

### 技術選定の理由

| 選択 | 理由 |
|------|------|
| **GAS（Google Apps Script）をメインに** | Webマーケ会社はGoogle Workspace利用率がほぼ100%。追加インフラ不要。ディレクター自身が修正可能。 |
| **Googleスプレッドシートをデータハブに** | 既存ワークフローとの親和性。非エンジニアでもデータ確認・修正が可能。42社規模なら十分。 |
| **Claude APIで考察生成** | GPT-4oでも可だが、長文の分析・日本語の自然さでClaude Sonnetが優位。月2万円でROI十分。 |
| **Googleスライド→PDF** | クライアントへの納品フォーマットとしてPowerPointの代替。GASから直接操作可能。 |
| **BigQueryはオプション** | 100社超・年次トレンド分析が必要になったタイミングで導入。初期は不要。 |

---

## 構築手順（実際に動くコード付き）

### 全体スケジュール

| フェーズ | 期間 | 内容 |
|----------|------|------|
| Phase 1 | 1〜2日目 | GCP設定・API有効化・認証 |
| Phase 2 | 3〜5日目 | GA4＋Search Console データ取得 |
| Phase 3 | 6〜8日目 | Google Ads＋Meta広告データ取得 |
| Phase 4 | 9〜10日目 | Claude APIによる分析・考察自動生成 |
| Phase 5 | 11〜12日目 | Slackアラート＋PDF生成＋メール送信 |
| Phase 6 | 13〜14日目 | テスト・修正・本番移行 |

---

### Step 1: GA4 Data API 接続（GASコード）

**所要時間: 2〜3時間**
**つまずきポイント:**
- GASエディタの「サービス」から「Google Analytics Data API」を追加し忘れる
- GA4のプロパティIDとUA（旧バージョン）のトラッキングIDを混同する
- 日付フォーマットが `YYYY-MM-DD` でないとエラーになる

```javascript
/**
 * GA4 Data API からレポートデータを取得し、スプレッドシートに書き出す
 *
 * 事前準備:
 * 1. GASエディタ → サービス → 「Google Analytics Data API」を追加
 * 2. GA4の管理画面 → プロパティ設定 → プロパティIDをメモ
 * 3. GASを実行するGoogleアカウントにGA4の「閲覧者」以上の権限を付与
 */

// ========== 設定 ==========
const CONFIG = {
  // クライアントごとのGA4プロパティID（スプレッドシートの「設定」シートから読む方が運用しやすい）
  clients: [
    { name: 'A社', propertyId: '123456789', sheetName: 'A社_GA4' },
    { name: 'B社', propertyId: '234567890', sheetName: 'B社_GA4' },
    // ... 全クライアント分を定義
  ],
  spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE',
};

/**
 * 全クライアントのGA4データを一括取得（メイン関数 - トリガーで毎日実行）
 */
function fetchAllGA4Reports() {
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);

  CONFIG.clients.forEach(client => {
    try {
      const data = runGA4Report(client.propertyId);
      writeToSheet(ss, client.sheetName, data);
      Logger.log(`${client.name}: ${data.length}行取得完了`);
    } catch (e) {
      Logger.log(`${client.name}: エラー - ${e.message}`);
      // Slackにエラー通知（後述のSlack連携で実装）
      sendSlackAlert(`GA4データ取得エラー: ${client.name} - ${e.message}`);
    }
  });
}

/**
 * GA4 Data API の runReport を実行
 * @param {string} propertyId - GA4プロパティID
 * @returns {Array} レポートデータの2次元配列
 */
function runGA4Report(propertyId) {
  // 前月の期間を自動計算
  const today = new Date();
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const startDate = Utilities.formatDate(firstDayLastMonth, 'Asia/Tokyo', 'yyyy-MM-dd');
  const endDate = Utilities.formatDate(lastDayLastMonth, 'Asia/Tokyo', 'yyyy-MM-dd');

  // レポートリクエスト構築
  const request = AnalyticsData.newRunReportRequest();

  // ディメンション（軸）
  request.dimensions = [
    { name: 'date' },
    { name: 'sessionDefaultChannelGroup' },
    { name: 'deviceCategory' },
  ];

  // メトリクス（指標）
  request.metrics = [
    { name: 'sessions' },
    { name: 'activeUsers' },
    { name: 'screenPageViews' },
    { name: 'bounceRate' },
    { name: 'averageSessionDuration' },
    { name: 'conversions' },
    { name: 'totalRevenue' },
  ];

  // 日付範囲
  request.dateRanges = [{ startDate: startDate, endDate: endDate }];

  // 並び順
  request.orderBys = [{ dimension: { dimensionName: 'date' } }];

  // API実行
  const response = AnalyticsData.Properties.runReport(request, `properties/${propertyId}`);

  // レスポンスを2次元配列に変換
  const headers = [
    ...response.dimensionHeaders.map(h => h.name),
    ...response.metricHeaders.map(h => h.name),
  ];

  const rows = (response.rows || []).map(row => [
    ...row.dimensionValues.map(v => v.value),
    ...row.metricValues.map(v => v.value),
  ]);

  return [headers, ...rows];
}

/**
 * スプレッドシートにデータ書き出し
 */
function writeToSheet(ss, sheetName, data) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // 既存データをクリアして新しいデータを書き込み
  sheet.clearContents();
  if (data.length > 0 && data[0].length > 0) {
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  }

  // ヘッダー行を太字に
  sheet.getRange(1, 1, 1, data[0].length).setFontWeight('bold');
}
```

**GA4 Data API のレート制限（2026年3月時点）:**

| クォータ | 標準プロパティ | GA4 360 |
|----------|---------------|---------|
| トークン/プロパティ/日 | 200,000 | 2,000,000 |
| トークン/プロパティ/時 | 40,000 | 400,000 |
| 同時リクエスト/プロパティ | 10 | 50 |

> 42社×1日1回のレポート取得であれば、余裕で無料枠内に収まる。ただし複雑なクエリ（多ディメンション×長期間）はトークン消費が大きいため、日次は簡易版、月次はフル版と分ける設計が安全。

---

### Step 2: Search Console API 接続

**所要時間: 1〜2時間**
**つまずきポイント:**
- Search Console APIは `searchanalytics.query` メソッドで、GASの標準サービスではなくURL Fetchで直接叩く必要がある（2026年3月時点）
- プロパティURLのフォーマット（`sc-domain:example.com` vs `https://example.com/`）を間違えやすい

```javascript
/**
 * Search Console API からキーワード別パフォーマンスデータを取得
 *
 * 事前準備:
 * 1. GCPコンソールで「Search Console API」を有効化
 * 2. OAuth2ライブラリをGASに追加（スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF）
 * 3. GCPでOAuth2クライアントIDを作成（デスクトップアプリ）
 */

/**
 * Search Consoleデータ取得（全クライアント）
 */
function fetchAllSearchConsoleData() {
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const scConfig = getSearchConsoleConfig(ss); // 設定シートからサイトURL一覧を読む

  scConfig.forEach(site => {
    try {
      const data = fetchSearchAnalytics(site.siteUrl);
      writeToSheet(ss, site.sheetName, data);
      Logger.log(`${site.name}: Search Console ${data.length}行取得`);
    } catch (e) {
      Logger.log(`${site.name}: SC Error - ${e.message}`);
      sendSlackAlert(`Search Console エラー: ${site.name} - ${e.message}`);
    }
  });
}

/**
 * Search Analytics API を直接呼び出し
 * @param {string} siteUrl - Search Consoleのプロパティ（例: "sc-domain:example.com"）
 * @returns {Array} 2次元配列
 */
function fetchSearchAnalytics(siteUrl) {
  const today = new Date();
  const startDate = Utilities.formatDate(
    new Date(today.getFullYear(), today.getMonth() - 1, 1), 'Asia/Tokyo', 'yyyy-MM-dd'
  );
  const endDate = Utilities.formatDate(
    new Date(today.getFullYear(), today.getMonth(), 0), 'Asia/Tokyo', 'yyyy-MM-dd'
  );

  const payload = {
    startDate: startDate,
    endDate: endDate,
    dimensions: ['query', 'page', 'date'],
    rowLimit: 5000,
    startRow: 0,
  };

  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  if (result.error) {
    throw new Error(`API Error ${result.error.code}: ${result.error.message}`);
  }

  // ヘッダー + データ行
  const headers = ['query', 'page', 'date', 'clicks', 'impressions', 'ctr', 'position'];
  const rows = (result.rows || []).map(row => [
    ...row.keys,
    row.clicks,
    row.impressions,
    (row.ctr * 100).toFixed(2) + '%',
    row.position.toFixed(1),
  ]);

  return [headers, ...rows];
}
```

**Search Console API のレート制限:**

| クォータ | 制限値 |
|----------|--------|
| QPM（サイト単位） | 1,200 |
| QPD（プロジェクト単位） | 30,000,000 |
| URL検査 QPD（サイト単位） | 2,000 |

> 42社分のデータ取得は余裕。ただし `rowLimit: 25000` が上限なので、大規模サイトではページネーションが必要。

---

### Step 3: Meta Marketing API 接続

**所要時間: 3〜4時間（認証設定が最も手間）**
**つまずきポイント:**
- Facebookアプリの審査（ads_read権限）に1〜3営業日かかる
- 長期トークンの取得が複雑（短期トークン→長期トークンへの交換→System User Token推奨）
- アトリビューションウィンドウの違い（7日クリック / 1日ビュー等）でGA4と数字がずれる

```javascript
/**
 * Meta Marketing API からFacebook/Instagram広告データを取得
 *
 * 事前準備:
 * 1. Meta for Developers でアプリを作成
 * 2. Marketing API → ads_read 権限を審査申請
 * 3. System User を作成し、永続トークンを取得
 * 4. スプレッドシートの「設定」シートにトークンとアカウントIDを記載
 *    ※ トークンは Script Properties に保存する方がセキュア
 */

/**
 * Meta広告データ取得
 */
function fetchAllMetaAdsData() {
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const token = PropertiesService.getScriptProperties().getProperty('META_ACCESS_TOKEN');
  const metaConfig = getMetaConfig(ss);

  metaConfig.forEach(account => {
    try {
      const data = fetchMetaInsights(account.adAccountId, token);
      writeToSheet(ss, account.sheetName, data);
      Logger.log(`${account.name}: Meta Ads ${data.length}行取得`);
    } catch (e) {
      Logger.log(`${account.name}: Meta Error - ${e.message}`);
      sendSlackAlert(`Meta Ads エラー: ${account.name} - ${e.message}`);
    }
  });
}

/**
 * Meta Insights API呼び出し
 * @param {string} adAccountId - 広告アカウントID（例: "act_123456789"）
 * @param {string} accessToken - System User Token
 * @returns {Array} 2次元配列
 */
function fetchMetaInsights(adAccountId, accessToken) {
  const today = new Date();
  const startDate = Utilities.formatDate(
    new Date(today.getFullYear(), today.getMonth() - 1, 1), 'Asia/Tokyo', 'yyyy-MM-dd'
  );
  const endDate = Utilities.formatDate(
    new Date(today.getFullYear(), today.getMonth(), 0), 'Asia/Tokyo', 'yyyy-MM-dd'
  );

  const fields = [
    'campaign_name',
    'impressions',
    'clicks',
    'spend',
    'cpc',
    'ctr',
    'actions',           // CV数はactionsの中にある
    'cost_per_action_type',
    'action_values',     // ROAS計算用
  ].join(',');

  const params = [
    `fields=${fields}`,
    `time_range={"since":"${startDate}","until":"${endDate}"}`,
    `level=campaign`,
    `time_increment=1`, // 日別データ
    `access_token=${accessToken}`,
    `limit=500`,
  ].join('&');

  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?${params}`;

  let allData = [];
  let nextUrl = url;

  // ページネーション対応
  while (nextUrl) {
    const response = UrlFetchApp.fetch(nextUrl, { muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());

    if (result.error) {
      throw new Error(`Meta API Error: ${result.error.message} (code: ${result.error.code})`);
    }

    if (result.data) {
      allData = allData.concat(result.data);
    }

    // 次のページ
    nextUrl = result.paging && result.paging.next ? result.paging.next : null;

    // レート制限対策: 200msウェイト
    Utilities.sleep(200);
  }

  // データ整形
  const headers = [
    'date_start', 'campaign_name', 'impressions', 'clicks',
    'spend', 'cpc', 'ctr', 'conversions', 'cpa', 'roas'
  ];

  const rows = allData.map(row => {
    const conversions = extractConversions(row.actions);
    const cpa = conversions > 0 ? (parseFloat(row.spend) / conversions).toFixed(0) : '-';
    const convValue = extractConversionValue(row.action_values);
    const roas = parseFloat(row.spend) > 0 ? (convValue / parseFloat(row.spend) * 100).toFixed(0) + '%' : '-';

    return [
      row.date_start,
      row.campaign_name,
      row.impressions,
      row.clicks,
      row.spend,
      row.cpc || '-',
      row.ctr || '-',
      conversions,
      cpa,
      roas,
    ];
  });

  return [headers, ...rows];
}

/**
 * actionsからCV数を抽出（purchase / lead / complete_registration等）
 */
function extractConversions(actions) {
  if (!actions) return 0;
  const convTypes = ['offsite_conversion.fb_pixel_purchase', 'offsite_conversion.fb_pixel_lead', 'lead', 'purchase'];
  let total = 0;
  actions.forEach(action => {
    if (convTypes.includes(action.action_type)) {
      total += parseInt(action.value, 10);
    }
  });
  return total;
}

function extractConversionValue(actionValues) {
  if (!actionValues) return 0;
  let total = 0;
  actionValues.forEach(av => {
    if (av.action_type === 'offsite_conversion.fb_pixel_purchase' || av.action_type === 'purchase') {
      total += parseFloat(av.value);
    }
  });
  return total;
}
```

### Yahoo!広告 API について

> **対応予定:** Yahoo!広告 ディスプレイ広告/検索広告のレポートAPI対応は次期バージョン（v2.0）で実装予定。Yahoo!広告APIは2023年にv14へ移行しており、認証方式がOAuth 2.0に統一されている。GASからの呼び出しは Meta API と類似の構成で実装可能。現時点では、Yahoo!広告の管理画面から**CSVレポートを手動エクスポート→Google Driveにアップロード→GASで取込**のフローで代替する。

**Meta Marketing API のレート制限:**

| クォータ | Standard Tier | Dev Tier |
|----------|--------------|----------|
| ads_insights / アカウント / 時 | 190,000 + 400×アクティブ広告数 | 600 + 400×アクティブ広告数 |
| ads_management / アカウント / 時 | 100,000 + 40×アクティブ広告数 | 300 + 40×アクティブ広告数 |

> **重要:** Dev TierのままだとInsightsが600/時しかなく、42アカウント分の日別データ取得で制限にかかる可能性大。**Standard Tierへのアップグレード（App Review必須）は初日に申請すること。**

---

### Step 4: Claude API でトレンド分析・考察自動生成

**所要時間: 2〜3時間**
**つまずきポイント:**
- GASからClaude APIを呼ぶ場合、レスポンスが大きいとタイムアウト（GASの実行制限6分）になりうる
- プロンプトに「前月比」「目標比」の数値を事前計算して渡さないと、LLMが計算ミスする

```javascript
/**
 * Claude API を使ってKPIデータの分析・考察を自動生成
 *
 * 事前準備:
 * 1. Anthropic API キーを Script Properties に設定
 *    PropertiesService.getScriptProperties().setProperty('CLAUDE_API_KEY', 'sk-ant-...');
 * 2. 各クライアントの目標値を「設定」シートに記載
 */

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

/**
 * 全クライアントの月次分析を生成
 */
function generateAllAnalysis() {
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');

  CONFIG.clients.forEach(client => {
    try {
      // GA4 + Search Console + 広告データを統合
      const summary = buildClientSummary(ss, client);

      // Claude APIで分析
      const analysis = callClaudeAPI(apiKey, summary, client.name);

      // 結果をシートに書き出し
      const analysisSheet = ss.getSheetByName(`${client.name}_分析`) || ss.insertSheet(`${client.name}_分析`);
      analysisSheet.clearContents();
      analysisSheet.getRange(1, 1).setValue(analysis);
      analysisSheet.getRange(1, 1).setWrap(true);

      Logger.log(`${client.name}: 分析生成完了`);

      // レート制限対策
      Utilities.sleep(1000);
    } catch (e) {
      Logger.log(`${client.name}: Analysis Error - ${e.message}`);
      sendSlackAlert(`分析生成エラー: ${client.name} - ${e.message}`);
    }
  });
}

/**
 * クライアントのデータを統合サマリーに変換（Claude APIに渡す前処理）
 */
function buildClientSummary(ss, client) {
  // GA4データ
  const ga4Sheet = ss.getSheetByName(`${client.name}_GA4`);
  const ga4Data = ga4Sheet ? ga4Sheet.getDataRange().getValues() : [];

  // 広告データ（Google Ads / Meta）
  const adsSheet = ss.getSheetByName(`${client.name}_Ads`);
  const adsData = adsSheet ? adsSheet.getDataRange().getValues() : [];

  // Search Consoleデータ
  const scSheet = ss.getSheetByName(`${client.name}_SC`);
  const scData = scSheet ? scSheet.getDataRange().getValues() : [];

  // 目標値
  const targetSheet = ss.getSheetByName('設定_目標');
  const targets = getClientTargets(targetSheet, client.name);

  // 前月比の事前計算（LLMに計算させない）
  const currentMonth = aggregateMonthly(adsData);
  const prevMonth = getPreviousMonthData(ss, client);
  const momChange = calculateMoMChange(currentMonth, prevMonth);

  return {
    clientName: client.name,
    period: getCurrentPeriodString(),
    ga4Summary: summarizeGA4(ga4Data),
    adsSummary: summarizeAds(adsData),
    scSummary: summarizeSC(scData),
    targets: targets,
    momChange: momChange,
  };
}

// --- 以下のヘルパー関数はクライアントのデータ構造に合わせてカスタマイズが必要 ---
// summarizeGA4(data): GA4データの要約（sessions, bounceRate, topChannels等を返す）
// summarizeAds(data): 広告データの要約（totalSpend, totalCV, avgCPA, roas等を返す）
// summarizeSC(data): Search Consoleデータの要約（topQueries, avgPositionChange等を返す）
// getClientTargets(sheet, name): 設定シートからクライアントの目標値を取得
// aggregateMonthly(data): 月間の広告データを集計
// getPreviousMonthData(ss, client): 前月のデータを取得
// calculateMoMChange(current, prev): 前月比の増減を計算（"+12%", "-5%"等の文字列を返す）
// getCurrentPeriodString(): 現在の期間文字列を返す（例: "2026年3月"）
// getClientEmailRecipients(ss, name): クライアントのメール送信先を取得
// getYesterdayData(data), get7DayAverage(data): 日次異常値チェック用のデータ取得

/**
 * Claude API 呼び出し
 */
function callClaudeAPI(apiKey, summary, clientName) {
  const prompt = `あなたはWebマーケティングのKPIアナリストです。以下のデータに基づいて、${clientName}の月次レポートの「考察」セクションを生成してください。

## ルール
- 数字は必ずデータから引用すること（推測しない）
- 前月比の増減理由を具体的に分析すること
- 「次月のアクション提案」を3つ以内で提示すること
- 文体はクライアント経営者に報告する丁寧語で
- 400〜600字程度

## 当月データ
- 期間: ${summary.period}
- 広告費: ${summary.adsSummary.totalSpend}円
- CV数: ${summary.adsSummary.totalCV}件
- CPA: ${summary.adsSummary.avgCPA}円
- ROAS: ${summary.adsSummary.roas}%
- サイトセッション: ${summary.ga4Summary.sessions}
- 直帰率: ${summary.ga4Summary.bounceRate}%
- 主要流入チャネル: ${JSON.stringify(summary.ga4Summary.topChannels)}

## 前月比（事前計算済み）
- 広告費: ${summary.momChange.spend}
- CV数: ${summary.momChange.cv}
- CPA: ${summary.momChange.cpa}
- セッション: ${summary.momChange.sessions}

## 目標値
- 月間CV目標: ${summary.targets.cvTarget}件
- CPA上限: ${summary.targets.cpaLimit}円
- ROAS目標: ${summary.targets.roasTarget}%

## Search Console
- 主要キーワードTop10: ${JSON.stringify(summary.scSummary.topQueries)}
- 平均掲載順位の変動: ${summary.scSummary.avgPositionChange}
`;

  const payload = {
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    messages: [
      { role: 'user', content: prompt }
    ],
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', options);
  const result = JSON.parse(response.getContentText());

  if (result.error) {
    throw new Error(`Claude API Error: ${result.error.message}`);
  }

  return result.content[0].text;
}
```

**Claude API コスト試算（42社/月）:**

| 項目 | 数量 | 単価 | 月額 |
|------|------|------|------|
| 入力トークン（1社あたり約2,000トークン） | 84,000 | $3/MTok (Sonnet) | $0.25 |
| 出力トークン（1社あたり約800トークン） | 33,600 | $15/MTok (Sonnet) | $0.50 |
| 日次アラート分析（異常値のみ、月20回想定） | 40,000入力 + 10,000出力 | - | $0.27 |
| **月額合計** | | | **約$1.02（約150円）** |

> 実際にはSonnet 4で十分。月額数百円。予算2万円は大幅に余裕がある（GPT-4oを使っても同程度）。

---

### Step 5: Slackアラート

**所要時間: 1〜2時間**

```javascript
/**
 * Slack Incoming Webhook でアラート・レポートを送信
 *
 * 事前準備:
 * 1. Slack App を作成 → Incoming Webhooks を有効化
 * 2. チャンネルを選択してWebhook URLを取得
 * 3. Script Properties に設定
 */

const SLACK_WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');

/**
 * 日次異常値チェック＆アラート（毎朝8:00にトリガー実行）
 */
function dailyAnomalyCheck() {
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const alerts = [];

  CONFIG.clients.forEach(client => {
    const adsSheet = ss.getSheetByName(`${client.name}_Ads`);
    if (!adsSheet) return;

    const data = adsSheet.getDataRange().getValues();
    const yesterday = getYesterdayData(data);
    const avg7d = get7DayAverage(data);

    if (!yesterday || !avg7d) return;

    // CPA が7日平均の+30%以上 → アラート
    if (yesterday.cpa > avg7d.cpa * 1.3 && avg7d.cpa > 0) {
      alerts.push({
        client: client.name,
        type: ':rotating_light: CPA急騰',
        detail: `昨日CPA ¥${yesterday.cpa.toLocaleString()} （7日平均 ¥${avg7d.cpa.toLocaleString()} の ${((yesterday.cpa / avg7d.cpa - 1) * 100).toFixed(0)}%増）`,
      });
    }

    // CV数が7日平均の-50%以下 → アラート
    if (yesterday.cv < avg7d.cv * 0.5 && avg7d.cv > 0) {
      alerts.push({
        client: client.name,
        type: ':warning: CV急減',
        detail: `昨日CV ${yesterday.cv}件（7日平均 ${avg7d.cv.toFixed(1)}件 の ${((1 - yesterday.cv / avg7d.cv) * 100).toFixed(0)}%減）`,
      });
    }

    // 日予算消化率が80%未満 → アラート
    if (yesterday.spendRate < 0.8) {
      alerts.push({
        client: client.name,
        type: ':chart_with_downwards_trend: 予算未消化',
        detail: `昨日の消化率 ${(yesterday.spendRate * 100).toFixed(0)}%（日予算の${(100 - yesterday.spendRate * 100).toFixed(0)}%が余り）`,
      });
    }
  });

  if (alerts.length > 0) {
    sendSlackAlertBatch(alerts);
  } else {
    // 異常なしの場合もサマリーを送信（安心材料）
    sendSlackMessage(':white_check_mark: 全クライアント異常なし（' + new Date().toLocaleDateString('ja-JP') + '）');
  }
}

/**
 * Slack メッセージ送信
 */
function sendSlackMessage(text) {
  const payload = { text: text };
  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  });
}

/**
 * アラートまとめて送信（見やすいフォーマット）
 */
function sendSlackAlertBatch(alerts) {
  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `KPIアラート（${new Date().toLocaleDateString('ja-JP')}）` },
    },
  ];

  alerts.forEach(alert => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${alert.client}* ${alert.type}\n${alert.detail}`,
      },
    });
    blocks.push({ type: 'divider' });
  });

  const payload = { blocks: blocks };
  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  });
}

function sendSlackAlert(message) {
  sendSlackMessage(`:rotating_light: ${message}`);
}
```

---

### Step 6: PDF自動生成＋メール送信

**所要時間: 2〜3時間**

```javascript
/**
 * Googleスライドをテンプレートにして月次レポートPDFを自動生成・メール送信
 *
 * 事前準備:
 * 1. Googleスライドでレポートテンプレートを作成
 *    - プレースホルダー: {{CLIENT_NAME}}, {{PERIOD}}, {{TOTAL_SPEND}}, {{TOTAL_CV}}, etc.
 * 2. テンプレートのファイルIDを設定
 */

const REPORT_TEMPLATE_ID = 'YOUR_GOOGLE_SLIDES_TEMPLATE_ID';
const REPORT_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID';

/**
 * 全クライアントの月次レポートPDFを生成・送信（月初1日にトリガー実行）
 */
function generateAndSendAllReports() {
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);

  CONFIG.clients.forEach(client => {
    try {
      // 1. テンプレートをコピー
      const templateFile = DriveApp.getFileById(REPORT_TEMPLATE_ID);
      const reportName = `${client.name}_月次レポート_${getCurrentPeriodString()}`;
      const folder = DriveApp.getFolderById(REPORT_FOLDER_ID);
      const copy = templateFile.makeCopy(reportName, folder);

      // 2. プレースホルダーを実データに置換
      const slides = SlidesApp.openById(copy.getId());
      const summary = buildClientSummary(ss, client);
      const analysis = ss.getSheetByName(`${client.name}_分析`).getRange(1, 1).getValue();

      replaceAllPlaceholders(slides, {
        '{{CLIENT_NAME}}': client.name,
        '{{PERIOD}}': summary.period,
        '{{TOTAL_SPEND}}': `¥${Number(summary.adsSummary.totalSpend).toLocaleString()}`,
        '{{TOTAL_CV}}': `${summary.adsSummary.totalCV}件`,
        '{{AVG_CPA}}': `¥${Number(summary.adsSummary.avgCPA).toLocaleString()}`,
        '{{ROAS}}': `${summary.adsSummary.roas}%`,
        '{{SESSIONS}}': `${Number(summary.ga4Summary.sessions).toLocaleString()}`,
        '{{BOUNCE_RATE}}': `${summary.ga4Summary.bounceRate}%`,
        '{{MOM_SPEND}}': summary.momChange.spend,
        '{{MOM_CV}}': summary.momChange.cv,
        '{{MOM_CPA}}': summary.momChange.cpa,
        '{{ANALYSIS}}': analysis,
      });

      slides.saveAndClose();

      // 3. PDFに変換
      const pdfBlob = copy.getAs('application/pdf');
      pdfBlob.setName(`${reportName}.pdf`);

      // 4. メール送信
      const recipients = getClientEmailRecipients(ss, client.name);
      if (recipients && recipients.length > 0) {
        MailApp.sendEmail({
          to: recipients.join(','),
          subject: `【月次レポート】${client.name}様 ${summary.period}`,
          htmlBody: buildReportEmailHTML(client.name, summary),
          attachments: [pdfBlob],
        });
      }

      // 5. Slack通知
      sendSlackMessage(`:page_facing_up: ${client.name} 月次レポート生成・送信完了`);

      Logger.log(`${client.name}: レポートPDF生成・送信完了`);

      // GASの実行時間制限対策（6分/回）: 10社ごとに新しいトリガーで継続
      Utilities.sleep(2000);

    } catch (e) {
      Logger.log(`${client.name}: Report Error - ${e.message}`);
      sendSlackAlert(`レポート生成エラー: ${client.name} - ${e.message}`);
    }
  });
}

/**
 * Googleスライドのプレースホルダー一括置換
 */
function replaceAllPlaceholders(slides, replacements) {
  const presentation = slides;
  Object.keys(replacements).forEach(placeholder => {
    presentation.replaceAllText(placeholder, replacements[placeholder] || '-');
  });
}

/**
 * レポート送付メールのHTML本文
 */
function buildReportEmailHTML(clientName, summary) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${clientName}様 月次レポート</h2>
      <p>いつもお世話になっております。</p>
      <p>${summary.period}の月次レポートをお送りいたします。</p>

      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">広告費</td>
          <td style="padding: 12px; border: 1px solid #ddd;">¥${Number(summary.adsSummary.totalSpend).toLocaleString()}</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${summary.momChange.spend}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">CV数</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${summary.adsSummary.totalCV}件</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${summary.momChange.cv}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">CPA</td>
          <td style="padding: 12px; border: 1px solid #ddd;">¥${Number(summary.adsSummary.avgCPA).toLocaleString()}</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${summary.momChange.cpa}</td>
        </tr>
      </table>

      <p>詳細は添付のPDFをご確認ください。</p>
      <p>ご不明点がございましたら、お気軽にお問い合わせください。</p>

      <p style="color: #999; font-size: 12px; margin-top: 40px;">
        ※ 本メールは自動送信です。数値に疑問がある場合は担当ディレクターまでご連絡ください。
      </p>
    </div>
  `;
}
```

---

## 提案トークスクリプト

### 社長への刺さる一言（アポイント時）

> 「御社のディレクターさん、月初の3〜4日間、レポート作成で手が止まっていませんか？　その間、競合は御社のクライアントに提案しています。**レポートを自動化するのではなく、ディレクターの時間を"提案"に取り戻す**お手伝いをしています。」

### 商談の流れ（30分想定）

1. **0〜5分: 現状ヒアリング**
   - 「クライアント何社をディレクター何人で回されていますか？」
   - 「月次レポート、1社あたりどのくらい時間かかっていますか？」
   - 「レポート提出は毎月何日ですか？」

2. **5〜10分: 痛みの確認**
   - 「月初の1週間、ディレクターは"提案"に何時間使えていますか？」
   - 「この1年で解約されたクライアント、何社ですか？ 理由は？」

3. **10〜20分: デモ（スプレッドシート＋Slackアラートの実画面）**
   - 「これが毎朝8時にSlackに届きます。CPAが急騰したら、月末を待たずにその日のうちに対応できます」
   - 「月次レポートのPDFは、月初1日の朝に自動で出来上がっています」

4. **20〜25分: ROI試算（その場で計算）**
   - ディレクター人数 × 担当社数 × 2.5時間/社 = 月間レポート工数
   - × ディレクター時給 = 年間コスト
   - 「この金額を、そのまま提案・改善施策に回せます」

5. **25〜30分: 次のステップ**
   - 「まず3社分のデータで2週間のPoCをやりませんか？ 費用は●●万円です」

### よくある反論と切り返し

| 反論 | 切り返し |
|------|----------|
| 「Databeatとか既製品で十分じゃない？」 | 「Databeatは"データ収集と出力"が主です。御社の提案力を上げるには、"考察の自動生成"と"異常値のリアルタイム検知"が必要です。既製品にはそこがありません。また既製品は月5万〜のサブスクで、年60万。ウチなら初期構築だけで、ランニングは年3万円以下です」 |
| 「ウチのディレクター、ITに弱いんだけど」 | 「ディレクターが触るのはスプレッドシートとSlackだけです。システムは裏で動きます。"使い方を覚える"のではなく"勝手にデータが揃っている"状態を作ります」 |
| 「セキュリティが心配。クライアントのデータを外に出すのは…」 | 「データはすべてGoogle Workspaceの中で完結します。新しいサービスにデータを送るのではなく、御社が今使っているGoogleの中で自動化するだけです。APIキーもGoogle Cloud内で管理されます」 |
| 「自分たちでもGAS書けるし」 | 「書けるなら素晴らしいです。ただ、42社分のAPI接続・エラーハンドリング・レート制限対策・テンプレート管理を"誰が保守し続けるか"が問題です。構築して終わりではなく、APIの仕様変更やUI変更に追従する運用も含めてお任せください」 |
| 「まずは安く試したい」 | 「3社・2週間のPoCを●万円でご提案します。実際のデータで動くものをお見せして、効果が出なければそこで止めていただいて構いません」 |

---

## 法規制・リスク

### 1. Cookie規制・改正電気通信事業法（2023年6月施行）

| 項目 | 影響 | 対応 |
|------|------|------|
| 外部送信規律 | GA4・Meta Pixel等の計測タグはすべて「外部送信」に該当。通知/公表またはオプトイン/オプトアウトの仕組みが必要 | クライアントのサイトにCMP（Consent Management Platform）が導入済みか確認。未導入なら導入支援も提案に含める |
| サードパーティCookieの段階的廃止 | Chrome以外（Safari, Firefox）では既にITP等で制限済み。GA4はファーストパーティCookieベースだがアトリビューションに影響 | サーバーサイドGTMの導入提案。コンバージョンAPIの活用 |

### 2. 各プラットフォームAPI利用規約

| API | 主な制約 | 注意点 |
|-----|----------|--------|
| GA4 Data API | Google APIサービス利用規約に準拠。データの再販禁止 | クライアントのGA4プロパティへのアクセス権限は、クライアント自身に付与してもらう（代理店が勝手に取得しない） |
| Search Console API | 利用規約でデータの大量スクレイピングを禁止 | rowLimit 25,000の上限あり。日次で全キーワードを取得しようとすると制限に抵触する可能性 |
| Meta Marketing API | Platform Policy準拠。広告データの30日以上の保存にはData Processing Terms(DPT)の同意が必要 | System User Tokenの管理。ビジネスマネージャーのadmin権限が必要 |
| Google Ads API | デベロッパートークンの利用規約。Basic/Standard Access Level | Standard Accessの審査に2〜4週間。クライアントのMCC権限が必要 |

### 3. 個人情報保護法

- GA4のデータにはユーザーIDやIPアドレス等の個人情報が含まれうる
- レポートには**集計済みデータ（KPI数値）のみ**を含め、個人を特定できる情報は扱わない設計にする
- クライアントとの契約書に「データ取り扱い」条項を含める

### 4. 運用リスク

| リスク | 対策 |
|--------|------|
| APIの仕様変更・廃止 | 各APIのChangelog/ブログをRSSで監視。四半期に1回の定期メンテナンスを契約に含める |
| GASの実行時間制限（6分/回） | クライアントをバッチ分割して複数トリガーで実行。10社ずつ処理 |
| トークンの期限切れ | Meta: System User Tokenは無期限。Google: サービスアカウントのキーは期限なし（OAuth refresh tokenは定期更新要） |
| スプレッドシートのセル数上限（10M） | 月次データはシート分割。年次アーカイブはBigQueryへ |

---

## POSTCABINETS内部メモ

### この業界の攻め方

1. **ターゲットは「従業員10〜30名のWebマーケ支援会社」**: 大手はDatabeat/ATOM等を導入済み。中小は手動のまま。ここが一番ペインが深い。
2. **入り口は「レポート自動化」、本丸は「運用コンサル」**: レポート自動化は月額フィーを取りにくい（一度作ったら動き続ける）。保守＋改善提案のサブスクモデルにする。
3. **PoCで入って、全社展開で広げる**: 最初の3社分を低価格で構築し、効果を実感してもらったら残りの全クライアント分に展開。
4. **営業リスト**: Web幹事・ITreview・ミツモア等で広告レポートツールを比較検討している会社 = まさにペインを感じている会社。
5. **展示会・セミナー**: ad:tech, Marketing Agenda, デジマチェーン等のイベントで中小代理店と接点を持つ。

### 自分たちに足りないもの

| 不足 | 具体的に | 埋め方 |
|------|----------|--------|
| **実績ゼロ** | 「やったことがない」が最大の弱み | **自社で先にやる**。POSTCABINETSのクライアント向けレポートをこのシステムで自動化し、Before/After数値を事例にする |
| **Meta Marketing APIの審査経験** | App Reviewの通し方を知らない | 自社アカウントで一度通して、手順をドキュメント化する |
| **Googleスライドのテンプレート品質** | デザイン力 | Canvaの有料テンプレートをベースに、Googleスライドに変換して使う |
| **保守運用の体制** | API仕様変更への追従を24/365やれるか | Claude Code + GitHub Actions で自動テストを回す。変更があったらSlackにアラート |
| **営業力** | この業界の社長に会える接点がない | まずは自社の取引先のWebマーケ会社に紹介営業。または LinkedIn + note記事 での情報発信 |

### 競合ツールとの差別化

| ツール | 月額 | 強み | 弱み（＝差別化ポイント） |
|--------|------|------|--------------------------|
| **Databeat** | 5万円〜（500円/アカウント） | 40媒体連携、Looker Studio/BigQuery出力 | 考察生成なし。レポートの「体裁」は整うが「分析」は人がやる |
| **ATOM** | 要問合せ（推定5〜10万） | 157種レポート、大手実績700社 | 大手向けの機能過剰。中小には高い。カスタマイズが限定的 |
| **Lisket** | 2万円〜 | 安い。予算管理機能あり | レポートがExcelのみ。考察なし。異常検知なし |
| **アドレポ** | 3万円〜 | バランス型 | テンプレート固定。AIなし |
| **Shirofune** | 広告費×5%（最低2.5万） | 広告運用自体も自動化 | レポートツールではなく運用ツール。代理店の仕事を奪う方向 |
| **我々の提案** | 初期150万＋ランニング月2万 | **AI考察生成 + 日次異常検知 + 完全カスタマイズ + ランニング最安** | 初期費用が必要。実績がまだない |

**差別化の核心:** 既製品は「データを集めて並べる」まで。我々は「データを読んで考察を書き、異常があれば即アラートを出し、提案のたたき台まで作る」ところまでやる。ディレクターの時間を"作業"から"判断と提案"に移すのが価値。

### 実案件に進む時のチェックリスト

- [ ] 自社のクライアント2〜3社で実際に構築し、1ヶ月間運用する
- [ ] Before/After数値（工数削減・ミス削減）を記録する
- [ ] クライアントからの感想（定性フィードバック）を取る
- [ ] Meta Marketing APIのApp Reviewを自社で通す
- [ ] Google Ads APIのデベロッパートークン（Standard Access）を取得する
- [ ] Googleスライドのレポートテンプレートを3パターン用意する
- [ ] PoC提案書（3社分・2週間・●万円）のフォーマットを作る
- [ ] 保守契約書のドラフトを作る（四半期メンテ含む）
- [ ] 営業先リスト20社を作成する
- [ ] note記事「レポート作成に月120時間かけていた代理店が、0時間にした話」を公開する
- [ ] 初回商談のデモ環境（ダミーデータ入り）を用意する

---

## 補足: ヘルパー関数（コード内で参照している共通関数）

```javascript
// ========== ヘルパー関数群 ==========

function getCurrentPeriodString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 前月
  const m = month === 0 ? 12 : month;
  const y = month === 0 ? year - 1 : year;
  return `${y}年${m}月`;
}

function getSearchConsoleConfig(ss) {
  // 「設定」シートからSCプロパティ一覧を読み取る
  const sheet = ss.getSheetByName('設定_SC');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).map(row => ({
    name: row[0],
    siteUrl: row[1],
    sheetName: `${row[0]}_SC`,
  }));
}

function getMetaConfig(ss) {
  const sheet = ss.getSheetByName('設定_Meta');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).map(row => ({
    name: row[0],
    adAccountId: row[1],
    sheetName: `${row[0]}_Meta`,
  }));
}

function getClientTargets(sheet, clientName) {
  if (!sheet) return { cvTarget: '-', cpaLimit: '-', roasTarget: '-' };
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === clientName);
  if (!row) return { cvTarget: '-', cpaLimit: '-', roasTarget: '-' };
  return {
    cvTarget: row[1],
    cpaLimit: row[2],
    roasTarget: row[3],
  };
}

function getClientEmailRecipients(ss, clientName) {
  const sheet = ss.getSheetByName('設定_メール');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === clientName);
  return row ? row[1].split(',').map(e => e.trim()) : [];
}

function aggregateMonthly(data) {
  // データ集計ロジック（省略: 実装時にカスタマイズ）
  return { spend: 0, cv: 0, cpa: 0 };
}

function getPreviousMonthData(ss, client) {
  // 前月データ取得（省略: アーカイブシートから取得）
  return { spend: 0, cv: 0, cpa: 0 };
}

function calculateMoMChange(current, prev) {
  const calc = (c, p, unit) => {
    if (!p || p === 0) return '-';
    const change = ((c - p) / p * 100).toFixed(1);
    return `${change > 0 ? '+' : ''}${change}%`;
  };
  return {
    spend: calc(current.spend, prev.spend),
    cv: calc(current.cv, prev.cv),
    cpa: calc(current.cpa, prev.cpa),
    sessions: '-', // GA4データから別途計算
  };
}

function summarizeGA4(data) {
  // GA4データのサマリー（省略: 実装時にカスタマイズ）
  return { sessions: 0, bounceRate: 0, topChannels: [] };
}

function summarizeAds(data) {
  return { totalSpend: 0, totalCV: 0, avgCPA: 0, roas: 0 };
}

function summarizeSC(data) {
  return { topQueries: [], avgPositionChange: '-' };
}

function getYesterdayData(data) {
  // 昨日のデータ行を抽出（省略）
  return null;
}

function get7DayAverage(data) {
  // 直近7日の平均（省略）
  return null;
}

function buildReportEmailHTML(clientName, summary) {
  // Step 6で定義済み
}
```

---

> **出典・参考:**
> - [GA4 Data API limits and quotas (Google Developers)](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas)
> - [Search Console API Usage Limits (Google Developers)](https://developers.google.com/webmaster-tools/limits)
> - [Meta Marketing API Rate Limiting](https://developers.facebook.com/docs/marketing-api/overview/rate-limiting/)
> - [Google Ads API Limits and Quotas](https://developers.google.com/google-ads/api/docs/best-practices/quotas)
> - [Average Marketing Agency Churn: 2026 Report (Focus Digital)](https://focus-digital.co/average-marketing-agency-churn/)
> - [広告レポート作成の工数削減の重要性 (アドレポ)](https://ad-repo.com/blog/man_hour_reduction/)
> - [広告レポート作成や分析の時間は全体の25%まで (Unyoo.jp / atara)](https://www.atara.co.jp/unyoojp/2015/09/reporting-task-reduction/)
> - [Databeat 公式サイト](https://www.data-be.at/)
> - [ATOM 公式サイト](https://www.atom.tools/top/)
> - [Lisket 料金プラン](https://lisket.jp/plan/)
> - [アドレポ 料金](https://ad-repo.com/fee/)
> - [Shirofune 料金プラン](https://shirofune.com/price/)
> - [Cookie規制・改正電気通信事業法 (Priv Lab)](https://privtech.co.jp/blog/law/revised-telecommunications-business-law-cookie.html)
> - [GAS × GA4 Data API サンプルコード (auto-worker.com)](https://auto-worker.com/blog/?p=5905)
