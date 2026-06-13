---
name: slide-generator
description: OpenAI Images API (gpt-image-1) で先進的なプレゼン画像を生成し、Marp Markdownスライドに自動埋め込み + PDF/PPTX出力。BtoB SaaS提案資料・営業資料・社内プレゼンに最適。
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Slide Generator Skill

OpenAI gpt-image-1 で生成した画像を Marp スライドに埋め込み、HTML/PDF/PPTX 形式で出力する。

## 前提条件

```bash
# 必須
export OPENAI_API_KEY="sk-..."

# CLI
npm install -g @marp-team/marp-cli
npm install -g tsx

# プロジェクト依存
npm install openai p-retry qrcode
```

## 利用フロー

### Step 1: 画像プロンプトを定義
JSON形式で生成したい画像を指定:
```json
[
  {
    "filename": "hero.png",
    "prompt": "Minimalist navy blue background, delivery truck line art...",
    "size": "1536x1024",
    "quality": "high"
  }
]
```

### Step 2: 画像を一括生成
```bash
npx tsx scripts/generate-image.ts \
  --config slides/sumirin/prompts.json \
  --out slides/sumirin/assets/images
```

### Step 3: スライドMarkdown作成
`slides/<deck>/deck.md` に Marp フォーマットで記述:
```markdown
---
marp: true
theme: default
size: 16:9
backgroundColor: #1a3a5c
color: white
---
# 安心安全万全フロー
![bg right:50%](assets/images/hero.png)
```

### Step 4: ビルド
```bash
# PDF
marp slides/sumirin/deck.md --pdf
# PPTX
marp slides/sumirin/deck.md --pptx
# HTML(Static)
marp slides/sumirin/deck.md
```

### Step 5: QRコード追加
Step 1 のJSONに `type: "qr"` を加えれば、URL→PNG変換でQR画像も同フォルダに生成される。

## 画像生成プロンプトのコツ

### スタイル統一(BtoB先進的)
- "Minimalist", "Premium", "B2B SaaS aesthetic", "Clean white background"
- ブランドカラー指定: "navy blue (#1a3a5c)", "orange accent (#f97316)"
- "No text", "No logos" — テキストはスライド側で

### 解像度選び
- ヒーロー画像: `1536x1024` (16:9 横長)
- 人物・正方形: `1024x1024`
- スマホモック: `1024x1536` (縦長)

### コスト目安
- gpt-image-1 high: $0.167/枚 ≒ 約25円
- 20枚スライド分 = 約500円

## ディレクトリ構成例

```
slides/
└── sumirin/                # 案件別フォルダ
    ├── prompts.json        # 画像プロンプト定義
    ├── deck.md             # Marp スライド本体
    ├── theme.css           # カスタムテーマ(任意)
    └── assets/
        ├── images/         # gpt-image-1生成画像
        └── qr/             # QRコード画像
```

## トラブルシューティング

| エラー | 対処 |
|---|---|
| `RateLimitError` | Tier昇格 or sleep間隔調整 |
| `content_policy_violation` | プロンプトを書き換え(リトライ不可) |
| `No image data returned` | `quality: 'low'` で再試行 |
| Marp PDF出力で日本語文字化け | `--allow-local-files` フラグ追加 |

## ベストプラクティス

1. プロンプトはバージョン管理(prompts.json をGit追跡)
2. 生成画像も Git に含める(コスト削減・再現性)
3. QRコードは固定文字列のみ生成(動的URLはサーバー側で)
4. PDFは `--allow-local-files` 付きで日本語ロード保証
