# POSTCABINETS / ClaudeCode 運用（このリポジトリ）

## Claude Code メモリ（要約）

- **スコープ**: **POSTCABINETS** 全体のオペレーション。**COPAIN** はその中の案件の一つ（他と同列。DB 名も COPAIN 専用にしない）。
- **目的（事業）**: COPAIN AI 完成、LINE＋育成型自動化、課金仮説などは **Projects の Brand/Area** で表現。
- **運用**: **Notion が正本**。`.env` のみシークレット。`npm run notion:env` で Notion を設定。
- **Notion ハブ v2**: **Projects**（案件）＋ **Tasks**（実行単位）＋ Owner（Human/Claude/Either）。`.notion-hub.json` は `notion:hub` で生成。
- **自動化**: Playwright `browser:daemon`、Discord `pulse:discord`（Active Projects ＋オープン Tasks）。
- **方針変更**は `CLAUDE.md` と Notion **Decisions** の両方を矛盾なく更新する。

## 単一の真実（Single Source of Truth）

- **計画・決定・タスク・リスク・顧客メモの正本は Notion**（このリポジトリ内のメモは一時的な下書きにしない。更新は Notion を先に更新する）。
- 作業前に Notion の **Tasks（Owner 別） / Projects（Active） / Weekly** を確認し、終わったら **Tasks と Decisions** に結果を追記する。
- シークレット（Notion token、Discord Bot token、Webhook、API キー）は **`.env` にのみ**置き、**絶対にコミットしない**。

## セキュリティ（必須）

- **Discord Bot トークンは一度でも外部に出したら Developer Portal で再発行**する。過去にチャット等へ貼った場合は無効化済みとみなす。
- 公開キー（Public Key）もサービス側で使う秘密に近い情報として取り扱う。
- 本リポジトリにトークンを書かない。`.env.example` はプレースホルダのみ。

## 事業の北極星

1. **第 1 事業**: COPAIN AI（AI アシスタント）を「完成」に近づける。
2. **提供形態の仮説**: 公式 LINE に接続し、ユーザーが育てながら自動化が進む体験。課金はクレジット課金またはサブスク（決済・規約は別途確定）。
3. **技術スタックの仮説**: OpenClaw 相当の Gateway をそのまま使うか、簡易版にするかは未確定。**簡易版**に倒す場合は「LINE → あなたのバックエンド → モデル」で十分な範囲から切る。

## 意思決定の境界

- **あなた（人）がやること**: 価格、契約、公開コピー、個人情報の扱い、自動送信の可否、新規事業の Go/No-Go。
- **エージェント／自動化がやってよいこと**: 調査、下書き、リポジトリ内の実装、Notion 更新案の提示、Discord への進捗通知（Webhook 経由など）。

## Notion ハブの構造（v2・POSTCABINETS）

**目的**: Claude Code が動きつつ、**あなたが一覧で見て、今日やることをすぐ実行できる**こと。

| DB | 役割 | 使い分け |
|----|------|----------|
| **Projects** | 案件・取り組みの「束」 | COPAIN も研修もインフラも **1 行＝1 案件**。Area / Brand で区別。 |
| **Tasks** | 日々の **1 アクション** | **Owner** = Human（あなた）/ Claude / Either。Status でボード化。Project に紐づけ。 |
| **Decisions** | 決定ログ | 方針・境界（誰が何を決めるか）。 |
| **Weekly** | 週のフォーカス | 可視化のリズム。 |
| **Risks** | リスク | 法務・技術・運用。 |
| **Triggers** | 自動化のきっかけ | cron / Discord 等。 |

**あなた向けダッシュボードのおすすめ**: Tasks を **ボード表示（Status）**し、フィルタで **Owner = Human または Either**、今日の Due。Claude には **Owner = Claude または Either** の Todo を先に処理してもらう。

**古い DB を消して作り直す（推奨）**: 同じ親ページのままでよい。`npm run notion:reset` が **親ページ直下の子データベースをすべてアーカイブ** → `notion:hub` → `notion:seed` まで実行する。`.notion-hub.json` は `.bak.<時刻>` に退避される。  
（親ページに置きたい **別の直下 DB** がある場合は、消えるので先に移動するか別親ページを使う。）

## Discord の役割

- **通知チャネル**: スクリプトまたは CI から **Webhook** で進捗・ブロッカーを投稿する（実装は `.env` の `DISCORD_WEBHOOK_URL`）。
- **対話が必要なら** Bot（トークンは `.env` のみ）。Slash コマンドや常時接続は後回しでよい。

## npm スクリプト（ルートで実行）

前提: Node 20+、`.env` に `NOTION_TOKEN` / `NOTION_PARENT_PAGE_ID`（および Discord 通知なら `DISCORD_WEBHOOK_URL`）。

| コマンド | 内容 |
|----------|------|
| `npm run notion:env` | **対話で .env に Notion トークンと親ページ ID を書き込む**（チャットに貼らない） |
| `npm run notion:verify` | Notion インテグレーション疎通 |
| `npm run notion:hub` | 親ページ直下に **v2** DB（Projects, **Tasks**, Decisions, Weekly, Risks, Triggers）+ `.notion-hub.json` |
| `npm run notion:reset` | **直下の子 DB を全アーカイブ** → `hub` → `seed` まで一括（`--yes` 同梱） |
| `npm run notion:seed` | 初期行（既に Projects に行がある場合はスキップ。上書きは `NOTION_SEED_FORCE=1`） |
| `npm run pulse:discord` | **Active Projects** ＋ **オープン Tasks**（Inbox〜Blocked）を Discord に投稿 |
| `npm run discord:test` | Webhook テスト投稿 |
| `npm run bootstrap` | verify → hub → seed → discord:test を連続実行 |

定期トリガー: `scripts/launchd/com.copain.notion-pulse.plist.example` をコピーし、パスを自分の環境に合わせて `launchctl load` する。

## バックグラウンド・ブラウザ（Playwright / Chromium）

目的: **画面を出さず**に Chromium を起動し、指定 URL を開いたまま常駐する（自動操作の土台）。

1. 初回のみ: `npm install` → `npm run browser:install`（Chromium バイナリ取得）
2. 設定: `browser/browser-runner.config.json` の `startUrl`（例: Notion / 管理画面）。`pingUrl` を空にすると定期再読込はしない。
3. 起動: `npm run browser:daemon`（フォアグラウンド常駐。バックグラウンド運用は `nohup` または `scripts/launchd/com.copain.browser-daemon.plist.example`）

注意: ヘッドレスでログインが必要なサイトは、**Cookie 永続化**や**別途ログイン手順**が要る場合があります。必要なら `scripts/browser-daemon.mjs` に `storageState` を足す拡張が次の一手。

## 次にやること（常にこの順で迷わない）

1. **Notion**: 親ページを 1 つ作り、インテグレーションに接続。`npm run notion:env` で `.env` を埋める。
2. **v2 ハブ**: `npm run notion:verify` → 既存を消してよければ **`npm run notion:reset`**、または `notion:hub` → `notion:seed`。
3. **Discord**: `DISCORD_WEBHOOK_URL` を設定し、`npm run discord:test`。
4. **毎日**: `pulse:discord` でサマリー。自分は **Tasks の Human / Either** から 1 件だけ実行。
5. **技術スパイク**: LINE / OpenClaw 等は **Projects に案件**、細かい作業は **Tasks** に分割。

## Claude Code に求める行動

- セッション開始: **Tasks（Claude / Either）** と **Active Projects** を確認するよう促す。リンクがあればそれを優先。
- セッション終了: **Tasks / Decisions** の更新案を箇条書き（Notion にコピペしやすく）。
- COPAIN に限定した表現にしない。**POSTCABINETS 全体**のタスクとして記述する。
