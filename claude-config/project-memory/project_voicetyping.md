---
name: VoiceTyping プロジェクト
description: 無料の音声入力アプリ（iOS keyboard + Android IME + Mac menu bar）。Typeless/Speakly代替。
type: project
---

## VoiceTyping — 無料クロスプラットフォーム音声入力アプリ

**Why:** Typeless ($12/月) や Genspark Speakly ($25/月〜) が高いので、無料で同等品質のものを作る。

**How to apply:** このプロジェクトの作業時は、設計仕様とプランを必ず参照してから進める。

### ステータス（2026-03-27時点）
- 設計仕様: `docs/superpowers/specs/2026-03-27-voicetyping-design.md` ✅ 完了
- 実装プラン: `docs/superpowers/plans/2026-03-27-voicetyping-plan.md` ✅ 完了
- 実装: **未着手** — Task 1（Firebase Gemini Proxy）から開始

### アーキテクチャ概要
- STT: OS標準API（Apple Speech / Android SpeechRecognizer）— 無料・オンデバイス
- LLM整形: Gemini 2.0 Flash 無料枠（Firebase Cloud Function経由）
- フォールバック: Regex フィラー除去（オフライン時）

### プラットフォーム
- **iOS**: カスタムキーボード拡張（SwiftUI）— スマホ重視
- **Android**: カスタムIME（Kotlin + Jetpack Compose）
- **Mac**: メニューバーアプリ + グローバルホットキー（Right Option）

### 実装タスク（13個、5フェーズ）
1. Firebase Gemini Proxy ← **次はここから**
2. RegexCleanup（Swift shared）
3. LLMFormatter（Swift shared）
4. Xcode project + keyboard extension target
5. SpeechManager — 持続録音（沈黙で切れない）
6. Keyboard UI — SwiftUI layout + mic button
7. iOS Host App — onboarding + settings
8. Android project setup
9. Android RegexCleanup + LLMFormatter
10. Android IME — SpeechManager + Keyboard UI
11. Mac App — menu bar + global hotkey + floating window
12. End-to-End verification
13. Firebase deploy

### 核心UX（Gboardとの違い）
- 沈黙しても録音が切れない（ユーザーが明示的に停止するまで継続）
- 録音終了後にLLMがフィラー除去・文法修正・整形
- モード切替: カジュアル / ビジネス / テクニカル / そのまま

### 実行方式
- Subagent-Driven Development推奨（タスクごとにサブエージェント派遣）

### 再開時の指示テンプレート
```
VoiceTypingの実装を再開して。
プラン: docs/superpowers/plans/2026-03-27-voicetyping-plan.md
Task 1（Firebase Gemini Proxy）から開始。
Subagent-Driven Developmentで進めて。
```
