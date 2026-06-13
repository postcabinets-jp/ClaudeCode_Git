---
description: Higgsfield のクレジットコストだけを確認する。生成は実行しない
argument-hint: [モデル名] --prompt "..." [オプション]
---

# /hicheck — Higgsfield コスト確認のみ（生成しない）

`$ARGUMENTS` のクレジット消費を見積もる。**generate create は実行しない。**

「これ何クレジット？」を素早く確認するためのコマンド。

---

## 実行内容

```bash
hfs generate cost <model> --prompt "..." [オプション]
```

結果を以下の形式で報告する：

```
モデル:     <model_name>
クレジット:  X credits
解像度:     <resolution>
アスペクト:  <aspect-ratio>

→ 実行する場合: /higen <同じ引数>
→ 動画の場合:   /hivid <同じ引数>
```

---

## よくある確認パターン

```bash
# 画像コスト確認
/hicheck nano_banana_2 --prompt "cinematic product photo" --resolution 2k

# 動画コスト確認（解像度違いで比較）
/hicheck veo3_1_lite --prompt "slow push-in shot" --resolution 480p
/hicheck veo3_1_lite --prompt "slow push-in shot" --resolution 1080p

# モデル比較（どのモデルが安いか）
/hicheck nano_banana_flash --prompt "..."
/hicheck nano_banana_2 --prompt "..."
```

---

## クレジット残高確認

コスト確認と合わせて残高も表示する：
```bash
hfs account
```