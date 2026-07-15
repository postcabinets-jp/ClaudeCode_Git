---
name: lovart
description: Generate high-quality slide images using Lovart AI platform via Claude Code. Specializes in the Nano Banana model which renders text accurately — ideal for slide covers, key visuals, and proposal documents. Use when the user wants to create slide images with AI without text corruption.
origin: local
---

# Lovart Slide Image Generation

Lovart is an AI image platform that unifies multiple models (Midjourney, GPT-4o, Nano Banana, etc.) in one place.
When connected to Claude Code, you can generate images by chat — no UI needed.

The **Nano Banana** model is the best choice for slides because it renders text accurately and readably, unlike Midjourney or Stable Diffusion which tend to corrupt text.

## When to Use

- Creating slide covers, title slides, or key visuals
- Proposal documents or seminar materials needing a polished cover
- Any slide where you want the title/text to appear directly in the image without post-processing
- When you want iterative refinement via chat (no Canva/Figma needed)

## One-Time Setup (10 minutes)

### Step 1: Get Lovart API Keys

1. Go to https://www.lovart.ai/ja/home and create an account
2. Click your profile icon (top right) -> "OpenClaw for Lovart"
3. Click "+ Create API Key"
4. Copy and save both:
   - `LOVART_ACCESS_KEY`
   - `LOVART_SECRET_KEY`

> Keys are shown only once. Save them immediately.

### Step 2: Add Keys to .env

In your project root:

```bash
echo "LOVART_ACCESS_KEY=your_key_here" >> .env
echo "LOVART_SECRET_KEY=your_key_here" >> .env
```

### Step 3: Verify Keys Are Loaded

Claude Code will automatically read `.env` on startup. Confirm with:

```bash
grep LOVART .env
```

## Workflow

### 1. Check Prerequisites

Before generating, verify:
- `LOVART_ACCESS_KEY` and `LOVART_SECRET_KEY` are set in `.env`
- If missing, run the setup steps above

### 2. Generate via Chat

Tell Claude what you want in natural language:

```
スライドのカバー画像を作って。
タイトル: 「AIで変わるデザインワークフロー」
スタイル: モダン、ダークブルー基調、テック感
```

Claude will call the Lovart API with Nano Banana model and return the image.

### 3. Iterative Refinement

No need to open Canva or Figma. Just continue the conversation:

```
もう少し濃い青にして
タイトルのフォントを大きくして
余白をもっと取って
背景にグリッドパターンを追加して
```

Each message triggers a regeneration.

### 4. Save Output

Generated images are returned as URLs or saved to `./output/` by default. Specify a path if needed:

```
output/slide-cover.png に保存して
```

## API Usage Pattern

```python
import os
import httpx

LOVART_ACCESS_KEY = os.getenv("LOVART_ACCESS_KEY")
LOVART_SECRET_KEY = os.getenv("LOVART_SECRET_KEY")

def generate_slide_image(prompt: str, output_path: str = None):
    """Generate a slide image using Lovart Nano Banana model."""
    headers = {
        "X-Access-Key": LOVART_ACCESS_KEY,
        "X-Secret-Key": LOVART_SECRET_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "model": "nano-banana",  # Best model for text-accurate slides
        "prompt": prompt,
        "size": "1920x1080",     # Standard slide aspect ratio
    }
    response = httpx.post(
        "https://api.lovart.ai/v1/generate",
        json=payload,
        headers=headers,
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    image_url = data["url"]

    if output_path:
        img_data = httpx.get(image_url).content
        with open(output_path, "wb") as f:
            f.write(img_data)
        return output_path
    return image_url
```

## Effective Prompt Patterns

### Slide Cover (Japanese)
```
スライドカバー画像。タイトル「{title}」を中央に大きく配置。
背景はダークネイビー、アクセントカラーはシアン。
プロフェッショナルなテックデザイン。16:9比率。
```

### Proposal Cover
```
提案書カバー。タイトル「{title}」、サブタイトル「{subtitle}」。
クリーンでミニマルなデザイン。ホワイトベース、ゴールドアクセント。
```

### Seminar Key Visual
```
セミナーキービジュアル。イベント名「{name}」、日付「{date}」。
動的でエネルギッシュなデザイン。グラデーション背景。
```

## Use Case Comparison

| Use Case | Recommended Approach |
|----------|---------------------|
| Cover / key visual (1 image, high quality) | **Lovart (this skill)** |
| Bulk slide generation (100+ slides) | Claude Code + Figma |
| Post-hoc text overlay | Claude Code + Canva |

Lovart costs per generation, so it's not practical for bulk (100+ slides). Use it for high-quality single images where quality matters.

## Cost Notes

- Lovart charges per generation
- Free credits available on signup
- Best for: covers, key visuals, important single slides
- Not ideal for: generating an entire deck of 50+ slides

## Troubleshooting

**"Authentication failed"**
- Check that LOVART_ACCESS_KEY and LOVART_SECRET_KEY are correctly set in `.env`
- Keys must be from the "OpenClaw for Lovart" section, not other API sections

**"Text is corrupted in output"**
- Make sure you're using `model: "nano-banana"` — other models don't handle text well
- Keep text in the prompt minimal and clear

**"Image doesn't match request"**
- Add more specific style descriptors
- Specify exact colors, layout positions, and text sizes
- Break complex requests into multiple refinement steps

## Related Skills

- `frontend-slides` — HTML presentation generation (zero-dependency, browser-based)
- `pencil` MCP — design directly in .pen files
