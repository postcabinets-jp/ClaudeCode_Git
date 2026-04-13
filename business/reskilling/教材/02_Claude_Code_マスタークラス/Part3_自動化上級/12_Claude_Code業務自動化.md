# Module 12: Claude Code 業務自動化
**Claude Code マスタークラス — Part 3: 自動化・上級**
**POST CABINETS Inc.**
**Module 12 / 全24モジュール**

---

## モジュール概要

| 項目 | 内容 |
|------|------|
| 想定時間 | 35分（講義20分＋ハンズオン15分） |
| 対象者 | コードが書けない方〜中級エンジニア |
| ゴール | Claude Codeを使って日常業務を自動化できるようになる |
| 前提知識 | Part 1-2の内容、ターミナル基本操作 |

---

## スライド構成（25枚）

### スライド 1: タイトル
**Claude Code 業務自動化**
— コードが書けなくても、自然言語で業務を自動化する —

### スライド 2: このモジュールで学ぶこと
- Claude Codeとは何か
- インストールと初期設定
- 基本操作5つ
- 業務自動化の実演5パターン
- CLAUDE.mdによるプロジェクト設定
- 権限モデルの理解

### スライド 3: Claude Codeとは
- Anthropicが開発した**エージェント型CLI**（コマンドラインツール）
- 自然言語で指示するだけで、ファイル操作・コード生成・コマンド実行を行う
- GitHubのコミットの約4%がClaude Code生成（2026年時点）
- **コードが書けなくてもOK** — 「〇〇して」と日本語で指示するだけ

### スライド 4: Claude Code vs ChatGPT vs Cursor
| 特徴 | Claude Code | ChatGPT | Cursor |
|------|------------|---------|--------|
| 実行環境 | ターミナル（CLI） | ブラウザ | IDE |
| ファイル操作 | 直接読み書き可能 | コピペが必要 | プロジェクト内のみ |
| コマンド実行 | 可能 | 不可 | 限定的 |
| 大規模プロジェクト | 得意 | 苦手 | 得意 |
| 非エンジニア向け | 学習コスト中 | 低い | 高い |

### スライド 5: インストール手順（図解）

### スライド 6-7: インストール — 全プラットフォーム対応
### スライド 8-10: 基本操作
### スライド 11-15: 実演5パターン
### スライド 16-18: CLAUDE.md
### スライド 19-22: 権限モデル
### スライド 23-24: コードが書けない人向けガイド
### スライド 25: まとめ・次のステップ

---

## 台本

### 1. イントロダクション（3分）

皆さん、こんにちは。Module 12「Claude Code 業務自動化」を始めていきましょう。

このモジュールの最大のポイントは、**「コードが書けなくても業務を自動化できる」** ということです。

「え、CLIって難しくない？」と思った方、大丈夫です。Claude Codeは、皆さんが日本語で「これやって」と話しかけるだけで、裏側でコードを書いて、実行して、結果を返してくれます。

たとえば、「このフォルダの中のCSVファイルを全部読み込んで、売上の合計を出して」と言えば、Claude Codeが自分でPythonスクリプトを書いて実行して、結果だけ見せてくれる。そういうツールです。

GitHubの統計では、コミットの約4%がClaude Code経由で生成されています。つまり、プロのエンジニアも実際の開発でガンガン使っているということです。

---

### 2. インストール手順（5分）

では、まずインストールしていきましょう。3つのプラットフォームそれぞれの手順を説明します。

#### Mac（推奨）

```bash
# 1. Node.js のインストール（未インストールの場合）
# Homebrew経由が最も簡単
brew install node

# 2. Claude Code のインストール
npm install -g @anthropic-ai/claude-code

# 3. 起動
claude
```

初回起動時にAnthropicアカウントへのログインを求められます。ブラウザが自動で開くので、ログインしてください。

#### Windows

```powershell
# 1. Node.js をインストール
# https://nodejs.org/ からLTS版をダウンロード・インストール

# 2. PowerShellを管理者権限で開く
npm install -g @anthropic-ai/claude-code

# 3. 起動
claude
```

Windows の場合、WSL2（Windows Subsystem for Linux）環境での利用が推奨されています。WSL2の中でMac/Linuxと同じ手順でインストールできます。

#### Linux

```bash
# Node.js のインストール（nvm推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts

# Claude Code のインストール
npm install -g @anthropic-ai/claude-code

# 起動
claude
```

どのプラットフォームでも、最終的にターミナルで `claude` と打てば起動します。

**補足**: Claude Codeを使うにはAnthropicのAPIプラン（Claude Pro以上）が必要です。月額20ドルのProプランで利用可能ですが、使用量に応じてレート制限があります。

---

### 3. 基本操作（5分）

Claude Codeには5つの基本操作があります。全部、自然言語で指示するだけです。

#### 3-1. ファイルを読む

```
> このフォルダにあるファイルの一覧を見せて

> README.mdの内容を読んで

> src/の中の全てのJavaScriptファイルを読んで要約して
```

Claude Codeは指示されたファイルを読み込んで、内容を理解した上で回答します。「このコード何してるの？」と聞けば、日本語で説明してくれます。

#### 3-2. ファイルを書く・編集する

```
> 新しいファイル report.txt を作って、今日の日付をタイトルにして

> config.json の port を 3000 から 8080 に変更して

> このCSVファイルのヘッダーを日本語に変更して
```

ファイルの作成・編集をする前に、Claude Codeは必ず「この変更をしていいですか？」と確認してきます。安心して使えます。

#### 3-3. コマンドを実行する

```
> このプロジェクトのテストを実行して

> git log で最近のコミットを5件見せて

> このフォルダのディスク使用量を調べて
```

Claude Codeはターミナルコマンドを実行できます。ただし、危険なコマンド（ファイル削除など）は実行前に確認を求めます。

#### 3-4. 検索する

```
> このプロジェクトの中で "TODO" と書かれている箇所を全部探して

> error という単語を含むログファイルを探して

> 売上データの中で100万円以上の取引を探して
```

大量のファイルから必要な情報を高速に探してくれます。

#### 3-5. 分析・要約する

```
> このプロジェクトの構造を説明して

> package.json を見て、使われている技術スタックを教えて

> このコードベース全体のアーキテクチャを図にして
```

プロジェクト全体を俯瞰して分析する力が、Claude Codeの最大の強みです。

---

### 4. 実演5パターン（12分）

ここからが本番です。実際の業務で使える5つのパターンを実演していきます。

#### パターン1: CSVデータの自動整形・分析

実際の業務でよくあるのが、「CSVデータの加工」ですね。

```
> sales_data.csv を読み込んで、以下の分析をして：
> 1. 月別の売上合計
> 2. 売上トップ10の商品
> 3. 前月比の成長率
> 結果をわかりやすい表で output/sales_report.md に保存して
```

Claude Codeはこの指示を受けて、以下のことを自動的にやります：

1. CSVファイルを読み込む
2. Pythonスクリプトを生成して実行する
3. 分析結果をMarkdownファイルに整形して保存する

生成されるスクリプト（参考）:

```python
import csv
from collections import defaultdict
from datetime import datetime

# CSVを読み込み
with open('sales_data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# 月別売上集計
monthly_sales = defaultdict(float)
product_sales = defaultdict(float)

for row in rows:
    date = datetime.strptime(row['date'], '%Y-%m-%d')
    month_key = date.strftime('%Y-%m')
    amount = float(row['amount'])
    monthly_sales[month_key] += amount
    product_sales[row['product']] += amount

# トップ10商品
top_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:10]

# レポート生成
with open('output/sales_report.md', 'w', encoding='utf-8') as f:
    f.write('# 売上分析レポート\n\n')
    f.write('## 月別売上\n\n')
    f.write('| 月 | 売上合計 |\n|---|---|\n')
    for month, total in sorted(monthly_sales.items()):
        f.write(f'| {month} | ¥{total:,.0f} |\n')
    f.write('\n## 売上トップ10商品\n\n')
    f.write('| 順位 | 商品 | 売上 |\n|---|---|---|\n')
    for i, (product, total) in enumerate(top_products, 1):
        f.write(f'| {i} | {product} | ¥{total:,.0f} |\n')
```

ポイントは、**皆さんはこのコードを書く必要がない** ということです。Claude Codeが自動で書いて実行します。

---

#### パターン2: 大量ファイルの一括リネーム・整理

```
> downloads/ フォルダの中のファイルを整理して：
> - 画像ファイル（jpg, png, gif）→ images/ フォルダへ
> - PDFファイル → documents/ フォルダへ
> - それ以外 → others/ フォルダへ
> ファイル名は「YYYYMMDD_元のファイル名」の形式にリネームして
```

Claude Codeはこの指示で、ファイルの分類、フォルダ作成、リネームまで一括で行います。100個のファイルがあっても数秒で完了します。

---

#### パターン3: 定型レポートの自動生成スクリプト

毎週同じフォーマットのレポートを作っている方、多いですよね。

```
> 毎週月曜日に実行する週次レポート生成スクリプトを作って。
> 要件：
> - data/ フォルダから最新のCSVを読み込む
> - 先週の月〜日のデータを抽出
> - KPI（売上・訪問者数・CVR）を集計
> - Markdownでレポートを生成
> - reports/ フォルダに「weekly_YYYYMMDD.md」で保存
```

生成されるスクリプト:

```python
#!/usr/bin/env python3
"""週次KPIレポート自動生成スクリプト"""

import csv
import glob
import os
from datetime import datetime, timedelta

def get_last_week_range():
    """先週の月曜〜日曜の日付範囲を返す"""
    today = datetime.now()
    last_monday = today - timedelta(days=today.weekday() + 7)
    last_sunday = last_monday + timedelta(days=6)
    return last_monday, last_sunday

def load_latest_csv(data_dir='data'):
    """data/フォルダから最新のCSVを読み込む"""
    csv_files = glob.glob(os.path.join(data_dir, '*.csv'))
    if not csv_files:
        raise FileNotFoundError("CSVファイルが見つかりません")
    latest = max(csv_files, key=os.path.getmtime)
    with open(latest, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f)), os.path.basename(latest)

def filter_last_week(rows, start, end):
    """先週のデータだけ抽出"""
    filtered = []
    for row in rows:
        row_date = datetime.strptime(row['date'], '%Y-%m-%d')
        if start <= row_date <= end:
            filtered.append(row)
    return filtered

def calculate_kpis(rows):
    """KPIを集計"""
    total_sales = sum(float(r.get('sales', 0)) for r in rows)
    total_visitors = sum(int(r.get('visitors', 0)) for r in rows)
    total_conversions = sum(int(r.get('conversions', 0)) for r in rows)
    cvr = (total_conversions / total_visitors * 100) if total_visitors > 0 else 0
    return {
        'sales': total_sales,
        'visitors': total_visitors,
        'conversions': total_conversions,
        'cvr': cvr
    }

def generate_report(kpis, start, end, source_file):
    """Markdownレポートを生成"""
    report_date = datetime.now().strftime('%Y%m%d')
    os.makedirs('reports', exist_ok=True)
    filepath = f'reports/weekly_{report_date}.md'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f'# 週次KPIレポート\n\n')
        f.write(f'**対象期間**: {start.strftime("%Y/%m/%d")} 〜 {end.strftime("%Y/%m/%d")}\n')
        f.write(f'**生成日時**: {datetime.now().strftime("%Y/%m/%d %H:%M")}\n')
        f.write(f'**データソース**: {source_file}\n\n')
        f.write('## KPIサマリー\n\n')
        f.write('| 指標 | 値 |\n|---|---|\n')
        f.write(f'| 売上 | ¥{kpis["sales"]:,.0f} |\n')
        f.write(f'| 訪問者数 | {kpis["visitors"]:,} |\n')
        f.write(f'| コンバージョン数 | {kpis["conversions"]:,} |\n')
        f.write(f'| CVR | {kpis["cvr"]:.2f}% |\n')

    print(f'レポート生成完了: {filepath}')
    return filepath

if __name__ == '__main__':
    start, end = get_last_week_range()
    rows, source = load_latest_csv()
    weekly_rows = filter_last_week(rows, start, end)
    kpis = calculate_kpis(weekly_rows)
    generate_report(kpis, start, end, source)
```

一度作ってしまえば、毎週 `python weekly_report.py` を実行するだけ。さらにcron等で自動化すれば、完全にハンズフリーになります。

---

#### パターン4: Webスクレイピングで競合情報収集

```
> 以下のURLリストから各ページのタイトルとメタディスクリプションを取得して、
> competitor_analysis.csv に保存するスクリプトを作って。
> URLリスト:
> - https://example-competitor1.com
> - https://example-competitor2.com
> - https://example-competitor3.com
```

**重要な注意**: Webスクレイピングは対象サイトの利用規約とrobots.txtを必ず確認してください。Claude Codeもこの点を指摘してくれることが多いです。

```python
#!/usr/bin/env python3
"""競合サイト情報収集スクリプト"""

import csv
import urllib.request
import urllib.error
from html.parser import HTMLParser

class MetaParser(HTMLParser):
    """HTMLからtitleとmeta descriptionを抽出"""
    def __init__(self):
        super().__init__()
        self.title = ''
        self.description = ''
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        if tag == 'title':
            self._in_title = True
        if tag == 'meta':
            attr_dict = dict(attrs)
            if attr_dict.get('name', '').lower() == 'description':
                self.description = attr_dict.get('content', '')

    def handle_data(self, data):
        if self._in_title:
            self.title += data

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False

def fetch_page_meta(url):
    """指定URLのタイトルとdescriptionを取得"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
        parser = MetaParser()
        parser.feed(html)
        return {'url': url, 'title': parser.title.strip(), 'description': parser.description}
    except (urllib.error.URLError, Exception) as e:
        return {'url': url, 'title': f'エラー: {e}', 'description': ''}

def main():
    urls = [
        'https://example-competitor1.com',
        'https://example-competitor2.com',
        'https://example-competitor3.com',
    ]

    results = [fetch_page_meta(url) for url in urls]

    with open('competitor_analysis.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['url', 'title', 'description'])
        writer.writeheader()
        writer.writerows(results)

    print(f'{len(results)}件のサイト情報を competitor_analysis.csv に保存しました')

if __name__ == '__main__':
    main()
```

---

#### パターン5: 日次バックアップの自動化

```
> 毎日深夜2時に以下を実行するバックアップスクリプトを作って：
> - documents/ フォルダを日付付きでtar.gz圧縮
> - backup/ フォルダに保存
> - 30日以上前のバックアップは自動削除
> - 実行ログを backup/backup.log に記録
> macOS の launchd で自動実行する設定ファイルも一緒に作って
```

```bash
#!/bin/bash
# daily_backup.sh — 日次バックアップスクリプト

set -euo pipefail

# 設定
SOURCE_DIR="$HOME/documents"
BACKUP_DIR="$HOME/backup"
RETENTION_DAYS=30
LOG_FILE="$BACKUP_DIR/backup.log"
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="documents_${DATE}.tar.gz"

# バックアップディレクトリ作成
mkdir -p "$BACKUP_DIR"

# ログ関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== バックアップ開始 ==="

# アーカイブ作成
if tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")"; then
    SIZE=$(du -h "$BACKUP_DIR/$ARCHIVE_NAME" | cut -f1)
    log "作成完了: $ARCHIVE_NAME ($SIZE)"
else
    log "エラー: アーカイブ作成に失敗"
    exit 1
fi

# 古いバックアップの削除
DELETED=$(find "$BACKUP_DIR" -name "documents_*.tar.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "古いバックアップ削除: ${DELETED}件"

log "=== バックアップ完了 ==="
```

launchdの設定ファイル（macOS用）:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.postcabinets.daily-backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/your-username/scripts/daily_backup.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/your-username/backup/launchd_stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/your-username/backup/launchd_stderr.log</string>
</dict>
</plist>
```

```bash
# launchd への登録
cp com.postcabinets.daily-backup.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.postcabinets.daily-backup.plist
```

---

### 5. CLAUDE.md — プロジェクト設定ファイル（3分）

Claude Codeの真の力を引き出すカギが、**CLAUDE.md** というファイルです。

CLAUDE.mdは、プロジェクトのルートに置く設定ファイルで、Claude Codeに対して「このプロジェクトではこういうルールで動いてね」と指示するものです。

```markdown
# プロジェクト設定

## 基本ルール
- コーディング前にリポジトリ構造を必ず確認する
- 大きな書き直しより最小変更を優先する
- 変更を加えたらテストを書く

## 技術スタック
- 言語: Python 3.12
- フレームワーク: FastAPI
- データベース: PostgreSQL
- デプロイ: Docker + AWS ECS

## コーディング規約
- 関数名はスネークケース（例: get_user_data）
- 型ヒントを必ず付ける
- docstringは日本語でOK

## セキュリティ
- .envファイルは絶対にコミットしない
- APIキーはAWS Secrets Managerから取得
- SQLは必ずパラメータ化クエリを使う
```

CLAUDE.mdは3つのレベルで配置できます：

1. **`~/.claude/CLAUDE.md`** — グローバル設定（全プロジェクト共通）
2. **プロジェクトルートの `CLAUDE.md`** — プロジェクト固有の設定
3. **サブディレクトリの `CLAUDE.md`** — ディレクトリ固有の設定

下位の設定が上位を上書きします。チームで使う場合は、プロジェクトルートのCLAUDE.mdをGit管理すると、全員が同じルールでClaude Codeを使えます。

---

### 6. 権限モデルの理解（3分）

Claude Codeは強力なツールですが、**何でもかんでも勝手にやるわけではありません**。権限モデルがしっかり設計されています。

#### 3つの権限レベル

| レベル | 操作例 | 確認 |
|--------|--------|------|
| **読み取り** | ファイル読み込み、検索 | 確認なしで実行 |
| **書き込み** | ファイル作成・編集 | 変更内容を表示して確認を求める |
| **実行** | シェルコマンド実行 | コマンド内容を表示して確認を求める |

#### 設定ファイルでの制御

`~/.claude/settings.json` で細かく制御できます：

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm test)",
      "Bash(npm run lint)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ]
  }
}
```

- **allow**: 確認なしで許可する操作
- **deny**: 常に拒否する操作
- それ以外は都度確認

「何が許可されていて何がブロックされているか」を意識することで、安心して業務に使えます。

---

### 7. 「コードが書けない人」向け使い方ガイド（2分）

最後に、コードが全く書けない方向けのTipsをまとめます。

#### 黄金ルール3つ

**1. 具体的に指示する**

```
# ❌ 曖昧
> データを分析して

# ✅ 具体的
> sales_2025.csv の月別売上合計を計算して、棒グラフのHTMLファイルを作って
```

**2. 段階的に進める**

一度に全部やらせるのではなく、ステップに分けて指示する。

```
> まず、data/フォルダにあるファイルの一覧を見せて
> （結果を確認）
> その中のsales.csvの中身を最初の5行だけ見せて
> （構造を理解）
> sales.csvの売上列の合計を計算して
```

**3. 結果を確認してからYesを押す**

Claude Codeが「この変更をしていいですか？」と聞いてきたら、**必ず内容を確認してからYes**を押してください。わからなければ「この変更の内容を日本語で説明して」と聞き返せばOKです。

---

### 8. まとめ（2分）

今日のModule 12では以下を学びました：

- Claude Codeは自然言語で指示するエージェント型CLI
- インストールはnpm一発
- 5つの基本操作: 読む、書く、実行、検索、分析
- 業務自動化5パターン: CSV分析、ファイル整理、レポート生成、スクレイピング、バックアップ
- CLAUDE.mdでプロジェクトルールを定義
- 権限モデルで安全に使える

次のModule 13では、Claude Codeに「目と手」を与えるMCP（Model Context Protocol）について学びます。Notion、Slack、Gmailなどの外部ツールとClaude Codeを直接つなげる方法です。

---

## ハンズオン演習

### 演習1: Claude Codeの基本操作（5分）

1. ターミナルで `claude` を起動する
2. 以下の指示を順番に実行する：
   - 「現在のフォルダの中身を教えて」
   - 「hello.txt というファイルを作って、中に"Hello from Claude Code!"と書いて」
   - 「hello.txt の内容を読んで」
   - 「hello.txt を削除して」

### 演習2: CSVデータの分析（5分）

1. 以下の内容のCSVファイルを手動で作成（またはClaude Codeに作ってもらう）:

```csv
date,product,amount,quantity
2025-01-05,WidgetA,15000,3
2025-01-12,WidgetB,28000,7
2025-01-19,WidgetA,10000,2
2025-02-03,WidgetC,45000,5
2025-02-14,WidgetA,20000,4
2025-02-28,WidgetB,14000,2
2025-03-05,WidgetC,60000,6
2025-03-15,WidgetA,25000,5
```

2. Claude Codeに「このCSVを分析して、商品別の売上合計と月別の推移を教えて」と指示する
3. 結果を確認する

### 演習3: CLAUDE.mdの作成（5分）

1. 自分の業務に合わせたCLAUDE.mdを作成する
2. 最低限含めるべき項目:
   - プロジェクトの概要
   - 使用する言語・ツール
   - ファイル命名規則
   - やってはいけないこと（セキュリティルール）

---

## 補足資料

### トラブルシューティング

| 症状 | 原因 | 対処法 |
|------|------|--------|
| `command not found: claude` | Node.jsまたはClaude Codeが未インストール | `node --version` を確認、なければインストール |
| 認証エラー | Anthropicアカウント未ログイン | `claude` 再起動でブラウザ認証 |
| レート制限 | API使用量の上限 | 少し待つか、プランをアップグレード |
| 日本語が文字化け | ターミナルのエンコーディング | UTF-8に設定 |

### 参考リンク

- [Claude Code 公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code)
- [CLAUDE.md のベストプラクティス](https://docs.anthropic.com/en/docs/claude-code/claude-md)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
