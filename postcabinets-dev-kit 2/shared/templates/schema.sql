-- ============================================================
-- POSTCABINETS Schema Template
-- Run via: supabase db push (or apply through Supabase MCP)
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ── Users (synced from Clerk via webhook) ──────────────────
create table if not exists public.users (
    id              uuid primary key default uuid_generate_v4(),
    clerk_id        text unique not null,
    email           text not null,
    display_name    text,
    avatar_url      text,
    plan            text default 'free' check (plan in ('free', 'pro', 'enterprise')),
    stripe_customer_id text,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can read own data"
    on public.users for select
    using (clerk_id = auth.jwt()->>'sub');

create policy "Users can update own data"
    on public.users for update
    using (clerk_id = auth.jwt()->>'sub');

-- ── Organizations (multi-tenant) ──────────────────────────
create table if not exists public.organizations (
    id              uuid primary key default uuid_generate_v4(),
    name            text not null,
    slug            text unique not null,
    owner_id        uuid references public.users(id) on delete cascade,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

alter table public.organizations enable row level security;

-- ── Organization Members ──────────────────────────────────
create table if not exists public.org_members (
    id              uuid primary key default uuid_generate_v4(),
    org_id          uuid references public.organizations(id) on delete cascade,
    user_id         uuid references public.users(id) on delete cascade,
    role            text default 'member' check (role in ('owner', 'admin', 'member')),
    created_at      timestamptz default now(),
    unique(org_id, user_id)
);

alter table public.org_members enable row level security;

create policy "Members can read own org"
    on public.org_members for select
    using (
        user_id in (
            select id from public.users where clerk_id = auth.jwt()->>'sub'
        )
    );

-- ── Subscriptions (synced from Stripe via webhook) ────────
create table if not exists public.subscriptions (
    id                  uuid primary key default uuid_generate_v4(),
    user_id             uuid references public.users(id) on delete cascade,
    stripe_subscription_id text unique,
    stripe_price_id     text,
    status              text default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start timestamptz,
    current_period_end   timestamptz,
    created_at          timestamptz default now(),
    updated_at          timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscriptions"
    on public.subscriptions for select
    using (
        user_id in (
            select id from public.users where clerk_id = auth.jwt()->>'sub'
        )
    );

-- ── Updated At Trigger ────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger users_updated_at
    before update on public.users
    for each row execute function public.update_updated_at();

create trigger organizations_updated_at
    before update on public.organizations
    for each row execute function public.update_updated_at();

create trigger subscriptions_updated_at
    before update on public.subscriptions
    for each row execute function public.update_updated_at();

-- ============================================================
-- Add your app-specific tables below
-- ============================================================

-- Example:
-- create table if not exists public.projects (
--     id          uuid primary key default uuid_generate_v4(),
--     org_id      uuid references public.organizations(id) on delete cascade,
--     name        text not null,
--     description text,
--     status      text default 'active',
--     created_at  timestamptz default now(),
--     updated_at  timestamptz default now()
-- );
-- alter table public.projects enable row level security;
