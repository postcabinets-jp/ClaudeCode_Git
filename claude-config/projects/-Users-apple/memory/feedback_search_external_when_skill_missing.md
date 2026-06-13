---
name: 足りない機能は外部を探して設計する
description: Claudeの既存Skill/MCP/標準ツールで足りない時、「できない/手動で」と妥協せず外部OSS・GitHub・PyPIを能動的に探して設計に組み込む
type: feedback
---

既存のClaude Skill・MCP・標準ツールで要件を満たせない時、その場の機能だけで妥協した設計（「APIが無いので手動」「ブラウザ操作で頑張る」等）を出すのは禁止。**まず外部（GitHub / PyPI / npm / OSS）を能動的に検索し、要件を満たすツールを見つけて設計に組み込む**こと。

具体手順：
1. 公式APIの有無をまず確認（WebSearch）
2. 無ければ「非公式API」「unofficial library」「github automate XXX」で必ず再検索
3. 見つけたら README / docs を WebFetch で読み、認証方式・主要関数・安定性警告まで確認してから設計に採用
4. 採用したら「これは非公式・壊れやすい」等のリスクも明示してフォールバックを用意

**Why:** NotebookLM連携の設計時、最初「一般向けAPIが無い→Geminiで再現 or ブラウザ手動」で妥協案を出したが、Nobuに「NotebookLM.pyとかGithubのSkillを探して最適設計しろ」と指摘された。実際 `teng-lin/notebooklm-py`（非公式Python API＋Claude Code Skill同梱、YouTube直投入→スライド/音声生成→DL）が存在し、これを使えば妥協不要だった。CLAUDE.md 0-2「できませんを簡単に言うな・最低3つ代替を試す」の具体化。

**How to apply:** 「この機能は標準ツールに無い」と感じた瞬間が外部探索のトリガー。新ライブラリ/Skill/MCPを設計の前提に組み込んでよい（むしろ推奨）。非公式ツールは安定性リスクを併記し、公式API or 自前再現のフォールバックを1つ用意する。
