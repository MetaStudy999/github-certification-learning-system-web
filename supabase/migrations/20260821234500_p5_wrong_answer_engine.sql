-- P5 Wrong Answer Engine

create table public.wrong_answer_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  set_slug text not null,
  question_id text not null,
  first_attempt_id uuid references public.question_attempts(id) on delete set null,
  latest_attempt_id uuid references public.question_attempts(id) on delete set null,
  last_selected_answer text not null check (last_selected_answer ~ '^[A-H]$'),
  correct_answer text not null check (correct_answer ~ '^[A-H]$'),
  error_code text check (error_code in ('CONCEPT', 'COMPARE', 'READING', 'MEMORY', 'PRACTICE', 'SCOPE')),
  reflection text,
  priority text not null default 'MEDIUM' check (priority in ('HIGH', 'MEDIUM', 'LOW')),
  status text not null default 'OPEN' check (status in ('OPEN', 'CLOSED')),
  retry_stage text not null default 'DAY_1' check (retry_stage in ('DAY_1', 'DAY_7', 'CLOSED')),
  wrong_count integer not null default 1 check (wrong_count >= 1),
  correct_retry_count integer not null default 0 check (correct_retry_count >= 0),
  first_wrong_at timestamptz not null default now(),
  last_wrong_at timestamptz not null default now(),
  next_retry_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_slug, set_slug, question_id)
);

create table public.wrong_answer_retries (
  id uuid primary key default gen_random_uuid(),
  wrong_answer_id uuid not null references public.wrong_answer_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null references public.question_attempts(id) on delete cascade,
  retry_stage text not null check (retry_stage in ('DAY_1', 'DAY_7')),
  is_correct boolean not null,
  reviewed_at timestamptz not null default now(),
  unique (attempt_id)
);

create index wrong_answer_items_user_queue_idx
  on public.wrong_answer_items(user_id, status, priority, next_retry_at);
create index wrong_answer_retries_user_reviewed_idx
  on public.wrong_answer_retries(user_id, reviewed_at desc);

create trigger wrong_answer_items_touch_updated_at
before update on public.wrong_answer_items
for each row execute function public.touch_updated_at();

alter table public.wrong_answer_items enable row level security;
alter table public.wrong_answer_retries enable row level security;

create policy wrong_answer_items_select_own
on public.wrong_answer_items for select to authenticated
using (auth.uid() = user_id);

create policy wrong_answer_retries_select_own
on public.wrong_answer_retries for select to authenticated
using (auth.uid() = user_id);

revoke all on public.wrong_answer_items from anon, authenticated;
revoke all on public.wrong_answer_retries from anon, authenticated;
grant select on public.wrong_answer_items to authenticated;
grant select on public.wrong_answer_retries to authenticated;
grant select, insert, update, delete on public.wrong_answer_items to service_role;
grant select, insert, update, delete on public.wrong_answer_retries to service_role;

create or replace function public.record_wrong_answer(
  p_user_id uuid,
  p_attempt_id uuid,
  p_course_slug text,
  p_set_slug text,
  p_question_id text,
  p_selected_answer text,
  p_correct_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.wrong_answer_items%rowtype;
begin
  insert into public.wrong_answer_items(
    user_id,
    course_slug,
    set_slug,
    question_id,
    first_attempt_id,
    latest_attempt_id,
    last_selected_answer,
    correct_answer,
    priority,
    status,
    retry_stage,
    wrong_count,
    correct_retry_count,
    first_wrong_at,
    last_wrong_at,
    next_retry_at
  ) values (
    p_user_id,
    p_course_slug,
    p_set_slug,
    p_question_id,
    p_attempt_id,
    p_attempt_id,
    p_selected_answer,
    p_correct_answer,
    'MEDIUM',
    'OPEN',
    'DAY_1',
    1,
    0,
    now(),
    now(),
    now() + interval '1 day'
  )
  on conflict (user_id, course_slug, set_slug, question_id) do update
  set latest_attempt_id = excluded.latest_attempt_id,
      last_selected_answer = excluded.last_selected_answer,
      correct_answer = excluded.correct_answer,
      priority = case when public.wrong_answer_items.wrong_count + 1 >= 2 then 'HIGH' else public.wrong_answer_items.priority end,
      status = 'OPEN',
      retry_stage = 'DAY_1',
      wrong_count = public.wrong_answer_items.wrong_count + 1,
      correct_retry_count = 0,
      last_wrong_at = now(),
      next_retry_at = now() + interval '1 day',
      closed_at = null
  returning * into v_item;

  return jsonb_build_object(
    'id', v_item.id,
    'courseSlug', v_item.course_slug,
    'setSlug', v_item.set_slug,
    'questionId', v_item.question_id,
    'errorCode', v_item.error_code,
    'priority', v_item.priority,
    'status', v_item.status,
    'retryStage', v_item.retry_stage,
    'wrongCount', v_item.wrong_count,
    'correctRetryCount', v_item.correct_retry_count,
    'nextRetryAt', v_item.next_retry_at
  );
end;
$$;

create or replace function public.record_wrong_answer_retry(
  p_user_id uuid,
  p_wrong_answer_id uuid,
  p_attempt_id uuid,
  p_is_correct boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.wrong_answer_items%rowtype;
  v_stage text;
  v_selected text;
  v_correct text;
begin
  select * into v_item
  from public.wrong_answer_items
  where id = p_wrong_answer_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'wrong answer item not found';
  end if;

  if v_item.status <> 'OPEN' or v_item.retry_stage = 'CLOSED' then
    raise exception 'wrong answer item is already closed';
  end if;

  select selected_answer, correct_answer into v_selected, v_correct
  from public.question_attempts
  where id = p_attempt_id and user_id = p_user_id;

  if not found then
    raise exception 'retry attempt not found';
  end if;

  v_stage := v_item.retry_stage;

  insert into public.wrong_answer_retries(
    wrong_answer_id, user_id, attempt_id, retry_stage, is_correct
  ) values (
    v_item.id, p_user_id, p_attempt_id, v_stage, p_is_correct
  );

  if p_is_correct then
    if v_stage = 'DAY_1' then
      update public.wrong_answer_items
      set latest_attempt_id = p_attempt_id,
          last_selected_answer = v_selected,
          correct_answer = v_correct,
          retry_stage = 'DAY_7',
          correct_retry_count = correct_retry_count + 1,
          next_retry_at = greatest(first_wrong_at + interval '7 days', now())
      where id = v_item.id;
    elsif v_stage = 'DAY_7' then
      update public.wrong_answer_items
      set latest_attempt_id = p_attempt_id,
          last_selected_answer = v_selected,
          correct_answer = v_correct,
          status = 'CLOSED',
          retry_stage = 'CLOSED',
          correct_retry_count = correct_retry_count + 1,
          next_retry_at = null,
          closed_at = now()
      where id = v_item.id;
    end if;
  else
    update public.wrong_answer_items
    set latest_attempt_id = p_attempt_id,
        last_selected_answer = v_selected,
        correct_answer = v_correct,
        priority = 'HIGH',
        status = 'OPEN',
        retry_stage = 'DAY_1',
        wrong_count = wrong_count + 1,
        correct_retry_count = 0,
        last_wrong_at = now(),
        next_retry_at = now() + interval '1 day',
        closed_at = null
    where id = v_item.id;
  end if;

  select * into v_item
  from public.wrong_answer_items
  where id = p_wrong_answer_id;

  return jsonb_build_object(
    'id', v_item.id,
    'courseSlug', v_item.course_slug,
    'setSlug', v_item.set_slug,
    'questionId', v_item.question_id,
    'errorCode', v_item.error_code,
    'priority', v_item.priority,
    'status', v_item.status,
    'retryStage', v_item.retry_stage,
    'wrongCount', v_item.wrong_count,
    'correctRetryCount', v_item.correct_retry_count,
    'nextRetryAt', v_item.next_retry_at
  );
end;
$$;

revoke all on function public.record_wrong_answer(uuid, uuid, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.record_wrong_answer_retry(uuid, uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.record_wrong_answer(uuid, uuid, text, text, text, text, text) to service_role;
grant execute on function public.record_wrong_answer_retry(uuid, uuid, uuid, boolean) to service_role;

comment on table public.wrong_answer_items is
  'P5 learner wrong-answer queue with DAY_1 and DAY_7 spaced retry stages.';
comment on table public.wrong_answer_retries is
  'P5 audit trail for retry-stage attempts.';
