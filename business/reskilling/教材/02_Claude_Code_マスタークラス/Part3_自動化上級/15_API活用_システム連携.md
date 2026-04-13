# Module 15: API活用・システム連携
**Claude Code マスタークラス — Part 3: 自動化・上級**
**POST CABINETS Inc.**
**Module 15 / 全24モジュール**

---

## モジュール概要

| 項目 | 内容 |
|------|------|
| 想定時間 | 25分（講義17分＋ハンズオン8分） |
| 対象者 | 非エンジニア〜初級エンジニア |
| ゴール | Claude APIの基本を理解し、ノーコードツールで業務連携を構築できる |
| 前提知識 | Part 1-2の内容、Claudeの基本操作 |

---

## スライド構成（20枚）

### スライド 1: タイトル
**API活用・システム連携**
— Claude APIとノーコードツールで業務フローを自動化する —

### スライド 2: このモジュールで学ぶこと
### スライド 3-5: Claude APIの基本
### スライド 6-7: API Key取得
### スライド 8-12: ノーコードツール連携
### スライド 13-17: 実演3パターン
### スライド 18-19: コスト管理
### スライド 20: まとめ

---

## 台本

### 1. Claude APIとは（3分）

皆さん、こんにちは。Module 15「API活用・システム連携」です。

これまでModule 12-14ではClaude Codeを使ってきました。Claude Codeは「人がターミナルで対話する」ツールでしたね。

今日学ぶ**Claude API**は、**プログラムやサービスがClaudeと会話する**ための仕組みです。

わかりやすい比較をしましょう。

| | claude.ai | Claude Code | Claude API |
|---|-----------|-------------|-----------|
| 使う人 | 人間 | 人間 | プログラム/サービス |
| インターフェース | ブラウザ | ターミナル | HTTPリクエスト |
| 用途 | 対話・質問 | 開発・自動化 | システム組み込み |

レストランに例えると:
- **claude.ai** = お店に行って注文する（対面）
- **Claude Code** = 電話で注文する（リモート対話）
- **Claude API** = UberEatsのAPIで注文する（システム連携）

APIを使えば、「Googleフォームに回答が来たら、Claudeに分析させて、結果をスプレッドシートに書き込む」というような**完全自動のフロー**が作れます。

#### APIの基本構造

Claude APIは非常にシンプルです。HTTPでJSONを送って、JSONで返ってくる。

```
あなたのシステム → [HTTPリクエスト] → Claude API → [HTTPレスポンス] → あなたのシステム
```

リクエスト（送るもの）:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "この文章を3行で要約してください: ..."
    }
  ]
}
```

レスポンス（返ってくるもの）:
```json
{
  "content": [
    {
      "type": "text",
      "text": "要約: ..."
    }
  ],
  "usage": {
    "input_tokens": 150,
    "output_tokens": 80
  }
}
```

「コードなんて書けない」という方、安心してください。この後紹介するノーコードツールを使えば、この部分を全く意識する必要はありません。

---

### 2. API Key取得とセットアップ（2分）

APIを使うには、まず**APIキー**が必要です。

#### Step 1: Anthropic Consoleにアクセス

https://console.anthropic.com/ にログインします。

#### Step 2: APIキーの作成

1. 左メニューの「API Keys」をクリック
2. 「Create Key」ボタンをクリック
3. 名前を付ける（例: `my-automation`）
4. 作成されたキーをコピー

**重要**: APIキーは一度しか表示されません。必ずその場で安全な場所に保存してください。

#### Step 3: 課金設定

APIは従量課金です。使った分だけ請求されます。

| モデル | 入力（100万トークン） | 出力（100万トークン） |
|--------|-------|-------|
| Claude Haiku 3.5 | $0.80 | $4.00 |
| Claude Sonnet 4 | $3.00 | $15.00 |
| Claude Opus 4 | $15.00 | $75.00 |

※ 2026年3月時点の価格。最新は公式サイトで確認してください。

**目安**: 一般的な業務自動化（日に数十回のAPI呼び出し）なら、月額$5〜$30程度に収まることが多いです。

月額の上限（Spend Limit）を設定できるので、想定外の課金を防げます。Consoleの「Billing」→「Spend Limits」で設定してください。

---

### 3. ノーコードツール連携（5分）

ここからが本日の核心です。**コードを一行も書かずに**Claude APIを業務フローに組み込む方法を紹介します。

#### Zapier × Claude API

**Zapierとは**: 異なるWebサービスをつなげる自動化ツール。「Aが起きたらBをする」を設定するだけ。

Zapierには**公式のClaude（Anthropic）連携**があります。

設定手順:
1. Zapierにログイン
2. 「Create Zap」をクリック
3. トリガー: 「Google Forms」→「New Response」
4. アクション: 「Anthropic (Claude)」→「Send Message」
5. Claude APIキーを入力
6. プロンプトに「{{回答内容}} を分析して...」と設定
7. 次のアクション: 「Google Sheets」→「Create Row」

これで、フォーム回答→Claude分析→スプレッドシート記録が完全自動になります。

#### Make (旧Integromat) × Claude API

**Makeとは**: Zapierと似た自動化ツール。より複雑なフロー（分岐・ループ）が得意。

Makeでの設定:
1. Makeにログイン
2. 「Create Scenario」をクリック
3. モジュール追加: 「HTTP」→「Make a request」
4. URL: `https://api.anthropic.com/v1/messages`
5. Method: POST
6. Headers:
   - `x-api-key`: あなたのAPIキー
   - `anthropic-version`: `2023-06-01`
   - `Content-Type`: `application/json`
7. Body:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "{{前のモジュールの出力}}"
    }
  ]
}
```

MakeはHTTPモジュールで直接APIを叩けるので、公式連携がなくてもClaude APIを使えます。

#### n8n × Claude API

**n8nとは**: オープンソースの自動化ツール。自分のサーバーにインストールして使える（データが外部に出ない）。

n8nには公式のAnthropicノード（AI Agent）があります。

```
[トリガー] → [Anthropic Chat Model] → [出力先]
```

n8nの特徴は**セルフホスト可能**なこと。社内の機密データを扱う場合、Zapier/Makeだとデータが外部サービスを経由しますが、n8nなら社内サーバーで完結します。

---

### 4. 実演3パターン（7分）

#### 実演1: Googleフォーム回答 → Claude分析 → スプレッドシートに結果

**ユースケース**: 顧客アンケートの回答をリアルタイムで分析・分類

Zapierでの設定:

```
トリガー: Google Forms → New Response
  ↓
アクション1: Anthropic Claude → Send Message
  Model: claude-sonnet-4-20250514
  System: あなたは顧客フィードバック分析の専門家です。
  Message: |
    以下の顧客アンケート回答を分析してください。

    回答者: {{Name}}
    満足度: {{Satisfaction}}
    自由記述: {{FreeText}}

    以下のJSON形式で出力してください：
    {
      "sentiment": "positive/neutral/negative",
      "category": "product/service/price/other",
      "key_points": ["ポイント1", "ポイント2"],
      "priority": "high/medium/low",
      "suggested_action": "推奨アクション"
    }
  ↓
アクション2: JSON Parser（Claudeの出力をパース）
  ↓
アクション3: Google Sheets → Create Row
  - sentiment列: {{sentiment}}
  - category列: {{category}}
  - key_points列: {{key_points}}
  - priority列: {{priority}}
  - suggested_action列: {{suggested_action}}
```

**結果**: アンケートが送信されるたびに、3〜5秒でスプレッドシートに分析結果が自動記録されます。

---

#### 実演2: メール受信 → Claude分類 → Slack通知

**ユースケース**: 重要なメールを自動でSlackに通知

Makeでの設定（Scenario）:

```
モジュール1: Gmail → Watch Emails
  Filter: ラベル「受信トレイ」の未読メール
  ↓
モジュール2: HTTP → Make a Request
  URL: https://api.anthropic.com/v1/messages
  Body: {
    "model": "claude-haiku-3-5-20241022",
    "max_tokens": 256,
    "messages": [{
      "role": "user",
      "content": "以下のメールを分類してください。\n\n件名: {{subject}}\n送信者: {{from}}\n本文: {{body}}\n\n分類: 緊急/重要/通常/不要\n要約: 1行で\nJSON形式で返してください。"
    }]
  }
  ↓
モジュール3: JSON → Parse
  ↓
モジュール4: Router（分岐）
  ├─ 緊急の場合 → Slack #urgent チャンネルに投稿
  ├─ 重要の場合 → Slack #important チャンネルに投稿
  └─ 通常/不要の場合 → 何もしない
```

Haiku（高速・安価モデル）を使っているのがポイントです。メール分類のような単純なタスクにはHaikuで十分で、コストも1/10以下に抑えられます。

---

#### 実演3: 定時バッチ — 日次データ → Claudeレポート → PDF出力

**ユースケース**: 毎朝8時に前日の売上レポートを自動生成してPDFで共有

n8nでの設定:

```
ノード1: Schedule Trigger
  Cron: 0 8 * * *（毎日8:00）
  ↓
ノード2: Google Sheets → Read Rows
  シート: 「売上データ」
  フィルタ: 日付 = 昨日
  ↓
ノード3: Anthropic Chat Model
  Model: claude-sonnet-4-20250514
  System Prompt: |
    あなたは経営レポートの作成者です。
    データを受け取り、以下のフォーマットでHTML形式のレポートを生成してください。
    - エグゼクティブサマリー（3行）
    - KPIダッシュボード（表形式）
    - 前日比・前週比
    - 注目ポイント（良い点・改善点）
    - 推奨アクション
    スタイリングはプロフェッショナルなデザインで。
  Message: {{前ノードのデータ}}
  ↓
ノード4: HTML to PDF（変換）
  ↓
ノード5: Slack → Upload File
  チャンネル: #daily-report
  ファイル: {{生成されたPDF}}
  メッセージ: 📊 本日の売上レポートです
```

---

### 5. コスト管理（3分）

API利用のコスト管理は非常に重要です。放置すると思わぬ請求が来ることがあります。

#### トークンとは

Claude APIの課金は**トークン数**ベースです。

- **1トークン** ≒ 日本語で約0.5〜1文字、英語で約4文字
- 「こんにちは」= 約3-5トークン
- A4用紙1ページ ≒ 約1,000-1,500トークン

#### コスト最適化の4つのルール

**ルール1: タスクに合ったモデルを選ぶ**

| タスク | 推奨モデル | 理由 |
|--------|-----------|------|
| 分類・仕分け | Haiku 3.5 | 単純なタスクなので安価モデルで十分 |
| 要約・レポート | Sonnet 4 | バランス型。大半の業務タスクに最適 |
| 戦略分析・創造的タスク | Opus 4 | 最高品質が必要な場合のみ |

ほとんどの業務自動化はSonnet 4で十分です。分類やラベリングのような単純作業はHaikuに任せれば、コストを大幅に削減できます。

**ルール2: System Promptで出力を制御する**

```json
{
  "system": "回答は100文字以内で。JSON形式で出力。余計な説明は不要。",
  "messages": [...]
}
```

出力トークンを制限することで、コストを抑えられます。

**ルール3: Spend Limitを設定する**

Anthropic Consoleの「Billing」→「Spend Limits」で月額上限を設定。上限に達するとAPIが停止します。

- テスト段階: $10/月
- 本番運用: $50〜$100/月（業務規模による）

**ルール4: 使用量をモニタリングする**

Anthropic Consoleのダッシュボードで、日別・モデル別の使用量を確認できます。月の半ばで予算の半分を超えていたら、プロンプトの最適化やモデルの変更を検討しましょう。

#### コスト試算の具体例

```
ケース: 顧客アンケート自動分析
- 月間回答数: 500件
- 1件あたり入力: 約500トークン
- 1件あたり出力: 約200トークン
- モデル: Claude Haiku 3.5

コスト計算:
- 入力: 500件 × 500トークン = 250,000トークン = $0.20
- 出力: 500件 × 200トークン = 100,000トークン = $0.40
- 月額合計: 約$0.60（≒ 90円）
```

この金額で500件のアンケートを自動分析できるのは、コスパ抜群です。

---

### 6. まとめ（1分）

Module 15のまとめです。

- **Claude API** = プログラムがClaudeと会話するためのHTTPインターフェース
- **ノーコードツール**（Zapier / Make / n8n）でコード不要の連携が可能
- **3つの実演**: フォーム分析、メール分類、日次レポート
- **コスト管理**: モデル選択・出力制限・Spend Limit・モニタリング
- 多くの業務自動化は月額$1〜$30で実現可能

次のModule 16では、さらに進んで**Agent SDK** — 自律的に判断して動くAIエージェントの構築方法を学びます。

---

## ハンズオン演習

### 演習1: APIキーの取得と動作確認（3分）

1. https://console.anthropic.com/ にアクセス
2. APIキーを作成
3. ターミナルで以下を実行（APIキーを自分のものに置き換え）:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-haiku-3-5-20241022",
    "max_tokens": 256,
    "messages": [
      {"role": "user", "content": "こんにちは。今日の日付を教えてください。"}
    ]
  }'
```

4. レスポンスが返ってくれば成功

### 演習2: Zapierで簡単な自動化を作る（5分）

1. Zapier（https://zapier.com/）に無料登録
2. 以下のZapを作成:
   - トリガー: 「Schedule」→「Every Day」
   - アクション: 「Anthropic Claude」→「Send Message」
   - プロンプト: 「今日のビジネス格言を1つ教えてください。50字以内で。」
   - アクション: 「Email」→ 自分宛にメール送信
3. テスト実行して、メールが届くことを確認

---

## 補足資料

### APIリクエストのPython例

エンジニア向けに、Pythonでの実装例も載せておきます。

```python
"""Claude API を使った基本的なリクエスト例"""

import anthropic

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY"  # 実運用では環境変数から読み込む
)

def analyze_text(text: str) -> str:
    """テキストを分析して結果を返す"""
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system="あなたはテキスト分析の専門家です。JSON形式で結果を返してください。",
        messages=[
            {
                "role": "user",
                "content": f"以下のテキストを分析してください:\n\n{text}"
            }
        ]
    )
    return message.content[0].text

# 使用例
result = analyze_text("顧客満足度は前年比5%向上した一方、解約率が微増している。")
print(result)
```

### TypeScript/Node.js例

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeText(text: string): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system:
      "あなたはテキスト分析の専門家です。JSON形式で結果を返してください。",
    messages: [
      {
        role: "user",
        content: `以下のテキストを分析してください:\n\n${text}`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type === "text") {
    return block.text;
  }
  throw new Error("Unexpected response type");
}

// 使用例
analyzeText(
  "顧客満足度は前年比5%向上した一方、解約率が微増している。"
).then(console.log);
```

### 参考リンク

- [Anthropic API ドキュメント](https://docs.anthropic.com/en/docs/api)
- [Anthropic Console](https://console.anthropic.com/)
- [Zapier Anthropic連携](https://zapier.com/apps/anthropic/integrations)
- [n8n Anthropic ノード](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmannthropicchats/)
