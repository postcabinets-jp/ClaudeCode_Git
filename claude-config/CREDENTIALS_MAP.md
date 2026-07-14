# CREDENTIALS_MAP.md — 認証・API 接続マップ

> Claude Code に渡してきた **全API・ログイン・Google系認証の「地図」**。
> ⚠️ **このファイルに生の鍵・トークンを書かない。** 「どこに・何が・どう取るか」だけを書く。
> 鍵の実体は各保存先（Keychain / OAuth JSON / .env / MCP OAuth）にあり、Claude は必要時にそこから取得する。
> このマップは `~/.claude/CREDENTIALS_MAP.md`。Claude Code 起動時に SessionStart hook（`credentials-map-inject.mjs`）で自動注入。
> 最終更新: 2026-06-09 (ブラウザ自動認証Google追加) / オーナー: 前田将臣（postcabinets@gmail.com）

> 📌 **プロジェクト別 `.env.local` の場所 → セクション7 参照**（毎回聞かれる系の情報はそこ）

---

## 0. 使い方（Claude Code 向けルール）

1. 認証・API・外部連携の作業に入る前に **必ずこのファイルで該当サービスの「保存先」と「取得方法」を確認**する。
2. 鍵が要るときは下記の **取得コマンド/パス** を使う。マップに無いサービスは「未登録」。勝手に推測で叩かず Nobu に確認。
3. **生の鍵をチャット・ログ・ファイルに出力しない。** 値はマスク（`***`）して扱う。
4. 取得に失敗したら CLAUDE.md 0-2 に従い代替を3つ試す（別パス→Keychain→再OAuth）。
5. このマップを更新したら `最終更新` 日付も直す。

---

## 1. サービス別 接続表

| # | サービス | 用途 | 保存先（実体） | 取得方法 | 状態 |
|---|---------|------|--------------|---------|------|
| 1 | **Google Calendar ×7** | カレンダー7口（/MTG） | MCP OAuth（claude.ai Google Calendar）/ 口リスト=`~/.config/calendar-sync/calendars.json` | MCPツール `mcp__claude_ai_Google_Calendar__*` | ✅運用中 |
| 2 | **Google Tasks** | ToDo↔GTasks同期 | `note/wiki/_meta/secrets/token.json` + `credentials.json` | `Credentials.from_authorized_user_file()`（`todo_sync_gtasks.py`） | ✅運用中 |
| 3 | **Google Photos** | SNS投稿用画像取得 | （予定）`~/.config/sns-post/gphotos_token.json` + `gphotos_client_secret.json` | OAuth JSON（`sns_post.py`, readonly） | ⛔未生成（初回 `sns_post.py auth` で作成） |
| 4 | **Google Cloud (gcloud ADC)** | GCP系API共通 | `~/.config/gcloud/application_default_credentials.json` | `gcloud auth` / ADC自動 | ✅運用中 |
| 5 | **Firebase** | Firebase MCP/CLI | `~/.config/configstore/firebase-tools.json` | `firebase login` / Firebase MCP | ✅運用中 |
| 6 | **Fathom** | オンラインMTG議事録 | **macOS Keychain**：`FATHOM_API_KEY` / `FATHOM_WEBHOOK_SECRET` | `security find-generic-password -w -s FATHOM_API_KEY` | ✅運用中（最も安全） |
| 7 | **Postiz** | Instagram予約投稿 | `~/.config/sns-post/postiz.json`（api_key / instagram_channel_id） | JSON読込（`sns_post.py schedule`） | ◯設定済み |
| 8 | **X / Twitter (x-radar)** | AI情報収集 | `~/.config/x-radar/.env`（X_AUTH_TOKEN / X_CT0 / X_USERNAME） | .env読込（twikit） | ✅運用中 |
| 9 | **Discord Bot** | 日次通知Bot | ①プラグイン用 `~/.claude/channels/discord/.env`（`DISCORD_BOT_TOKEN`）+ allowlist=`access.json` ②ops用 🔑中央`.env`（`DISCORD_BOT_TOKEN` / `DISCORD_APPLICATION_ID` / `DISCORD_PUBLIC_KEY` / `DISCORD_MORNING_CHANNEL_ID` / `DISCORD_WEBHOOK_URL`） | .env読込 | ✅運用中 |
| 10 | **Higgsfield** | 画像/動画生成 | `~/.config/higgsfield/credentials.json`（access/refresh token） | JSON読込 | ◯利用時 |
| 11 | **Brave Search** | 検索MCP | `~/.claude/settings.local.json`（`BRAVE_API_KEY` 枠） | 環境変数（MCP） | ⛔未設定（空） |
| 23 | **Plate Recognizer** | ナンバープレートOCR（かねひさ案件） | Vercel環境変数 `PLATE_RECOGNIZER_TOKEN`（reolink-management-dashboard） | Vercel Dashboard / `npx vercel env pull` | ✅運用中（月2500枚無料） |
| 12 | **MCP OAuth（要都度認証）** | Slack / Gmail / Drive / Canva / Notion(MCP) 等 | claude.ai OAuth（セッション毎）/ 状態=`~/.claude/mcp-needs-auth-cache.json` | セッション内で `authenticate` ツール | ◯都度OAuth |
| 13 | **Anthropic API** | スクリプト直叩き | 🔑中央`.env`（`ANTHROPIC_API_KEY`） | dotenv読込 | ✅運用中 |
| 14 | **Gemini API** | スクリプト直叩き | 🔑中央`.env`（`GEMINI_API_KEY`） | dotenv読込 | ◯利用時 |
| 15 | **Limitless** | ライフログAPI | 🔑中央`.env`（`LIMITLESS_API_KEY`）※正本は `raw/Limitless/*.md` 直読 | dotenv読込 | ◯（API直叩きは限定的） |
| 16 | **Notion（直API）** | Notion連携 | 🔑中央`.env`（`NOTION_TOKEN`=ops用hub限定 / `NOTION_TOKEN_OBSIDIAN`=integration「Obsidian」**ワークスペース全体可視**・prep用 / `NOTION_PARENT_PAGE_ID`） | dotenv読込（`notion-*.mjs`）/ prep=`collect_notion_updates.py`（OBSIDIANを優先） | ✅運用中 |
| 17 | **Linear** | タスク連携 | 🔑中央`.env`（`LINEAR_API_KEY` / `LINEAR_CLAUDE_USER_ID` / `LINEAR_TEAM_ID`） | dotenv読込（`linear-*.mjs`） | ◯利用時 |
| 18 | **LINE** | LINE Messaging | 🔑中央`.env`（`LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET`） | dotenv読込 | ◯利用時 |
| 19 | **LinkedIn** | LinkedIn投稿 | 🔑中央`.env`（`LINKEDIN_DB_ID`）※アクセストークンは `linkedin-setup.mjs` 管理 | dotenv読込（`linkedin-*.mjs`） | ◯利用時 |
| 20 | **Granola** | 議事録同期 | DB id=🔑中央`.env`（`GRANOLA_MEETING_NOTES_DB_ID`）/ トークンは `granola-token-refresh.mjs` が自動更新 | スクリプト管理 | ◯利用時 |
| 21 | **ttyd（Web端末）** | リモート端末認証 | 🔑中央`.env`（`TTYD_USER` / `TTYD_PASS`） | dotenv読込 | ◯利用時 |
| 22 | **AWS（openshorts）** | S3アップロード | `/Users/apple/claude for me/projects/openshorts/.env`（`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_S3_BUCKET` / `AWS_S3_PUBLIC_BUCKET`） | dotenv読込 | ◯openshorts専用 |
| 24 | **ブラウザ自動認証（Google）** | ブラウザでGoogleログイン/同意画面を自動で通す | **macOS Keychain** service=`claude-browser-auth`（`google-email` / `google-password`） | ヘルパー `~/.claude/browser-auth-fill.sh`（§8の手順に従う） | ◯利用時（2FAは手動ハンドオフ） |

> 🔑**中央 `.env`** = `/Users/apple/claude for me/.env`（権限 `600`）。Anthropic / Gemini / Limitless / Discord / Notion / Linear / LINE / LinkedIn / Granola / ttyd の鍵が集約。ops配下の各 `*.mjs` が `lib/env.mjs` の `loadDotEnv()` で読む。
> AWSだけ別ファイル `projects/openshorts/.env`（権限 `600`）。

---

## 2. Keychain（macOS）に入っている鍵

| キー名 / service | サービス | 取得コマンド |
|--------|---------|-------------|
| `FATHOM_API_KEY` | Fathom | `security find-generic-password -w -s FATHOM_API_KEY` |
| `FATHOM_WEBHOOK_SECRET` | Fathom Webhook検証 | `security find-generic-password -w -s FATHOM_WEBHOOK_SECRET` |
| service=`claude-cred-backup` | 全認証ファイルの暗号化バックアップ（§5参照） | `bash ~/.claude/secrets-restore.sh --list` |
| service=`claude-browser-auth`（account=`google-email` / `google-password`） | ブラウザGoogle自動認証（§8） | 登録=`bash ~/.claude/browser-auth-setup.sh` / 在否=`… --check`（値は出さない） |

> 新しい鍵を足すときは **可能な限り Keychain に集約**するのが最安全（手本=Fathom）。

---

## 3. Google Apps Script（クラウド側）

| 名前 | 役割 | 場所 / バックアップ | トリガー |
|------|------|------------------|---------|
| **Calendar Bridge** | 他カレンダーのオンラインMTGをprimaryへミラー（Fathom制約回避） | `script.google.com`（bachikanshikoku）/ コード控え=`note/_system/scripts/calendar_bridge.gs` | 5分毎・エラー時 postcabinets@gmail.com へ通知 |

---

## 4. 連携カレンダー7アカウント（参考）

`bachikanshikoku@gmail.com`(My) / `maeda.nobumi@gmail.com`(政治メイン) / `postcabinets@gmail.com`(事業) / `maeda.nobumi@oneosaka.jp`(維新) / `hikaeshitsu@oneosaka.jp`(控室) / `fugikai.ishin@gmail.com`(府議団) / `duxdcw@gmail.com`
設定: `~/.config/calendar-sync/calendars.json`

---

## 5. セキュリティ状況

- [x] **`note/wiki/_meta/secrets/` は `.gitignore`（44行目）登録済み**で git 追跡なし（確認: 2026-05-31, `git ls-files` 空）。Google OAuth トークンの git 流出リスクなし。
- [x] **全認証ファイルを `chmod 600` 済み**（2026-05-31）：中央`.env` / openshorts / x-radar / postiz / higgsfield / gcloud / firebase / vault secrets×2 / discord。他ユーザー読み取り不可。
- [x] **Keychain 暗号化バックアップ作成済み**（2026-05-31）。実在10ファイルを base64 で Keychain（service=`claude-cred-backup`）に保存、SHA256で復元整合性を全件検証（pass=10）。`.env`/JSON は600のまま運用継続、Keychain が正本/復旧経路。
  - ※「平文.envを廃止してKeychain直読化する真の移行」は**見送り**。中央`.env`は約39本のops/launchd自動処理（朝会通知・Discord bot常駐・Notion/Linear同期等）が `lib/env.mjs` 経由で共有しており、直読化は全スクリプト書換＋実機テストが必要で破壊リスクが高い。`600 + Keychainバックアップ`で実用上の安全性は確保。
- [x] このマップ自体は鍵を持たないので共有・git 管理OK。保存先パスの露出だけ定期確認。

### Keychain バックアップ運用（service=`claude-cred-backup` / account=各ファイル絶対パス）
- **更新**（鍵を変えたら再実行）: `bash ~/.claude/secrets-backup.sh`
- **一覧**: `bash ~/.claude/secrets-restore.sh --list`
- **単体復旧**: `bash ~/.claude/secrets-restore.sh "<絶対パス>"`（権限600で書戻し）
- **全復旧**: `bash ~/.claude/secrets-restore.sh --all`（既存上書き注意）
- 対象10ファイル: 中央`.env` / openshorts AWS / x-radar / postiz / higgsfield / gcloud / firebase / vault secrets×2 / discord。新規鍵を足したら両スクリプトの `FILES=()` に追記して再実行。

---

## 6. 更新ルール

- 新しいAPI/ログインを Claude Code に渡したら **「1. 接続表」に1行追加**（生の鍵は書かない）＋必要なら backup/restore の `FILES=()` に追加。
- 保存先・コマンドが変わったら該当行を更新し `最終更新` を直す。
- 「もう使わない」連携は行を削除せず **状態を `⛔廃止` に**して履歴を残す。

---

## 7. プロジェクト別 .env.local マップ

> 作業開始前に「このプロジェクトの環境変数はどこ？」を確認するための早引き。生の値は書かない。

| プロジェクト | パス | 主なキー | 状態 |
|------------|------|---------|------|
| **fieldnote**（政治活動アプリ） | `/Users/apple/政治活動/政治活動アプリ/fieldnote/.env.local` | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`（追加予定） | ✅運用中 |

> Supabase Project: `yocifbtqagbwwufuujzp`（URL末尾から識別可能）
> fieldnote の `.env.local` にキーを追加したらここに1行追記する。

## Google Health API（2026-06-07）
- 用途: 自分ログ収集OS / Google Health APIから歩数・心拍・活動・睡眠を読む
- OAuth Client ID: `444348039130-5imjdmlaqqrrrdqb18902946n8bdc3so.apps.googleusercontent.com`（Desktop client）
- Refresh token保存先: macOS Keychain `GOOGLE_HEALTH_REFRESH_TOKEN`（account=client_id）／⚠️失効(invalid_grant)時は `python dev/google_health_oauth_manual.py start` → 同意 → `... finish '<callback_url>'` で再発行（直近: 2026-06-16 再認証済）
- Client ID保存先: macOS Keychain `GOOGLE_HEALTH_CLIENT_ID`（account=default）
- Client secret保存先: macOS Keychain `GOOGLE_HEALTH_CLIENT_SECRET`（account=client_id）
- プロトタイプ: `/Users/apple/dev/google_health_daily_summary.py` / `/Users/apple/dev/google_health_oauth_manual.py`
- 生鍵はこのファイルに書かない。
- ⚠️ 実測(2026-06-13): このAPIで取れるのは **Fitbit由来**(睡眠/歩数/心拍/活動/距離) ＋ **Health Connect経由の体重/体脂肪**のみ。**運動セッション型・栄養型は非対応**。Samsung Healthの睡眠はGoogleクラウドに来ない。筋トレ・食事はこのAPIでは読めない。
- **体重→トレーニングノート自動連携（2026-06-23構築）**: `~/.note-system/scripts/update_training_weight.py`（+ラッパー`update_training_weight.sh`）が `google_health_daily_summary.py` の体重/体脂肪を `note/wiki/life/トレーニング.md` の `<!-- weight:auto -->` ブロックへ毎朝upsert（冪等・乗らない日はskip）。launchd `com.postcabinets.training-weight`（毎日08:30+12:30・昨日backfill+今日）。Nobu要望「現在地の体重を毎日Health Connectから徹底更新」。

## 筋トレログ Firebase（iron_log・2026-06-13）
- 用途: 筋トレ記録アプリ → Firestore → Vault `raw/トレーニング.md` へ日次自動取込（Google Health APIは運動セッション非対応のため別配線）
- Firebaseプロジェクト: `ironlog-pc-2026`（GCP・postcabinets@gmail.com オーナー）/ Firestore: native・asia-northeast1
- Android App ID: `1:525941574905:android:5e9c506cdbfa3373b9a628`（package co.postcabinets.iron_log）
- **サービスアカウント鍵**: `/Users/apple/note/wiki/_meta/secrets/ironlog-firebase-sa.json`（SA: `ironlog-sync@ironlog-pc-2026.iam.gserviceaccount.com`・Owner）— システム側の読み取りに使用
- 取込スクリプト: `/Users/apple/dev/ironlog_to_note.py`（launchd `com.postcabinets.ironlog-ingest`・毎時）
- Firestoreルール: `workouts` は create のみ許可（読みはSAでルール迂回）。生鍵はこのファイルに書かない。
- ⚠️ firebase CLIのトークンは失効しがち。CLI操作は `firebase logout` → `GOOGLE_APPLICATION_CREDENTIALS=<上記SA鍵> firebase <cmd>` でSA認証。

---

## 8. ブラウザ自動認証（Google）— Claude 実行プロトコル（2026-06-09）

> 目的: Chrome操作中に Google のログイン/同意画面が出たら、Claude が自動で通す。
> **設計の肝（実証済み方式=clipboard）**: 値は Keychain → クリップボード → **Chrome MCP の Cmd+V** で欄へ。
> Claudeの文脈にもMCPツール引数にも生の値を通さない（漏洩面=クリップボードのみ→貼付直後に即clear）。
> ⚠️ 旧keystroke方式は **失敗する**（osascriptは「OS最前面アプリ」に飛ぶが、Chrome MCPは裏でタブ操作するため欄に届かない）。2026-06-09実機で確認。

### 保管（Keychain ネイティブ＝正本。ファイル化しない）
- service=`claude-browser-auth` / account=`google-email`・`google-password`
- 登録: `bash ~/.claude/browser-auth-setup.sh`（Nobu本人が1回だけ。`read -s`で非表示）
- 在否確認: `bash ~/.claude/browser-auth-setup.sh --check`（値は出さない）

### スクリプト `~/.claude/browser-auth-fill.sh`（既定=clipboard方式）
- `bash …/browser-auth-fill.sh email` → メールをクリップボードへ（値は標準出力にもargvにも出さない）
- `bash …/browser-auth-fill.sh password` → 同上パスワード
- `bash …/browser-auth-fill.sh clear` → クリップボード消去（**貼付直後に必ず実行**）

### Claude が画面ごとに取る動作（実証フロー）
| 画面 | 動作 |
|---|---|
| **アカウント選択** | メールに一致するアカウントをChrome MCPでクリック（秘密情報なし） |
| **メール入力** | ①欄をMCPクリックしfocus → ②`fill.sh email` → ③MCP `key cmd+v` → ④`fill.sh clear` → ⑤「次へ」クリック |
| **パスワード入力** | メールと同じ①〜④ で `fill.sh password` → 「次へ」クリック |
| **「許可/Allow」同意** | 許可ボタンをクリック（秘密情報なし） |
| **2段階認証/本人確認/パスキー** | ⛔ **自動化せず停止 → Nobuに通知して待機**（対象外。指紋/パスキーはNobu本人が実行） |

### 制約・注意（実機検証 2026-06-09）
- **必ず貼付直後に `fill.sh clear`** を呼ぶ（クリップボード残留を消す）。
- Googleは新規セッションのログインで高確率に**パスキー/本人確認**を挟む（実機でも `postcabinets@gmail.com` 入力→次へで即パスキー要求）。ここでNobuにハンドオフ＝設計どおりの正常動作。
- **Chrome既ログイン済みなら認証画面自体が出ない**（calendar.google.com直行で確認済み）。これが最安定経路。
- keystrokeフォールバック（`METHOD=keystroke`）は最前面化が要り不安定。基本使わない。
- 対象は今は Google系のみ。横展開時は service 名を分けて追加（例 `claude-browser-auth-x`）。
- Keychainネイティブ保存のため `secrets-backup.sh`(ファイルバックアップ)対象外＝それ自体が正本。
