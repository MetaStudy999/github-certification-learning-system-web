-- P3 User / Progress baseline

create extension if not exists pgcrypto;

create table public.learner_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  total_modules integer not null default 0 check (total_modules >= 0),
  completed_modules integer not null default 0 check (completed_modules >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug),
  check (completed_modules <= total_modules or total_modules = 0)
);

create table public.module_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  module_slug text not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  first_opened_at timestamptz,
  last_opened_at timestamptz,
  completed_at timestamptz,
  view_count integer not null default 0 check (view_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug, module_slug)
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  module_slug text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create index module_progress_user_course_idx on public.module_progress(user_id, course_slug);
create index study_sessions_user_started_idx on public.study_sessions(user_id, started_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger learner_profiles_touch_updated_at
before update on public.learner_profiles
for each row execute function public.touch_updated_at();

create trigger course_progress_touch_updated_at
before update on public.course_progress
for each row execute function public.touch_updated_at();

create trigger module_progress_touch_updated_at
before update on public.module_progress
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_learner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.learner_profiles(id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Learner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_learner();

alter table public.learner_profiles enable row level security;
alter table public.course_progress enable row level security;
alter table public.module_progress enable row level security;
alter table public.study_sessions enable row level security;

create policy learner_profiles_own_rows
on public.learner_profiles for all to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy course_progress_own_rows
on public.course_progress for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy module_progress_own_rows
on public.module_progress for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy study_sessions_own_rows
on public.study_sessions for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.learner_profiles to authenticated;
grant select, insert, update, delete on public.course_progress to authenticated;
grant select, insert, update, delete on public.module_progress to authenticated;
grant select, insert, update, delete on public.study_sessions to authenticated;

create or replace function public.record_module_visit(
  p_course_slug text,
  p_module_slug text,
  p_total_modules integer
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_completed integer;
  v_total integer := greatest(coalesce(p_total_modules, 0), 1);
  v_status text;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  insert into public.module_progress(
    user_id, course_slug, module_slug, status, first_opened_at, last_opened_at, view_count
  ) values (
    v_user_id, p_course_slug, p_module_slug, 'in_progress', now(), now(), 1
  )
  on conflict (user_id, course_slug, module_slug) do update
  set last_opened_at = now(),
      view_count = public.module_progress.view_count + 1,
      status = case when public.module_progress.status = 'completed' then 'completed' else 'in_progress' end;

  select count(*)::integer into v_completed
  from public.module_progress
  where user_id = v_user_id and course_slug = p_course_slug and status = 'completed';

  v_status := case when v_completed >= v_total then 'completed' else 'in_progress' end;

  insert into public.course_progress(
    user_id, course_slug, status, total_modules, completed_modules, started_at, completed_at
  ) values (
    v_user_id, p_course_slug, v_status, v_total, v_completed, now(),
    case when v_status = 'completed' then now() else null end
  )
  on conflict (user_id, course_slug) do update
  set status = excluded.status,
      total_modules = excluded.total_modules,
      completed_modules = excluded.completed_modules,
      started_at = coalesce(public.course_progress.started_at, excluded.started_at),
      completed_at = case when excluded.status = 'completed' then coalesce(public.course_progress.completed_at, now()) else null end;

  return jsonb_build_object(
    'course_slug', p_course_slug,
    'module_slug', p_module_slug,
    'completed_modules', v_completed,
    'total_modules', v_total,
    'status', v_status
  );
end;
$$;

create or replace function public.set_module_completion(
  p_course_slug text,
  p_module_slug text,
  p_completed boolean,
  p_total_modules integer
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_completed integer;
  v_total integer := greatest(coalesce(p_total_modules, 0), 1);
  v_status text;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  insert into public.module_progress(
    user_id, course_slug, module_slug, status, first_opened_at, last_opened_at, completed_at, view_count
  ) values (
    v_user_id,
    p_course_slug,
    p_module_slug,
    case when p_completed then 'completed' else 'in_progress' end,
    now(),
    now(),
    case when p_completed then now() else null end,
    1
  )
  on conflict (user_id, course_slug, module_slug) do update
  set status = case when p_completed then 'completed' else 'in_progress' end,
      last_opened_at = now(),
      completed_at = case when p_completed then coalesce(public.module_progress.completed_at, now()) else null end;

  select count(*)::integer into v_completed
  from public.module_progress
  where user_id = v_user_id and course_slug = p_course_slug and status = 'completed';

  v_status := case when v_completed >= v_total then 'completed' else 'in_progress' end;

  insert into public.course_progress(
    user_id, course_slug, status, total_modules, completed_modules, started_at, completed_at
  ) values (
    v_user_id, p_course_slug, v_status, v_total, v_completed, now(),
    case when v_status = 'completed' then now() else null end
  )
  on conflict (user_id, course_slug) do update
  set status = excluded.status,
      total_modules = excluded.total_modules,
      completed_modules = excluded.completed_modules,
      started_at = coalesce(public.course_progress.started_at, excluded.started_at),
      completed_at = case when excluded.status = 'completed' then coalesce(public.course_progress.completed_at, now()) else null end;

  return jsonb_build_object(
    'course_slug', p_course_slug,
    'module_slug', p_module_slug,
    'completed', p_completed,
    'completed_modules', v_completed,
    'total_modules', v_total,
    'status', v_status
  );
end;
$$;

create or replace function public.start_study_session(
  p_course_slug text,
  p_module_slug text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  insert into public.study_sessions(user_id, course_slug, module_slug)
  values (v_user_id, p_course_slug, p_module_slug)
  returning id into v_session_id;

  return v_session_id;
end;
$$;

create or replace function public.finish_study_session(p_session_id uuid)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_duration integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  update public.study_sessions
  set ended_at = now(),
      duration_seconds = greatest(extract(epoch from (now() - started_at))::integer, 0)
  where id = p_session_id and user_id = v_user_id and ended_at is null
  returning duration_seconds into v_duration;

  if v_duration is null then
    raise exception 'active study session not found';
  end if;

  return v_duration;
end;
$$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_learner() from public, anon, authenticated;
revoke all on function public.record_module_visit(text, text, integer) from public, anon;
revoke all on function public.set_module_completion(text, text, boolean, integer) from public, anon;
revoke all on function public.start_study_session(text, text) from public, anon;
revoke all on function public.finish_study_session(uuid) from public, anon;

grant execute on function public.record_module_visit(text, text, integer) to authenticated;
grant execute on function public.set_module_completion(text, text, boolean, integer) to authenticated;
grant execute on function public.start_study_session(text, text) to authenticated;
grant execute on function public.finish_study_session(uuid) to authenticated;
