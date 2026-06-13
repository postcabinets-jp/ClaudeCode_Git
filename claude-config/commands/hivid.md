---
description: Higgsfield で動画を生成する。cost確認→承認→create→wait の順で無駄クレジットを出さない
argument-hint: [モデル名] --prompt "..." [--image ./first.png] [その他オプション]
---

# /hivid — Higgsfield 動画生成（コスト確認ファースト）

`$ARGUMENTS` で動画を生成する。動画はクレジット消費が画像より大きいため、**cost確認と承認を特に厳守する。**

---

## 必須フロー

### Step 1: モデル確認（未指定の場合）

| 用途 | 推奨モデル | 特徴 |
|------|-----------|------|
| 汎用・高品質 | `veo3_1` | Google製、音声付き生成可 |
| 軽量版 | `veo3_1_lite` | veo3_1より安価 |
| シネマティック | `cinematic_studio_3_0` | カメラワーク制御 |
| SNS縦動画 | `kling3_0` | 9:16対応、動き滑らか |
| 高速生成 | `seedance_2_0` | 短い生成時間 |
| 人物一貫性 | `soul_cast` | Soul IDと組み合わせ |

```bash
# モデルのパラメータ詳細確認
hfs model get <model_name>
```

### Step 2: コスト見積もり（**生成前に必ず実行**）

```bash
hfs generate cost <model> --prompt "..." [--image ./first.png] [オプション]
```

> 「この動画生成は **X クレジット** かかります。実行しますか？」

動画は解像度・長さでクレジットが大きく変わる。**低解像度で試してから本番生成**を推奨。

### Step 3: ユーザー承認

承認なしで `generate create` を実行するのは禁止。

### Step 4: 生成実行

```bash
hfs generate create <model> --prompt "..." [オプション] --wait --wait-timeout 20m --wait-interval 10s
```

動画は生成に時間がかかるため `--wait-timeout 20m` を標準で設定。

### Step 5: 結果報告

- 出力URLを表示
- 使用コマンドをコードブロックで記録
- 消費クレジット数を報告

---

## よく使うオプション

```bash
# 解像度（まず 480p で試す）
--resolution 480p | 720p | 1080p

# アスペクト比
--aspect-ratio 16:9 | 9:16 | 1:1

# 動画長さ（秒）
--duration 5 | 10

# 最初のフレーム画像
--image ./first_frame.png

# 最初と最後のフレーム
--start-image ./start.png --end-image ./end.png

# JSON出力
--json
```

---

## クレジット節約ルール

1. **解像度は 480p から始める** — 動き・構図確認後に 1080p で本番生成
2. **画像から動画（img2vid）** — テキストのみより一貫性が高く無駄が少ない
3. **プロンプトは `nano_banana_2`（画像）で先に構図確認** してから動画化
4. アップロード済み画像の再利用: `hfs upload list --image`

---

## 注意事項

- `veo3_1` は `--image` が必須の場合あり（`hfs model get veo3_1` で確認）
- Soul ID を使う場合: `hfs soul-id list` で ID を確認してから渡す
- クレジット残高: `hfs account`
