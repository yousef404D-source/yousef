-- ============================================================
-- Nova AI — Database schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.
-- ============================================================

-- ---------- Conversations (chat sessions) ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_idx on public.conversations(user_id);

alter table public.conversations enable row level security;

drop policy if exists "conversations_select_own" on public.conversations;
create policy "conversations_select_own" on public.conversations
  for select using (auth.uid() = user_id);

drop policy if exists "conversations_insert_own" on public.conversations;
create policy "conversations_insert_own" on public.conversations
  for insert with check (auth.uid() = user_id);

drop policy if exists "conversations_update_own" on public.conversations;
create policy "conversations_update_own" on public.conversations
  for update using (auth.uid() = user_id);

drop policy if exists "conversations_delete_own" on public.conversations;
create policy "conversations_delete_own" on public.conversations
  for delete using (auth.uid() = user_id);

-- ---------- Messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('user', 'assistant')),
  text text not null default '',
  code_block text,
  preview_url text,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_user_id_idx on public.messages(user_id);

alter table public.messages enable row level security;

drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own" on public.messages
  for select using (auth.uid() = user_id);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = user_id);

-- ---------- Deployments ----------
create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  prompt text not null,
  deploy_url text,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists deployments_user_id_idx on public.deployments(user_id);

alter table public.deployments enable row level security;

drop policy if exists "deployments_select_own" on public.deployments;
create policy "deployments_select_own" on public.deployments
  for select using (auth.uid() = user_id);

drop policy if exists "deployments_insert_own" on public.deployments;
create policy "deployments_insert_own" on public.deployments
  for insert with check (auth.uid() = user_id);

-- ---------- Request logs (rate limiting only — no client read access) ----------
-- Replaces the old unauthenticated GET /api/log endpoint entirely, which
-- publicly leaked every visitor's email/IP/prompt to anyone who called it.
-- Nobody can read this table from the client — it's written by the
-- authenticated user themself and only used server-side for rate-limit
-- counting.
create table if not exists public.request_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null,
  created_at timestamptz not null default now()
);

create index if not exists request_logs_user_id_created_idx
  on public.request_logs(user_id, created_at desc);

alter table public.request_logs enable row level security;

-- Users may insert their own log rows (used by the rate limiter) but
-- can never select/read the table — there is intentionally no SELECT
-- policy, so PostgREST denies all reads from anon/authenticated roles.
drop policy if exists "request_logs_insert_own" on public.request_logs;
create policy "request_logs_insert_own" on public.request_logs
  for insert with check (auth.uid() = user_id);

-- Housekeeping: auto-update conversations.updated_at when a message is added
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();
