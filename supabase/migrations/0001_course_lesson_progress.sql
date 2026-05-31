create table if not exists public.course_lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  lesson_id text not null,
  manual_completed boolean not null default false,
  completed boolean not null default false,
  lab_results jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_id)
);

alter table public.course_lesson_progress enable row level security;

create policy "Users can read their own progress"
  on public.course_lesson_progress
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.course_lesson_progress
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.course_lesson_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own progress"
  on public.course_lesson_progress
  for delete
  using (auth.uid() = user_id);
