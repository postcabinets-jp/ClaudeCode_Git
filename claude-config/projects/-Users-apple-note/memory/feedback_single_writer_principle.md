---
name: single-writer-principle
description: Vault（特にDaily）への自動書き込みは決定的コードのみ。LLMジョブにbypassPermissionsを与えることを禁止
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 99083b56-081a-4ea0-bb33-c436bf4889f2
---

**ルール:** Vaultに自動で書けるのは決定的コード（mtg_prep / evening_reviewのセクション書き込み / daily_guard）とNobu本人だけ。cron/launchdでclaude -pを起動するときは必ず `--disallowedTools "Write,Edit,NotebookEdit,Bash"` を付け、テキスト生成専用にする。`--permission-mode bypassPermissions` をvaultに対して使うのは禁止。

**Why:** 2026-07-08朝、prepは正常生成したのに08:10に`condition_update(copain)`署名の外部AIが🧬を劣化データで上書き（7/3にも同一事故）。犯人はkabeuchi等のbypassPermissions付きclaude -pで、LLMが「気を利かせて」ファイルを直接編集していた。決定的パイプラインをいくら固くしても、自由書き込みのLLMが同居する限り再発するため、Nobuが「修正しても崩れないようにしたい」と要求。

**How to apply:** 新しい自動化ジョブでclaude -pを使うときは必ずdisallowedToolsを付ける。書き込みが必要なら「LLMがテキストを返す→Pythonがセクション限定で書く」の2段構成にする。Daily破壊を検知したら`daily_guard.sh`（08:30/12:50）が復元し、証拠を`.hijack_HHMM.bak`に残す。関連: [[prep-v6-design]] V6.5
