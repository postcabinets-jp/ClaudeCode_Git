import { create } from "zustand";

function toJSTDateString(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}
import { persist } from "zustand/middleware";
import type { UserProfile, DiagnosisResult } from "@/types";
import { CHARACTERS, LEVEL_NAMES } from "@/types";
import { calcCharacterLevel } from "@/lib/diagnosis";
import { upsertUser, saveDiagnosis } from "@/lib/supabase/db";

interface UserStore {
  profile: UserProfile | null;
  _hasHydrated: boolean;
  recentCheckinQuestionIds: string[];
  lastCheckinDate: string | null; // "YYYY-MM-DD" 形式
  setProfile: (profile: UserProfile) => void;
  setProfileFromGoogle: (googleUser: { id: string; name: string; email: string; avatar?: string }) => void;
  updateDiagnosis: (result: DiagnosisResult) => void;
  incrementCheckin: () => void;
  addCheckinQuestionIds: (ids: string[]) => void;
  clearProfile: () => void;
  setHasHydrated: (v: boolean) => void;
  hasCheckedInToday: () => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      _hasHydrated: false,
      recentCheckinQuestionIds: [],
      lastCheckinDate: null,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setProfile: (profile) => {
        set({ profile });
        // Supabase同期（失敗してもLocalStorageは生きている）
        upsertUser(profile).catch(console.error);
      },

      setProfileFromGoogle: (googleUser) => {
        const profile: UserProfile = {
          id: googleUser.id,
          nickname: googleUser.name,
          character: undefined,
          diagnosisHistory: [],
          continuousDays: 0,
          totalCheckins: 0,
          agreedDisclaimer: true, // Googleログイン時点で同意
          createdAt: new Date().toISOString(),
        };
        set({ profile });
        upsertUser(profile).catch(console.error);
      },

      updateDiagnosis: (result) => {
        const { profile } = get();
        if (!profile) return;

        const level = calcCharacterLevel(profile.continuousDays);
        const charBase = CHARACTERS[result.primaryType];

        const updatedProfile: UserProfile = {
          ...profile,
          character: {
            ...charBase,
            level,
            levelName: LEVEL_NAMES[level],
          },
          diagnosisHistory: [result, ...profile.diagnosisHistory].slice(0, 30),
        };

        set({ profile: updatedProfile });
        // Supabase同期: upsertUser完了後にsaveDiagnosis（外部キー制約のため順序が必要）
        upsertUser(updatedProfile)
          .then(() => saveDiagnosis(updatedProfile.id, result))
          .catch(console.error);
      },

      hasCheckedInToday: () => {
        const { lastCheckinDate } = get();
        if (!lastCheckinDate) return false;
        const today = toJSTDateString(new Date());
        return lastCheckinDate === today;
      },

      incrementCheckin: () => {
        const { profile, lastCheckinDate } = get();
        if (!profile) return;

        const today = toJSTDateString(new Date());
        const yesterday = toJSTDateString(new Date(Date.now() - 86400000));

        let newDays: number;
        if (lastCheckinDate === today) {
          newDays = profile.continuousDays; // 同日は増やさない
        } else if (lastCheckinDate === yesterday) {
          newDays = profile.continuousDays + 1; // 昨日もやった→継続
        } else {
          newDays = 1; // 1日以上空いた→リセット
        }
        const newTotal = profile.totalCheckins + 1;
        const level = calcCharacterLevel(newDays);

        const updatedProfile: UserProfile = {
          ...profile,
          continuousDays: newDays,
          totalCheckins: newTotal,
          character: profile.character
            ? { ...profile.character, level, levelName: LEVEL_NAMES[level] }
            : profile.character,
        };

        set({ profile: updatedProfile, lastCheckinDate: today });
        // Supabase同期（fire-and-forget）
        upsertUser(updatedProfile).catch(console.error);
      },

      addCheckinQuestionIds: (ids) => {
        const { recentCheckinQuestionIds } = get();
        // 最新60件（約3日分）を保持
        const updated = [...ids, ...recentCheckinQuestionIds].slice(0, 60);
        set({ recentCheckinQuestionIds: updated });
      },

      clearProfile: () => set({ profile: null, recentCheckinQuestionIds: [], lastCheckinDate: null }),
    }),
    {
      name: "teateyakkyoku-user",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
