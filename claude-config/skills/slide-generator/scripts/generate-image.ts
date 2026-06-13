#!/usr/bin/env tsx
/**
 * OpenAI gpt-image-1 で画像を一括生成し、ローカルに保存する。
 *
 * Usage:
 *   tsx scripts/generate-image.ts --config <prompts.json> --out <imagesDir>
 *
 * prompts.json schema:
 *   [
 *     {
 *       "filename": "hero.png",
 *       "prompt": "...",
 *       "size": "1024x1024" | "1536x1024" | "1024x1536",
 *       "quality": "low" | "medium" | "high"
 *     },
 *     {
 *       "filename": "qr-demo.png",
 *       "type": "qr",
 *       "url": "https://anzen-manzen-flow.vercel.app/demo"
 *     }
 *   ]
 */

import OpenAI from 'openai'
import fs from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

interface ImageSpec {
  filename: string
  prompt?: string
  size?: '1024x1024' | '1536x1024' | '1024x1536'
  quality?: 'low' | 'medium' | 'high'
  type?: 'ai' | 'qr'
  url?: string
}

const PRICE: Record<string, number> = {
  low: 0.011,
  medium: 0.042,
  high: 0.167,
}

async function retry<T>(fn: () => Promise<T>, retries = 3, baseMs = 2000): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('content_policy_violation')) throw e
      console.warn(`[retry ${i + 1}/${retries}] ${msg}`)
      await new Promise((r) => setTimeout(r, baseMs * (i + 1)))
    }
  }
  throw lastErr
}

async function generateAi(spec: ImageSpec, outDir: string, openai: OpenAI) {
  const { filename, prompt, size = '1536x1024', quality = 'high' } = spec
  if (!prompt) throw new Error(`prompt required for AI image: ${filename}`)

  const result = await retry(() =>
    openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size,
      quality,
      n: 1,
    }),
  )

  const b64 = result.data?.[0]?.b64_json
  if (!b64) throw new Error(`No image data: ${filename}`)

  const out = path.join(outDir, filename)
  await fs.writeFile(out, Buffer.from(b64, 'base64'))
  const cost = PRICE[quality] ?? 0
  console.log(`[AI] ${filename} (${size} ${quality}) — $${cost.toFixed(3)}`)
  return cost
}

async function generateQr(spec: ImageSpec, outDir: string) {
  const { filename, url } = spec
  if (!url) throw new Error(`url required for QR: ${filename}`)

  // Dynamic import to avoid hard dep when not used
  const { default: QRCode } = await import('qrcode')
  const out = path.join(outDir, filename)
  await QRCode.toFile(out, url, {
    errorCorrectionLevel: 'M',
    width: 600,
    margin: 2,
    color: { dark: '#1a3a5c', light: '#ffffff' },
  })
  console.log(`[QR] ${filename} → ${url}`)
  return 0
}

async function main() {
  const { values } = parseArgs({
    options: {
      config: { type: 'string', short: 'c' },
      out: { type: 'string', short: 'o' },
    },
  })

  if (!values.config || !values.out) {
    console.error('Usage: tsx generate-image.ts --config <json> --out <dir>')
    process.exit(1)
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable required')
    process.exit(1)
  }

  const json = await fs.readFile(values.config, 'utf-8')
  const specs: ImageSpec[] = JSON.parse(json)
  const outDir = path.resolve(values.out)
  await fs.mkdir(outDir, { recursive: true })

  const openai = new OpenAI({ apiKey })
  let total = 0
  for (const spec of specs) {
    try {
      if (spec.type === 'qr') {
        total += await generateQr(spec, outDir)
      } else {
        total += await generateAi(spec, outDir, openai)
      }
    } catch (e) {
      console.error(`[FAIL] ${spec.filename}:`, e instanceof Error ? e.message : e)
    }
  }
  console.log(`\n[DONE] ${specs.length} images → ${outDir}`)
  console.log(`[COST] Total: $${total.toFixed(2)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
