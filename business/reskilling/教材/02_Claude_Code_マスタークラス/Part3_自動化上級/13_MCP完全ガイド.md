# Module 13: MCP 完全ガイド
**Claude Code マスタークラス — Part 3: 自動化・上級**
**POST CABINETS Inc.**
**Module 13 / 全24モジュール**

---

## モジュール概要

| 項目 | 内容 |
|------|------|
| 想定時間 | 30分（講義20分＋ハンズオン10分） |
| 対象者 | Claude Codeの基本操作ができる方 |
| ゴール | MCPの仕組みを理解し、外部ツール連携を設定できるようになる |
| 前提知識 | Module 12の内容 |

---

## スライド構成（22枚）

### スライド 1: タイトル
**MCP 完全ガイド — Claudeに外部ツールの「目と手」を与える**

### スライド 2: このモジュールで学ぶこと
### スライド 3-4: MCPとは何か
### スライド 5-6: API連携との違い
### スライド 7-8: MCPの仕組み（図解）
### スライド 9-12: 主要MCPサーバー一覧
### スライド 13-16: セットアップ手順
### スライド 17-19: 実演3パターン
### スライド 20-21: セキュリティ
### スライド 22: まとめ

---

## 台本

### 1. イントロダクション（2分）

皆さん、こんにちは。Module 13「MCP完全ガイド」を始めます。

前回のModule 12で、Claude Codeの基本操作を学びました。ファイルを読み書きしたり、コマンドを実行したり。でも、ここで一つ疑問が出ませんか？

「Claude Codeは自分のパソコンの中のことしかできないの？」

答えはNoです。**MCP（Model Context Protocol）** を使えば、Claude CodeからNotion、Slack、Gmail、GitHub、Google Calendarなどの外部サービスを直接操作できるようになります。

MCPは2024年にAnthropicが策定したオープン標準プロトコルで、OpenAIも採用を表明しています。つまり、業界標準になりつつある技術です。

---

### 2. MCPとは（3分）

MCPを一言で言うと、**「AIに外部ツールの目と手を与えるための共通規格」** です。

たとえば今まで、AIにSlackのメッセージを読んでもらいたければ、こうする必要がありました：

1. 自分でSlackを開く
2. メッセージをコピーする
3. ChatGPTやClaudeに貼り付ける
4. 結果をまたSlackに貼り付ける

MCPがあれば：

1. Claude Codeに「Slackの#generalチャンネルの最新メッセージを読んで要約して」と言うだけ
2. Claude Codeが自分でSlackにアクセスして、読んで、要約を返す

この「自分でアクセスして操作する」部分を可能にするのがMCPです。

#### MCPの3つの構成要素

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Claude Code │────▶│  MCP Server  │────▶│  外部サービス  │
│  （Host）     │◀────│  （Bridge）    │◀────│  (Notion等)   │
└─────────────┘     └──────────────┘     └──────────────┘
```

1. **Host（ホスト）**: Claude Code自身。MCPサーバーに指示を出す側
2. **MCP Server（サーバー）**: 外部サービスとの橋渡しをするプログラム
3. **外部サービス**: Notion、Slack、Gmail等の実際のサービス

MCPサーバーは、各サービス専用のものが用意されています。Notion用、Slack用、Gmail用... という具合に。

---

### 3. なぜMCPが重要か — API連携との違い（3分）

「APIで直接つなげばいいんじゃないの？」と思った方もいるでしょう。MCPとAPI直接連携の違いを整理します。

| 比較項目 | API直接連携 | MCP |
|----------|-----------|-----|
| 実装コスト | 各サービスごとにコード記述 | 設定ファイル1つ |
| 認証管理 | 自前で実装 | MCPサーバーが管理 |
| セキュリティ | 自前で設計 | プロトコルレベルで標準化 |
| 更新追従 | API変更時にコード修正 | サーバー更新で対応 |
| 互換性 | サービスごとにバラバラ | 統一インターフェース |

MCPの最大のメリットは**標準化**です。一度MCPの仕組みを理解すれば、Notionだろうが、Slackだろうが、GitHubだろうが、同じやり方で接続できます。

もう一つ大きいのが**セキュリティ**です。MCPサーバーは、どのツールにどの権限でアクセスするかを明示的に定義します。AIが勝手に全てのデータにアクセスすることはありません。

---

### 4. 主要MCPサーバー一覧と用途（5分）

現在利用可能な主要MCPサーバーを見ていきましょう。

#### Slack MCP Server

| 機能 | 説明 |
|------|------|
| チャンネル一覧取得 | ワークスペース内のチャンネルを検索 |
| メッセージ読み取り | 指定チャンネルのメッセージ履歴を取得 |
| メッセージ投稿 | チャンネルにメッセージを投稿 |
| スレッド返信 | 既存スレッドへの返信 |

使用例: 「#salesチャンネルの今週のメッセージを要約して」

#### Notion MCP Server

| 機能 | 説明 |
|------|------|
| データベース読み取り | Notionのテーブルデータを取得 |
| ページ作成・更新 | 新しいページの作成や既存ページの編集 |
| 検索 | ワークスペース内の全文検索 |
| コメント追加 | ページへのコメント投稿 |

使用例: 「NotionのTasksデータベースから今週期限のタスクを一覧にして」

#### Gmail MCP Server

| 機能 | 説明 |
|------|------|
| メール検索 | 条件指定でメールを検索 |
| メール読み取り | メール本文の読み取り |
| 下書き作成 | 返信メールの下書きを作成 |
| ラベル管理 | メールのラベル操作 |

使用例: 「先週届いた見積もり関連のメールを探して要約して」

#### GitHub MCP Server

| 機能 | 説明 |
|------|------|
| リポジトリ操作 | Issue作成、PR一覧取得 |
| コード検索 | リポジトリ内のコード検索 |
| PR操作 | プルリクエストの作成・レビュー |

使用例: 「未マージのPRを一覧にして、各PRの概要を教えて」

#### Google Calendar MCP Server

| 機能 | 説明 |
|------|------|
| 予定一覧 | 指定期間の予定を取得 |
| 予定作成 | 新しい予定の作成 |
| 空き時間検索 | 空いている時間帯を検索 |

使用例: 「来週の空き時間を3つ教えて」

#### ファイルシステム MCP Server

| 機能 | 説明 |
|------|------|
| ファイル読み書き | 指定ディレクトリのファイル操作 |
| ディレクトリ走査 | フォルダ構造の探索 |

使用例: 特定のディレクトリ配下のみに限定してファイルアクセスを許可する場合に使用

---

### 5. セットアップ手順（5分）

MCPサーバーの設定方法を具体的に見ていきましょう。Claude Codeでの設定は非常にシンプルです。

#### 設定ファイルの場所

MCPサーバーは `~/.claude/settings.json` で設定します。

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-notion"],
      "env": {
        "NOTION_API_KEY": "ntn_xxxxxxxxxxxx"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-xxxxxxxxxxxx"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

#### セットアップの3ステップ

**Step 1: APIキーの取得**

各サービスの開発者ポータルからAPIキー/トークンを取得します。

- **Notion**: https://www.notion.so/my-integrations でインテグレーション作成
- **Slack**: https://api.slack.com/apps でBot作成、OAuth Token取得
- **GitHub**: Settings > Developer settings > Personal Access Tokens

**Step 2: settings.jsonに追記**

上記のJSON形式で、使いたいMCPサーバーを追加します。

**Step 3: Claude Codeを再起動**

```bash
# Claude Codeを一度終了して再起動
claude
```

起動時にMCPサーバーの接続状況が表示されます。

```
MCP Servers:
  ✓ notion (connected)
  ✓ slack (connected)
  ✓ github (connected)
```

#### プロジェクト単位の設定

グローバル設定（`~/.claude/settings.json`）に加えて、プロジェクトルートに `.claude/settings.json` を置くことで、プロジェクト固有のMCPサーバーを設定できます。

```
my-project/
├── .claude/
│   └── settings.json    ← プロジェクト固有のMCP設定
├── CLAUDE.md
└── src/
```

---

### 6. 実演3パターン（8分）

#### 実演1: Notion DBを読んで週次レポート自動生成

まず、NotionのTasksデータベースから今週完了したタスクを取得して、週次レポートを自動生成します。

```
> NotionのTasksデータベースから、今週StatusがDoneになったタスクを全て取得して。
> それを使って以下のフォーマットで週次レポートを作って：
>
> # 週次活動レポート（YYYY/MM/DD週）
> ## 完了タスク
> - タスク名（担当者）
> ## 来週の予定
> - 現在Statusが"In Progress"のタスクを一覧
> ## ブロッカー
> - Statusが"Blocked"のタスクがあれば記載
```

Claude Codeは以下の流れで処理します：

1. Notion MCP Serverを使ってTasksデータベースにアクセス
2. Status = "Done" かつ今週更新されたレコードを取得
3. Status = "In Progress" のレコードも取得
4. Status = "Blocked" のレコードも取得
5. Markdownフォーマットでレポートを生成

これが**コピペなし**、**ブラウザ操作なし**で完了します。

---

#### 実演2: Gmail検索 → Slackに要約投稿

```
> Gmailで「見積書」というキーワードを含む今週のメールを検索して。
> 各メールの送信者・件名・金額（本文から読み取れれば）を一覧にして。
> その一覧をSlackの#accountingチャンネルに投稿して。
> 投稿フォーマット:
> 📧 今週の見積書メールまとめ
> 1. [送信者] - [件名] - [金額]
> 2. ...
```

この指示で、Claude Codeは：

1. Gmail MCP Server で「見積書」を検索（今週分）
2. 各メールの本文を読み取り、金額情報を抽出
3. Slack MCP Server で #accounting チャンネルに整形して投稿

**注意**: Gmail MCPでは「下書き作成」はできますが、実際のメール送信はセキュリティ上の理由で制限されています。必ず人間が確認してから送信する設計になっています。

---

#### 実演3: GitHub PR一覧 → 進捗レポート

```
> GitHubの our-org/main-project リポジトリのオープンなPRを全て取得して。
> 各PRについて以下の情報をまとめて：
> - PR番号とタイトル
> - 作成者
> - 作成日
> - レビュー状況（approved / changes_requested / pending）
> - 変更ファイル数
>
> これをMarkdownの表にして、progress_report.md として保存して。
> また、1週間以上レビュー待ちのPRがあれば、Slackの#devチャンネルに
> リマインダーを投稿して。
```

この例は、GitHub MCPとSlack MCPを**組み合わせて**使うパターンです。MCPの力は、複数のサービスを横断して作業できるところにあります。

---

### 7. セキュリティの考慮事項（3分）

MCPは便利ですが、外部サービスへのアクセスを伴うため、セキュリティに注意が必要です。

#### 原則1: 最小権限の原則

各MCPサーバーに渡すトークンは、必要最小限の権限に絞ってください。

```
# Notion: 特定のページ/DBのみにアクセス許可
# Slack: 特定チャンネルのみ読み書き
# GitHub: 特定リポジトリのみ
# Gmail: 読み取りのみ（送信権限は不要なら外す）
```

#### 原則2: トークンの管理

```
# ❌ やってはいけない
# settings.json にトークンを直接書いてGitにコミット

# ✅ 推奨
# 環境変数を使う
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-notion"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      }
    }
  }
}
```

環境変数は `.env` ファイルや macOS の Keychain で管理します。

#### 原則3: 操作ログの確認

MCPサーバーが実行した操作は、Claude Codeのセッションログで確認できます。定期的にどんな操作が行われたか確認する習慣をつけましょう。

#### 原則4: 本番データへの書き込みは慎重に

特にNotionやSlackへの投稿は、実行前にClaude Codeが確認を求めます。内容を必ず確認してからYesを押してください。

テスト環境で十分に動作確認した後に本番環境で使うのが安全です。

---

### 8. まとめ（1分）

Module 13のまとめです。

- **MCP** = AIに外部ツールの目と手を与えるオープン標準
- Notion、Slack、Gmail、GitHub、Google Calendar等に対応
- 設定は `settings.json` に追記するだけ
- 複数サービスを横断した自動化が可能
- セキュリティは「最小権限」「トークン管理」が必須

次のModule 14では、Claude Codeをさらに深くカスタマイズする「カスタムコマンド」「Hooks」「Agents」の3本柱を学びます。

---

## ハンズオン演習

### 演習1: MCP設定の確認（3分）

1. `~/.claude/settings.json` を開く（なければ作成）
2. 以下のテンプレートをコピーして、自分の環境に合わせて編集:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic-ai/mcp-server-filesystem",
        "/Users/your-username/Documents"
      ]
    }
  }
}
```

3. Claude Codeを再起動して、MCP接続を確認

### 演習2: Notion MCP接続（5分）

1. Notion でインテグレーションを作成（https://www.notion.so/my-integrations）
2. テスト用データベースを作成し、インテグレーションに接続
3. settings.json にNotion MCPサーバーを追加
4. Claude Codeから「Notionのデータベースの内容を教えて」と指示
5. 結果を確認

### 演習3: 複数MCP連携（発展・2分）

- NotionのタスクDBを読み取り → Markdownファイルとして保存
- この操作をClaude Codeへの一回の指示で実行してみる

---

## 補足資料

### MCPサーバー一覧（2026年3月時点）

| サーバー名 | パッケージ | 主な用途 |
|-----------|-----------|---------|
| Notion | @anthropic-ai/mcp-server-notion | DB読み書き、ページ管理 |
| Slack | @anthropic-ai/mcp-server-slack | メッセージ読み書き |
| Gmail | @anthropic-ai/mcp-server-gmail | メール検索・下書き |
| GitHub | @anthropic-ai/mcp-server-github | リポジトリ操作 |
| Google Calendar | @anthropic-ai/mcp-server-google-calendar | スケジュール管理 |
| Filesystem | @anthropic-ai/mcp-server-filesystem | ローカルファイル操作 |
| Linear | @anthropic-ai/mcp-server-linear | イシュー管理 |
| Asana | @anthropic-ai/mcp-server-asana | プロジェクト管理 |
| Playwright | @anthropic-ai/mcp-server-playwright | ブラウザ自動操作 |

### 参考リンク

- [MCP 公式仕様](https://modelcontextprotocol.io/)
- [MCP サーバー一覧](https://github.com/modelcontextprotocol/servers)
- [Claude Code MCP設定ドキュメント](https://docs.anthropic.com/en/docs/claude-code/mcp)
