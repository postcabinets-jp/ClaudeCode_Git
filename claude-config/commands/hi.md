---
description: Higgsfield CLI のスタートガイド。コマンド一覧・モデル選択・使い方を整理して表示する
argument-hint: [setup | models | status]
---

# /hi — Higgsfield スタートガイド

引数なしで実行 → フル整理を表示。
`$ARGUMENTS` が `setup` なら初回セットアップを案内。
`$ARGUMENTS` が `models` ならモデル一覧を取得して表示。
`$ARGUMENTS` が `status` なら残高とジョブ履歴を表示。

---

## 引数なし（デフォルト）の動作

以下を**この順番で**実行して1画面に整理する。

### 1. ログイン状態の確認

```bash
hfs auth --help 2>&1 | head -5
hfs account status 2>&1
```

未ログインなら：
```
⚠️  未ログインです。まず以下を実行してください：
    hfs auth login
```

### 2. コマンドチートシート（毎回表示）

以下をそのまま出力する：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Higgsfield CLI チートシート
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【起動コマンド名】
  hfs または higgsfield（hf は Hugging Face 専用のため使用禁止）

【スラッシュコマンド 使い分け】

  /hicheck [モデル] --prompt "..."
    → コストだけ確認。生成しない。まずここから。

  /higen [モデル] --prompt "..." [--image ./file.png]
    → 画像生成。cost確認→承認→create→wait の順で動く。

  /hivid [モデル] --prompt "..." [--image ./first.png]
    → 動画生成。480p から試すのが鉄則。

  /hi models
    → モデル一覧をリアルタイムで取得して表示。

  /hi status
    → クレジット残高 + 直近ジョブ確認。

【モデル早見表（用途 → モデル名）】

  画像 汎用     → nano_banana_2
  画像 高速安価  → nano_banana_flash
  画像 シネマ   → cinematic_studio_2_5
  画像 人物     → soul_cinematic / text2image_soul_v2
  画像 マーケ   → marketing_studio_image

  動画 汎用高品質 → veo3_1
  動画 軽量版    → veo3_1_lite
  動画 シネマ    → cinematic_studio_3_0
  動画 SNS縦動画 → kling3_0
  動画 高速      → seedance_2_0
  動画 人物一貫  → soul_cast

【クレジット節約の鉄則】
  1. 必ず /hicheck でコスト確認してから生成
  2. 動画は解像度 480p で構図確認 → 本番で 1080p
  3. 同じ画像を何度もアップしない → hfs upload list --image で再利用
  4. テキストより画像入力（img2vid）の方が無駄が少ない

【よく使う生フラグ】
  --resolution  1k/2k/4k（画像）| 480p/720p/1080p（動画）
  --quality     low/medium/high/ultra
  --aspect-ratio 1:1 / 16:9 / 9:16
  --wait        生成完了まで待ってURLを返す（必須）
  --json        JSON出力（スクリプト処理用）

【その他コマンド】
  hfs account status       クレジット残高確認
  hfs upload list --image  アップ済み画像一覧
  hfs generate list        直近の生成ジョブ一覧
  hfs soul-id list         Soul ID（人物参照）一覧
  hfs model get <name>     モデルの詳細パラメータ確認

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## `setup` の動作

初回セットアップ手順を案内する：

```
1. ログイン
   hfs auth login
   → ブラウザが開くのでHiggsfieldアカウントでOAuth認証

2. 残高確認
   hfs account

3. モデル一覧確認
   hfs model list --image
   hfs model list --video

4. テスト生成（最安モデルで動作確認）
   /hicheck nano_banana_flash --prompt "a white product on clean background"
   → コスト確認後に /higen で実行
```

---

## `models` の動作

リアルタイムでモデル一覧を取得して表示する：

```bash
echo "=== 画像モデル ===" && hfs model list --image 2>&1
echo "=== 動画モデル ===" && hfs model list --video 2>&1
```

---

## `status` の動作

残高と直近ジョブを確認する：

```bash
echo "=== 残高 ===" && hfs account 2>&1
echo "=== 直近ジョブ ===" && hfs generate list 2>&1 | head -30
echo "=== アップ済み画像 ===" && hfs upload list --image 2>&1 | head -20
```
