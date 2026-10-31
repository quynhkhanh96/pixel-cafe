-- Khanh's Pixel Café leaderboard
-- Paste this whole file into Supabase → SQL Editor → New query, then press Run.

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  game text not null check (game in ('tiramisu-factory')),
  name text not null check (char_length(name) between 1 and 16),
  score integer not null check (score between 0 and 200000),
  served integer not null default 0 check (served between 0 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists scores_game_score_idx on public.scores (game, score desc);

-- Anyone can read scores and add a new one. Nobody can edit or delete through the website.
alter table public.scores enable row level security;

drop policy if exists "read scores" on public.scores;
create policy "read scores" on public.scores
  for select to anon using (true);

drop policy if exists "add scores" on public.scores;
create policy "add scores" on public.scores
  for insert to anon with check (true);

-- When you add a new game later, allow its name here, for example:
-- alter table public.scores drop constraint scores_game_check;
-- alter table public.scores add constraint scores_game_check
--   check (game in ('tiramisu-factory', 'khanhs-bakery'));
