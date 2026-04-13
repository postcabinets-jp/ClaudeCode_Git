"""
営業リスト スコアリングスクリプト
3つのCSVを統合し、A/B/Cランクに分類してABMリストを出力する

スコア軸:
  - 担当者レベル（役職）: 経営層/部長=3, 課長/係長=2, 担当者=1
  - 業種フィット（AIコンサル・研修導入可能性）: 高=3, 中=2, 低=1
  - 温度感（アポ歴・AI活用状況）: 高=3, 中=2, 低=1

合計 7〜9 = Aランク / 5〜6 = Bランク / 〜4 = Cランク
"""

import csv
import json
import re
from pathlib import Path

BASE = Path("/Users/apple/claude for me/営業リスト")
OUTPUT = Path("/Users/apple/claude for me/営業リスト/ABMリスト_scored.csv")

# ─── スコアリング関数 ───────────────────────────────

EXEC_KEYWORDS = ["代表", "社長", "CEO", "取締役", "役員", "執行役員"]
MANAGER_KEYWORDS = ["部長", "本部長", "事業部長", "マネージャー", "GM", "ゼネラル"]
SECTION_KEYWORDS = ["課長", "係長", "主任", "リーダー", "チーフ", "担当部長", "課長代理"]

HIGH_FIT_INDUSTRIES = ["製造", "建設", "医療", "福祉", "物流", "運輸", "小売", "流通",
                        "不動産", "金融", "保険", "商社", "食品", "教育", "HR", "人材"]
MED_FIT_INDUSTRIES = ["IT", "SaaS", "ソフトウェア", "広告", "マーケ", "コンサル", "その他サービス"]

HOT_STATUS = ["後追い必須", "再アプローチ必要", "アポ（2）確定", "アポ（2）日程調整",
               "社内稟議", "トライアル成約", "アポ（3）"]
WARM_STATUS = ["架電済み", "メール送信済み", "アポ（1）"]

def score_role(role_text: str) -> int:
    t = role_text or ""
    if any(k in t for k in EXEC_KEYWORDS):
        return 3
    if any(k in t for k in MANAGER_KEYWORDS):
        return 3
    if any(k in t for k in SECTION_KEYWORDS):
        return 2
    if t.strip():
        return 1
    return 1

def score_industry(industry_text: str) -> int:
    t = industry_text or ""
    if any(k in t for k in HIGH_FIT_INDUSTRIES):
        return 3
    if any(k in t for k in MED_FIT_INDUSTRIES):
        return 2
    return 1

def score_temperature(status: str, ai_status: str = "") -> int:
    s = status or ""
    a = ai_status or ""
    if any(k in s for k in HOT_STATUS):
        return 3
    if "具体的な導入を検討" in a:
        return 3
    if any(k in s for k in WARM_STATUS):
        return 2
    if "興味はあるが" in a or "すでにAIを活用" in a:
        return 2
    return 1

def rank(score: int) -> str:
    if score >= 7:
        return "A"
    if score >= 5:
        return "B"
    return "C"

def approach_hint(row_dict: dict) -> str:
    """課題仮説・アプローチ方法を1行で生成"""
    hints = []
    ai_issue = row_dict.get("ai_issue", "")
    biz_issue = row_dict.get("biz_issue", "")
    industry = row_dict.get("industry", "")

    if "属人化" in biz_issue:
        hints.append("属人化解消→AI研修")
    if "人材育成" in biz_issue or "AI人材" in biz_issue:
        hints.append("AI人材育成研修")
    if "工数削減" in biz_issue:
        hints.append("業務自動化コンサル")
    if "全社" in biz_issue:
        hints.append("全社AI推進支援")
    if "セキュリティ" in ai_issue:
        hints.append("セキュリティ担保型導入提案")
    if "専門知識" in ai_issue or "活用方法" in ai_issue:
        hints.append("ハンズオン研修")
    if "コスト" in ai_issue:
        hints.append("助成金活用スキーム提案")
    if not hints:
        if "製造" in industry or "建設" in industry:
            hints.append("現場業務自動化事例を提示")
        elif "医療" in industry or "福祉" in industry:
            hints.append("医療向けセキュア導入事例を提示")
        else:
            hints.append("AI活用無料診断を提案")
    return " / ".join(hints)

# ─── AI-PAX展示会リード ────────────────────────────

records = []

with open(BASE / "☎️【2025_10】AI-PAX展示会リード - シート1.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        company = row.get("会社名", "").strip()
        if not company:
            continue
        role = (row.get("役職", "") + " " + row.get("役職区分", "")).strip()
        industry = row.get("業種", "")
        status = row.get("アポ取得状況", "")
        ai_status = row.get("AI活用における現在の状況", "")
        ai_issue = row.get("AI活用における課題", "")
        biz_issue = row.get("業務での課題", "")
        email = row.get("メールアドレス", "")
        person = (row.get("姓", "") + row.get("名", "")).strip()
        emp = row.get("従業員規模", "")

        rs = score_role(role)
        ins = score_industry(industry)
        ts = score_temperature(status, ai_status)
        total = rs + ins + ts

        rd = {"ai_issue": ai_issue, "biz_issue": biz_issue, "industry": industry}
        records.append({
            "ソース": "AI-PAX展示会",
            "企業名": company,
            "担当者名": person,
            "役職": role,
            "業種": industry,
            "従業員規模": emp,
            "メール": email,
            "営業状況": status,
            "AI活用状況": ai_status,
            "役職スコア": rs,
            "業種スコア": ins,
            "温度感スコア": ts,
            "合計スコア": total,
            "ランク": rank(total),
            "課題仮説・アプローチ": approach_hint(rd),
        })

# ─── VisionToDo顧客管理 ───────────────────────────

with open(BASE / "🙆VisionToDo 顧客管理 - 支社顧客.csv", encoding="utf-8") as f:
    reader = csv.reader(f)
    rows = list(reader)

headers = [h.replace("\n", "") for h in rows[1]]
for row in rows[2:]:
    if len(row) < 2:
        continue
    company = row[1].strip() if len(row) > 1 else ""
    if not company:
        continue
    person = row[2].strip() if len(row) > 2 else ""
    email = row[4].strip() if len(row) > 4 else ""
    status = row[11].strip() if len(row) > 11 else ""
    ketsu = row[38].strip() if len(row) > 38 else ""
    備考 = row[35].strip() if len(row) > 35 else ""

    # 役職はpersonフィールドから推測 or 空
    role = ketsu if ketsu else ""
    rs = score_role(role)
    ins = 2  # 業種情報なし→中程度デフォルト
    ts = score_temperature(status)
    total = rs + ins + ts

    rd = {"ai_issue": "", "biz_issue": 備考, "industry": ""}
    records.append({
        "ソース": "VisionToDo",
        "企業名": company,
        "担当者名": person,
        "役職": role,
        "業種": "",
        "従業員規模": "",
        "メール": email,
        "営業状況": status,
        "AI活用状況": "",
        "役職スコア": rs,
        "業種スコア": ins,
        "温度感スコア": ts,
        "合計スコア": total,
        "ランク": rank(total),
        "課題仮説・アプローチ": approach_hint(rd),
    })

# ─── 京都展示会 ───────────────────────────────────

with open(BASE / "☎️京都展示会20241112-13.xlsx - myBridge.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        company = row.get("会社名", "").strip()
        if not company:
            continue
        person = (row.get("名前", "") or "").strip()
        role = (row.get("役職", "") or "").strip()
        email = (row.get("電子メール", "") or "").strip()
        status = (row.get("テレアポ結果", "") or "").strip()
        memo = (row.get("コールメモ", "") or "").strip()
        priority = (row.get("優先度", "") or "").strip()

        # 優先度S/Aは温度感高め
        temp_boost = 0
        if priority == "S":
            temp_boost = 1

        rs = score_role(role)
        ins = 2
        ts = min(3, score_temperature(status) + temp_boost)
        total = rs + ins + ts

        rd = {"ai_issue": "", "biz_issue": memo, "industry": ""}
        records.append({
            "ソース": "京都展示会",
            "企業名": company,
            "担当者名": person,
            "役職": role,
            "業種": "",
            "従業員規模": "",
            "メール": email,
            "営業状況": status,
            "AI活用状況": "",
            "役職スコア": rs,
            "業種スコア": ins,
            "温度感スコア": ts,
            "合計スコア": total,
            "ランク": rank(total),
            "課題仮説・アプローチ": approach_hint(rd),
        })

# ─── 出力 ─────────────────────────────────────────

records.sort(key=lambda x: -x["合計スコア"])

fieldnames = ["ランク", "合計スコア", "ソース", "企業名", "担当者名", "役職",
              "業種", "従業員規模", "メール", "営業状況", "AI活用状況",
              "役職スコア", "業種スコア", "温度感スコア", "課題仮説・アプローチ"]

with open(OUTPUT, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)

# サマリー表示
a_rank = [r for r in records if r["ランク"] == "A"]
b_rank = [r for r in records if r["ランク"] == "B"]
c_rank = [r for r in records if r["ランク"] == "C"]

print(f"総件数: {len(records)}")
print(f"Aランク: {len(a_rank)}社")
print(f"Bランク: {len(b_rank)}社")
print(f"Cランク: {len(c_rank)}社")
print()
print("=== Aランク TOP20 ===")
for r in a_rank[:20]:
    print(f"[{r['合計スコア']}] {r['企業名']} / {r['役職']} / {r['ソース']} / {r['営業状況']}")
    print(f"     → {r['課題仮説・アプローチ']}")
