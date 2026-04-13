# Module 16: Agent SDK 入門
**Claude Code マスタークラス — Part 3: 自動化・上級**
**POST CABINETS Inc.**
**Module 16 / 全24モジュール**

---

## モジュール概要

| 項目 | 内容 |
|------|------|
| 想定時間 | 25分（講義18分＋ハンズオン7分） |
| 対象者 | 初級〜中級エンジニア、AIエージェントに関心のある方 |
| ゴール | Agent SDKの概念を理解し、簡単なエージェントを構築できるようになる |
| 前提知識 | Module 15（API基礎）の内容 |

---

## スライド構成（20枚）

### スライド 1: タイトル
**Agent SDK 入門**
— 自律的に考えて動くAIエージェントを構築する —

### スライド 2: このモジュールで学ぶこと
### スライド 3-4: エージェントとチャットボットの違い
### スライド 5-7: Agent SDKのアーキテクチャ
### スライド 8-11: 主要概念（Tools, Handoffs, Guardrails, Tracing）
### スライド 12-16: ユースケース5つ
### スライド 17-18: エージェント構築デモ
### スライド 19: 社内導入ステップ
### スライド 20: まとめ

---

## 台本

### 1. イントロダクション — エージェントとは（3分）

皆さん、こんにちは。Module 16「Agent SDK 入門」です。

これが今回のPart 3最後のモジュールになります。ここまでClaude Code、MCP、カスタムコマンド、APIと学んできました。最後に、これらを統合する究極の形 — **自律型AIエージェント** を学びます。

まず「エージェント」と「チャットボット」の違いを明確にしましょう。

#### チャットボット vs エージェント

| | チャットボット | エージェント |
|---|-----------|-----------|
| 動き方 | 質問→回答（1往復） | 目標を与える→自分で計画→実行→確認→修正 |
| 判断 | 人間が毎回指示 | 自分で次のアクションを判断 |
| ツール利用 | なし（テキストのみ） | 外部ツールを使って行動する |
| 例 | 「天気を教えて」→「晴れです」 | 「来週の出張準備して」→ カレンダー確認 → ホテル検索 → 予約提案 |

チャットボットは「聞かれたことに答える」。エージェントは「目標に向かって自分で考えて動く」。この違いが決定的です。

Agent SDKは、このエージェントを構築するためのフレームワークです。

---

### 2. Agent SDKのアーキテクチャ（4分）

Agent SDKの全体像を図で理解しましょう。

```
┌──────────────────────────────────────────────────┐
│                   Agent Loop                      │
│                                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│  │  Claude   │───▶│ 判断     │───▶│ ツール   │    │
│  │  (LLM)   │    │ (次の行動)│    │ (実行)   │    │
│  └──────────┘    └──────────┘    └──────────┘    │
│       ▲                              │            │
│       │          ┌──────────┐        │            │
│       └──────────│ 結果     │◀───────┘            │
│                  │ (フィードバック)│                │
│                  └──────────┘                      │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │ Guardrails（安全装置）                       │   │
│  │ - 入力チェック / 出力チェック / ツール制限    │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │ Tracing（追跡）                              │   │
│  │ - 全ステップのログ記録                        │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

エージェントは**ループ**で動きます：

1. **Claude（LLM）** が状況を分析
2. **判断**: 次に何をすべきか決定
3. **ツール実行**: 外部APIを呼んだりファイルを操作したり
4. **結果確認**: ツールの結果をClaudeに戻す
5. **1に戻る**: 目標達成するまでループ

このループを「エージェントループ」と呼びます。人間がいちいち指示しなくても、エージェントが自分で次のステップを判断して進めていきます。

---

### 3. 4つの主要概念（5分）

Agent SDKの設計は4つの柱で構成されています。

#### 概念1: Tools（ツール）

ツールは、エージェントが使える「道具」です。

```python
from claude_agent_sdk import tool

@tool
def search_database(query: str) -> str:
    """社内データベースを検索する"""
    # 実際のDB検索ロジック
    results = db.search(query)
    return str(results)

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """メールを送信する"""
    # 実際のメール送信ロジック
    email_service.send(to=to, subject=subject, body=body)
    return f"メール送信完了: {to}"

@tool
def create_ticket(title: str, description: str, priority: str) -> str:
    """サポートチケットを作成する"""
    ticket = ticketing_system.create(
        title=title, description=description, priority=priority
    )
    return f"チケット作成完了: #{ticket.id}"
```

エージェントは、これらのツールの中から**状況に応じて適切なものを自分で選んで**使います。「メールの問い合わせにはsend_emailを使おう」「技術的な質問にはsearch_databaseを使おう」という判断を、AIが自律的に行います。

#### 概念2: Handoffs（引き継ぎ）

Handoffは、あるエージェントから別のエージェントに会話を**引き継ぐ**仕組みです。

```
顧客: 「請求書の金額がおかしいです」

[一次対応エージェント]
  → 技術的な問題ではない → 請求について
  → Handoff → [請求担当エージェント]

[請求担当エージェント]
  → 請求データベースを確認
  → 差額を特定
  → 回答を作成
```

これは人間のコールセンターと同じ構造です。一次対応が内容を判断して、専門部署に回す。この「回す」仕組みがHandoffです。

```python
from claude_agent_sdk import Agent, handoff

billing_agent = Agent(
    name="billing_support",
    instructions="請求に関する問い合わせを処理する。請求データベースを検索して正確に回答する。",
    tools=[search_billing_db, adjust_invoice],
)

tech_agent = Agent(
    name="tech_support",
    instructions="技術的な問い合わせを処理する。ナレッジベースを検索して回答する。",
    tools=[search_knowledge_base, create_ticket],
)

triage_agent = Agent(
    name="triage",
    instructions="""
    顧客の問い合わせを分類し、適切な担当に引き継ぐ。
    - 請求・支払い関連 → billing_support
    - 技術的な問題 → tech_support
    """,
    handoffs=[
        handoff(billing_agent),
        handoff(tech_agent),
    ],
)
```

#### 概念3: Guardrails（安全装置）

Guardrailsは、エージェントの行動に**制約を設ける**仕組みです。

「AIが勝手にお金を送金したらどうするの？」「顧客データを外部に漏らしたら？」

これらのリスクを防ぐのがGuardrailsです。

```python
from claude_agent_sdk import guardrail

@guardrail
def check_no_pii_in_output(output: str) -> bool:
    """出力に個人情報（電話番号・メールアドレス等）が含まれていないか確認"""
    import re
    phone_pattern = r'\d{2,4}-\d{2,4}-\d{4}'
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    if re.search(phone_pattern, output) or re.search(email_pattern, output):
        return False  # ブロック
    return True  # 許可

@guardrail
def check_spending_limit(amount: float) -> bool:
    """支出が上限を超えていないか確認"""
    MAX_AMOUNT = 10000  # 1万円
    return amount <= MAX_AMOUNT

agent = Agent(
    name="support_agent",
    instructions="顧客サポートを行う",
    tools=[search_database, send_email],
    output_guardrails=[check_no_pii_in_output],
)
```

Guardrailsは**入力チェック**と**出力チェック**の両方に設定できます。エージェントの行動を「ここまでは許可、ここから先はブロック」と明確に区切れます。

#### 概念4: Tracing（追跡）

Tracingは、エージェントの全行動をログとして記録する仕組みです。

```
[2026-03-29 10:00:01] Agent: triage — 入力受信「請求書の金額が...」
[2026-03-29 10:00:02] Agent: triage — 分類結果: billing
[2026-03-29 10:00:02] Agent: triage → Handoff → billing_support
[2026-03-29 10:00:03] Agent: billing_support — Tool: search_billing_db("顧客ID: 12345")
[2026-03-29 10:00:04] Agent: billing_support — 結果: 差額¥2,000を検出
[2026-03-29 10:00:05] Agent: billing_support — 回答生成
[2026-03-29 10:00:05] Guardrail: check_no_pii — PASS
[2026-03-29 10:00:05] Agent: billing_support — 出力完了
```

「AIが何をしたか」が全て記録されるので、問題が起きたときに原因を追跡できます。監査対応やコンプライアンスの面でも重要です。

---

### 4. ユースケース5つ（4分）

Agent SDKで構築できるエージェントの実例を5つ紹介します。

#### ユースケース1: カスタマーサポート自動応答エージェント

```
顧客の問い合わせ
  ↓
[トリアージエージェント] → 分類
  ├→ [FAQ回答エージェント] → ナレッジベース検索 → 即座に回答
  ├→ [技術サポートエージェント] → ログ確認 → 解決策提示
  ├→ [請求エージェント] → 請求DB確認 → 対応
  └→ [エスカレーション] → 人間のオペレーターに引き継ぎ
```

**効果**: 問い合わせの70-80%を自動応答。人間は複雑なケースに集中できる。

#### ユースケース2: データ分析エージェント

```
「先月の売上を地域別に分析して、異常値があれば原因を調べて」
  ↓
[分析エージェント]
  1. データベースからデータ取得（SQLツール）
  2. 統計処理を実行（計算ツール）
  3. 異常値を検出
  4. 異常値の原因をさらに深掘り調査
  5. グラフを生成（可視化ツール）
  6. レポートを作成・保存
```

**効果**: 分析者が半日かけていたレポート作成を15分で自動化。

#### ユースケース3: コンテンツ作成エージェント

```
「来月のSNSコンテンツカレンダーを作って」
  ↓
[コンテンツエージェント]
  1. 過去の投稿パフォーマンスを分析
  2. 業界トレンドを調査
  3. カレンダーの草案を作成
  4. 各投稿のコピーを作成
  5. ハッシュタグを提案
  6. スケジュールを確定（人間の確認後）
```

#### ユースケース4: タスク管理エージェント

```
「今日のタスクを整理して、優先順位を付けて」
  ↓
[タスク管理エージェント]
  1. Notionからタスクを取得（MCP経由）
  2. Gmailから期限付きメールを確認
  3. カレンダーから今日の予定を取得
  4. 緊急度×重要度でマトリクス作成
  5. 推奨スケジュールを提案
```

#### ユースケース5: 社内ナレッジ検索エージェント

```
「○○プロジェクトの最新の設計方針を教えて」
  ↓
[ナレッジエージェント]
  1. Notionのドキュメントを検索
  2. Slackの関連チャンネルを検索
  3. GitHubのPR/Issueを検索
  4. 複数ソースの情報を統合
  5. 最新の設計方針をまとめて回答
  6. 関連ドキュメントへのリンクを付記
```

---

### 5. エージェント構築デモ（5分）

実際にシンプルなエージェントを構築してみましょう。

#### Python版: カスタマーサポートエージェント

```python
"""
簡易カスタマーサポートエージェント
Agent SDKを使った最小構成の例
"""

import anthropic
from anthropic import Agent, tool, handoff

client = anthropic.Anthropic()

# --- ツール定義 ---

@tool
def search_faq(query: str) -> str:
    """FAQデータベースを検索する

    Args:
        query: 検索キーワード
    """
    # 簡易的なFAQデータ（実運用ではDBを使う）
    faq_data = {
        "料金": "基本プランは月額5,000円、プロプランは月額15,000円です。",
        "解約": "マイページ > 設定 > サブスクリプション から解約できます。解約は即時反映されます。",
        "支払い方法": "クレジットカード（Visa/Mastercard/AMEX）と銀行振込に対応しています。",
        "トライアル": "14日間の無料トライアルがあります。クレジットカード登録不要です。",
    }

    for key, answer in faq_data.items():
        if key in query:
            return answer
    return "該当するFAQが見つかりませんでした。詳細はサポートチームにお問い合わせください。"


@tool
def lookup_account(customer_id: str) -> str:
    """顧客アカウント情報を検索する

    Args:
        customer_id: 顧客ID
    """
    # 簡易的な顧客データ（実運用ではDBを使う）
    accounts = {
        "C001": {"name": "田中太郎", "plan": "Pro", "status": "active", "since": "2025-01"},
        "C002": {"name": "鈴木花子", "plan": "Basic", "status": "active", "since": "2025-06"},
    }

    account = accounts.get(customer_id)
    if account:
        return f"顧客: {account['name']}, プラン: {account['plan']}, ステータス: {account['status']}, 利用開始: {account['since']}"
    return "顧客IDが見つかりません"


@tool
def create_support_ticket(
    customer_id: str, subject: str, description: str, priority: str
) -> str:
    """サポートチケットを作成する

    Args:
        customer_id: 顧客ID
        subject: チケットの件名
        description: 問題の詳細説明
        priority: 優先度（low/medium/high）
    """
    # 実運用ではチケットシステムのAPIを呼ぶ
    ticket_id = "TK-" + str(hash(subject))[:6]
    return f"チケット作成完了: {ticket_id} (優先度: {priority})"


# --- エージェント定義 ---

# FAQ対応エージェント
faq_agent = Agent(
    name="faq_agent",
    model="claude-haiku-3-5-20241022",
    instructions="""
    あなたはFAQ対応の専門エージェントです。
    顧客の質問に対して、FAQデータベースを検索して回答してください。
    FAQで解決できない場合は、その旨を正直に伝えてください。
    回答は簡潔に、丁寧な日本語で。
    """,
    tools=[search_faq],
)

# アカウント対応エージェント
account_agent = Agent(
    name="account_agent",
    model="claude-sonnet-4-20250514",
    instructions="""
    あなたはアカウント管理の専門エージェントです。
    顧客のアカウント情報を確認し、問題を解決してください。
    解決できない問題はチケットを作成してください。
    """,
    tools=[lookup_account, create_support_ticket],
)

# トリアージ（振り分け）エージェント
triage_agent = Agent(
    name="triage_agent",
    model="claude-haiku-3-5-20241022",
    instructions="""
    あなたはカスタマーサポートの一次対応エージェントです。
    顧客の問い合わせ内容を判断し、適切な専門エージェントに引き継いでください。

    振り分け基準:
    - 一般的な質問（料金、機能、使い方）→ faq_agent
    - アカウント固有の問題（ログイン、プラン変更、請求）→ account_agent
    """,
    handoffs=[
        handoff(faq_agent),
        handoff(account_agent),
    ],
)

# --- 実行 ---

def main():
    # エージェントを実行
    result = client.agents.run(
        agent=triage_agent,
        messages=[
            {
                "role": "user",
                "content": "料金プランについて教えてください"
            }
        ]
    )

    print("回答:", result.final_output)


if __name__ == "__main__":
    main()
```

#### TypeScript版: 同じエージェント

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ツール定義
const tools = [
  {
    name: "search_faq",
    description: "FAQデータベースを検索する",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "検索キーワード" },
      },
      required: ["query"],
    },
  },
  {
    name: "lookup_account",
    description: "顧客アカウント情報を検索する",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_id: { type: "string", description: "顧客ID" },
      },
      required: ["customer_id"],
    },
  },
];

// ツールの実行関数
function executeTool(
  name: string,
  input: Record<string, string>
): string {
  switch (name) {
    case "search_faq": {
      const faqData: Record<string, string> = {
        料金: "基本プランは月額5,000円、プロプランは月額15,000円です。",
        解約: "マイページ > 設定 > サブスクリプション から解約できます。",
        支払い方法:
          "クレジットカード（Visa/Mastercard/AMEX）と銀行振込に対応しています。",
      };
      for (const [key, answer] of Object.entries(faqData)) {
        if (input.query.includes(key)) return answer;
      }
      return "該当するFAQが見つかりませんでした。";
    }
    case "lookup_account":
      return `顧客ID: ${input.customer_id} のアカウント情報を取得しました。`;
    default:
      return "不明なツールです。";
  }
}

// エージェントループ
async function runAgent(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  // エージェントループ: ツール呼び出しがなくなるまで繰り返す
  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:
        "あなたはカスタマーサポートエージェントです。顧客の質問に丁寧に回答してください。必要に応じてツールを使ってください。",
      tools,
      messages,
    });

    // ツール呼び出しがあるか確認
    const toolUseBlocks = response.content.filter(
      (block) => block.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      // ツール呼び出しなし → 最終回答
      const textBlock = response.content.find(
        (block) => block.type === "text"
      );
      return textBlock && textBlock.type === "text"
        ? textBlock.text
        : "回答を生成できませんでした。";
    }

    // ツールを実行して結果を追加
    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map(
      (block) => {
        if (block.type !== "tool_use") throw new Error("unexpected");
        const result = executeTool(
          block.name,
          block.input as Record<string, string>
        );
        return {
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: result,
        };
      }
    );

    messages.push({ role: "user", content: toolResults });
  }
}

// 実行
runAgent("料金プランについて教えてください").then((answer) => {
  console.log("回答:", answer);
});
```

---

### 6. 社内導入のステップ（2分）

Agent SDKを使ったAIエージェントの社内導入は、以下のステップで進めるのが現実的です。

#### Phase 1: PoC（概念実証）— 1-2週間

- **対象**: 社内の1つの業務プロセス（例: FAQ応答）
- **規模**: 社内テスト（5人程度）
- **目標**: 「エージェントが業務の一部を代行できる」ことを実証

#### Phase 2: パイロット — 1-2ヶ月

- **対象**: PoCで検証した業務を、実際の業務フローに組み込む
- **規模**: 特定チーム（10-20人）
- **追加**: Guardrailsの調整、Tracingの監視体制構築
- **目標**: 実運用での精度とコストを把握

#### Phase 3: 本番展開 — 3ヶ月〜

- **対象**: 全社または顧客向け
- **追加**: エラーハンドリング、フォールバック（人間への引き継ぎ）、SLA設定
- **目標**: 安定運用と段階的な対象業務の拡大

#### 導入時の3つの原則

1. **人間を排除しない**: エージェントは「人間を支援する」もの。最終判断は人間が行う設計にする
2. **段階的に権限を拡大**: 最初は読み取り専用 → 成功したら書き込み許可 → 成功したら外部連携
3. **失敗を前提に設計**: エージェントが間違える前提で、フォールバック（人間への引き継ぎ）を必ず用意する

---

### 7. まとめ（1分）

Module 16、そしてPart 3全体のまとめです。

**Module 16のポイント**:
- **Agent SDK** = 自律型AIエージェントを構築するフレームワーク
- 4つの柱: **Tools**（道具）、**Handoffs**（引き継ぎ）、**Guardrails**（安全装置）、**Tracing**（追跡）
- エージェントは「ループ」で自律的に動く
- 社内導入は **PoC → パイロット → 本番** の3段階

**Part 3 全体の振り返り**:

| Module | 学んだこと | できるようになること |
|--------|-----------|-------------------|
| 12 | Claude Code | 自然言語で業務自動化 |
| 13 | MCP | 外部ツール（Notion/Slack等）連携 |
| 14 | Commands/Hooks/Agents | Claude Codeのカスタマイズ |
| 15 | API + ノーコード | システム間の自動連携 |
| 16 | Agent SDK | 自律型AIエージェント構築 |

この5つのモジュールの知識を組み合わせれば、**業務プロセスの大部分をAIで自動化する**ことができます。重要なのは、一気に全部やろうとせず、小さなタスクから始めて成功体験を積み上げることです。

---

## ハンズオン演習

### 演習1: エージェントの設計（3分）

コードを書かなくてOKです。以下のテンプレートを埋めて、自分の業務に合ったエージェントを設計してみてください。

```
エージェント名: ___________________
目的: ___________________

使うツール:
1. ___________________（何をするツール）
2. ___________________（何をするツール）
3. ___________________（何をするツール）

Guardrails（安全装置）:
- やってはいけないこと: ___________________
- 上限: ___________________

Handoff先:
- ___________________の場合 → [別のエージェント/人間]
```

例:
```
エージェント名: 見積もり作成エージェント
目的: 顧客からの問い合わせに基づいて見積書の草案を作成する

使うツール:
1. search_price_list（価格表を検索する）
2. calculate_discount（ボリュームディスカウントを計算する）
3. generate_pdf（見積書PDFを生成する）

Guardrails:
- やってはいけないこと: 30%を超える値引き
- 上限: 見積もり金額500万円以上は人間の承認が必要

Handoff先:
- 金額500万円以上 → 営業マネージャー
- カスタム要件がある場合 → 技術チーム
```

### 演習2: curlでツール付きAPI呼び出し（4分）

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-haiku-3-5-20241022",
    "max_tokens": 1024,
    "tools": [
      {
        "name": "get_weather",
        "description": "指定した都市の天気を取得する",
        "input_schema": {
          "type": "object",
          "properties": {
            "city": {
              "type": "string",
              "description": "都市名"
            }
          },
          "required": ["city"]
        }
      }
    ],
    "messages": [
      {"role": "user", "content": "大阪の天気を教えてください"}
    ]
  }'
```

レスポンスに `tool_use` ブロックが含まれていれば成功です。エージェントが「ツールを使いたい」と判断したことがわかります。

---

## 補足資料

### Agent SDK vs 他のフレームワーク

| 比較項目 | Claude Agent SDK | LangChain | AutoGPT |
|----------|-----------------|-----------|---------|
| 提供元 | Anthropic（公式） | LangChain Inc. | オープンソース |
| モデル | Claude専用 | マルチモデル | マルチモデル |
| 安全性 | Guardrails組み込み | 別途実装が必要 | 限定的 |
| 追跡性 | Tracing組み込み | LangSmith連携 | 限定的 |
| 学習コスト | 低〜中 | 中〜高 | 高 |
| 本番適用性 | 高 | 中〜高 | 低 |

Claude Agent SDKは「安全性」と「追跡性」が最初から組み込まれている点が特徴です。本番環境で使うことを前提に設計されています。

### エージェント設計のアンチパターン

| アンチパターン | 問題 | 正しいアプローチ |
|-------------|------|--------------|
| 万能エージェント | 1つのエージェントに全機能を詰め込む | 専門エージェントに分割 + Handoff |
| Guardrailなし | 暴走リスク | 必ず入出力チェックを設定 |
| 人間の排除 | 重大な判断ミスのリスク | 人間の承認ステップを組み込む |
| ログなし | 問題発生時に原因不明 | Tracingを必ず有効化 |
| 一気に本番 | 予期しない挙動で事故 | PoC→パイロット→本番の3段階 |

### 参考リンク

- [Claude Agent SDK ドキュメント](https://docs.anthropic.com/en/docs/agents)
- [Claude API Tool Use ガイド](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Anthropic Cookbook - エージェント例](https://github.com/anthropics/anthropic-cookbook)
