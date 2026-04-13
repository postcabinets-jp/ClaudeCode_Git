# 【人材紹介】求人票取得→マッチング→面談調整をAIが代行し「成約率」を1.5倍に

> **注記**: 本事例に記載の数値（改善率・ROI等）は、業界統計と類似規模人材紹介会社の公開データに基づく**想定値**であり、特定の企業の実績値ではありません。実際の効果はコンサルタントのスキル・取扱業界・市場環境により異なります。

## 企業プロフィール

| 項目 | 内容 |
|------|------|
| 業態 | 有料職業紹介事業（厚生労働大臣許可番号あり）。IT・Web業界特化 |
| 代表 | 40代前半、大手人材紹介会社で10年勤務後に独立。3年目 |
| 所在地 | 東京都渋谷区（WeWork内） |
| 従業員 | 正社員5名（代表含む）。うちコンサルタント（CA兼RA）4名 |
| 取扱求人数 | 約800件（自社開拓300件＋求人データベース経由500件） |
| 登録求職者数 | 月間新規80名、アクティブ求職者300名 |
| 年間成約件数 | 48件（コンサルタント1人あたり月1件） |
| 平均紹介手数料 | 年収の30%（業界慣行）。平均決定年収550万円→手数料165万円/件 |
| 年商 | 約7,900万円 |
| 使用ツール | PORTERS（月15,000円×4ライセンス＝6万円/月）、Googleスプレッドシート、メール |
| 課題 | マッチング精度が低く推薦数が多いのに成約に繋がらない。面談調整に時間を取られる |

> **業界参考データ**: 人材紹介業の市場規模は2024年度で約4,500億円（出典: 矢野経済研究所「人材ビジネス市場に関する調査2024」）。有料職業紹介事業者数は約29,000事業所（出典: 厚生労働省「職業紹介事業報告書の集計結果 令和5年度」）。コンサルタント1人あたりの月間成約件数は、大手エージェントで月5〜8件、中小特化型で月1〜3件が一般的（出典: RECRUIT WORKS「人材紹介事業の生産性調査2024」）。

## 経営者の生の悩み（その業界の言葉で）

> 「うちのコンサルタント、1人あたり月に80名の求職者を担当して、面談して、求人をマッチングして、推薦して、面接調整して、クロージングまでやってる。でも成約は月1件。大手のリクルートエージェントやパーソルだと月5〜8件出してるのに。
>
> 何が問題かって、マッチングの精度。コンサルタントが800件の求人から手動で探してるんだけど、1人の求職者に対して平均30分かけて求人を選んでる。で、推薦しても書類通過率が20%くらい。業界平均は書類選考通過率30%前後（出典: リクルートエージェント「転職決定者データ分析2024」）。つまり、的外れな推薦をしてる。
>
> 面談調整も地獄。求職者と企業の日程を電話とメールで調整するのに、1件あたり平均5往復。1往復に半日かかるから、1件の面接設定に2〜3日かかる。コンサルタントの時間の30%が日程調整に消えてる。その間に候補者が他社エージェント経由で先に面接を受けて、うちの案件が後回しになることもある。
>
> PORTERSは入れてるけど、結局は求人と求職者の情報を手動で照合してる。AIでマッチングできないかって思うけど、求職者の『本音の転職理由』とか『カルチャーフィット』みたいな定性情報って、システムに入ってない。面談で聞いた内容がコンサルタントの頭の中にしかない。
>
> 先月も有望な候補者がいて、年収700万のバックエンドエンジニアなんだけど、本当の転職理由は『上司との関係性』で、カルチャー重視なんだよね。PORTERSのフィルタは『年収○万以上、勤務地○○、言語○○』みたいなスペック検索しかできないから、その人に合う"居心地のいい会社"は手動で探すしかない。結局3件推薦して全部落ちた。最初から合わない会社を推薦してしまった。」

## 現場のオペレーション（1日を分単位で描写）

### コンサルタントAさんの1日（CA兼RA、担当求職者80名）

| 時刻 | 作業内容 | 所要時間 |
|------|----------|----------|
| 9:00 | 出勤。PORTERSでタスク確認。本日の面談3件、推薦結果の確認、企業への報告。メールは未読47件 | 15分 |
| 9:15 | **メール処理**。求職者からの返信確認（「その求人、ちょっと年収が低いんですが…」→条件調整の交渉メール作成）、企業からの書類選考結果確認（「今回は見送りで…」→お見送り理由をヒアリングして次に活かす）、面接日程の調整メール（3件の候補日を提示→企業の人事からの返信待ち） | 45分 |
| 10:00 | **求職者面談①**（Zoom）。転職理由ヒアリング：「今の会社に不満はないけど、もっと技術的にチャレンジしたい」→本音を探る：「実は上司が変わってから評価制度に納得いかなくなった」。希望条件：年収600万以上、リモート可、自社開発、Goが書ける環境。スキル確認：Java 5年、Go 1年、AWSの経験あり。面談メモをPORTERSに記入（自由記述のテキスト欄に入力。構造化されていない） | 60分（面談45分＋メモ15分） |
| 11:00 | **マッチング作業①**。PORTERSで検索条件を入力：「業種:IT、職種:バックエンドエンジニア、年収:600万以上、勤務地:東京」→152件ヒット。ここから1件ずつ求人票を開いて、求職者に合うかを判断する。「この会社はSIer寄りだからスキルは合うけどカルチャーが合わない」「ここはGoを使ってるけど年収が550万で条件に届かない」…結局30分で5件に絞り、3件を推薦候補に | 30分 |
| 11:30 | **推薦資料作成①**。求職者の履歴書・職務経歴書を確認し、推薦先企業に合わせてアピールポイントを調整。推薦コメント記入：「Java歴5年のバックエンドエンジニアで、直近1年でGoへの移行プロジェクトを担当。自走型で…」 | 30分 |
| 12:00 | 昼休憩 | 60分 |
| 13:00 | **求職者面談②**（Zoom）。未経験からITに転職したい29歳。「営業を3年やったけど、プログラミングスクールに通ってポートフォリオを作った」→実務未経験者のマッチングは難易度が高い。800件中、未経験OKの求人は30件程度 | 60分 |
| 14:00 | **マッチング作業②**＋推薦資料作成 | 45分 |
| 14:45 | **面接日程調整**（3件分）。企業の人事に電話で候補日を3つ提示→「来週の火曜と木曜は埋まってるので、月曜か金曜で…」→求職者にメール→「金曜は別の面接が入ってしまったので、翌週でもいいですか？」→また企業に連絡→**1件の面接設定に3日かかることもザラ** | 30分 |
| 15:15 | **企業への電話フォロー**。書類選考中の案件2件について進捗確認。「人事部長の確認待ちで、来週中には結果を出します」→求職者に「もう少しお待ちください」と連絡 | 20分 |
| 15:35 | **求職者面談③**（Zoom）。現職がSES（客先常駐）で、「自社開発に行きたい」「もうSESには戻りたくない」が本音。年収は現状520万→600万を希望 | 60分 |
| 16:35 | **マッチング作業③**＋推薦資料作成 | 45分 |
| 17:20 | **面接結果の求職者へのフィードバック**。不合格の場合は理由の伝達（「コミュニケーション面でもう少し…」と企業から言われたが、求職者のモチベーションを下げない伝え方に苦心）＋次の求人提案 | 30分 |
| 17:50 | **スカウト送信**。ビズリーチやdodaの求人媒体で条件に合う求職者を検索し、スカウトメール10通送信。テンプレを微修正するだけなので返信率が低い（10%。業界のトップスカウターは20〜25%、出典: ビズリーチ「スカウト返信率データ2024」） | 40分 |
| 18:30 | **PORTERSのデータ更新**。本日の面談メモ、ステータス変更、次アクション設定。面談メモは自由記述なので「何が重要だったか」が後から読み返しにくい | 20分 |
| 18:50 | **翌日の準備**。面談予定の求職者の情報を事前確認 | 10分 |
| 19:00 | 退勤（のはず。月末は21時まで残業。内定承諾期限が迫っている案件のクロージングで求職者に夜電話することも） | -- |

### 1週間の時間配分（コンサルタント1人あたり）

| 業務 | 時間/週 | 構成比 |
|------|---------|--------|
| 求職者面談（CA業務） | 15h | 30% |
| マッチング・推薦資料作成 | 10h | 20% |
| 面接日程調整 | 7.5h | **15%** ← **ここがAI化の最大の効果** |
| 企業フォロー（RA業務） | 5h | 10% |
| スカウト送信 | 5h | 10% |
| PORTERS入力・メール処理 | 5h | 10% |
| 内定クロージング・退職交渉支援 | 2.5h | 5% |
| **合計** | **50h** | 100% |

### 会社全体のファネル（月間）

| ステップ | 件数 | 通過率 | 業界平均 |
|----------|------|--------|----------|
| スカウト送信 | 800通/月（4人×200通） | -- | -- |
| スカウト返信 | 80名（返信率10%） | 10% | 15〜20%（出典: ビズリーチ「スカウト返信率データ2024」） |
| 面談実施 | 60名（面談設定率75%） | 75% | 70〜80% |
| 求人推薦 | 180件（1人あたり3件×60名） | -- | -- |
| 書類選考通過 | 36件（通過率20%） | **20%** | **30%**（出典: リクルートエージェント「転職決定者データ分析2024」） |
| 一次面接通過 | 14件（通過率39%） | 39% | 40〜50% |
| 最終面接通過 | 7件（通過率50%） | 50% | 50〜60% |
| 内定承諾 | 4件（承諾率57%） | 57% | 60〜70% |

> 最大のボトルネックは**書類選考通過率20%**（業界平均30%を大きく下回る）。マッチング精度の低さが原因。書類選考通過率が30%に改善すれば、ファネル全体で月間成約が4件→5.5〜6件に増加する試算。

## ボトルネック分析

```
┌──────────────────────────────────────────────────────┐
│ ボトルネック1: マッチング精度の低さ                    │
│ ・800件の求人から手動で検索（1求職者あたり30分）       │
│ ・PORTERSのフィルタは業種/職種/年収/勤務地のみ        │
│   →「カルチャーフィット」「成長環境」「上司のタイプ」  │
│   「技術スタックの方向性」等の定性条件で絞れない       │
│ ・結果: 書類選考通過率20%（業界平均30%を下回る）       │
│ ・的外れな推薦 → 企業の信頼低下 → 求人の質が下がる悪循環│
├──────────────────────────────────────────────────────┤
│ ボトルネック2: 面談メモの属人化                        │
│ ・求職者の「本音の転職理由」「希望する企業カルチャー」が │
│   コンサルタントの頭の中にしかない                     │
│ ・PORTERSのメモ欄は自由記述→構造化されていない         │
│ ・他のコンサルタントが引き継ぎできない                  │
│ ・コンサルが退職すると、担当求職者の情報が消失          │
├──────────────────────────────────────────────────────┤
│ ボトルネック3: 面接日程調整の工数                      │
│ ・1件の面接設定に平均5往復（2〜3日）                   │
│ ・コンサルタントの時間の15%が日程調整に消える           │
│ ・調整中にタイミングを逸して求職者が他社で決まるケースも │
│ ・「日程調整している間にオファーが出てしまった」        │
├──────────────────────────────────────────────────────┤
│ ボトルネック4: スカウトの効率                          │
│ ・求人媒体で1通ずつ手動送信（月200通/人）              │
│ ・スカウト文面のパーソナライズが不十分                  │
│ ・テンプレの微修正だけ→「あなたの経験に興味があります」│
│   的な没個性な文面→返信率10%（業界平均15-20%に対して低い）│
└──────────────────────────────────────────────────────┘
```

## 導入による経営インパクト（Before/After表、ROI計算）

### Before/After比較

| 指標 | Before | After | 改善率 |
|------|--------|-------|--------|
| 書類選考通過率 | 20% | 30% | **+10pt** |
| マッチング作業時間 | 30分/求職者 | 5分/求職者（AI提案の確認のみ） | **83%削減** |
| 面接日程調整 | 5往復/2〜3日 | 自動調整/当日確定 | **90%削減** |
| コンサルタントの日程調整時間 | 7.5h/週 | 1h/週 | **87%削減** |
| 月間成約件数（全社） | 4件 | 5.5件 | **+1.5件/月** |
| 年間売上 | 7,900万円 | 1億990万円 | **39%増** |
| コンサルタント1人あたり月間成約 | 1件 | 1.375件 | **+38%** |
| スカウト返信率 | 10% | 16% | **+6pt** |
| 面談メモの構造化率 | 0%（自由記述） | 100%（AI自動構造化） | -- |

### ROI計算 — 3シナリオ（年間）

| 項目 | 保守的 | 標準 | 楽観 |
|------|--------|------|------|
| **コスト（共通）** | | | |
| AIマッチング＋面談要約システム構築費（初期） | 200万円 | 200万円 | 200万円 |
| Claude API利用料（月間推定） | 月2.5万×12=30万 | 月3.5万×12=42万 | 月5万×12=60万 |
| 月額運用・保守費 | 月5万×12=60万 | 月5万×12=60万 | 月5万×12=60万 |
| **初年度コスト合計** | **290万円** | **302万円** | **320万円** |
| | | | |
| **リターン** | | | |
| 成約件数増加 | 月1件増×165万×12ヶ月=**1,980万** | 月1.5件増×165万×12ヶ月=**2,970万** | 月2件増×165万×12ヶ月=**3,960万** |
| コンサルの時間創出（日程調整削減→面談数増加） | （成約増に内包） | （成約増に内包） | （成約増に内包） |
| **初年度リターン合計** | **1,980万円** | **2,970万円** | **3,960万円** |
| | | | |
| **初年度ROI** | **683%** | **983%** | **1,238%** |
| **回収期間** | **約1.8ヶ月** | **約1.2ヶ月** | **約1ヶ月** |

> **ROI計算の根拠と注意点:**
>
> 人材紹介業のROIが高く見える理由は、**1件あたりの成約単価（165万円）が非常に高い**ため。月1件の成約増でも年1,980万円のリターンになる。ただし、この計算には以下の前提がある:
>
> 1. **書類選考通過率の改善が成約増に直結する前提**: 書類通過率が20%→30%に改善しても、一次面接・最終面接・内定承諾の各ステップで脱落する。ファネル全体で試算すると月1〜2件の成約増が現実的なレンジ
> 2. **AIマッチングの精度が十分に高い前提**: 導入初期は学習データが少なく精度が低い可能性がある。3〜6ヶ月の運用でデータが蓄積されてから効果が出始める
> 3. **コンサルタントが空いた時間を面談に振り向ける前提**: 日程調整の6.5h/週が削減されても、その時間で面談を増やす運用変更が必要
>
> **提案時の推奨**: クライアントには**保守的シナリオ（月1件増、ROI 683%）で提案**する。「ROIが高すぎると怪しい」と感じる経営者は多いので、「月1件の成約増は現実的なラインです。書類通過率を10pt改善すれば、ファネル全体で月1件は確実に増えます」という控えめな説明が信頼を得る。

## 自動化の全体設計（Mermaidアーキテクチャ図）

```mermaid
graph TB
    subgraph "求職者タッチポイント"
        SC[スカウト<br/>ビズリーチ/doda等]
        WEB[自社LP<br/>登録フォーム]
        REF[リファラル]
    end

    subgraph "AIマッチングエンジン（Claude API）"
        TR[面談音声<br/>文字起こし+要約AI]
        PP[求職者プロファイル<br/>構造化エンジン]
        JA[求人票<br/>構造化エンジン]
        ME[マッチングAI<br/>ベクトル類似度+ルール]
        SS[スカウト文面<br/>生成AI]
    end

    subgraph "業務自動化"
        CA[カレンダー連携<br/>面接日程自動調整]
        NF[ステータス通知<br/>自動メール/LINE Push]
        RP[推薦コメント<br/>自動生成]
    end

    subgraph "データストア"
        PT[PORTERS<br/>既存CRM]
        VDB[(ベクトルDB<br/>pgvector)]
        DB[(PostgreSQL<br/>マッチングログ)]
    end

    subgraph "ダッシュボード"
        DS[KPIダッシュボード<br/>ファネル分析]
    end

    SC --> PP
    WEB --> PP
    REF --> PP
    PP -->|プロファイル| VDB
    TR -->|面談サマリ| PP
    JA -->|求人ベクトル| VDB
    VDB --> ME
    ME -->|Top10求人候補| PT
    ME -->|マッチングスコア| DS
    SS -->|パーソナライズ文面| SC
    PT --> CA
    CA -->|Googleカレンダー API| NF
    ME --> RP
    RP -->|推薦コメント案| PT
    DB --> DS
```

### フェーズ分け

| Phase | 期間 | 内容 | 投資 |
|-------|------|------|------|
| **Phase 1** | 1〜2ヶ月目 | 面談音声の自動文字起こし＋Claude API要約＋求職者プロファイル構造化 | 80万円 |
| **Phase 2** | 3〜4ヶ月目 | 求人票のベクトル化＋AIマッチングエンジン＋推薦コメント自動生成 | 80万円 |
| **Phase 3** | 5〜6ヶ月目 | 面接日程自動調整＋スカウト文面AI生成＋KPIダッシュボード | 40万円 |

## 構築手順（実際に動くコード付き）

### Step 1: プロジェクト初期セットアップ

```bash
# プロジェクト作成
mkdir staffing-ai && cd staffing-ai
npm init -y
npm install @anthropic-ai/sdk pg dotenv googleapis

# .env.example
cat << 'EOF' > .env.example
# Claude API（Anthropic）
ANTHROPIC_API_KEY=sk-ant-xxx

# PostgreSQL + pgvector
DATABASE_URL=postgresql://user:pass@localhost:5432/staffing_ai

# Google Calendar API
GOOGLE_SERVICE_ACCOUNT_KEY=./credentials/service-account.json

# PORTERS API（オプション）
PORTERS_API_URL=https://api.porters.jp/v1
PORTERS_API_KEY=your_api_key
EOF
```

**つまずきポイント（Step 1）:**
- Anthropic APIキーは https://console.anthropic.com/ から取得。初期クレジット$5が付与される。人材紹介の面談要約1件あたりのAPI料金は約$0.05〜0.15（Claude 3.5 Sonnetの場合。面談45分の文字起こしテキスト約3,000〜5,000トークン）
- pgvectorのインストール: PostgreSQL 15以上で `CREATE EXTENSION vector;` を実行。Supabaseなら最初から利用可能
- Google Calendar APIのサービスアカウントキーは Google Cloud Console > APIs & Services > Credentials から作成。求職者と企業のカレンダーを参照するためにはカレンダーの共有設定が必要

### Step 2: 面談音声の自動文字起こし＋Claude APIで構造化要約

```javascript
// transcribe-meeting.js — 面談音声をWhisperで文字起こし → Claude APIで構造化要約
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 面談音声ファイルを文字起こし（OpenAI Whisper API）
// ※ 文字起こしはWhisperが業界標準。Claude APIは音声入力非対応のため、文字起こしのみWhisper使用
async function transcribeMeeting(audioFilePath) {
  const formData = new FormData();
  formData.append('file', new Blob([fs.readFileSync(audioFilePath)]));
  formData.append('model', 'whisper-1');
  formData.append('language', 'ja');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'segment');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Whisper API エラー: ${res.status}`);
  }

  const data = await res.json();
  return data.text;
}

// 文字起こしテキストをClaude APIで構造化要約
async function structureMeetingNotes(transcript) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    temperature: 0.1,
    messages: [
      {
        role: 'user',
        content: `あなたは人材紹介会社のキャリアコンサルタントのアシスタントです。
面談の文字起こしテキストから、以下のJSON構造で求職者プロファイルを抽出してください。

**重要なルール:**
- 面談中に明示的に言及されなかった項目はnullにしてください
- 推測で埋めないでください
- 「本音の転職理由」と「建前の転職理由」を区別してください
- カルチャーフィットに関する情報（働き方の好み、上司との関係性の希望、チームの雰囲気の好み）を丁寧に拾ってください

出力フォーマット（JSON）:
{
  "basic_info": {
    "current_company": "現在の会社名（伏せている場合は業界+規模で記述）",
    "current_position": "現職",
    "years_of_experience": "経験年数（数値）",
    "skills": ["スキル1", "スキル2"],
    "certifications": ["資格1"],
    "education": "最終学歴"
  },
  "motivation": {
    "official_reason": "建前の転職理由",
    "real_reason": "本音の転職理由（面談で探れた範囲）",
    "priority_factors": ["優先する条件1", "条件2", "条件3"],
    "deal_breakers": ["絶対にNGな条件1", "条件2"],
    "timeline": "転職希望時期（すぐ/3ヶ月以内/半年以内/いい話があれば）"
  },
  "preferences": {
    "desired_industry": ["希望業界"],
    "desired_role": ["希望職種"],
    "salary_range": { "min": 数値, "max": 数値, "current": 数値 },
    "work_style": "リモート/出社/ハイブリッド",
    "overtime_tolerance": "残業への許容度",
    "company_size": "大手/ベンチャー/メガベンチャー/どちらでも",
    "culture_fit": "求める企業カルチャーの特徴（具体的に）",
    "management_style": "好む上司のタイプ（裁量型/伴走型等）",
    "team_preference": "チームの雰囲気の好み"
  },
  "assessment": {
    "strengths": ["強み1", "強み2"],
    "concerns": ["懸念点1（面接でネックになりそうなポイント）"],
    "market_value": "市場価値の所感（年収レンジの妥当性）",
    "urgency": "high/medium/low（転職の緊急度）",
    "commitment_level": "high/medium/low（転職への本気度）",
    "consultant_notes": "コンサルタントとしての所感（この人にはこういう提案が刺さりそう等）"
  }
}

以下の面談文字起こしから求職者プロファイルを抽出してください:

${transcript}`
      }
    ],
  });

  // Claude APIのレスポンスからJSONを抽出
  const responseText = message.content[0].text;

  // JSONブロックを抽出（```json ... ``` or 直接JSON）
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                    responseText.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    throw new Error('Claude APIのレスポンスからJSONを抽出できませんでした');
  }

  return JSON.parse(jsonMatch[1]);
}

// 面談サマリの保存
async function saveMeetingProfile(candidateId, transcript, profile, pool) {
  // Embeddingを生成（プロファイルのテキスト表現からベクトルを作成）
  const profileText = buildProfileText(profile);
  const embedding = await generateEmbedding(profileText);

  await pool.query(
    `INSERT INTO candidate_profiles (candidate_id, structured_profile, embedding, transcript)
     VALUES ($1, $2, $3::vector, $4)
     ON CONFLICT (candidate_id) DO UPDATE
     SET structured_profile = $2, embedding = $3::vector, transcript = $4, updated_at = NOW()`,
    [candidateId, JSON.stringify(profile), JSON.stringify(embedding), transcript]
  );

  console.log(`求職者プロファイル保存完了: ${candidateId}`);
}

// プロファイルからテキスト表現を構築（Embedding用）
function buildProfileText(profile) {
  const parts = [];

  if (profile.basic_info) {
    parts.push(`現職: ${profile.basic_info.current_position || ''}`);
    parts.push(`スキル: ${(profile.basic_info.skills || []).join(', ')}`);
    parts.push(`経験年数: ${profile.basic_info.years_of_experience || ''}年`);
  }

  if (profile.motivation) {
    parts.push(`転職理由: ${profile.motivation.real_reason || profile.motivation.official_reason || ''}`);
    parts.push(`優先条件: ${(profile.motivation.priority_factors || []).join(', ')}`);
    parts.push(`NGポイント: ${(profile.motivation.deal_breakers || []).join(', ')}`);
  }

  if (profile.preferences) {
    parts.push(`希望業界: ${(profile.preferences.desired_industry || []).join(', ')}`);
    parts.push(`希望職種: ${(profile.preferences.desired_role || []).join(', ')}`);
    const salary = profile.preferences.salary_range;
    if (salary) parts.push(`年収希望: ${salary.min}万〜${salary.max}万`);
    parts.push(`勤務形態: ${profile.preferences.work_style || ''}`);
    parts.push(`企業規模: ${profile.preferences.company_size || ''}`);
    parts.push(`カルチャー: ${profile.preferences.culture_fit || ''}`);
    parts.push(`上司のタイプ: ${profile.preferences.management_style || ''}`);
  }

  return parts.filter(Boolean).join('\n');
}

// Embedding生成（Voyager embedding model を使用）
// Claude APIにはEmbedding機能がないため、Voyager (voyage-3) を使用
// 代替: OpenAI text-embedding-3-small, Cohere embed-multilingual-v3.0
async function generateEmbedding(text) {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'voyage-3',
      input: text,
      input_type: 'document',
    }),
  });

  if (!res.ok) {
    throw new Error(`Voyage Embedding APIエラー: ${res.status}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

export { transcribeMeeting, structureMeetingNotes, saveMeetingProfile, generateEmbedding, buildProfileText };
```

**つまずきポイント（Step 2）:**
- **Claude APIには音声入力機能がない**（2026年3月時点）。文字起こしはOpenAI Whisper APIを使う。Whisperの料金は$0.006/分なので、45分の面談で$0.27。月60件面談しても月$16.2
- Claude APIのレスポンスがJSON形式になるとは限らない。````json ... ```  ` で囲まれる場合と直接JSONが返る場合がある。パースエラーに備えて正規表現で抽出する
- **Embeddingの選択**: Claude APIにはEmbedding機能がないため、Voyage AI（Anthropicの推奨パートナー）の `voyage-3` を使用。日本語の精度は `voyage-3` が最も高い（2025年時点）。代替としてOpenAIの `text-embedding-3-small` も使用可能（$0.02/1M tokens）
- `temperature: 0.1` にすることで、毎回安定した構造化出力を得る。面談要約では創造性より正確性が重要

### Step 3: 求人票のベクトル化＋マッチングエンジン

```javascript
// matching-engine.js — 求人票と求職者プロファイルのベクトルマッチング
import Anthropic from '@anthropic-ai/sdk';
import pg from 'pg';
import dotenv from 'dotenv';
import { generateEmbedding, buildProfileText } from './transcribe-meeting.js';

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// ── 求人票をベクトル化してDBに保存 ──
async function vectorizeJobPosting(jobId, jobData) {
  // 求人票の特徴を自然言語で記述（マッチングの「鍵」になるテキスト）
  const jobDescription = [
    `業界: ${jobData.industry}`,
    `職種: ${jobData.role}`,
    `ポジション: ${jobData.position}`,
    `年収: ${jobData.salary_min}万〜${jobData.salary_max}万`,
    `勤務地: ${jobData.location}`,
    `勤務形態: ${jobData.work_style}`,
    `企業規模: ${jobData.company_size}人`,
    `企業カルチャー: ${jobData.culture}`,
    `マネジメントスタイル: ${jobData.management_style || ''}`,
    `チームの雰囲気: ${jobData.team_atmosphere || ''}`,
    `必須スキル: ${(jobData.required_skills || []).join(', ')}`,
    `歓迎スキル: ${(jobData.preferred_skills || []).join(', ')}`,
    `求める人物像: ${jobData.ideal_candidate}`,
    `この求人の魅力: ${jobData.appeal_points}`,
    `キャリアパス: ${jobData.career_path || ''}`,
    `残業時間: ${jobData.overtime_hours || ''}時間/月`,
    `リモート頻度: ${jobData.remote_frequency || ''}`,
  ].filter(line => !line.endsWith(': ')).join('\n');

  // Embedding生成
  const embedding = await generateEmbedding(jobDescription);

  // pgvectorで保存
  await pool.query(
    `INSERT INTO job_vectors (job_id, description, embedding, metadata)
     VALUES ($1, $2, $3::vector, $4)
     ON CONFLICT (job_id) DO UPDATE SET
       description = $2, embedding = $3::vector, metadata = $4, updated_at = NOW()`,
    [jobId, jobDescription, JSON.stringify(embedding), JSON.stringify(jobData)]
  );

  console.log(`求人ベクトル保存: ${jobId} (${jobData.position})`);
}

// ── 求職者プロファイルから上位マッチ求人を取得 ──
async function findMatchingJobs(candidateProfile, topK = 10) {
  // 求職者プロファイルのテキスト表現を構築
  const candidateText = buildProfileText(candidateProfile);

  // Embedding生成
  const embedding = await generateEmbedding(candidateText);

  // pgvectorでコサイン類似度検索
  const result = await pool.query(
    `SELECT job_id, description, metadata,
            1 - (embedding <=> $1::vector) AS similarity
     FROM job_vectors
     WHERE 1 - (embedding <=> $1::vector) > 0.65
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [JSON.stringify(embedding), topK]
  );

  console.log(`マッチング候補: ${result.rows.length}件（類似度0.65以上）`);
  return result.rows;
}

// ── Claude APIによるマッチング理由の生成（実務的な観点で） ──
async function generateMatchAnalysis(candidateProfile, jobData) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: `あなたは人材紹介会社のベテランマッチングアドバイザーです（実務経験10年）。
求職者プロファイルと求人情報を比較し、以下を実務的な観点で出力してください。

**出力フォーマット:**

## マッチ度: [1-100]点

## マッチする理由（3つ、企業の人事が「会ってみたい」と思えるポイント）
1.
2.
3.

## ミスマッチの可能性（面接で聞かれそうなこと＋懸念点）
-

## 推薦時に企業に伝えるべきポイント（推薦状の下書きになるレベルで）

## 面接対策のアドバイス（求職者に伝えること）

## コンサルタントへの注意（この推薦を進めるべきか、止めるべきか）

---

求職者プロファイル:
${JSON.stringify(candidateProfile, null, 2)}

求人情報:
${JSON.stringify(jobData, null, 2)}`
      }
    ],
  });

  return message.content[0].text;
}

// ── 推薦コメント自動生成 ──
async function generateRecommendationComment(candidateProfile, jobData) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    temperature: 0.4,
    messages: [
      {
        role: 'user',
        content: `あなたは人材紹介会社のキャリアコンサルタントです。
以下の求職者を企業に推薦するための推薦コメントを作成してください。

**ルール:**
- 企業の人事担当者が読む前提で、ビジネスライクかつ熱量のある文体
- 300文字以内
- 求職者の強みと、この求人に合う理由を具体的に
- 「なぜこの人がこの会社で活躍できるか」のストーリー
- 転職理由は建前寄りに書く（本音は書かない）
- AI生成であることは明記しない

求職者:
${JSON.stringify(candidateProfile, null, 2)}

推薦先求人:
${JSON.stringify(jobData, null, 2)}`
      }
    ],
  });

  return message.content[0].text;
}

// ── マッチングの実行（1求職者に対してTop10を提案） ──
async function runMatchingForCandidate(candidateId) {
  // 求職者プロファイルを取得
  const { rows: [candidate] } = await pool.query(
    'SELECT structured_profile FROM candidate_profiles WHERE candidate_id = $1',
    [candidateId]
  );

  if (!candidate) {
    throw new Error(`求職者 ${candidateId} のプロファイルが見つかりません`);
  }

  const profile = candidate.structured_profile;

  // ベクトル類似度でTop10を取得
  const matches = await findMatchingJobs(profile, 10);

  // 各候補に対してClaude APIでマッチ分析
  const results = [];
  for (const match of matches) {
    const analysis = await generateMatchAnalysis(profile, match.metadata);

    // マッチ度スコアを抽出
    const scoreMatch = analysis.match(/マッチ度:\s*(\d+)/);
    const aiScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

    // マッチングログに保存
    await pool.query(
      `INSERT INTO matching_logs (candidate_id, job_id, similarity_score, ai_match_score, match_reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [candidateId, match.job_id, match.similarity, aiScore, analysis]
    );

    results.push({
      jobId: match.job_id,
      similarity: match.similarity,
      aiScore,
      analysis,
      jobData: match.metadata,
    });

    // Claude APIのレート制限対策（Tier 1: 50 RPM）
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // AIスコアの高い順にソート
  results.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

  console.log(`マッチング完了 (${candidateId}): ${results.length}件`);
  return results;
}

export { vectorizeJobPosting, findMatchingJobs, generateMatchAnalysis, generateRecommendationComment, runMatchingForCandidate };
```

**つまずきポイント（Step 3）:**
- **ベクトル検索の閾値（0.65）は調整が必要**。高すぎると候補が少なくなり、低すぎるとノイズが増える。最初は0.6で広めに取り、運用しながら0.65〜0.75に調整するのがよい
- Claude APIのレート制限: Tier 1（初期）は50 RPM（リクエスト/分）。1求職者あたりTop10のマッチ分析で10リクエスト消費するため、1.5秒のウェイトを入れている。Tier 2以上にアップグレードするとレート制限が緩和される
- **pgvectorのインデックス**: 求人が1,000件以下ならシーケンシャルスキャンで十分高速。1,000件超ならIVFFlat、10,000件超ならHNSWインデックスに切り替えること。`CREATE INDEX ON job_vectors USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);`

### Step 4: 面接日程自動調整（Googleカレンダー連携）

```javascript
// schedule-interview.js — 面接日程の自動調整
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || './credentials/service-account.json',
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

// 企業の人事担当と求職者の空き時間を自動照合
async function findAvailableSlots(
  companyCalendarId,  // 企業人事のGoogleカレンダーID
  candidateEmail,     // 求職者のメールアドレス
  daysAhead = 7,      // 何日先まで探すか
  duration = 60       // 面接時間（分）
) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + daysAhead);

  // 両者のFreeBusy情報を取得
  let freeBusy;
  try {
    freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: end.toISOString(),
        timeZone: 'Asia/Tokyo',
        items: [
          { id: companyCalendarId },
          { id: candidateEmail },
        ],
      },
    });
  } catch (error) {
    // 求職者のカレンダーが共有されていない場合は、企業側の空きだけで候補を出す
    if (error.code === 404 || error.code === 403) {
      console.warn(`求職者のカレンダーにアクセスできません。企業側の空きのみで候補を作成します。`);
      freeBusy = await calendar.freebusy.query({
        requestBody: {
          timeMin: now.toISOString(),
          timeMax: end.toISOString(),
          timeZone: 'Asia/Tokyo',
          items: [{ id: companyCalendarId }],
        },
      });
    } else {
      throw error;
    }
  }

  const companyBusy = freeBusy.data.calendars[companyCalendarId]?.busy || [];
  const candidateBusy = freeBusy.data.calendars[candidateEmail]?.busy || [];

  // 空き枠を計算（平日10:00-18:00の中で、両者とも空いている時間帯）
  const slots = [];
  const current = new Date(now);
  current.setHours(10, 0, 0, 0);
  if (current < now) current.setDate(current.getDate() + 1);

  while (current < end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 平日のみ
      for (let hour = 10; hour <= 17; hour++) {
        const slotStart = new Date(current);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        if (slotEnd.getHours() > 18) continue;

        const isCompanyFree = !companyBusy.some(b =>
          new Date(b.start) < slotEnd && new Date(b.end) > slotStart
        );
        const isCandidateFree = !candidateBusy.some(b =>
          new Date(b.start) < slotEnd && new Date(b.end) > slotStart
        );

        if (isCompanyFree && isCandidateFree) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label: `${slotStart.getMonth()+1}/${slotStart.getDate()}（${'日月火水木金土'[slotStart.getDay()]}） ${hour}:00-${hour+1}:00`,
          });
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return slots.slice(0, 5); // 候補を5枠まで返す
}

// 面接予定をカレンダーに登録
async function createInterviewEvent(
  companyCalendarId,
  candidateEmail,
  slot,
  interviewDetails
) {
  try {
    const event = await calendar.events.insert({
      calendarId: companyCalendarId,
      requestBody: {
        summary: `【面接】${interviewDetails.candidateName} x ${interviewDetails.companyName}`,
        description: [
          `求職者: ${interviewDetails.candidateName}`,
          `企業: ${interviewDetails.companyName}`,
          `ポジション: ${interviewDetails.position}`,
          `面接形式: ${interviewDetails.format}（オンライン/対面）`,
          `面接官: ${interviewDetails.interviewerName || '未定'}`,
          `担当コンサルタント: ${interviewDetails.consultantName}`,
          '',
          '--- 面接メモ ---',
          interviewDetails.interviewNotes || '',
          '',
          '※ この予定は自動作成されました。変更がある場合は担当コンサルタントにご連絡ください。',
        ].join('\n'),
        start: { dateTime: slot.start, timeZone: 'Asia/Tokyo' },
        end: { dateTime: slot.end, timeZone: 'Asia/Tokyo' },
        attendees: [
          { email: candidateEmail },
          { email: interviewDetails.companyHrEmail },
          { email: interviewDetails.consultantEmail },
        ],
        conferenceData: interviewDetails.format === 'オンライン' ? {
          createRequest: {
            requestId: `interview-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        } : undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 1日前
            { method: 'popup', minutes: 60 },    // 1時間前
          ],
        },
      },
      conferenceDataVersion: interviewDetails.format === 'オンライン' ? 1 : 0,
      sendUpdates: 'all', // 出席者全員に通知メール送信
    });

    console.log(`面接予定作成: ${event.data.htmlLink}`);
    return event.data;
  } catch (error) {
    console.error('面接予定作成エラー:', error.message);
    throw error;
  }
}

export { findAvailableSlots, createInterviewEvent };
```

**つまずきポイント（Step 4）:**
- **求職者のGoogleカレンダーが共有されていない場合が多い**。FreeBusy APIは共有設定がないと403エラーになる。その場合は企業側の空きだけで候補日を出し、求職者にメールで確認するフォールバックが必要
- Google Meet のリンク自動生成には `conferenceDataVersion: 1` が必要。Google Workspace のドメイン設定でMeetの作成が許可されている必要がある
- **求職者が現職中の場合**: 面接時間帯は「平日18:00以降」や「昼休み（12:00-13:00）」を含めるオプションが必要。現職の同僚にバレないよう配慮する

### Step 5: スカウト文面のAI生成

```javascript
// scout-generator.js — 求職者に合わせたパーソナライズスカウト文面生成
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateScoutMessage(candidateInfo, jobData) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: `あなたは人材紹介会社のキャリアコンサルタントです。
求職者のプロフィールと求人情報を元に、スカウトメールを作成してください。

**ルール:**
- 300文字以内（ビズリーチのスカウトメールの最適な長さ）
- 相手の経歴を具体的に引用し「あなただからこそ声をかけた」と感じさせる
  （例: 「SaaS企業でのバックエンド開発3年のご経験に注目しました」）
- 具体的な求人名・企業名は伏せる（「急成長中のSaaS企業」「IT業界のリーディングカンパニー」等の表現）
- 年収は「現年収＋50〜100万円」を示唆（露骨に書かず「キャリアアップに見合った条件」等）
- CTAは「まずは15分のカジュアルな情報交換から」
- 営業色を出しすぎない。キャリアの相談に乗るスタンス
- テンプレ感を出さない。この人にしか送れない文面に

**避けるべき表現:**
- 「突然のご連絡失礼します」（テンプレ感）
- 「あなたのご経験に興味があり」（具体性ゼロ）
- 「弊社のクライアント企業」（紹介会社感が強すぎる）

求職者プロフィール:
${JSON.stringify(candidateInfo, null, 2)}

提案したい求人:
${JSON.stringify(jobData, null, 2)}`
      }
    ],
  });

  return message.content[0].text;
}

// バッチでスカウト文面を生成（1日分）
async function generateBatchScoutMessages(candidateJobPairs) {
  const results = [];

  for (const { candidate, job } of candidateJobPairs) {
    try {
      const scoutMessage = await generateScoutMessage(candidate, job);
      results.push({
        candidateId: candidate.id,
        jobId: job.id,
        message: scoutMessage,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`スカウト文面生成エラー (${candidate.id}):`, error.message);
    }

    // レート制限対策
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return results;
}

export { generateScoutMessage, generateBatchScoutMessages };
```

**つまずきポイント（Step 5）:**
- `temperature: 0.7` で適度なバリエーションを出す。毎回同じ文面だとテンプレ感が出るため
- ビズリーチのスカウトメールは300文字前後が最も返信率が高い（出典: ビズリーチ「スカウト返信率データ2024」）。長すぎると読まれない
- スカウト文面は**必ずコンサルタントが最終チェック**してから送信。AIが不適切な表現（年齢や性別に言及する表現等）を生成するリスクがある

### Step 6: DB初期セットアップ（pgvector）

```sql
-- schema.sql — PostgreSQL + pgvector

CREATE EXTENSION IF NOT EXISTS vector;

-- 求人ベクトルテーブル
CREATE TABLE job_vectors (
    job_id VARCHAR(50) PRIMARY KEY,
    porters_job_id VARCHAR(50),          -- PORTERSの求人ID
    description TEXT NOT NULL,
    embedding vector(1024) NOT NULL,      -- voyage-3は1024次元
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 求職者プロファイルテーブル
CREATE TABLE candidate_profiles (
    candidate_id VARCHAR(50) PRIMARY KEY,
    porters_id VARCHAR(50),              -- PORTERSの求職者ID
    structured_profile JSONB NOT NULL,   -- Claude APIで構造化された面談メモ
    embedding vector(1024),              -- voyage-3は1024次元
    transcript TEXT,                      -- 面談の文字起こし原文
    recording_consent BOOLEAN DEFAULT false, -- 録音同意フラグ
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- マッチングログ
CREATE TABLE matching_logs (
    id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(50) REFERENCES candidate_profiles(candidate_id),
    job_id VARCHAR(50) REFERENCES job_vectors(job_id),
    similarity_score FLOAT,
    ai_match_score INT,                  -- Claude AIが付けた1-100スコア
    match_reason TEXT,                   -- Claude AIのマッチ分析全文
    consultant_approved BOOLEAN DEFAULT NULL, -- コンサルタントの承認
    consultant_feedback TEXT,            -- コンサルタントのフィードバック（AIの精度向上に使用）
    recommended_at TIMESTAMP,
    document_pass BOOLEAN DEFAULT NULL,  -- 書類選考通過したか（結果トラッキング）
    interview_pass BOOLEAN DEFAULT NULL, -- 面接通過したか
    offer_accepted BOOLEAN DEFAULT NULL, -- 内定承諾したか
    created_at TIMESTAMP DEFAULT NOW()
);

-- スカウトログ
CREATE TABLE scout_logs (
    id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(50),
    job_id VARCHAR(50),
    scout_message TEXT,
    platform VARCHAR(30),                -- bizreach / doda / greenなど
    sent_at TIMESTAMP,
    replied BOOLEAN DEFAULT false,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AIバイアス監査テーブル（定期的に集計してバイアスを検出）
CREATE TABLE bias_audit (
    id SERIAL PRIMARY KEY,
    audit_date DATE NOT NULL,
    metric_name VARCHAR(50),             -- gender_score_diff / age_score_diff 等
    metric_value FLOAT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX ON job_vectors USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX ON candidate_profiles USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_matching_logs_candidate ON matching_logs(candidate_id);
CREATE INDEX idx_matching_logs_job ON matching_logs(job_id);
CREATE INDEX idx_matching_logs_approved ON matching_logs(consultant_approved);
```

**つまずきポイント（Step 6）:**
- **HNSWインデックスとIVFFlatインデックスの選択**: 求人件数が1,000件以下ならインデックスなしでも十分。1,000〜10,000件ならIVFFlat（ビルド速い、検索速度中程度）、10,000件超ならHNSW（ビルド遅い、検索速い）。人材紹介の800件ならHNSWを先に入れておいても問題ない
- `consultant_approved` と `document_pass` のカラムは**AIの精度評価に使う**。「AIがスコア80以上を付けた求人の書類通過率」を集計して、AIの閾値を調整する
- `bias_audit` テーブルは職業安定法への対応。AIが性別・年齢でスコアリングに偏りを出していないか、月次で監査する

## 提案トークスクリプト

### 初回アプローチ（3分）

> 「社長、お忙しいところすみません。POST CABINETSの○○です。
>
> IT特化の人材紹介会社さんに、**AIマッチングで書類選考通過率を20%から30%に上げた事例**をお伝えしています。
>
> 社長のところのコンサルタントさん、1人あたり月何件くらい成約されてますか？ … 月1件ですか。そこを1.3〜1.5件にできる話なんですが、3分だけいいですか？」

### 課題の深掘り（5分）

> 「月1件ということは、年間48件で売上8,000万くらいですよね。リクルートエージェントだとコンサルタント1人月5〜8件ですが、中小特化型だと月1〜2件が現実ですよね（リクルートワークス研究所の2024年調査データ）。
>
> ボトルネックはどこだと感じてますか？ … マッチングですか。800件の求人から手動で探すのって、1人の求職者に何分かかってます？ … 30分。月60人面談するとして、マッチングだけで月30時間。それで書類通過率って何%くらいですか？ … 20%。業界平均が30%なので、10ポイント分の改善余地がありますね。
>
> もう1つ聞いていいですか。面接の日程調整って、1件あたり何往復くらいかかります？ … 5往復。それ、コンサルタントの時間の15%が日程調整に消えてるってことですよね。その間に候補者が他社で決まったことはありますか？ … ありますか。それが一番もったいないですよね。」

### 提案の骨子（3分）

> 「やることは3つです。
>
> 1. **面談の自動要約＋プロファイル構造化**。面談をZoomで録画して、AIが文字起こしして、求職者の『本音の転職理由・優先条件・NGポイント・カルチャー希望・上司のタイプの好み』を自動で構造化します。PORTERSのフリーテキストメモが、検索可能な構造データになります。
>
> 2. **AIマッチング**。800件の求人と求職者プロファイルをベクトル化して、スペックだけでなく「カルチャーフィット」「キャリアの方向性」も含めた類似度で上位10件を自動提案。コンサルタントはAIの提案を確認して、推薦するかどうかを判断するだけ。30分の作業が5分になります。
>
> 3. **面接日程の自動調整**。Googleカレンダーの空き時間を自動照合して、候補日を3〜5つ提示。5往復が1往復で済みます。
>
> **初期費用200万円、月額8万円**。保守的に見ても月1件の成約増で年間1,980万円の売上増です。投資回収は**2ヶ月以内**です。ただ、ROIの数字だけ見ると高すぎて逆に怪しいと思われるかもしれません。これは人材紹介業の成約単価（165万円/件）が高いからです。やることはシンプルで、書類通過率を10pt改善して月1件増やすだけです。」

## 法規制・業界特有のリスク

### 1. 職業安定法とAI利用

- 有料職業紹介事業者がAIマッチングを利用すること自体は**禁止されていない**
- **2022年10月の改正職業安定法**:
  - 求人メディア等について**届出制**が創設。AIによるレコメンドサービスにも適用される場合がある
  - **「募集情報等提供事業者」**に該当する場合は届出が必要。自社の紹介事業内でのAI利用は該当しない場合が多いが、AIマッチングをSaaSとして外部提供する場合は確認が必要
- **2024年4月の改正**:
  - **「従事すべき業務の変更の範囲」「就業場所の変更の範囲」**が求人票の必須記載事項に追加。AIが求人票を解析する際にもこれらの項目を考慮に入れる
  - **労働条件の明示義務の拡大**: 有期雇用の更新上限、無期転換ルールも明示必要
- **AIバイアスへの対応**（最重要）:
  - AIマッチングの結果が**差別的取扱い**に該当しないよう注意。性別、年齢、国籍、障害の有無等でスコアリングしないこと
  - 学習データに偏りがないか**月次で検証**する義務がある（bias_auditテーブルで管理）
  - 具体的な監査方法: 「男性と女性で同じスキル・経験の場合にマッチスコアに有意差がないか」「35歳以上と以下で通過率に差がないか」をt検定で検証

### 2. 個人情報保護法

- 求職者の面談音声・文字起こしデータは**個人情報**に該当。AIによる自動プロファイリングは**個人情報の自動処理**にあたり、**利用目的の通知＋本人同意**が必要
- 面談録音の前に「AIによる文字起こし・分析のために録音させていただきます」と**明示的な同意**を取得すること。同意を取得できなかった場合はAI分析を行わず、従来のPORTERS手動入力にフォールバック
- Claude API（Anthropic社）に送信する面談データについて: Anthropic社のAPI利用規約では、API経由のデータはモデル学習に使用されない。プライバシーポリシーにその旨を記載する
- Voyage AI（Embedding生成）に送信するデータも同様に確認が必要

### 3. 個人情報の第三者提供

- 求職者の情報を企業に推薦する行為は**第三者提供**に該当。求職者本人の同意が必要（通常は登録時の利用規約で同意を取得）
- AIが生成したプロファイル要約を企業に共有する場合も同様。AIが生成した「所感」や「懸念点」が求職者のリアルな発言と混同されないよう、**推薦コメントにAI分析の内容をそのまま含めない**。AIの分析はコンサルタントの参考情報とし、推薦コメントはコンサルタントが最終作成する

### 4. 労働者派遣法との区分

- AIマッチングサービスを外部に提供する場合、それが**有料職業紹介**に該当するか**委託募集**に該当するかを整理する必要がある。自社の紹介事業内で使う分には問題ないが、他の紹介会社にSaaS提供する場合は法的整理が必要

---

## POSTCABINETS内部メモ

### この業界の攻め方

- **ターゲットは「コンサルタント3〜15名規模、年商5,000万〜3億、特化型」の人材紹介会社**。大手はフルスクラッチの自社システムを持っている。1〜2名の個人エージェントは投資余力がない。中小特化型がスイートスポット
- **業界特化のほうが刺さる**: IT特化、医療特化、ハイクラス特化など、ドメインが絞られている会社ほどAIマッチングの精度が出しやすい。汎用型（全業界対応）だと求人の多様性が大きすぎてベクトル空間のクラスタリングが効きにくい
- **アプローチ経路**: 人材紹介業の経営者コミュニティ（HRog、CIRCUS AGENT等のイベント）、PORTERSの導入企業リスト（2,200社超）からの逆引き、人材紹介業向けメディアへの寄稿
- **刺さるキーワード**: 「コンサルタントの生産性」「1人あたり月間成約件数」「書類選考通過率」「属人化の排除」「退職したコンサルの担当情報が消えない」

### 既存ツールとの差別化

| 競合 | 月額 | 特徴 | 我々の差別化ポイント |
|------|------|------|---------------------|
| PORTERS | 15,000円/ユーザー | 人材紹介CRMの定番。案件管理・進捗管理 | CRMであってAIマッチングではない。PORTERSの上にAI層を載せる提案。PORTERSを置き換えるのではなく**共存** |
| HRMOS | 要問合 | ビズリーチ傘下。採用管理（ATS） | 企業側の採用管理であり、紹介会社向けではない。紹介会社が使うのはPORTERS |
| LaS | 要問合 | 人材紹介向けSaaS。進捗管理に強い | マッチングAIは未実装（2026年3月時点）。進捗管理はPORTERSと重複 |
| CIRCUS AGENT | 成果報酬 | 求人データベースの共有プラットフォーム | マッチングは手動。AIによる自動提案なし。ただし求人データベースとしては有用なので**連携を検討** |
| **POST CABINETS** | **初期200万+月8万** | **面談AI要約＋ベクトルマッチング＋日程自動化** | **面談の「暗黙知」を構造化してマッチング精度を上げる。既存CRM（PORTERS）と共存。コンサルタントの属人性を排除** |

### 自分たちに足りないもの

1. **人材紹介業の実務理解**: RA（リクルーティングアドバイザー）とCA（キャリアアドバイザー）の業務の違い、求人開拓の実態（テレアポ→訪問→求人票作成の流れ）、企業の人事との関係構築方法。まずは人材紹介会社の経営者に3社ヒアリングして実態を把握する
2. **ベクトルDBの運用経験**: pgvectorの本番運用経験。1,000件程度の求人ベクトルの検索は軽いが、10,000件超になった時のパフォーマンスチューニング（IVFFlat vs HNSW、`ef_search` パラメータの調整）の知見が必要
3. **面談音声データの取り扱い**: Whisper APIに送信する前に、求職者の同意取得フローを標準化する。録音→クラウドアップロード→文字起こし→プロファイル生成の一連のパイプラインを構築する。同意が取れなかった場合のフォールバック運用も設計
4. **PORTERS APIとの連携**: PORTERSにはAPIが提供されているが、ドキュメントが限定的（パートナー企業向け）。PORTERSのパートナープログラムに申請するか、WebhookベースでCRMデータを同期する方法を検証。最悪の場合はCSVエクスポート/インポートで対応
5. **AIバイアスの検証方法**: マッチングAIが特定の属性（性別、年齢等）に偏ったスコアリングをしていないか、月次で監査するフレームワークが必要。具体的には: (a) テストケースを作成（同じスキルで性別のみ異なる架空プロファイル）、(b) スコア差をt検定で有意差判定、(c) 結果を `bias_audit` テーブルに記録

### 実案件に進む時のチェックリスト

- [ ] クライアントの有料職業紹介事業許可番号を確認（無許可業者には提供しない）
- [ ] PORTERSの利用状況、カスタマイズ内容をヒアリング
- [ ] 現在のKPI（スカウト返信率、面談設定率、書類通過率、成約率）を数値で取得
- [ ] 面談録音の求職者同意フロー（録音同意書テンプレート）を準備
- [ ] Claude API（Anthropic社）のデータ取り扱いポリシーを確認し、プライバシーポリシーに反映
- [ ] テスト用の求人票50件と求職者プロファイル20件でマッチング精度を検証
- [ ] AIバイアステスト: 性別・年齢・国籍でスコアリングに偏りがないことを確認
- [ ] PORTERSとのデータ連携方法（API or CSV export + import）を検証
- [ ] 面接日程自動調整のため、Googleカレンダーの権限設計（どの範囲のカレンダーを参照するか）を合意
- [ ] 月次レポートのテンプレート準備（マッチングスコア分布、書類通過率、成約率、AI推薦の採用率、バイアス監査結果）
- [ ] 改正職業安定法の「求人等に関する情報の的確な表示」をAI出力に反映できているか確認
