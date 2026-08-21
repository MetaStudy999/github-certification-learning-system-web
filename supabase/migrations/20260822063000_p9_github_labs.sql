-- P9 Labs / GitHub API

create table public.github_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  github_login text not null,
  connection_kind text not null default 'fine_grained_pat'
    check (connection_kind in ('fine_grained_pat', 'github_app_user')),
  token_ciphertext text not null,
  token_iv text not null,
  token_tag text not null,
  token_fingerprint text not null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now()
);

create table public.lab_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lab_slug text not null,
  repository_full_name text not null,
  status text not null check (status in ('PASS', 'RETRY')),
  rule_version text not null,
  summary jsonb not null default '{}'::jsonb,
  verified_at timestamptz not null default now()
);

create table public.lab_verification_checks (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.lab_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  check_code text not null,
  object_type text not null,
  object_id text,
  status text not null check (status in ('PASS', 'FAIL')),
  message text not null,
  canonical_url text,
  metadata jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now()
);

create index lab_attempts_user_course_idx
  on public.lab_attempts(user_id, course_slug, verified_at desc);
create index lab_attempts_user_lab_idx
  on public.lab_attempts(user_id, course_slug, lab_slug, verified_at desc);
create index lab_verification_checks_attempt_idx
  on public.lab_verification_checks(attempt_id, checked_at);

alter table public.github_connections enable row level security;
alter table public.lab_attempts enable row level security;
alter table public.lab_verification_checks enable row level security;

-- GitHub credentials never become directly readable by browser roles.
revoke all on public.github_connections from anon, authenticated;
grant select, insert, update, delete on public.github_connections to service_role;

create policy lab_attempts_select_own
on public.lab_attempts for select to authenticated
using (auth.uid() = user_id);

create policy lab_verification_checks_select_own
on public.lab_verification_checks for select to authenticated
using (auth.uid() = user_id);

revoke all on public.lab_attempts from anon, authenticated;
grant select on public.lab_attempts to authenticated;
grant select, insert, update, delete on public.lab_attempts to service_role;

revoke all on public.lab_verification_checks from anon, authenticated;
grant select on public.lab_verification_checks to authenticated;
grant select, insert, update, delete on public.lab_verification_checks to service_role;

comment on table public.github_connections is
  'P9 encrypted GitHub credential store. Browser roles have no direct access.';
comment on table public.lab_attempts is
  'P9 GitHub-backed lab verification result. PASS/RETRY is rule-engine output.';
comment on table public.lab_verification_checks is
  'P9 source-backed verification checks and canonical GitHub evidence pointers.';
