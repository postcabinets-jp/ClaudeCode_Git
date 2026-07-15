---
name: post-cabinets
description: POST CABINETSの請求書テンプレート情報。HTML→Chrome headless PDF変換で作成。
metadata: 
  node_type: memory
  type: reference
  originSessionId: e92994d7-96c8-4f7c-94dd-92a14b03aa68
---

## 発行者情報
- 会社名：株式会社POST CABINETS
- 〒530-0001 大阪府大阪市北区梅田1丁目2番2号 大阪駅前第2ビル12-12
- Email: info@postcabinets.com

## 振込先
- 銀行：GMOあおぞらネット銀行
- 支店：法人営業部（101）
- 口座種別：普通預金
- 口座番号：1859848
- 口座名義：カ）ポストキャビネッツ

## 備考の定型文
- 振込手数料はご負担くださいますようお願い申し上げます。

## テンプレートファイル
- HTML: `/Users/apple/Documents/請求書_かねひさ株式会社_20260430.html`（ベースとして流用可）

## PDF生成コマンド
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --print-to-pdf="[出力パス].pdf" \
  --print-to-pdf-no-header \
  --no-margins \
  --run-all-compositor-stages-before-draw \
  --virtual-time-budget=5000 \
  "file://[HTMLパス].html"
```

## レイアウトのポイント
- `@page { margin: 0; size: A4; }` でヘッダー/フッターを除去
- 振込先は `white-space: nowrap` で折り返し防止
- 配色：黒（#1a1a1a）ベース、Claude/Anthropic配色禁止
- フォント：Hiragino Kaku Gothic ProN / Hiragino Sans / Yu Gothic

## 命名規則
`請求書_{請求先会社名}_{請求日YYYYMMDD}.pdf`
