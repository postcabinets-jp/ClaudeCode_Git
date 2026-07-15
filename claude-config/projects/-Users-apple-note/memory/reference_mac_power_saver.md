---
name: mac
description: Dia/Obsidianの電力浪費の真因と、放置検知の自動省エネ常駐ジョブの場所
metadata: 
  node_type: memory
  type: reference
  originSessionId: 18bb65c4-bdc4-458e-bc03-5ca8817fb8ef
---

NobuのMacは常駐アプリの電力浪費が起きやすい。実測で判明した真因と対策。

## 真因（2026-06-01実測）
- **Dia ブラウザ**: 35タブ・6.9GB・45プロセス。さらに `NSAppSleepDisabled=1` を自分で立てて**macOSのApp Nap省電力を無効化**していた（最悪の組み合わせ）
- **Obsidian**: Renderer単体4.77GB。主因は重量プラグイン2つ — `surfing`（Obsidian内蔵ブラウザ＝実質3本目のブラウザ）と `smart-connections`（全ノートAI埋め込み常駐）
- VoiceInk: CloudKit importタスクがCPU0%のままスリープを12時間阻害する不具合あり（電力直接消費は小だが夜間の待機電力を浪費）

## 追加の真因（2026-07-13実測）
- **firebase MCP のゾンビ積み上がり**が放電の主犯だった。`npm exec firebase-tools@latest mcp` が**セッション終了後もkillされず残存**し、4セット8プロセスまで溜まって各196%/110%CPUを張り付かせていた。前日14:22→翌03:17で71%→5%まで落ちていた。
  - firebaseはanzen-flow等の特定案件でしか使わないのに毎セッション起動して常時回るのが構造的欠陥。
  - 教訓: npx/npm-exec経由のMCPサーバはゾンビ化して累積する。CPU上位を見るとき`node`の正体を`ps -o command`で必ず追う（親が`npm exec ...mcp`なら暴走MCP）。

## 設置した対策（常駐・自動）
- `~/bin/power-saver.sh` + `~/Library/LaunchAgents/com.nobu.power-saver.plist`
  - 60秒ごと起動。**アイドル非依存で毎回**: 暴走MCP検知→kill（CPU80%超の個体を即kill＋`npm exec firebase-tools ...mcp`親が2セット以上ならpkillで間引き）。2026-07-13追加、ダミー100%プロセスで検知kill実証済み。
  - **バッテリー駆動=5分 / AC=10分アイドル超過時のみ**動作:
    ① DiaのNSAppSleepDisabledをfalse化（App Nap復活）
    ② ハングしたVoiceInkをkill（CPU<1%なのにスリープ阻害）
    ③ Obsidian Renderer 3GB超で警告ログ（killはしない）
  - ログ: `~/Library/Logs/power-saver.log`
  - 解除: `launchctl unload ~/Library/LaunchAgents/com.nobu.power-saver.plist`
- `~/Library/Application Support/obsidian/argv.json` — Electronのメモリ制限（`--max-old-space-size=512`, `enable-low-end-device-mode`）。次回Obsidian起動から有効
- `~/bin/obsidian-lite.sh [off|on|status]` — surfing/smart-connectionsを**手動**トグル（Obsidian再起動を伴う。自動化はvault破損リスクで避けた）

## 診断の教訓
**スリープ阻害（pmset -g log/assertions）と消費電力は別物。** 最初VoiceInkのスリープ阻害ログだけ見て「主犯」と誤断した。電力の真因はCPU%（top）・累積CPU時間（ps -o time）・RSS実測で判明。`powermetrics`はsudo必須でサンドボックス不可、4指標で代替した。

**Why:** Nobuに「本当にそうかな？もうちょい調べて」と再調査を求められ、初回の即断が間違っていた。
**How to apply:** Mac電力/パフォーマンス診断では pmset だけで結論を出さず、必ず top + ps累積CPU + RSS実測まで降りる。常駐前提のNobuには「消す」でなく「常駐のまま省エネ」を設計する。
