---
name: kindle
description: obsidian-kindle-pluginの保存先は必ずraw/Kindle。ルート(/)にすると起動毎に二重ファイル量産
metadata: 
  node_type: memory
  type: reference
  originSessionId: f9c6745e-66eb-4766-8f14-8cf533ca0a19
---

Kindleハイライトは `obsidian-kindle-plugin`（設定: `.obsidian/plugins/obsidian-kindle-plugin/data.json`）で同期。正本は `raw/Kindle/`。

**保存先は必ず `raw/Kindle`。** プラグイン設定 `highlightsFolder` を `/`(Vaultルート)にすると、`syncOnBoot:true`のたびにルート直下へ二重ファイルが量産される。

- 同期は各ファイルの `kindle-contentHash` で**同一パスを上書き更新**＝保存先が正しければ再同期しても重複しない（冪等）。**ファイル内でハイライトが二重追記されることはない**。重複の原因は常に「保存先ズレ」でファイル単位に発生する。
- 点検: `cd note && find . -maxdepth 1 -name '*.md' -exec grep -l '^kindle-asin:' {} +` → ルートにKindleファイルが出たら保存先設定がズレている合図。
- 重複除去手順: ASINで raw/Kindle と突合し、①中身一致＝ルート側削除 ②ルート側がhighlightsCount多い＝rawを新版で置換 ③ルートのみ＝新刊なのでraw/Kindleへ移動。
- **raw/Kindle/*.md は手編集しない**（syncOnBoot=trueで毎回上書き消滅）。抜き書き・洞察は `wiki/` へコンパイルして残す。
- 設定変更はObsidian起動中に data.json を直接書いても終了時にプラグインが上書きして無効化される→**プラグインUIで変更**するのが確実。

**Why:** 2026-07-05、highlightsFolderが`/`になっていて65冊がVaultルートに重複量産されていた（Nobuが「また同じように同期されてる」と気づいて発覚）。除去＋設定をraw/KindleへUI修正で対応。
**How to apply:** Kindle同期・重複の相談が来たら、まず上記findで保存先ズレを確認。ファイル内重複ではなくファイル単位重複を疑う。ルールはraw/Kindle/INDEX.mdの「同期ルール」節にも記載済。
