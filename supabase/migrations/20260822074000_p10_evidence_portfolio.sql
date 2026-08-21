-- P10 Evidence / Portfolio

create table public.manual_evidence_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  evidence_type text not null check (evidence_type in ('ENVIRONMENT','LAB_LOCAL','REPOSITORY_DOCS','PROJECT','EXAM','REFLECTION')),
  title text not null,
  what_text text not null,
  why_text text not null,
  verify_text text not null,
  result_text text not null,
  canonical_url text,
  score_percent numeric(5,2) check (score_percent is null or score_percent between 0 and 100),
  confirmed boolean not null default false,
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidence_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  package_version text not null,
  status text not null check (status in ('DRAFT','READY','CLEAR_CANDIDATE')),
  completeness_percent integer not null check (completeness_percent between 0 and 100),
  gate jsonb not null default '[]'::jsonb,
  snapshot jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  unique (user_id, course_slug)
);

create table public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.evidence_packages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  source_type text not null,
  source_id text,
  status text not null check (status in ('PASS','MISSING','INFO')),
  title text not null,
  summary text not null,
  canonical_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index manual_evidence_user_course_idx on public.manual_evidence_records(user_id, course_slug, evidence_type, updated_at desc);
create index evidence_items_package_idx on public.evidence_items(package_id, category);

create trigger manual_evidence_touch_updated_at before update on public.manual_evidence_records
for each row execute function public.touch_updated_at();

alter table public.manual_evidence_records enable row level security;
alter table public.evidence_packages enable row level security;
alter table public.evidence_items enable row level security;

create policy manual_evidence_own on public.manual_evidence_records for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy evidence_packages_select_own on public.evidence_packages for select to authenticated
using (auth.uid() = user_id);
create policy evidence_items_select_own on public.evidence_items for select to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete on public.manual_evidence_records to authenticated;
revoke all on public.evidence_packages from anon, authenticated;
revoke all on public.evidence_items from anon, authenticated;
grant select on public.evidence_packages to authenticated;
grant select on public.evidence_items to authenticated;
grant select, insert, update, delete on public.evidence_packages to service_role;
grant select, insert, update, delete on public.evidence_items to service_role;

comment on table public.manual_evidence_records is 'P10 learner self-attested evidence for facts that GCLS cannot independently verify.';
comment on table public.evidence_packages is 'P10 server-generated reproducible evidence snapshot. CLEAR_CANDIDATE is not an automatic certification result.';
comment on table public.evidence_items is 'P10 normalized evidence pointers and quality-gate rows for portfolio projection.';
