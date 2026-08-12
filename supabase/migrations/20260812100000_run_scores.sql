-- Run scores for Undead Arcade death screen saves.
-- Apply in Supabase Dashboard → SQL Editor, or via Supabase CLI.

create table if not exists public.run_scores (
  id bigint generated always as identity primary key,
  player_name text not null default 'Anonymous',
  survival_ms integer not null check (survival_ms >= 0),
  levels_completed integer not null default 0 check (levels_completed >= 0),
  level_reached integer not null default 1 check (level_reached >= 1),
  kills integer not null default 0 check (kills >= 0),
  coins integer not null default 0 check (coins >= 0),
  created_at timestamptz not null default now()
);

create index if not exists run_scores_survival_ms_idx
  on public.run_scores (survival_ms desc);

alter table public.run_scores enable row level security;

create policy "Anyone can insert run scores"
  on public.run_scores
  for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can read run scores"
  on public.run_scores
  for select
  to anon, authenticated
  using (true);
