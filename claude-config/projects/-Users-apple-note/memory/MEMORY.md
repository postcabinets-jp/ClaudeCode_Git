# Nobu's Note System — Memory

## ユーザー設定・好み

### Markdownフォーマット
- **Dailyノートに書くとき、セクション内のラベル（「達成：」「持ち越し：」等）は必ず `**太字:**` で書く**
- リストの直前には必ず空行を入れる

### ファイルリンク
- **作成・変更したVault内ファイルは毎回Obsidianリンクで出す**
- 形式: `[表示名](obsidian://open?vault=My%20note&file=パス)` （.md省略、スペースは%20）
- Vault外のファイル（`~/.note-system/`等）はパスをそのまま表示

### セッション運用ルール（2026-06-19確定）
- **セッションで実施した内容をDailyページに毎回記録する** — `## 🌙 Dreaming` セクションをページ末尾に追記
- **Memory反映内容をセッション開始時に毎回確認・報告する** — 「今日関連するMemoryはXX」を冒頭1行で示す

## システム構成（Mac mini: nobunoMac-mini.local）

### ベースパス
- Vault: `/Users/nobu/My note`
- スクリプト: `~/.note-system/scripts/`
- 既存ツール: `~/.openclaw/scripts/`
- ログ: `~/.note-system/logs/`
- LaunchAgents: `~/Library/LaunchAgents/com.postcabinets.*`

### launchd 18ジョブ（2026-06-17 全面整備）
| plist | 時刻 | スクリプト | 用途 |
|---|---|---|---|
| `auto-dreaming` | 01:00 | `auto-dreaming.sh` | セッション学び抽出→Memory |
| `nar` | 02:30 | `nar.sh` | Night Auto-Review |
| `youtube-digest` | 02:30 | `youtube_digest.py` | YouTube注目動画→raw/YouTube/ |
| `mtg-prep` | 03:00,04:00 | **`mtg_prep.sh`** | **V6.4**（2026-07-07）: ナビ→🎯→📥→🧬→8.5書き戻し→9 Weekly→9.5連鎖ヘルス→10セルフ検証 |
| `morning-briefing` | 05:00 | `morning_briefing.sh` | Notionコンテキスト+カレンダープリフェッチ |
| `limitless-sync` | 06:30,22:00 | `limitless_sync.sh` | Limitless録音→raw/ |
| `mtg-prep-watchdog` | **06:50** | `mtg_prep_watchdog.sh` | prep失敗リトライ+**Limitless後着検知→再生成**（V6.4で06:20→06:50、limitless-sync 06:30の後） |
| `note.morning` | 07:00 | `morning_brief.sh` | Dailyノート作成+朝通知 |
| `nightly-scan` | 07:05 | `notion-nightly-scan.mjs` | Notion→タスク自動登録 |
| `morning-kabeuchi` | 08:00 | `morning_kabeuchi.sh` | 壁打ち質問3つ生成→通知 |
| `graph-autolink` | 月曜08:30 | `graph_autolink.py` | wiki/リンク候補レポート |
| `weekly-review` | 日曜20:00 | `weekly_review.sh` | 週次レビュー |
| `evening-review` | 22:00 | `evening_review.sh` | **V5**: 突合+📌引き継ぎ+💭メモ転記 |
| `midday-check` | 13:00 | `midday_check.sh` | **V5**: 午前消化チェック+午後リマインド（通知のみ） |
| `kokkai-fetch` | 6h毎 | `kokkai_fetch.sh` | 国会API取得 |
| `kokkai-sync` | 4h毎 | `kokkai_sync.sh` | 国会→Notion同期 |
| `ironlog-ingest` | 1h毎 | `ironlog_ingest.py` | 筋トレログ→raw/トレーニング.md |
| `git-autopull` | 5分毎 | インライン | claude for me リポ自動更新 |
| `socat-proxy` | 常駐 | socat | TCP 3100転送 |

| `nikkei-digest` | 04:30 | `nikkei_digest.py` | 日経電子版ヘッドライン→logs/ |

**停止済み（.disabled）**: linear-agent-loop, early-push, midnight-push, dashboard, **paperclip**（2026-06-19 auto-dreaming誤混入のため停止）, **condition-update**（2026-07-06 V6.3でStep 4.5に統合・copain競合解消のため停止）

### 3フェーズ実行順序（V6 — 2026-07-01〜）
**朝:** 01:00 dreaming → 02:30 nar+youtube → 03:00/04:00 **mtg-prep(V6.4)** → 04:30 nikkei-digest → 05:00 briefing → 06:30 limitless → **06:50 watchdog（後着リカバリ）** → 07:00 morning → 07:05 nightly-scan → 08:00 kabeuchi
**昼:** 13:00 midday-check（通知のみ）
**夜:** 22:00 limitless-sync → **22:05** evening-review（V6.2: 5分ずらしでレース条件回避。7/4事故の教訓）

### 既存スクリプト（openclaw）
- `~/.openclaw/scripts/gcal-helper.py` — Googleカレンダー取得
- `~/.openclaw/scripts/limitless-daily-digest.sh` — Limitlessダイジェスト生成
- `~/.openclaw/scripts/morning-notion-reader.sh` — Notion目標・優先事項取得

## Dailyノート構成（V6.4 — 2026-07-07実装済み）
テンプレート: `/Users/nobu/My note/_system/templates/Daily.md`
設計書: `wiki/_meta/prep-v6-design.md` (status: V6.4)
V6.4追加: **🔗ナビ行（`<!-- prep_nav -->`・Mission/ゴール/月次/週次/プロジェクト/Inbox）**、**連鎖⚠️行（`<!-- prep_chain -->`・上位層の鮮度警告）**、💭は常時表示（なし時「（メモなし）」）
設計原理: **claude -p完全廃止・Python直書き。整合は週次/月次に任せ、日次は材料を横に置くだけ**
V6.3追加: **[x]完了フィードバックループ（過去7日Daily→bi-gramマッチ→📌＋NARテーブル除外）、💭テンプレ判定、copainガード、set -e除去**

**5セクション:**
- `## ✍️` — Nobu手書き（AI触らない。翌朝Prepが📥に💭転記）
- `## 🎯 今週の重要タスク` — Wn.mdの「今週の確実ライン」を転記（生成しない）
- `## 📥 引き継ぎ` — **4サブセクション**: ✅やったこと(要点3つ+Limitlessトグル) / 🔎次の一手(NAR独立+ゴールタグ) / 📌持ち越し(日数カウント) / 💭メモ
- `## 🧬 コンディション` — **分析付き**（折りたたみしない）。体重vs月次MS / トレ頻度vs週4 / BIG3推移 / 睡眠×回復 / コーチメモ
- `## ✅ 突合` — evening_review **22:05**（limitless_sync 22:00の後）

**注意**: `update_daily_section.py`が`## 📥`更新時に`<details>🧬`を飲み込むため、Step 4.5で再挿入ロジックあり

**カレンダー書き戻し（Step 8.5）:**
- `gcal_write_shikou.py` — 思考整理イベントに現在地サマリ
- `gcal_write_training.py` — トレーニング枠にDay A/Bメニュー
- `gcal_create_feedback.py` — ✍️メモ→13-17時空き枠にフィードバック赤イベント

**V5→V6で廃止:**
- `claude -p` 呼び出し全廃（レートリミット・認証切れの根治）
- 🔗ナビ, 📊今月の進捗, 📍今週の進捗, 📅今日の予定, 🎯今日の3発, 📚読書, 📰ニュース, 🧬コンディション（旧##形式）
- `mtg_prep_v2.sh` → `mtg_prep.sh` に差し替え（plist更新済み）

## 未解決の課題
- MacBook側の `com.postcabinets.mtg-prep` を停止する必要あり（二重書き込み防止）
- YouTube OAuth初回認証が未実施（ブラウザ認証が必要）
- **Health API OAuth認証が必要** — `python3 ~/.note-system/scripts/google_health_auth.py` を1回実行（ブラウザ認証）。GCPプロジェクト(444348039130)でHealth APIの有効化も要確認
- **MacBook→Mac mini移行後に未実施のルーティンあり** — どれが未実施か確認・修正が必要（2026-06-21指摘）
- **Prep未実装機能**: プロジェクト整合性チェック（2026-06-21確定要件。Weekly更新は2026-06-27実装済み）
- **Obsidian Chrome拡張ブロック（2026-06-22発生）**: `mmlmfjhmonkocbjadbfplnigmagldckm`（Web Clipper）が `ERR_BLOCKED_BY_CLIENT` でブロックされる。uBlock等の広告ブロッカーが原因の可能性。解決策未確認
- ~~**Prepニュース取得が機能していない（2026-06-27確認）**~~ → **V6で廃止**（ニュースセクション自体を削除）
- **LimitlessAPIデータ取得エラー（2026-06-30確認）**: DailyページにLimitlessデータが反映されていない。Nobuは「必ずとれる。Errorになる理由がない」と明言 → [feedback_limitless_api_discipline.md](feedback_limitless_api_discipline.md)
- ~~**Prep V6でも2026-07-04/07-07のDailyページが不正**~~ → **2026-07-07 V6.4で構造対処**: ①週番号を`week_of()`（ISO木曜規約・月〜日週）に一本化（旧`(日-1)/7+1`は禁止） ②📌は「M/Dまで」明示のみ期日・他は最終言及日から「N日停滞」 ③プロジェクト.md日次突合（`project_daily_sync.py`・Daily[x]→反転＋アーカイブ移動） ④Weekly同期を新ダッシュボード形式対応＋ソースは今日のDaily（前日ラベル） ⑤生成後セルフ検証（`validate_daily.py`）不合格で通知 ⑥Limitless後着はwatchdog 06:50が再生成。詳細: wiki/_meta/prep-v6-design.md V6.4
- **B.ring健康データ連携（2026-06-27接続失敗）**: 睡眠・消費カロリーデータ取得を試みたが接続できず → [reference_bring_health_integration.md](reference_bring_health_integration.md)
- **Inbox処理のPrep統合（2026-07-07再発）**: inbox_triage.pyは「実装済み」だが、Nobuが「InboxメモをPrepで拾えてるんかな？ファイルの移動も機能していない」と確認。実際には動作していない可能性。次回ログで要確認

## Prep拡張要件（2026-06-21/28確定 → V3で大半実装済み）
→ 詳細: [feedback_prep_requirements.md](feedback_prep_requirements.md) | [reference_weekly_link_issue.md](reference_weekly_link_issue.md)
- ~~Prep作成時にWeeklyページも更新する~~ → **2026-06-27実装済**（Step 9）
- ~~プロジェクト整合性チェックを毎回実施~~ → **V3で実装済**（Step 7 PROJECT_SYNC）
- ~~月次情報もDailyに集約表示する~~ → **V3で実装済**（3発が月次マイルストーンから逆算）
- 週番号Wnの正定義（2026-07-07一本化）: 週=月〜日、**Wn=その週の木曜が属する月の第n木曜週**（ISO木曜規約）。実装は`mtg_prep.sh`の`week_of()`。`date +%V`も`(日-1)/7+1`も使わない
- ~~**ゴールファースト**~~ → **V3で実装済**（🎯3発 = 2026目標→月次→週次→カレンダーから逆算）
- ~~**コンディションパイプライン**~~ → **V3で実装済**（🧬統合 + gcal_write_training.py書き戻し）
- **Inbox統合（未実装）**: 毎日Inbox内容をPrepで処理し適切な場所に情報整理する

## データ取得仕様
- **トレーニングログは当日分のみ取得** — 過去データの重複取得禁止。日付フィルタ必須 → [feedback_training_log_spec.md](feedback_training_log_spec.md)

## コンテキストルール
- **企業訪問は全て政治家としての意見交換**。見積もり・営業提案等のビジネス推論禁止 → [feedback_enterprise_visit_context.md](feedback_enterprise_visit_context.md)

## Dailyページ gold standard
- **2026-06-29のDailyページが理想形**。「29日の表現が理想」とNobuが明言（2026-06-30） → [reference_daily_goldstandard.md](reference_daily_goldstandard.md)

## 縦の連鎖ヘルスチェック（V6.2 — 2026-07-05開始）
- **Dreamingで毎回5点チェック**: Weekly→Daily接続 / NAR独立 / 🧬分析の影響 / 📌肥大 / 3領域バランス → [feedback_vertical_chain_health.md](feedback_vertical_chain_health.md)
- **初回診断（7/5）: 要改善** — Weekly空洞・NAR停止中・📌15件超・🏢Nobu行動ゼロ。V6.2実装で改善見込みの部分と、運用（SUM定着・📌棚卸し）でしか解決しない部分の両方がある

## 事実ベース原則（2026-06-24確定）
- **Dailyノート生成で推論・提案・アドバイス禁止** — 「今日の一手」「挽回の一手」「完了の目安」「AIによる選書」等は全て削除。prepは材料を並べるだけ、判断はNobuがMTGで行う → [feedback_factbase_principle.md](feedback_factbase_principle.md)

## Claude CLI認証（launchd環境）
- **OAuth期限切れで401エラーが発生する** — Claude CLIはOAuth認証を使用。トークンが `~/Library/Application Support/Claude/config.json` に保存されている。期限切れ時は `claude login` で手動更新が必要。mtg_prep_v2.shに事前認証チェック＋macOS通知を追加済み（2026-06-25）
- **レートリミットで全セクション生成失敗**（2026-06-28発生）— "You've hit your limit"でClaude CLI出力が空。Daily/プロジェクト/月次すべて更新不可。Weekly(Step 9)のみDaily直読フォールバックで生存。月次にもフォールバック追加済み（📍中間現在地の日付カウンタ自動更新）
- **Fableモデル切り替えでスクリプト動作不可**（2026-07-06確認）— `claude -p` や Claude SDK呼び出しでFable（claude-fable等）を指定すると動作しない。理由は不明（API非対応 or モデルID不一致の可能性）。Prepスクリプトはモデル名ハードコードを避け、デフォルトモデルを使うか、動作確認済みモデル（claude-opus-4-6等）を明示する

## エージェント操作ルール
- **単一ライター原則（2026-07-08確定）**: Vaultへの自動書き込みは決定的コードのみ。launchdのclaude -pは必ず`--disallowedTools "Write,Edit,NotebookEdit,Bash"`（bypassPermissions禁止）。7/8のcopain🧬上書き事故が根拠。daily_guard（08:30/12:50）が破壊検知→復元＋🧬朝リフレッシュ → [feedback_single_writer_principle.md](feedback_single_writer_principle.md)
- **バックグラウンドタスク起動後は必ず`TaskOutput block=true`で待機してから終了** — 待機せずに終了しようとすると Stop hook が警告（2026-06-25に6回発生） → [feedback_background_task_discipline.md](feedback_background_task_discipline.md)

## プロジェクト
- **SaaS Factory** (2026-06-26〜): 改良版OSSを量産。repo: `postcabinets-oss`。18本+修復多発（knowledge-base最多4回）。v3商用化実装中（7/5: 14850行、7/6: 25811行セッション。Cloudflareデプロイ＋セキュリティ＋フルスタック確認を毎回走らせる設計） → [project_saas_factory.md](project_saas_factory.md)
- **一日一生論** (2026-07-02〜): 哲学的書籍執筆。Voice design重視・空想的日常排除。7/5に過去最大110046行セッション。Stop hook 10回 → [project_ichinichiissei_ron.md](project_ichinichiissei_ron.md)
- **WOOD SMART GACHA** (2026-07-04〜): 木製×QR決済×DXのスマートガチャ新規事業。基板待ちで実機テスト前準備のみ完了 → [project_wood_smart_gacha.md](project_wood_smart_gacha.md)
- **食事記録アプリ** (2026-07-05〜): Android。シンプルな水分・食事記録+PFCデータベース。Mac mini→MacBook引き継ぎ済み → [project_food_tracker_app.md](project_food_tracker_app.md)

## 解決済み
- ~~auto-dreaming.sh品質問題~~ → **2026-06-19修正済**: Paperclip除外・JSONLパーサー修正・Memory書き込み有効化・Daily追記Python化。Paperclip plist(.disabled化)も停止済み
- ~~Firebase認証情報でIronトレーニングデータ取得不可~~ → **2026-06-22修正済**: `ironlog_ingest.py` をFirestore REST API経由に書き換え。firebase-toolsのOAuthトークンを再利用してサービスアカウント不要に
- ~~🧬コンディションがN/A固定~~ → **2026-06-24修正（3度目で根治）**: 原因は2つ。①`timeout`コマンドがmacOSに存在せずlaunchdでスクリプト実行自体が失敗→`_timeout`関数で`gtimeout`→`timeout`→直接実行のフォールバックに修正。②`google_health_summary.py`のAPIレスポンスパースが壊れていた（`points[0].get("values")`を参照するが実構造は`points[0]["steps"]["countSum"]`等）→実APIレスポンスに合わせてパースロジックを全面書き直し。修正後6/22,6/23のデータ取得を確認済み
- ~~月次情報のDaily集約~~ → **2026-06-22解決済**: `mtg_prep_v2.sh` のStep 5 Claude一括生成で月次.mdを入力に含め、📊ステータスで月次マイルストーンを表示中
- ~~Weekly更新がprepに未実装~~ → **2026-06-27解決済**: Step 9追加（`update_weekly_sync.py`）
- ~~Prepゴールファースト設計未実装~~ → **2026-06-29 V3デプロイで解決**: 🎯3発 = 目標→月次→週次→カレンダーから逆算。1st=後援会固定
- ~~コンディション→カレンダーパイプライン未実装~~ → **2026-06-29 V3デプロイで解決**: 🧬統合セクション + gcal_write_training.py（Day A/Bメニュー書き戻し）+ gcal_create_feedback.py（メモ→フィードバック枠）
- ~~Daily 17セクション過多~~ → **2026-06-29 V3デプロイで解決**: 7セクション + ✅突合に削減。V2の📊ステータス/🎯メイン/🔧任せる/⏭やらない/📍週次進捗/📓ログ/🚀MTGを廃止
