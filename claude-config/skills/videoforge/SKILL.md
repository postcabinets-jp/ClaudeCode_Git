---
name: videoforge
description: SNSショート動画（YouTube Shorts/TikTok/Reels）を自動生成する。スクリプト生成→音声合成→スライドレンダリング→動画書き出しまでワンコマンドで完結。POST CABINETSの動画量産パイプライン。
origin: local
---

# VideoForge — ショート動画自動生成

## プロジェクトパス
`/Users/apple/POSTCABINETS.co-ltd/videoforge`

## 起動前の確認

```bash
# VOICEVOXが起動していなければ起動
open -a VOICEVOX

# Style-BERT-VITS2を使う場合（音質が良い・推奨）
cd /Users/apple/POSTCABINETS.co-ltd/videoforge
python3.10 scripts/start-sbv2.py &
# → http://127.0.0.1:5000 で起動。VOICEVOXより自然な日本語音声
```

## コマンド

```bash
cd /Users/apple/POSTCABINETS.co-ltd/videoforge

# テストスクリプトで動作確認（APIキー不要）
npm run render:auto
# = tsx src/index.ts render-auto --test

# 実際のトピックで生成
npx tsx src/index.ts render-auto --topic "ChatGPTで仕事を3倍速くする方法"

# 画像生成スキップ（Remotionシーンコンポーネントを使用・推奨）
npx tsx src/index.ts render-auto --topic "..." --skip-images

# Remotion Studioでプレビュー
npm run preview
```

## パイプライン構成

```
トピック入力
  ↓
[Step 1] スクリプト生成 (Claude Haiku)
  → hook / title / points×3 / summary / cta
  ↓
[Step 2] スライド画像生成 (Gemini Nano Banana Pro) ※skip-imagesで省略可
  ↓
[Step 3] 音声合成 (Style-BERT-VITS2 or VOICEVOX)
  → シーンごとにWAV生成 → 結合 → BGM/SEミックス
  ↓
[Step 4] 字幕生成 (timing.jsonベース / Whisper)
  ↓
[Step 5] 動画レンダリング (Remotion)
  → HookScene / TitleScene / PointScene×3 / SummaryScene / CTAScene
  ↓
[自己修正ループ] QualityAudit → TimingFix → 再レンダリング (最大3回)
  ↓
output/videos/*.mp4
```

## 音声エンジン

| エンジン | 起動方法 | 品質 | 備考 |
|---------|---------|------|------|
| **Style-BERT-VITS2** (推奨) | `python3.10 scripts/start-sbv2.py &` | ★★★★★ | Happy/Angry/Neutral スタイル対応 |
| VOICEVOX | `open -a VOICEVOX` | ★★★ | フォールバック用。speaker_id=81(青山龍星/熱血) |

SBV2が `http://127.0.0.1:5000` で起動していれば自動でSBV2を使用。未起動ならVOICEVOXにフォールバック。

## SBV2パラメータ（現在の設定）

```
style: Happy / style_weight: 10.0
length: 1.1 (やや遅め)
intonation_scale: 1.3
```

`scripts/start-sbv2.py` で調整可能。

## スライドコンポーネント（Remotion）

| シーン | コンポーネント | 内容 |
|--------|--------------|------|
| Hook | `HookScene` | パルスリング + 単語ステッガーアニメ |
| Title | `TitleScene` | タイトルスライドアップ + コーナー装飾 |
| Point×3 | `PointScene` | 巨大ナンバー + ガラスパネル + emphasis強調 |
| Summary | `SummaryScene` | チェックアイコン + カードスタッガー |
| CTA | `CTAScene` | フォローボタンUI + パルスリング |

Gemini画像がある場合はフルスクリーン表示。ない場合はRemotionコンポーネントを使用。

## スクリプトのフックパターン

```
衝撃数字型: 「ChatGPTユーザーの9割が損してる使い方」
問いかけ型: 「まだ損してませんか？」
逆説型:    「プロンプトエンジニアは実は不要です」
```

## 出力

```
output/videos/{timestamp}_{hooktype}-{duration}s.mp4
output/scripts/{timestamp}.json
output/temp/{timestamp}/timing.json
output/temp/{timestamp}/audio/
```

## 改善ロードマップ（TODO）

- [ ] SBV2スタイルをシーンごとに変える（hookはAngry、pointはHappy等）
- [ ] BGMに実際のlofiトラックを追加（現在はダミーがなければスキップ）
- [ ] スクリプトテンプレートのバリエーション追加（データ型・ストーリー型）
- [ ] バッチ生成（複数トピックを一括処理）
- [ ] Whisperによる字幕精度向上
