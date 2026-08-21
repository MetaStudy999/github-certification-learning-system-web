-- P7 AI Gateway / Tutor

create table public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  set_slug text not null,
  question_id text not null,
  stage text not null check (stage in ('HINT', 'CONCEPT', 'SIMILAR_EXAMPLE', 'EXPLANATION')),
  ai_mode text not null check (ai_mode in ('mock', 'local', 'api', 'hybrid')),
  provider text not null,
  model text,
  fallback boolean not null default false,
  request_chars integer not null check (request_chars >= 0),
  response_text text not null,
  latency_ms integer not null check (latency_ms >= 0),
  created_at timestamptz not null default now()
);

create index ai_interactions_user_course_idx
  on public.ai_interactions(user_id, course_slug, created_at desc);
create index ai_interactions_user_question_idx
  on public.ai_interactions(user_id, course_slug, set_slug, question_id, created_at desc);

alter table public.ai_interactions enable row level security;

create policy ai_interactions_select_own
on public.ai_interactions for select to authenticated
using (auth.uid() = user_id);

-- Browser clients can read only their own tutor history. AI writes are server-only.
revoke all on public.ai_interactions from anon, authenticated;
grant select on public.ai_interactions to authenticated;
grant select, insert, update, delete on public.ai_interactions to service_role;

comment on table public.ai_interactions is
  'P7 AI Tutor interaction audit. AI assists learning only; it never decides question correctness.';
