-- ============================================
-- てあて薬局 初期スキーマ
-- Supabase SQL Editorで実行してください
-- ============================================

-- ユーザープロフィール
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  fatigue_type text check (fatigue_type in ('brain','blood','nerve','organ','energy')),
  character_name text,
  character_level int default 1 check (character_level between 1 and 3),
  continuous_days int default 0,
  total_checkins int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 診断履歴
create table public.diagnoses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  primary_type text not null,
  secondary_type text not null,
  scores jsonb not null, -- {brain: 12, blood: 8, ...}
  created_at timestamptz default now()
);

-- 商品
create table public.products (
  id text primary key, -- kampo-001 など
  name text not null,
  category text check (category in ('kampo','supplement','herbal_tea')),
  target_fatigue_types text[] not null,
  target_symptoms text[],
  description text,
  mechanism text,
  price int not null,
  trial_price int,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 注文
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete set null,
  items jsonb not null, -- [{product_id, quantity, price}]
  total_amount int not null,
  status text default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled')),
  is_subscription boolean default false,
  stripe_payment_intent_id text,
  shipping_address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- チャット履歴
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  role text check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security（RLS）
-- ============================================

alter table public.profiles enable row level security;
alter table public.diagnoses enable row level security;
alter table public.orders enable row level security;
alter table public.chat_messages enable row level security;

-- profiles: 自分のレコードのみ読み書き可
create policy "profiles: self only" on public.profiles
  for all using (auth.uid() = id);

-- diagnoses: 自分のレコードのみ
create policy "diagnoses: self only" on public.diagnoses
  for all using (auth.uid() = user_id);

-- products: 全員が読める、書き込みは不可（管理者のみ）
alter table public.products enable row level security;
create policy "products: read for all" on public.products
  for select using (true);

-- orders: 自分のレコードのみ
create policy "orders: self only" on public.orders
  for all using (auth.uid() = user_id);

-- chat_messages: 自分のレコードのみ
create policy "chat_messages: self only" on public.chat_messages
  for all using (auth.uid() = user_id);

-- ============================================
-- 新規ユーザー作成時に自動でprofileを作成
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
