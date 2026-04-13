#!/usr/bin/env python3
"""
tldv × ABMシート突合スクリプト
- tldv APIから全会議の文字起こしを取得
- ABMシートの企業名・担当者名と突合
- Claude APIで課題抽出・営業戦略アップデートを生成
- 結果をCSVに出力
"""

import csv
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import anthropic
import requests

# ── 設定 ──────────────────────────────────────────────
TLDV_API_KEY = "23639fcf-7326-4d68-8f09-827dd39c460f"
TLDV_BASE_URL = "https://pasta.tldv.io/v1alpha1"
TLDV_HEADERS = {"x-api-key": TLDV_API_KEY}

ABM_CSV = Path(__file__).parent.parent.parent / "営業リスト/ABMシート_完全版.csv"
OUTPUT_CSV = Path(__file__).parent.parent.parent / "営業リスト/ABMシート_tldv更新済み.csv"

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# ── tldv API ──────────────────────────────────────────
def get_all_meetings(max_pages: int = 5) -> list[dict]:
    """会議一覧を取得（最新順、最大max_pages分）"""
    meetings = []
    for page in range(1, max_pages + 1):
        resp = requests.get(
            f"{TLDV_BASE_URL}/meetings",
            headers=TLDV_HEADERS,
            params={"page": page, "pageSize": 50},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        meetings.extend(data.get("results", []))
        if page >= data.get("pages", 1):
            break
        time.sleep(0.3)
    return meetings


def get_transcript(meeting_id: str) -> list[dict]:
    """文字起こし取得"""
    resp = requests.get(
        f"{TLDV_BASE_URL}/meetings/{meeting_id}/transcript",
        headers=TLDV_HEADERS,
        timeout=30,
    )
    if resp.status_code == 404:
        return []
    resp.raise_for_status()
    return resp.json().get("data", [])


def transcript_to_text(transcript: list[dict]) -> str:
    """文字起こし配列 → 読みやすいテキスト"""
    lines = []
    for seg in transcript:
        lines.append(f"[{seg['speaker']}] {seg['text']}")
    return "\n".join(lines)


# ── 突合ロジック ──────────────────────────────────────
def normalize(s: str) -> str:
    """全角/半角統一・スペース除去"""
    s = s.strip()
    # 全角英数→半角
    s = s.translate(str.maketrans(
        "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ"
        "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ"
        "０１２３４５６７８９",
        "abcdefghijklmnopqrstuvwxyz"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "0123456789",
    ))
    return re.sub(r"\s+", "", s)


def normalize_company(s: str) -> str:
    """企業名から一般語・記号を除去してコアを抽出"""
    s = normalize(s)
    # 企業形態・敬称・絵文字などを除去
    remove = ["株式会社", "合同会社", "有限会社", "社団法人", "財団法人",
              "（", "）", "(", ")", "様", "さん", "さま", "👘", "👻", "🔴", "🐦", "‍", "⬛"]
    for r in remove:
        s = s.replace(r, "")
    return s.strip()


def match_meeting_to_abm(meeting: dict, abm_rows: list[dict]) -> dict | None:
    """
    会議の参加者名・メール・会議名 → ABMシートの企業名・担当者名と突合
    優先順位: メール完全一致 > 企業名部分一致（会議名） > 担当者名一致
    返り値: マッチしたABM行（なければNone）
    """
    invitee_names = {normalize(i.get("name", "")) for i in meeting.get("invitees", [])}
    invitee_emails = {i.get("email", "").lower() for i in meeting.get("invitees", [])}
    meeting_name_raw = normalize_company(meeting.get("name", ""))

    for row in abm_rows:
        company_core = normalize_company(row.get("企業名", ""))
        person = normalize(row.get("担当者名", ""))
        email = row.get("メール", "").lower().strip()

        if len(company_core) < 3:
            continue

        # 1. メール完全一致
        if email and email in invitee_emails:
            return row

        # 2. 企業名が会議名に含まれる（または逆）
        if company_core and (company_core in meeting_name_raw or meeting_name_raw in company_core):
            return row

        # 3. 担当者名が参加者名に含まれる
        if person and any(person in n or n in person for n in invitee_names if n):
            return row

    return None


# ── Claude による課題抽出 ─────────────────────────────
def extract_insights_with_claude(
    transcript_text: str,
    abm_row: dict,
    client: anthropic.Anthropic,
) -> dict:
    """
    文字起こし全文 + 既存ABM情報 → 課題・温度感・次アクションを抽出
    """
    existing_context = f"""
企業名: {abm_row.get('企業名', '')}
担当者: {abm_row.get('担当者名', '')} / {abm_row.get('役職', '')}
既存の業務課題仮説: {abm_row.get('業務課題', '')}
既存のAI課題仮説: {abm_row.get('AI課題', '')}
既存の刺さる訴求: {abm_row.get('刺さる訴求', '')}
直近の状況: {abm_row.get('最後の状況', '')}
""".strip()

    prompt = f"""以下は営業商談の文字起こしです。既存の営業情報と照らし合わせ、以下を日本語で簡潔に抽出してください。

## 既存の営業情報
{existing_context}

## 商談の文字起こし
{transcript_text[:6000]}

## 抽出してほしい項目（JSON形式で返してください）
{{
  "confirmed_issues": "文字起こしから確認された実際の課題（箇条書き）",
  "new_findings": "既存仮説にはなかった新たな発見・ニーズ",
  "temperature": "HOT / WARM / COLD（理由も一言で）",
  "updated_strategy": "この商談を踏まえた具体的な次の営業アクション",
  "key_quote": "戦略設計に使える相手の発言（原文引用）",
  "updated_訴求": "更新版の刺さる訴求（商談情報を反映）"
}}

JSONのみ返してください。"""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()

    # JSONパース
    try:
        # コードブロックがある場合は除去
        raw = re.sub(r"```json\s*|\s*```", "", raw)
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw_response": raw}


# ── メイン処理 ────────────────────────────────────────
def main():
    print("=== tldv × ABMシート突合 開始 ===\n")

    # ABMシート読み込み
    abm_rows = []
    with open(ABM_CSV, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        abm_rows = list(reader)
    print(f"ABMシート読み込み: {len(abm_rows)}件\n")

    # Claudeクライアント
    if not ANTHROPIC_API_KEY:
        print("ERROR: ANTHROPIC_API_KEY が未設定です")
        sys.exit(1)
    claude = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # tldv会議一覧取得（全件）
    print("tldv から会議一覧を取得中（全ページ）...")
    meetings = get_all_meetings(max_pages=99)
    # 自動命名を除外
    meetings = [m for m in meetings if "'s meeting" not in m.get("name", "")]
    print(f"命名済み会議数: {len(meetings)}件\n")

    # 突合 & 処理
    results = []
    matched_count = 0

    for meeting in meetings:
        abm_row = match_meeting_to_abm(meeting, abm_rows)
        if not abm_row:
            continue

        matched_count += 1
        company = abm_row.get("企業名", "")
        person = abm_row.get("担当者名", "")
        happened_at = meeting.get("happenedAt", "")[:10]

        print(f"[MATCH] {company} / {person} — 会議日: {happened_at}")

        # 文字起こし取得
        transcript = get_transcript(meeting["id"])
        if not transcript:
            print(f"  → 文字起こしなし。スキップ")
            continue

        transcript_text = transcript_to_text(transcript)
        print(f"  → 文字起こし {len(transcript)}セグメント取得")

        # Claude で課題抽出
        print(f"  → Claude で課題抽出中...")
        insights = extract_insights_with_claude(transcript_text, abm_row, claude)

        # 結果をまとめる
        result_row = dict(abm_row)
        result_row["商談日_tldv"] = happened_at
        result_row["会議URL_tldv"] = meeting.get("url", "")
        result_row["確認済み課題"] = insights.get("confirmed_issues", "")
        result_row["新発見"] = insights.get("new_findings", "")
        result_row["温度感"] = insights.get("temperature", "")
        result_row["更新版_次アクション"] = insights.get("updated_strategy", "")
        result_row["キーワード発言"] = insights.get("key_quote", "")
        result_row["更新版_刺さる訴求"] = insights.get("updated_訴求", "")
        results.append(result_row)

        time.sleep(0.5)  # レート制限対策

    print(f"\n突合完了: {matched_count}件マッチ / {len(results)}件に文字起こしあり\n")

    if not results:
        print("マッチした商談がありませんでした。")
        print("ヒント: tldv の会議名または参加者名がABMシートの企業名・担当者名と一致しているか確認してください。")
        return

    # CSV出力
    fieldnames = list(results[0].keys())
    with open(OUTPUT_CSV, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    print(f"出力完了: {OUTPUT_CSV}")
    print(f"\n=== 完了 ===")


if __name__ == "__main__":
    main()
