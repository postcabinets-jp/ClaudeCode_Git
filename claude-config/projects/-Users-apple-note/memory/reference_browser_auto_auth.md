---
name: ブラウザGoogle自動認証の仕組み
description: Chrome操作中にGoogleログイン/同意が出たら自動で通す。Keychain→クリップボード→MCP貼付で秘密を文脈に通さず入力
type: reference
---

ブラウザでGoogle認証が出たとき、Claudeが自動で通すための仕組み（2026-06-09構築・実機検証済み）。

## 設計の核心（実証済み方式=clipboard）
値を **Keychain → クリップボード → Chrome MCPの Cmd+V** で欄へ。Claudeの文脈にもMCP引数にも生の値を通さない。貼付直後に必ずclearでクリップボード消去。CREDENTIALS_MAPには「在処」だけ書く既存思想を維持。

⚠️ **旧keystroke方式は失敗する**（2026-06-09実機）。osascript keystrokeは「OS最前面アプリ」へ飛ぶが、Chrome MCPはCDPで裏からタブを操作するため、Bash実行時の最前面はターミナル側＝キーが欄に届かない。clipboard+MCP貼付なら最前面問題を受けない。

## 構成
- 保管: Keychain service=`claude-browser-auth` / account=`google-email`・`google-password`（ネイティブ保存＝正本、ファイル化しない）
- セットアップ: `bash ~/.claude/browser-auth-setup.sh`（Nobu本人が1回。`read -s`非表示）。在否確認 `--check`
- 入力ヘルパー: `bash ~/.claude/browser-auth-fill.sh email|password|clear`（既定clipboard。値は標準出力にもargvにも出さない）
- プロトコル: `~/.claude/CREDENTIALS_MAP.md` §8（SessionStartで自動注入＝毎回手順を持てる）

## Claudeの動作（画面別・実証フロー）
- アカウント選択/許可=Chrome MCPクリック（秘密なし）
- メール/パスワード= ①欄をMCPクリックしfocus → ②`fill.sh email|password` → ③MCP `key cmd+v` → ④`fill.sh clear` → ⑤「次へ」
- **パスキー/本人確認/2FAが出たら自動化せず停止→Nobu通知**（対象外。指紋はNobu本人）

**How to apply:** Chrome MCP操作中にaccounts.google.comのログイン/同意が出たら§8手順。入力欄は必ず先にMCPクリックしてfocus→fill.sh→MCP cmd+v→fill.sh clearの順。Chrome既ログイン済みなら認証画面自体出ない（最安定）。
**Why:** Nobuが「ブラウザ認証を自動で通したい」と要望。生鍵をCREDENTIALS_MAPに直書きはNG（git管理OKの前提が崩れる）ためKeychain経由に。keystrokeは実機で欄に届かず失敗→clipboard+MCP貼付に確定。Googleは新規ログインで高確率にパスキーを挟むのでハンドオフ必須。実機テスト: postcabinets@gmail.com 入力→次へ→パスキー要求→Nobu指紋でログイン成功（2026-06-09）。
