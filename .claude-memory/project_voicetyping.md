---
name: VoiceTyping プロジェクト
description: 無料の音声入力アプリ（iOS keyboard + Android IME + Mac menu bar）。Typeless/Speakly代替。
type: project
---

## VoiceTyping — 無料クロスプラットフォーム音声入力アプリ

**Why:** Typeless ($12/月) や Genspark Speakly ($25/月〜) が高いので、無料で同等品質のものを作る。

**How to apply:** このプロジェクトの作業時は、設計仕様とプランを必ず参照してから進める。

### ステータス（2026-03-27更新）
- 設計仕様: `docs/superpowers/specs/2026-03-27-voicetyping-design.md` ✅ 完了
- 実装プラン: `docs/superpowers/plans/2026-03-27-voicetyping-plan.md` ✅ 完了
- 実装: **Task 1〜11, 13 全完了** — 全3プラットフォーム + Firebase config実装済み、PRマージ済み
- 残り: **Task 12（E2Eビルド確認）** — 実機/シミュレータでのビルドテスト

### 実装済みファイル（55+ファイル）
- `voicetyping/firebase/` — Cloud Function + deploy config ✅ ビルド成功
- `voicetyping/ios/` — Xcode project + keyboard extension + host app ✅ xcodegen成功
- `voicetyping/android/` — Gradle project + IME + Compose UI ✅
- `voicetyping/mac/` — Menu bar app + global hotkey ✅ xcodegen成功

### 残タスク: E2Eビルド確認 + Firebase Deploy
1. iOS: Xcodeでシミュレータビルド確認
2. Mac: VoiceTypingMac.xcodeprojビルド確認
3. Android: `./gradlew assembleDebug` 確認
4. Firebase: `firebase login` → `firebase functions:secrets:set GEMINI_API_KEY` → `firebase deploy --only functions`

### 核心UX（Gboardとの違い）
- 沈黙しても録音が切れない（ユーザーが明示的に停止するまで継続）
- 録音終了後にLLMがフィラー除去・文法修正・整形
- モード切替: カジュアル / ビジネス / テクニカル / そのまま

### 再開時の指示テンプレート
```
VoiceTypingのE2Eビルド確認 + Firebase Deployを進めて。
プラン: docs/superpowers/plans/2026-03-27-voicetyping-plan.md
Task 12から。
```
