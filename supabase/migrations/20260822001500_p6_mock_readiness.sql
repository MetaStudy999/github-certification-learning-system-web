-- P6 Mock / Readiness

alter table public.question_attempts
  add column if not exists source_kind text not null default 'QUESTION_BANK'
  check (source_kind in ('QUESTION_BANK', 'MOCK'));

alter table public.wrong_answer_items
  add column if not exists source_kind text not null default 'QUESTION_BANK'
  check (source_kind in ('QUESTION_BANK', 'MOCK'));

create table public.mock_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  mock_slug text not null,
  role text not null check (role in ('DIAGNOSTIC', 'GATE', 'FINAL')),
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'SUBMITTED')),
  recommended_seconds integer not null check (recommended_seconds > 0),
  target_percent integer not null check (target_percent between 1 and 100),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  elapsed_seconds integer check (elapsed_seconds is null or elapsed_seconds >= 0),
  total_questions integer not null default 40 check (total_questions > 0),
  correct_answers integer check (correct_answers is null or correct_answers >= 0),
  score_percent numeric(5,2) check (score_percent is null or score_percent between 0 and 100),
  judgment text check (judgment is null or judgment in ('EXAM-READY', 'READY', 'REVIEW', 'NOT READY'))
);

create table public.mock_exam_answers (
  id uuid primary key default gen_random_uuid(),
  mock_attempt_id uuid not null references public.mock_exam_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_attempt_id uuid not null references public.question_attempts(id) on delete cascade,
  question_id text not null,
  selected_answer text not null check (selected_answer ~ '^[A-H]$'),
  correct_answer text not null check (correct_answer ~ '^[A-H]$'),
  is_correct boolean not null,
  unique (mock_attempt_id, question_id)
);

create table public.readiness_profiles (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  study_guide_confirmed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug)
);

create index mock_exam_attempts_user_course_idx
  on public.mock_exam_attempts(user_id, course_slug, submitted_at desc);
create index mock_exam_answers_user_attempt_idx
  on public.mock_exam_answers(user_id, mock_attempt_id);

create trigger readiness_profiles_touch_updated_at
before update on public.readiness_profiles
for each row execute function public.touch_updated_at();

alter table public.mock_exam_attempts enable row level security;
alter table public.mock_exam_answers enable row level security;
alter table public.readiness_profiles enable row level security;

create policy mock_exam_attempts_select_own
on public.mock_exam_attempts for select to authenticated
using (auth.uid() = user_id);

create policy mock_exam_answers_select_own
on public.mock_exam_answers for select to authenticated
using (auth.uid() = user_id);

create policy readiness_profiles_select_own
on public.readiness_profiles for select to authenticated
using (auth.uid() = user_id);

revoke all on public.mock_exam_attempts from anon, authenticated;
revoke all on public.mock_exam_answers from anon, authenticated;
revoke all on public.readiness_profiles from anon, authenticated;
grant select on public.mock_exam_attempts to authenticated;
grant select on public.mock_exam_answers to authenticated;
grant select on public.readiness_profiles to authenticated;
grant select, insert, update, delete on public.mock_exam_attempts to service_role;
grant select, insert, update, delete on public.mock_exam_answers to service_role;
grant select, insert, update, delete on public.readiness_profiles to service_role;

create or replace function public.record_mock_wrong_answer(
  p_user_id uuid,
  p_attempt_id uuid,
  p_course_slug text,
  p_mock_slug text,
  p_question_id text,
  p_selected_answer text,
  p_correct_answer text,
  p_priority text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.wrong_answer_items%rowtype;
  v_priority text := case when p_priority in ('HIGH', 'MEDIUM', 'LOW') then p_priority else 'MEDIUM' end;
begin
  insert into public.wrong_answer_items(
    user_id, course_slug, set_slug, question_id,
    first_attempt_id, latest_attempt_id,
    last_selected_answer, correct_answer,
    priority, status, retry_stage,
    wrong_count, correct_retry_count,
    first_wrong_at, last_wrong_at, next_retry_at,
    source_kind
  ) values (
    p_user_id, p_course_slug, p_mock_slug, p_question_id,
    p_attempt_id, p_attempt_id,
    p_selected_answer, p_correct_answer,
    v_priority, 'OPEN', 'DAY_1',
    1, 0,
    now(), now(), now() + interval '1 day',
    'MOCK'
  )
  on conflict (user_id, course_slug, set_slug, question_id) do update
  set latest_attempt_id = excluded.latest_attempt_id,
      last_selected_answer = excluded.last_selected_answer,
      correct_answer = excluded.correct_answer,
      priority = case
        when public.wrong_answer_items.wrong_count + 1 >= 2 then 'HIGH'
        when v_priority = 'HIGH' then 'HIGH'
        else public.wrong_answer_items.priority
      end,
      status = 'OPEN',
      retry_stage = 'DAY_1',
      wrong_count = public.wrong_answer_items.wrong_count + 1,
      correct_retry_count = 0,
      last_wrong_at = now(),
      next_retry_at = now() + interval '1 day',
      closed_at = null,
      source_kind = 'MOCK'
  returning * into v_item;

  return jsonb_build_object(
    'id', v_item.id,
    'courseSlug', v_item.course_slug,
    'setSlug', v_item.set_slug,
    'questionId', v_item.question_id,
    'priority', v_item.priority,
    'status', v_item.status,
    'retryStage', v_item.retry_stage,
    'wrongCount', v_item.wrong_count,
    'correctRetryCount', v_item.correct_retry_count,
    'nextRetryAt', v_item.next_retry_at,
    'sourceKind', v_item.source_kind
  );
end;
$$;

revoke all on function public.record_mock_wrong_answer(uuid, uuid, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.record_mock_wrong_answer(uuid, uuid, text, text, text, text, text, text) to service_role;

comment on table public.mock_exam_attempts is 'P6 GH-900 mock exam sessions and aggregate scores.';
comment on table public.mock_exam_answers is 'P6 per-question mock answer audit rows.';
comment on table public.readiness_profiles is 'P6 manual readiness acknowledgements such as latest official Study Guide confirmation.';
