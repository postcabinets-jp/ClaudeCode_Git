# 設計書: Claude Code × Linear 自律駆動体制

**作成日**: 2026-03-31
**ステータス**: Approved
**担当**: Claude Code

---

## 1. 概要

Claude Codeをオーケストレーターとして、Linearをエージェント専用のプロジェクト管理基盤として使う自律駆動体制を構築する。

### 役割分担
- **Notion** — nobu（人間）のタスク・事業管理・意思決定の場所
- **Linear** — AIエージェント専用の作業場。Goal→Issue→Project→Task→Todoを自律管理
- **Discord** — 進捗通知・ブロッカー報告のアウトプットチャネル

### ゴール
- nobuがNotionに書いたことをClaudeが自動でLinear Issueに分解・起票
- Linearのダッシュボードを「AIの脳内を覗く窓」として可視化
- nobuはLinearを**読むだけ**。書くのはClaude Code

---

## 2. 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                   nobu（人間）                        │
│  Notion: 事業タスク・日記・意思決定・DB構築           │
└───────────────────────┬─────────────────────────────┘
                        │ 高レベル指示（Notion or Discord）
                        ▼
┌─────────────────────────────────────────────────────┐
│          Claude Code オーケストレーター               │
│  ・Linearに Goal/Issue/Project/Task/Todo を自律管理  │
│  ・launchd で定期起動（15分ごと）                    │
│  ・Discord Webhook で進捗通知                        │
└──────────┬───────────────────────┬───────────────────┘
           │ Linear API            │ Claude Code サブエージェント
           ▼                       ▼
┌──────────────────┐   ┌───────────────────────────────┐
│  Linear          │   │  実装・調査・スクリプト生成     │
│  Goal            │   │  （Agent tool / subagent）     │
│  └── Issue       │   └───────────────────────────────┘
│       └── Project│
│            └── Task
│                 └── Todo（Sub-issue）
└──────────────────┘
```

**データの流れ**:
1. nobuがNotionまたはDiscordに「やってほしいこと」を書く
2. Claude Codeが拾い上げ、LinearにGoal → Issue → Taskに分解して起票
3. 優先順位の高いIssueから自律実行
4. 完了したらLinearのステータスを更新 + Discordに通知

---

## 3. Linear 階層設計

```
Workspace: POSTCABINETS-AI
│
├── Team: AI-Ops
│     │
│     ├── 🎯 Goal（Cycles）
│     │     例: "AI自動化インフラ構築 Q2"
│     │
│     ├── 📋 Project
│     │     例: "LinkedIn自動投稿", "Notion夜間スキャン"
│     │
│     ├── 🔴 Issue（タスクに相当する実行単位）
│     │     例: "LinkedIn投稿スクリプトのエラーハンドリング改善"
│     │     - Priority: Urgent/High/Medium/Low
│     │     - Assignee: Claude（ラベルで識別）
│     │     - Status: Backlog→Todo→In Progress→Done
│     │
│     └── ✅ Sub-issue / Todo（チェックリスト相当）
│           例: "discord通知追加", "エラーログをNotionに保存"
│
└── Labels
      - agent:claude-code
      - agent:subagent
      - type:bug / type:feat / type:research
      - source:notion / source:discord / source:auto
      - requires-approval（承認待ちフラグ）
```

**運用ルール**:
- Issueの `Assignee = Claude` になっているものだけを自律実行対象とする
- `source` ラベルでタスクの発生源を追跡できる
- nobuはLinearを読むだけ。書くのはClaude Code

---

## 4. 自律ループ設計

```
launchd（15分ごと）
  └── scripts/linear-agent-loop.mjs
        │
        ├── 1. Notionの思考ノート・TasksDBをスキャン
        │       → Claude向けタスクをLinear Issueに起票
        │
        ├── 2. LinearからAssignee=Claude & Status=Todoのイシューを取得
        │
        ├── 3. 優先度順にイシューを1件取り出す
        │       → Status を "In Progress" に更新
        │
        ├── 4. Claude Code サブエージェントに実行委譲
        │       （Agent tool / claude -p コマンド）
        │
        ├── 5. 完了 → Linear Status を "Done" に更新
        │           → Discord Webhook で通知
        │           → Notionの元タスクも更新（あれば）
        │
        └── 6. 次のイシューへ（or 終了）
```

**安全装置**:
- 1回のループで実行するIssueは最大3件（暴走防止）
- `requires-approval` ラベルがついたIssueはスキップしてDiscord通知だけ送る
- エラー発生時はIssueに `status:blocked` + エラーコメントを書いて止まる

---

## 5. 技術スタックとファイル構成

```
claude for me/
├── scripts/
│   ├── linear-agent-loop.mjs      # メインループ（launchd から起動）
│   ├── linear-client.mjs          # Linear API ラッパー
│   └── linear-notion-bridge.mjs   # Notion → Linear 起票ブリッジ
│
├── scripts/launchd/
│   └── com.postcabinets.linear-agent-loop.plist.example
│
└── .env
      LINEAR_API_KEY=...
      LINEAR_TEAM_ID=...
      LINEAR_CLAUDE_USER_ID=...   # "Claude" アカウントのID
```

**依存パッケージ**:
- `@linear/sdk` — Linear 公式 Node.js SDK
- `@notionhq/client` — 既存をそのまま流用
- Discord Webhook — 既存の `scripts/notify-discord.mjs` を流用

**launchd 設定**:
- 間隔: 900秒（15分）
- 起動条件: ネットワーク接続時のみ
- ログ: `~/Library/Logs/linear-agent-loop.log`

---

## 6. 初回セットアップ手順（nobu視点）

```bash
# 1. Linear でワークスペース作成 + "Claude" メンバー追加（手動）
# 2. APIキーをセットアップ
npm run linear:setup

# 3. launchd に登録して自動ループ開始
cp scripts/launchd/com.postcabinets.linear-agent-loop.plist.example \
   ~/Library/LaunchAgents/com.postcabinets.linear-agent-loop.plist
# パスを編集してから:
launchctl load ~/Library/LaunchAgents/com.postcabinets.linear-agent-loop.plist
```

---

## 7. 日常運用（nobu視点）

**nobuがやること**:
- Notionに書く → Claudeが拾ってLinearに起票・実行
- Discordの通知を確認（Linear Board を眺めるだけ）
- `requires-approval` 通知が来たら Discord で承認指示

**Linearダッシュボード（Board表示）**:
```
Backlog | Todo | In Progress | Done
（全部Claudeが動かすのでnobuは眺めるだけ）
```

---

## 8. 朝のルーティン設計

**理想の1日の起点**:

```
朝（Claude Codeターミナルで）
  │
  ├── 1. サマリー取得（自動）
  │       - Notionの今日のタスク・昨日の残タスク
  │       - LinearのIn Progress / Blocked Issue
  │       - Discordの未読通知
  │       → "今日の状況" を1画面でサマリー表示
  │
  ├── 2. 壁打ち（nobuとClaude）
  │       - nobuが今日の方針・頭の中を話す
  │       - Claudeが質問・整理・優先順位の提案
  │
  └── 3. タスク分解・Linear起票（Claude自動）
          - 壁打ちの内容をGoal/Issue/Taskに構造化
          - LinearにIssue起票 + 優先度設定
          - 自律ループが即座に実行開始
```

**その他チャネルからの指示（非同期）**:
- Notion思考ノートへの書き込み
- Discord メッセージ
- 将来: LINE / その他
→ すべて自律ループ（15分ごと）が自動で拾いLinearに起票・実行

**ポイント**: 朝の壁打ちは「人間がClaude に文脈を渡す場」。これがあることで
自律ループの精度と優先順位判断が大幅に上がる。

---

## 9. 今後の拡張ポイント

| フェーズ | 内容 |
|---------|------|
| Phase 1 | 本設計の実装（インフラ構築） |
| Phase 2 | Linear Webhook 導入（イベント駆動化） |
| Phase 3 | Planner/Worker/Reviewer のマルチエージェント分業 |
