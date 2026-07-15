# MEMORY.md

> このVaultの **絶対ルール集**。AIはこのファイルを起動時に必ず読む。
> **索引のみ**（1エントリ150字以内）。詳細は各サブファイル参照。フォルダ構成・禁則・raw→wikiの正本は毎セッション注入の `note/CLAUDE.md`。

## 索引

- [ユーザープロフィール](user_profile.md) — 前田将臣（大阪府議会議員）、政調会長、南大阪発展が軸
- [政治活動の業界用語](reference_業界用語.md) — 「叩き」=地域訪問・ポスティング（叩き台=draftとは別物）
- [朝会のToDo整理フロー変更](feedback_mtg_todo_flow.md) — GTasks正本を先に読む / ルーティン惰性ToDo廃止 / 新規やりたいこと毎日捕捉 / SNS自動催促廃止 / venvは`_system/.venv`（`.system`は誤り）
- [朝会は二択より現物整理が先](feedback_mtg_shiza_real_first.md) — 抽象的な二択を出す前にGTask/カレンダーを直読→整理・統合・断捨離してから具体案。Nobuは残骸を溜めたくない人
- [朝会V3設計](feedback_mtg_v3_design.md) — /MTG V3の設計メモ（Phase構成・秘書ブリーフィングの詰め）
- [カレンダー入力ルール](feedback_calendar_entry_rule.md) — カレンダーは①動かせない約束②60分以上の塊だけ。単発タスクは🧹雑務消化枠1個に集約・中身は説明欄/GTask。5分を15分枠にしない
- [カレンダーは目視要約せずスクリプト出力を唯一ソース](feedback_calendar_source_of_truth.md) — 予定確認前に`fetch_calendars.py [日付]`を回す。prep表鵜呑み・生JSON目視要約でカレンダーを2連続で外した(2026-06-15)
- [カレンダー書込み2原則](feedback_calendar_write_rules.md) — ①政治家=maeda.nobumi@gmail.com・個人=bachikanshikoku・事業=postcabinets ②colorIdは勝手に付けない/変えない。委任ドラフトは該当時間帯のイベント説明欄にobsidianリンク(2026-06-17)
- [AI秘書のキャラ定義＋SUMの目的（鏡→分身）](reference_秘書キャラクター定義.md) — 冷静な参謀秘書1本に統一(先生/卑屈/口調模倣のブレ禁止)。思考はNobu・実行段取りと外向け生産が秘書。SUMは毎朝prepが「外に出る成果物」1本を完成形で用意→GO/赤入れだけ
- [Claude設定はObsidianに一元化・Obsidian起点で動く](reference_claude設定_obsidian一元化.md) — 操作盤は[[wiki/_meta/Claude設定マップ.md]]。挙動変更は先にそこで対象ファイル特定。~/.claude物理移動は禁止(本体/launchd全壊)・cc-syncでGit同期済(2026-06-28)
- [朝会SUM起動シーケンス＋週次todo運用](reference_朝会と週次todo運用.md) — 毎朝7:00→/MTGの5フェーズ・気力ゲージ廃止/今日の宣言方式・GTask読取専用・Dailyテンプレ固定・ISO木曜週採番・当日タスク正本=Google Tasks
- [領域バランス＋経営者モード](project_領域バランス経営者モード.md) — 3本柱・POSTCABINETS3区分(👔経営/🔧振る/💭保留)・モード制・最低ライン(週3件/経営判断週1/思考枠週1枠)
- [自動化インフラ＋launchd波及先](reference_自動化インフラとlaunchd.md) — 対面=Limitless/オンライン=Fathom・Calendar Bridge・自動取込・ルール変更/リネーム時に確認すべきスクリプト/コマンド/launchd台帳
- [Inbox整理は移動のみ・手書き原本を消すな](feedback_inbox_整理_破壊禁止.md) — Inbox整理でファイル中身の削除/上書き/コンパイル後の原本削除は禁止。手書き素材はraw/へ移動し原本保存。削除は差分プレビュー→承認制。Daily/・Inbox/はgit外＝消すと復元不能
- [Kindle同期の保存先と重複防止](reference_kindle_sync.md) — obsidian-kindle-pluginの保存先は必ずraw/Kindle。ルート(/)にすると起動毎に二重ファイル量産。重複はファイル内でなくファイル単位に出る＝保存先ズレが原因。raw/Kindleは手編集しない
- [食事ログ(meal_log)アプリ](../../../../note/raw/アプリ開発/食事ログ_引き継ぎ.md) — PFC+水分記録Flutterアプリ。2026-07-05にMac mini→MacBook `~/dev/meal_log` へ再構築完了（Mac miniはSSH鍵未登録で入れない）。APKはGDrive マイドライブ/meal_log.apk
- [トレーニング自動化＋v2プログラム](project_training_automation.md) — Nobuは/トレーニングを手動で回さない→週次スケジューリング自動化(training_autoschedule.py 日曜)。プログラムv2=Push/Legs/Pull・週3・上半身2:脚1（脚偏重データを是正）。大会=FWJ West Japan 2026-11-07メンズフィジーク。reconcile(月次)/fwj_entry_watch(毎朝)も稼働

<!-- ↓ 旧 -Users-apple proj から統合（開発・品質・政治活動系）2026-07-15。user_nobu_profile↔user_profile は重複の可能性・要整理 -->
- [Nobuプロフィール](user_nobu_profile.md) — 前田将臣の基本情報・ミッション・思考グセ・行動原則
- [政治活動コンテキスト](project_political_activity.md) — 維新府議団政調会長・2026年目標・2031年（40歳）引退計画
- [Obsidian noteの構造と差分ルール](reference_obsidian_note.md) — ~/noteのフォルダ構成・Dreaming時の差分チェック手順
- [自己修正ループ＆できません禁止](feedback_quality_loop.md) — 提出前に2周セルフ検証、代替手段3つ試すまで諦めない
- [ビジュアル成果物は参考イメージ先出し](feedback_design_reference_first.md) — スライド/LP/UI/画像は文字仕様だけで作らない、3〜5枚先に提示
- [~/.claude セットアップ構成](reference_claude_md_setup.md) — CLAUDE.md / commands / agents の配置（2026-05-15更新）
- [X Radar: X→Obsidian AI情報収集](project_x_radar.md) — twikit+Haiku/Opusで2h毎取得・分類→~/note/wiki/ai-radar/に保存
- [請求書フォーマット（POST CABINETS）](reference_invoice_format.md) — 発行者情報・振込先・PDF生成コマンド・レイアウト注意点
- [Mac電力消費の常駐アプリ対策](reference_mac_power_saver.md) — Dia/Obsidianが浪費。放置検知の自動省エネ常駐ジョブ設置済み。診断はpmset単独でなくtop+ps+RSSまで
- [安全完全万全フロー 海外SCM拡張](project_anzen_manzen_scm.md) — かねひさ×住友林業の物流アプリ。海外SCM設計書docs/GLOBAL_SCM_DESIGN.md。粗利は荷主だけ＝最重要要件
- [SQL設計は実DBで流して検証する](feedback_verify_sql_in_real_db.md) — スキーマ/RLS設計はローカルPG14で流すと机上で見えない穴が出る。手順あり
- [anzen-flow モノレポ構成と落とし穴](reference_anzen_monorepo.md) — 安全完全万全フローを3アプリ分割(pnpm+Turbo+Next16)。二重React型/proxy規約/Tailwind v4 @sourceのハマり所
- [足りない機能は外部を探して設計する](feedback_search_external_when_skill_missing.md) — 標準Skill/MCPに無い時は妥協せずGitHub/PyPI/OSSを能動検索して設計に組込む（例: NotebookLM→notebooklm-py）
- [mtg_prep事前準備の障害対策](reference_mtg_prep_watchdog.md) — claude -pのMCPデッドロック対策。無人ジョブは--strict-mcp-config/15分timeout/stale-lock/verify_daily_prep/watchdog(06:20)/status反映通知。mtg_prep改修時必読
- [筋トレログ(iron_log)アプリ](../../../../note/raw/アプリ開発/筋トレログ.md) — Health Connect連携の筋トレ記録アプリ(~/dev/iron_log)。状況/機能/ビルドはVault raw/アプリ開発/に整理。実装ほぼ完了・実機テスト待ち
- [Flutter/Android無人ビルドの罠](reference_flutter_android_build_env.md) — Gradleはsandbox無効化必須/CDNタイムアウトはローカルzip参照/同一プロジェクトのGradleは常に1本
- [並行マルチエージェント実装の分担術](feedback_parallel_agent_foundation.md) — 単一コードベースに多機能並行投入は「共有基盤を親が先に1本化→1ファイル1担当→統合は親」で衝突ゼロ
- [YouTubeダイジェストはAI/政治/ビジネス限定](feedback_youtube_digest_genre.md) — youtube_digest.pyはミッション3本柱をハードフィルタ化＋"ai"の語境界一致。スポーツ/エンタメ/健康は除外（2026-06-17修正）
- [ブラウザGoogle自動認証の仕組み](reference_browser_auto_auth.md) — Chrome操作中にGoogleログイン/同意が出たら自動で通す。Keychain→クリップボード→MCP貼付で秘密を文脈に通さず入力（旧keystroke方式は失敗）

---

## 📆 連携カレンダー（7アカウント）

`/MTG` の Phase 0 で全カレンダーから今日の予定を取得（CLAUDE.md §6 はここを参照）：

| ID | ラベル |
|---|---|
| `bachikanshikoku@gmail.com` | My Calendar |
| `maeda.nobumi@gmail.com` | 政治家（メイン・スケジュール集約先） |
| `postcabinets@gmail.com` | POSTCABINETS |
| `maeda.nobumi@oneosaka.jp` | 前田信美(維新) |
| `hikaeshitsu@oneosaka.jp` | 維新府議団 控室 |
| `fugikai.ishin@gmail.com` | 維新府議団 |
| `duxdcw@gmail.com` | duxdcw |

設定ファイル: `~/.config/calendar-sync/calendars.json`
