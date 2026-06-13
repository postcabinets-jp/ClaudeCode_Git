---
description: Higgsfield で画像を生成する。cost確認→承認→create→wait の順で無駄クレジットを出さない
argument-hint: [モデル名] --prompt "..." [--image ./file.png] [その他オプション]
---

# /higen — Higgsfield 画像生成（コスト確認ファースト）

`$ARGUMENTS` で画像を生成する。**必ず cost を確認してからユーザーに承認を取り、create を実行する。**

---

## 必須フロー（順番を変えるな）

### Step 1: モデル確認（モデル未指定の場合）

引数にモデル名がなければ用途に合ったモデルを提案する：

| 用途 | 推奨モデル |
|------|-----------|
| 汎用高品質 | `nano_banana_2` |
| シネマティック | `cinematic_studio_2_5` |
| 人物一貫性 | `soul_cinematic` / `text2image_soul_v2` |
| マーケ素材 | `marketing_studio_image` |
| 高速・安価 | `nano_banana_flash` |
| 広告用 | `dtc_ads`（`--style_id` 必須） |

モデルパラメータを確認する場合：
```bash
hfs model get <model_name>
```

### Step 2: コスト見積もり（**実行前に必ず**）

```bash
hfs generate cost <model> --prompt "..." [オプション]
```

取得したクレジット数をユーザーに報告：
> 「この生成は **X クレジット** かかります。実行しますか？」

### Step 3: ユーザー承認を得る

承認なしで `generate create` を実行するのは禁止。

### Step 4: 生成実行

```bash
hfs generate create <model> --prompt "..." [オプション] --wait
```

`--wait` を必ずつける（ポーリング自動化）。デフォルト timeout は 10m。

ローカルファイルは `--image ./path.png` でそのまま渡せる（自動アップロード）。

### Step 5: 結果報告

- 出力URLをそのまま表示
- 生成に使ったコマンドをコードブロックで記録（再現性のため）
- クレジット消費数を報告

---

## よく使うオプション

```bash
# 解像度
--resolution 1k | 2k | 4k

# アスペクト比
--aspect-ratio 1:1 | 16:9 | 9:16 | 4:3 | 3:4

# クオリティ
--quality low | medium | high | ultra

# 画像を入力として使う（image-to-image）
--image ./input.png
--image <upload_id>

# JSON出力（パース用）
--json
```

## Soul ID を使う場合

```bash
# Soul ID 一覧確認
hfs soul-id list

# Soul ID を使って生成（soul_cinematic モデル）
hfs generate cost soul_cinematic --prompt "..." --soul-id <soul_id>
```

---

## 注意事項

- `--wait` なしで実行すると job_id が返るだけ。結果は `hfs generate wait <job_id>` で取得
- クレジット残高確認: `hfs account`
- アップロード済み素材の再利用: `hfs upload list --image`（同じ素材を何度もアップロードしない）
