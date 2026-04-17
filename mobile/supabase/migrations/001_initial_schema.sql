-- ============================================================
-- Call It — Initial Schema (Phase 1)
-- Run this in the Supabase SQL editor or via `supabase db push`
-- ============================================================

-- Users (extends Supabase auth.users)
create table public.users (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null,
  display_name      text not null,
  ghin_number       text,
  handicap_index    numeric(4,1),
  home_course_id    text,
  created_at        timestamptz default now() not null
);

-- Courses (cached from course API)
create table public.courses (
  id         text primary key,
  name       text not null,
  location   text not null,
  country    text not null default 'US',
  tee_boxes  jsonb not null default '[]',
  holes      jsonb not null default '[]',
  source_id  text,
  updated_at timestamptz default now()
);

-- Rounds
create table public.rounds (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  course_id       text not null references public.courses(id),
  tee_box         text not null,
  date            date not null,
  status          text not null default 'active' check (status in ('active','complete','abandoned')),
  total_score     integer,
  differential    numeric(4,1),
  posted_to_ghin  boolean not null default false,
  created_at      timestamptz default now() not null
);

-- Hole scores
create table public.hole_scores (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references public.rounds(id) on delete cascade,
  hole_number integer not null check (hole_number between 1 and 18),
  par         integer not null,
  strokes     integer,
  putts       integer,
  fairway_hit boolean,
  gir         boolean,
  penalties   integer not null default 0,
  sand_save   boolean,
  score_name  text,
  unique (round_id, hole_number)
);

-- Handicap history
create table public.handicap_history (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  round_id             uuid references public.rounds(id),
  differential         numeric(4,1) not null,
  handicap_index_after numeric(4,1),
  calculated_at        timestamptz default now() not null
);

-- ── Row-Level Security ────────────────────────────────────────────────────────

alter table public.users           enable row level security;
alter table public.rounds          enable row level security;
alter table public.hole_scores     enable row level security;
alter table public.handicap_history enable row level security;

-- users: own row only
create policy "users_own" on public.users
  for all using (auth.uid() = id);

-- rounds: own rounds only
create policy "rounds_own" on public.rounds
  for all using (auth.uid() = user_id);

-- hole_scores: via round ownership
create policy "hole_scores_own" on public.hole_scores
  for all using (
    exists (select 1 from public.rounds r where r.id = round_id and r.user_id = auth.uid())
  );

-- handicap_history: own records
create policy "handicap_own" on public.handicap_history
  for all using (auth.uid() = user_id);

-- courses: readable by all authenticated users
create policy "courses_read" on public.courses
  for select using (auth.role() = 'authenticated');

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index rounds_user_date    on public.rounds (user_id, date desc);
create index hole_scores_round   on public.hole_scores (round_id, hole_number);
create index hcp_history_user    on public.handicap_history (user_id, calculated_at desc);
