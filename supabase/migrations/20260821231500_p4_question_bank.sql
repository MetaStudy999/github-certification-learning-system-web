-- P4 Question Bank attempt history

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  set_slug text not null,
  question_id text not null,
  selected_answer text not null check (selected_answer ~ '^[A-H]$'),
  correct_answer text not null check (correct_answer ~ '^[A-H]$'),
  is_correct boolean not null,
  attempted_at timestamptz not null default now()
);

create index question_attempts_user_course_idx
  on public.question_attempts(user_id, course_slug, attempted_at desc);
create index question_attempts_user_question_idx
  on public.question_attempts(user_id, course_slug, question_id, attempted_at desc);

alter table public.question_attempts enable row level security;

create policy question_attempts_select_own
on public.question_attempts for select to authenticated
using (auth.uid() = user_id);

-- Browser clients may only read their own attempts. They cannot forge scores.
revoke all on public.question_attempts from anon, authenticated;
grant select on public.question_attempts to authenticated;

-- Server-side grading writes through a Supabase secret/service-role credential.
grant select, insert on public.question_attempts to service_role;

comment on table public.question_attempts is
  'P4 attempt history. Writes are performed only by the server after source-backed answer evaluation.';
