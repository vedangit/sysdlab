create extension if not exists pgcrypto;

create table if not exists public.lesson_feedback_interest (
  id uuid primary key default gen_random_uuid(),
  lesson_href text,
  lesson_title text,
  source text not null default 'lesson_completion',
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.lesson_feedback_interest enable row level security;

create policy "Anyone can submit interest"
  on public.lesson_feedback_interest
  for insert
  with check (email <> '');
