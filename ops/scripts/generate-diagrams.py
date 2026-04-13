#!/usr/bin/env python3
"""
CC活用事例15件の図解をMermaid→Kroki永続URLとして生成するスクリプト
"""
import base64, zlib, json

def mermaid_to_kroki_url(diagram: str, fmt: str = "svg") -> str:
    """Mermaid記法をKroki永続URLに変換"""
    compressed = zlib.compress(diagram.encode('utf-8'), 9)
    encoded = base64.urlsafe_b64encode(compressed).decode('ascii')
    return f"https://kroki.io/mermaid/{fmt}/{encoded}"

# ============================
# 15事例の図解定義
# ============================

diagrams = {
    "01_invoice_flow": {
        "title": "事例01: 請求書PDF→仕訳CSV 自動化フロー",
        "page_id": "32e9bf08eefd8198b85ef470134a98b0",
        "diagram": """graph TD
    A["📄 請求書PDF<br/>50〜100枚/月"] -->|フォルダにまとめる| B["🤖 Claude Code"]
    B -->|PDF読み取り| C["📋 データ抽出<br/>取引先名・金額・日付・税区分"]
    C -->|勘定科目マスタ照合| D["📊 勘定科目自動判定"]
    D -->|CSV生成| E["📁 freee/弥生<br/>インポート用CSV"]
    E -->|ワンクリック| F["✅ 仕訳完了"]

    style A fill:#ff6b6b,color:#fff
    style B fill:#4ecdc4,color:#fff
    style F fill:#2ecc71,color:#fff"""
    },

    "02_sales_report": {
        "title": "事例02: 週次営業レポート自動生成フロー",
        "page_id": "32e9bf08eefd81e4a529cdd902f353fe",
        "diagram": """graph TD
    A["📊 各メンバーの<br/>スプレッドシート"] -->|CSVエクスポート| B["🤖 Claude Code"]
    B --> C["📈 集計・分析"]
    C --> D["チーム別<br/>商談数・金額・受注率"]
    C --> E["前週比<br/>増減ハイライト"]
    C --> F["⚠️ 注目商談<br/>大型・停滞"]
    D & E & F --> G["📝 Markdown<br/>週次レポート"]
    G -->|Slackに投稿| H["✅ 共有完了"]

    style A fill:#3498db,color:#fff
    style B fill:#4ecdc4,color:#fff
    style H fill:#2ecc71,color:#fff"""
    },

    "03_screening": {
        "title": "事例03: 書類選考効率化フロー",
        "page_id": "32e9bf08eefd816e89ebc9cfed427da0",
        "diagram": """graph TD
    A["📋 求人要件"] -->|事前読み込み| B["🤖 Claude Code"]
    C["📄 職務経歴書PDF<br/>月30名分"] -->|一括読み込み| B
    B --> D["🔍 スキルマッチ分析"]
    D --> E["A〜E 5段階評価"]
    D --> F["💪 強みポイント"]
    D --> G["❓ 面接確認事項"]
    E & F & G --> H["📊 選考サマリー"]
    H -->|人事が最終判断| I["✅ 面接候補決定"]

    style C fill:#e74c3c,color:#fff
    style B fill:#4ecdc4,color:#fff
    style I fill:#2ecc71,color:#fff"""
    },

    "04_knowledge_base": {
        "title": "事例04: 就業規則ナレッジベース フロー",
        "page_id": "32e9bf08eefd8193bd2cf08ce746e75a",
        "diagram": """graph TD
    A["📕 就業規則PDF<br/>62ページ"] -->|初回読み込み| B["🤖 Claude Code"]
    C["📘 在宅勤務規定"] -->|初回読み込み| B
    D["📗 慶弔規定"] -->|初回読み込み| B
    B --> E["🧠 社内規則を理解"]
    F["👤 社員の質問<br/>有給は繰り越せる？"] -->|質問| E
    E --> G["📖 条文引用＋<br/>分かりやすい回答"]

    style F fill:#f39c12,color:#fff
    style B fill:#4ecdc4,color:#fff
    style G fill:#2ecc71,color:#fff"""
    },

    "05_sns": {
        "title": "事例05: SNS投稿自動企画フロー",
        "page_id": "32e9bf08eefd81529a75f9e2fd618f00",
        "diagram": """graph TD
    A["📦 商品カタログCSV"] -->|読み込み| C["🤖 Claude Code"]
    B["📊 先月の反応データ"] -->|読み込み| C
    C --> D["💡 投稿ネタ10本生成"]
    D --> E["✍️ キャプション案"]
    D --> F["🏷️ ハッシュタグ5個"]
    D --> G["🎨 画像指示"]
    E & F & G -->|Notion MCP| H["📅 SNSカレンダーDB<br/>に自動登録"]

    style A fill:#9b59b6,color:#fff
    style C fill:#4ecdc4,color:#fff
    style H fill:#2ecc71,color:#fff"""
    },

    "06_secretary_ai": {
        "title": "事例06: 秘書AI（Gmail×Notion×Calendar）フロー",
        "page_id": "32e9bf08eefd81519377fab08ec29363",
        "diagram": """graph TD
    A["📧 Gmail<br/>未読100通/日"] -->|Gmail MCP| B["🤖 Claude Code"]
    B --> C{"重要度判定"}
    C -->|至急| D["🔴 至急対応"]
    C -->|今週中| E["🟡 今週中"]
    C -->|参考| F["🟢 参考情報"]
    D & E -->|Notion MCP| G["📋 タスクDB<br/>に自動登録"]
    D -->|Calendar MCP| H["📅 空き枠3つ提案"]

    style A fill:#e74c3c,color:#fff
    style B fill:#4ecdc4,color:#fff
    style G fill:#2ecc71,color:#fff
    style H fill:#3498db,color:#fff"""
    },

    "07_slack_digest": {
        "title": "事例07: Slack日次ダイジェスト自動生成フロー",
        "page_id": "32e9bf08eefd815baffed0bbadae2d93",
        "diagram": """graph TD
    A["💬 Slack 5ch<br/>200件/日"] -->|Slack MCP| B["🤖 Claude Code"]
    B --> C["📊 プロジェクト別に分類"]
    C --> D["⚡ 意思決定が必要"]
    C --> E["🚧 ブロッカー"]
    C --> F["🎉 成果報告"]
    D & E & F --> G["📝 A4一枚ダイジェスト"]
    G -->|毎朝配信| H["✅ 5分で全体把握"]

    style A fill:#4a154b,color:#fff
    style B fill:#4ecdc4,color:#fff
    style H fill:#2ecc71,color:#fff"""
    },

    "08_contract_review": {
        "title": "事例08: 契約書自動レビューフロー",
        "page_id": "32e9bf08eefd81b5a3fff4c372a7cafb",
        "diagram": """graph TD
    A["📄 契約書PDF<br/>Google Drive"] -->|Drive MCP| B["🤖 Claude Code"]
    B --> C["🔍 リスク条項チェック"]
    C --> D["⏰ 自動更新条項"]
    C --> E["💰 損害賠償上限"]
    C --> F["🧠 知的財産帰属"]
    C --> G["🚫 競業避止義務"]
    C --> H["🔒 秘密保持期間"]
    D & E & F & G & H --> I["📋 リスクレポート"]
    I --> J["⚠️ 弁護士確認リスト"]

    style A fill:#e67e22,color:#fff
    style B fill:#4ecdc4,color:#fff
    style J fill:#e74c3c,color:#fff"""
    },

    "09_competitor_watch": {
        "title": "事例09: 競合サイト監視フロー",
        "page_id": "32e9bf08eefd8147b197fdc4f4214e17",
        "diagram": """graph TD
    A["🌐 競合5社<br/>商品ページ"] -->|Playwright MCP<br/>毎朝自動巡回| B["🤖 Claude Code"]
    B --> C["📸 スナップショット取得"]
    C -->|前日との差分比較| D["🔍 変更検出"]
    D --> E["💰 価格変更"]
    D --> F["🆕 新商品追加"]
    D --> G["📢 キャンペーン"]
    E & F & G -->|Slack通知| H["📊 差分レポート<br/>を自動投稿"]

    style A fill:#e74c3c,color:#fff
    style B fill:#4ecdc4,color:#fff
    style H fill:#2ecc71,color:#fff"""
    },

    "10_seo_ranking": {
        "title": "事例10: SEOランキング自動チェックフロー",
        "page_id": "32e9bf08eefd8171832cc73d4ac34757",
        "diagram": """graph TD
    A["📊 検索順位CSV<br/>10社×50KW"] -->|先週+今週| B["🤖 Claude Code"]
    B --> C["📉 3位以上下落を抽出"]
    C --> D["🔴 要対応<br/>10位以上下落"]
    C --> E["🟡 注意<br/>3〜9位下落"]
    D & E --> F["💡 原因仮説＋対策案"]
    F --> G["📋 クライアント別<br/>アラートレポート"]

    style A fill:#3498db,color:#fff
    style B fill:#4ecdc4,color:#fff
    style D fill:#e74c3c,color:#fff
    style G fill:#2ecc71,color:#fff"""
    },

    "11_kpi_anomaly": {
        "title": "事例11: KPI異常検知→先手提案フロー",
        "page_id": "32e9bf08eefd81c69220f4df06cfdec3",
        "diagram": """graph TD
    A["📊 GA4 + 広告データ<br/>15社分CSV"] -->|月初に読み込み| B["🤖 Claude Code"]
    B --> C["🔍 前月比±20%<br/>異常値検出"]
    C -->|異常あり| D["📝 原因分析＋対策案"]
    D -->|Gmail MCP| E["✉️ 先手の提案メール<br/>ドラフト自動作成"]
    C -->|異常なし| F["✅ 正常レポート"]

    style A fill:#9b59b6,color:#fff
    style B fill:#4ecdc4,color:#fff
    style E fill:#2ecc71,color:#fff"""
    },

    "12_line_bot": {
        "title": "事例12: LINE FAQ Bot構築フロー",
        "page_id": "32e9bf08eefd811685c5e98d945d376e",
        "diagram": """graph TD
    A["📋 社内FAQ集<br/>Excel + マニュアルPDF"] -->|日本語で指示| B["🤖 Claude Code<br/>がコードを書く"]
    B --> C["⚙️ LINE Bot<br/>自動生成"]
    C --> D["🏪 店舗スタッフ<br/>LINEで質問"]
    D -->|回答あり| E["💬 即回答"]
    D -->|回答なし| F["📨 本部に確認します"]
    F -->|Slack通知| G["👤 本部が対応"]

    style A fill:#f39c12,color:#fff
    style B fill:#4ecdc4,color:#fff
    style E fill:#2ecc71,color:#fff
    style C fill:#06c755,color:#fff"""
    },

    "13_spreadsheet_to_notion": {
        "title": "事例13: スプレッドシート→Notion DB移行フロー",
        "page_id": "32e9bf08eefd81adb7bcccf5acee80e9",
        "diagram": """graph TD
    A["📊 顧客CSV<br/>20ファイル分散"] -->|全部読み込み| B["🤖 Claude Code"]
    B --> C["🔄 重複排除・クレンジング"]
    C -->|Notion MCP| D["👥 顧客マスタDB"]
    C -->|Notion MCP| E["💼 商談DB"]
    C -->|Notion MCP| F["📝 対応履歴DB"]
    D -.->|リレーション| E
    D -.->|リレーション| F

    style A fill:#e74c3c,color:#fff
    style B fill:#4ecdc4,color:#fff
    style D fill:#2ecc71,color:#fff
    style E fill:#2ecc71,color:#fff
    style F fill:#2ecc71,color:#fff"""
    },

    "14_daily_report": {
        "title": "事例14: 日報→週次サマリー自動生成フロー",
        "page_id": "32e9bf08eefd819288c2c763e4fd2649",
        "diagram": """graph TD
    A["📝 Notion日報DB<br/>20名×5日分"] -->|Notion MCP| B["🤖 Claude Code"]
    B --> C["📊 自動集約"]
    C --> D["🏆 今週の成果<br/>プロジェクト別"]
    C --> E["⚠️ 課題・ブロッカー"]
    C --> F["😊😟 メンバー<br/>コンディション"]
    C --> G["📋 来週アクション"]
    D & E & F & G -->|Notion MCP| H["📄 週次レポート<br/>ページに書き込み"]

    style A fill:#f39c12,color:#fff
    style B fill:#4ecdc4,color:#fff
    style H fill:#2ecc71,color:#fff"""
    },

    "15_auto_response": {
        "title": "事例15: 問い合わせ自動応答フロー",
        "page_id": "32e9bf08eefd81bc870cf7530fd999fe",
        "diagram": """graph TD
    A["📧 問い合わせメール<br/>月200件"] -->|Gmail MCP| B["🤖 Claude Code"]
    B --> C{"自動分類"}
    C -->|60%| D["📚 FAQ対応可能"]
    C -->|20%| E["💼 営業対応"]
    C -->|15%| F["🔧 技術対応"]
    C -->|5%| G["😤 クレーム"]
    D -->|自動返信ドラフト| H["✉️ 即時応答"]
    E -->|sales@に転送| I["営業チーム"]
    F -->|dev@に転送| J["技術チーム"]
    G -->|manager@に転送| K["マネージャー"]

    style A fill:#e74c3c,color:#fff
    style B fill:#4ecdc4,color:#fff
    style H fill:#2ecc71,color:#fff"""
    }
}

# ============================
# URL生成
# ============================

results = {}
for key, data in diagrams.items():
    url = mermaid_to_kroki_url(data["diagram"], "svg")
    results[key] = {
        "title": data["title"],
        "page_id": data["page_id"],
        "url": url
    }
    print(f"✅ {data['title']}")
    print(f"   Page: {data['page_id']}")
    print(f"   URL: {url[:80]}...")
    print()

# JSON出力
with open("/Users/apple/claude for me/cases/diagrams/diagram-urls.json", "w") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n📁 {len(results)}件のURL生成完了 → diagram-urls.json")
