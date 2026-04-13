#!/usr/bin/env python3
"""自動命名会議の文字起こしをスキャンして未マッチ企業と突合"""
import csv, json, re, time, requests
from pathlib import Path

TLDV_API_KEY = "23639fcf-7326-4d68-8f09-827dd39c460f"
BASE = "https://pasta.tldv.io/v1alpha1"
H = {"x-api-key": TLDV_API_KEY}
ABM_CSV = Path(__file__).parent.parent.parent / "営業リスト/ABMシート_完全版.csv"
OUT_JSON = Path(__file__).parent.parent.parent / "営業リスト/tldv_matched_transcripts.json"

ALREADY_MATCHED = {
    "エヌエス・テック株式会社","国土防災技術株式会社","株式会社グレエイト",
    "株式会社コメ兵","株式会社ジェイ・アイ・ティ","株式会社リバスタ","株式会社藤商事"
}

def n(s): return re.sub(r"[\s　]","",str(s).strip())
def sc(s):
    s=n(s)
    for w in ["株式会社","合同会社","有限会社","（別担当）","（","）","(",")"]:
        s=s.replace(w,"")
    return s

with open(ABM_CSV, encoding="utf-8-sig") as f:
    all_abm = list(csv.DictReader(f))
unmatched = [r for r in all_abm if r["企業名"].strip() not in ALREADY_MATCHED]

search_keys = {}
for row in unmatched:
    search_keys[row["企業名"]] = {
        "row": row,
        "company_core": sc(row["企業名"]),
        "person": n(row["担当者名"]),
        "person_family": n(row["担当者名"])[:2],
        "email": row.get("メール","").lower().strip(),
    }

print(f"未マッチ企業: {len(search_keys)}件")

# 全会議取得（命名済み + 自動命名）
all_meetings = []
for page in range(1, 24):
    r = requests.get(f"{BASE}/meetings", headers=H, params={"page": page, "pageSize": 50}, timeout=30)
    data = r.json()
    all_meetings.extend(data.get("results", []))
    if page >= data.get("pages", 1): break
    time.sleep(0.1)

auto_named = [m for m in all_meetings if "'s meeting" in m.get("name","")]
print(f"自動命名会議: {len(auto_named)}件 / 全{len(all_meetings)}件")
print("文字起こしスキャン開始...\n")

new_matches = []
scanned = 0

for i, m in enumerate(auto_named):
    r = requests.get(f"{BASE}/meetings/{m['id']}/transcript", headers=H, timeout=20)
    if r.status_code != 200: continue
    segs = r.json().get("data", [])
    if not segs: continue
    scanned += 1

    speakers = {n(s.get("speaker","")) for s in segs[:100]}
    early_text = n(" ".join(s.get("text","") for s in segs[:30]))
    inv_emails = [iv.get("email","").lower() for iv in m.get("invitees",[])]

    for company, keys in search_keys.items():
        if any(x["abm"]["企業名"] == company for x in new_matches): continue

        hit = None
        # 1. メール一致
        if keys["email"] and keys["email"] in inv_emails:
            hit = f"email:{keys['email']}"
        # 2. 担当者姓（2文字）が話者名に含まれる（短すぎる姓は除外）
        elif len(keys["person_family"]) >= 2:
            for sp in speakers:
                if sp and keys["person_family"] in sp and 2 <= len(sp) <= 8:
                    hit = f"話者:{sp}⊃{keys['person_family']}"
                    break
        # 3. 企業名コアが冒頭テキストに出現
        if not hit and len(keys["company_core"]) >= 5 and keys["company_core"] in early_text:
            hit = f"冒頭テキスト:{keys['company_core']}"

        if hit:
            transcript_text = "\n".join(f"[{s['speaker']}] {s['text']}" for s in segs)
            print(f"[HIT] {company} / {keys['row']['担当者名']}")
            print(f"  理由: {hit}")
            print(f"  会議: {m['name']} ({m['happenedAt'][:10]})")
            print(f"  話者一覧: {sorted(speakers)}")
            new_matches.append({
                "abm": keys["row"],
                "meeting": {
                    "id": m["id"], "name": m["name"],
                    "date": m["happenedAt"][:10], "url": m.get("url",""),
                    "all_matches": 1,
                },
                "transcript": transcript_text,
                "match_reason": hit,
            })

    if (i+1) % 50 == 0:
        print(f"  {i+1}/{len(auto_named)}件スキャン... マッチ: {len(new_matches)}件")
    time.sleep(0.1)

print(f"\n完了 — スキャン: {scanned}件 / 新規マッチ: {len(new_matches)}件")

with open(OUT_JSON, encoding="utf-8") as f:
    existing = json.load(f)

combined = existing + new_matches
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(combined, f, ensure_ascii=False, indent=2)
print(f"合計マッチ: {len(combined)}件 → 保存完了")
