# Global AI Development Principles — POST CABINETS

## 基本原則
1. コーディング前にリポジトリ構造を必ず確認する
2. 広範な書き直しより最小変更を優先する
3. 振る舞いが変わる場合はテストを書く・更新する
4. hooks / scripts / MCP ツールを使う前にセキュリティ影響を確認する
5. 大きな機能実装: plan → implement → review → test の順で進める

## 役割分担（3つのAI）
- **Claude Code**: 設計・複雑改修・レビュー・共通ルール適用・hooks/commands/agents の中心
- **Codex CLI**: ローカル実装・小中規模修正・テスト追加・量産系タスク
- **Gemini CLI**: リサーチ・別案比較・要約・妥当性チェック（セカンドオピニオン）

## 利用可能なエージェント（~/.claude/agents/）
- architect, planner, code-reviewer, tdd-guide
- security-reviewer, refactor-cleaner, doc-updater
- build-error-resolver, e2e-runner, loop-operator

## 利用可能なスラッシュコマンド（~/.claude/commands/）
- /plan, /tdd, /code-review, /build-fix, /e2e
- /learn, /checkpoint, /evolve, /model-route

## セッション識別（複数タブ運用）

Claude Codeの全レスポンスの**冒頭1行目**に、トピックと状態レベルを表示する:

```
📌 [トピック要約（15字以内）]
```

- セッション開始時に最初のユーザーメッセージからトピックを判断して設定
- トピックが変わったら自動更新する
- 技術的な議論なら具体的に（例: `📌 LINE Bot Webhook設計`）、雑談なら `📌 雑談` でOK

### 回答の末尾に状態レベルを表示

全レスポンスの**末尾**に、このセッションの現在の状態を1行で表示する:

| レベル | 表示 | 意味 |
|--------|------|------|
| 🟢 DONE | `🟢 完了 — 追加指示あればどうぞ` | 作業完了。急ぎの入力不要 |
| 🟡 WAITING | `🟡 確認待ち — [具体的な質問]` | あなたの判断・回答が必要。**このタブを見て** |
| 🔴 BLOCKED | `🔴 ブロック中 — [理由]` | 進めない。あなたのアクションが必要 |
| 🔵 WORKING | `🔵 作業中…` | エージェント実行中。待っていてOK |

例:
```
🟡 確認待ち — Hero音でOK？それとも他の音を試す？
```
```
🟢 完了 — CLAUDE.md更新済み。追加あればどうぞ
```

## 会社情報
株式会社POST CABINETS — Webマーケティング・SNSマーケティング支援
詳細: ~/Library/CloudStorage/GoogleDrive-bachikanshikoku@gmail.com/マイドライブ/corsor/CLAUDE.md
