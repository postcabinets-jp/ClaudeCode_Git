import { createClient } from "@/lib/supabase/client";
import type { UserProfile, DiagnosisResult } from "@/types";
import type { DailyCheckinResult } from "@/lib/daily-checkin";

// ユーザーをupsert（anon_idをキーに）
export async function upsertUser(profile: UserProfile): Promise<void> {
  try {
    const supabase = createClient();

    const payload = {
      anon_id: profile.id,
      nickname: profile.nickname ?? null,
      fatigue_type: profile.character?.type ?? null,
      character_level: profile.character?.level ?? 1,
      continuous_days: profile.continuousDays,
      total_checkins: profile.totalCheckins,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("users")
      .upsert(payload, { onConflict: "anon_id" });

    if (error) {
      console.error("[db] upsertUser error:", error.message);
    }
  } catch (err) {
    console.error("[db] upsertUser unexpected error:", err);
  }
}

// チェックイン結果を保存
export async function saveCheckin(
  anonId: string,
  result: DailyCheckinResult
): Promise<void> {
  try {
    const supabase = createClient();

    // users テーブルから内部UUIDを取得
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("anon_id", anonId)
      .single();

    if (userError || !user) {
      console.error("[db] saveCheckin: user not found for anonId", anonId);
      return;
    }

    const timeSlot =
      result.timeSlot === "all" ? null : result.timeSlot;

    const { error } = await supabase.from("checkins").insert({
      user_id: user.id,
      question_ids: result.questionIds,
      answers: result.answers,
      scores: result.scores,
      overall_percent: result.overallPercent,
      feedback: result.feedback,
      time_slot: timeSlot,
    });

    if (error) {
      console.error("[db] saveCheckin error:", error.message);
    }
  } catch (err) {
    console.error("[db] saveCheckin unexpected error:", err);
  }
}

// 診断結果を保存
export async function saveDiagnosis(
  anonId: string,
  result: DiagnosisResult
): Promise<void> {
  try {
    const supabase = createClient();

    // users テーブルから内部UUIDを取得（upsertで存在保証してから取得）
    const { error: upsertError } = await supabase
      .from("users")
      .upsert({ anon_id: anonId }, { onConflict: "anon_id" });

    if (upsertError) {
      console.error("[db] saveDiagnosis: upsert failed", upsertError.message);
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("anon_id", anonId)
      .single();

    if (userError || !user) {
      console.error("[db] saveDiagnosis: user not found for anonId", anonId);
      return;
    }

    const { error } = await supabase.from("diagnoses").insert({
      user_id: user.id,
      primary_type: result.primaryType,
      secondary_type: result.secondaryType,
      scores: result.scores,
    });

    if (error) {
      console.error("[db] saveDiagnosis error:", error.message);
    }
  } catch (err) {
    console.error("[db] saveDiagnosis unexpected error:", err);
  }
}

// 問い合わせを保存
export async function saveInquiry(data: {
  anonId: string;
  kampoId?: string;
  kampoName?: string;
  userName: string;
  email: string;
  message: string;
}): Promise<boolean> {
  try {
    const supabase = createClient();

    // ユーザーID取得
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("anon_id", data.anonId)
      .single();

    const { error } = await supabase.from("inquiries").insert({
      user_id: user?.id ?? null,
      kampo_id: data.kampoId ?? null,
      kampo_name: data.kampoName ?? null,
      user_name: data.userName,
      email: data.email,
      message: data.message,
    });

    if (error) {
      console.error("[db] saveInquiry error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[db] saveInquiry unexpected error:", err);
    return false;
  }
}

// ユーザーをanon_idで取得
export async function getUser(anonId: string): Promise<Record<string, unknown> | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("anon_id", anonId)
      .single();

    if (error) {
      console.error("[db] getUser error:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[db] getUser unexpected error:", err);
    return null;
  }
}
