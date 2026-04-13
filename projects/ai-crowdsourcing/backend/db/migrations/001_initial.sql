-- pgvector拡張を有効化
create extension if not exists vector;

-- ユーザー共通テーブル
create table profiles (
  id uuid references auth.users primary key,
  role text not null check (role in ('client', 'worker')),
  display_name text not null,
  created_at timestamptz default now()
);

-- 企業プロフィール
create table client_profiles (
  id uuid references profiles(id) primary key,
  company_name text,
  brand_guidelines jsonb default '{}'
);

-- ワーカープロフィール
create table worker_profiles (
  id uuid references profiles(id) primary key,
  bio text,
  skills text[] default '{}',
  hourly_rate_min integer,
  hourly_rate_max integer,
  skill_vector vector(1536),
  skill_score numeric(4,2) default 0,
  available boolean default true
);

-- 案件
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) not null,
  title text not null,
  task_type text not null check (task_type in ('sns_post','document','data_entry','lp','other')),
  requirements jsonb not null default '{}',
  budget_min integer,
  budget_max integer,
  deadline timestamptz,
  status text not null default 'open'
    check (status in ('open','matched','in_progress','review','completed','cancelled')),
  assigned_worker_id uuid references profiles(id),
  requirement_vector vector(1536),
  created_at timestamptz default now()
);

-- マッチング候補
create table match_candidates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  worker_id uuid references profiles(id) not null,
  score numeric(5,4) not null,
  reason text,
  created_at timestamptz default now()
);

-- 納品物
create table deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  worker_id uuid references profiles(id) not null,
  file_urls text[] default '{}',
  message text,
  qa_score integer,
  qa_report jsonb,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- 取引・エスクロー
create table transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  stripe_payment_intent_id text unique,
  amount integer not null,
  platform_fee integer not null,
  status text not null default 'pending'
    check (status in ('pending','authorized','captured','refunded')),
  created_at timestamptz default now()
);

-- ベクトル検索インデックス
create index on worker_profiles using ivfflat (skill_vector vector_cosine_ops)
  with (lists = 100);
create index on projects using ivfflat (requirement_vector vector_cosine_ops)
  with (lists = 100);

-- RLS（Row Level Security）
alter table profiles enable row level security;
alter table projects enable row level security;
alter table deliverables enable row level security;

create policy "profiles: 自分のみ更新可" on profiles
  for all using (auth.uid() = id);

create policy "projects: clientは自分の案件のみ" on projects
  for all using (auth.uid() = client_id);

create policy "projects: workerは参照のみ（open案件）" on projects
  for select using (status = 'open' or assigned_worker_id = auth.uid());

-- match_workers RPC関数
create or replace function match_workers(
  query_vector vector(1536),
  match_count int default 3
)
returns table (
  worker_id uuid,
  display_name text,
  skills text[],
  skill_score numeric,
  score float
)
language sql stable
as $$
  select
    wp.id as worker_id,
    p.display_name,
    wp.skills,
    wp.skill_score,
    1 - (wp.skill_vector <=> query_vector) as score
  from worker_profiles wp
  join profiles p on p.id = wp.id
  where wp.available = true
    and wp.skill_vector is not null
  order by wp.skill_vector <=> query_vector
  limit match_count;
$$;
