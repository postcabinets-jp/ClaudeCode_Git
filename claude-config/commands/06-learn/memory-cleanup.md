---
description: MEMORY.md と memory/*.md を整理・統合・重複排除。古い記録の削除と矛盾解消
---

# /memory-cleanup — auto-memory を健全に保つ

`~/.claude/projects/-Users-apple/memory/` の整理を行う。

## 実行手順

### 1. インデックス確認
- `MEMORY.md` を読む
- 各エントリのリンク先ファイルが存在するか確認
- 死んだリンク（ファイルがない）を検出

### 2. 各メモリファイルを読む
- type別（user/feedback/project/reference）に分類
- 内容を1〜2行で要約

### 3. 重複検出
- 同じトピックを扱うメモリを発見
- 統合候補をユーザーに提示

### 4. 矛盾検出
- 「Xすべき」と「Xしてはいけない」のような矛盾
- どちらが正しいかユーザーに確認

### 5. 古さチェック
- project type は特に古くなりやすい
- 30日以上前のproject memoryで、現在のリポ状態と乖離しているもの

### 6. 提案
```
## 統合候補
- [memoryA] + [memoryB] → 統合案: ...

## 削除候補
- [memoryC]: 内容が現在のコードベースと一致しない（git logで確認済み）

## 矛盾
- [memoryD] vs [memoryE]: どちらを採用？

## MEMORY.md の整理
- 並び順をtype別 → 鮮度順 に整理
- 長すぎる行を短く
```

### 7. ユーザー承認後に実行
- ファイル削除 / 統合 / MEMORY.md 書き換え
- 削除前にバックアップ（`memory.backup-YYYYMMDD/`）

## 禁止
- ユーザー確認なしの削除
- バックアップなしの書き換え
- 「全部消してまとめ直す」（保守的に統合）
