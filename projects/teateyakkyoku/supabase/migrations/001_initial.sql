-- users テーブル
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id text UNIQUE NOT NULL, -- デバイスのZustand ID
  nickname text,
  fatigue_type text CHECK (fatigue_type IN ('brain','blood','nerve','organ','energy')),
  character_level integer DEFAULT 1,
  continuous_days integer DEFAULT 0,
  total_checkins integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- checkins テーブル
CREATE TABLE IF NOT EXISTS public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  question_ids text[] NOT NULL,
  answers jsonb NOT NULL,
  scores jsonb NOT NULL,
  overall_percent integer NOT NULL,
  feedback text,
  time_slot text CHECK (time_slot IN ('morning','afternoon','evening')),
  created_at timestamptz DEFAULT now()
);

-- diagnoses テーブル
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  primary_type text NOT NULL,
  secondary_type text,
  scores jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- anon_idベースのポリシー（認証なしアクセス用）
CREATE POLICY "users_anon_access" ON public.users
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "checkins_anon_access" ON public.checkins
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "diagnoses_anon_access" ON public.diagnoses
  FOR ALL USING (true) WITH CHECK (true);
