-- P8 RAG — Source of Truth grounded retrieval
-- Supabase / PostgreSQL pgvector uses the extension name `vector`.

create extension if not exists vector with schema extensions;

create table public.rag_documents (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  module_slug text not null,
  source_tier text not null check (source_tier in ('PRE_ANSWER', 'POST_ATTEMPT')),
  title text not null,
  source_path text not null unique,
  source_url text not null,
  provider text not null,
  source_ref text not null,
  content_hash text not null,
  embedding_profile text not null,
  embedding_dimensions integer not null check (embedding_dimensions = 384),
  indexed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rag_documents_course_tier_idx
  on public.rag_documents(course_slug, source_tier, module_slug);

create table public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.rag_documents(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  heading text,
  content text not null,
  content_chars integer not null check (content_chars > 0),
  embedding extensions.vector(384) not null,
  embedding_provider text not null,
  embedding_model text not null,
  embedding_fallback boolean not null default false,
  created_at timestamptz not null default now(),
  unique(document_id, chunk_index)
);

create index rag_chunks_document_idx on public.rag_chunks(document_id, chunk_index);

create table public.rag_index_runs (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  source_ref text not null,
  embedding_profile text not null,
  status text not null check (status in ('RUNNING', 'COMPLETED', 'FAILED')),
  target_documents integer not null default 0,
  indexed_documents integer not null default 0,
  skipped_documents integer not null default 0,
  deleted_documents integer not null default 0,
  document_count integer not null default 0,
  chunk_count integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index rag_index_runs_course_started_idx
  on public.rag_index_runs(course_slug, started_at desc);

create or replace function public.match_rag_chunks(
  query_embedding extensions.vector(384),
  match_course_slug text,
  allowed_source_tiers text[],
  match_count integer default 5,
  min_similarity double precision default 0
)
returns table (
  chunk_id uuid,
  document_id uuid,
  module_slug text,
  source_tier text,
  title text,
  source_path text,
  source_url text,
  heading text,
  content text,
  similarity double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select
    c.id as chunk_id,
    d.id as document_id,
    d.module_slug,
    d.source_tier,
    d.title,
    d.source_path,
    d.source_url,
    c.heading,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.rag_chunks c
  join public.rag_documents d on d.id = c.document_id
  where d.course_slug = match_course_slug
    and d.source_tier = any(allowed_source_tiers)
    and 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit greatest(1, least(match_count, 8));
$$;

alter table public.rag_documents enable row level security;
alter table public.rag_chunks enable row level security;
alter table public.rag_index_runs enable row level security;

revoke all on public.rag_documents from anon, authenticated;
revoke all on public.rag_chunks from anon, authenticated;
revoke all on public.rag_index_runs from anon, authenticated;
grant select, insert, update, delete on public.rag_documents to service_role;
grant select, insert, update, delete on public.rag_chunks to service_role;
grant select, insert, update, delete on public.rag_index_runs to service_role;

revoke execute on function public.match_rag_chunks(extensions.vector, text, text[], integer, double precision) from public, anon, authenticated;
grant execute on function public.match_rag_chunks(extensions.vector, text, text[], integer, double precision) to service_role;

alter table public.ai_interactions
  add column rag_grounded boolean not null default false,
  add column rag_source_count integer not null default 0 check (rag_source_count >= 0),
  add column rag_embedding_profile text,
  add column rag_source_ref text;

create table public.ai_interaction_sources (
  id uuid primary key default gen_random_uuid(),
  interaction_id uuid not null references public.ai_interactions(id) on delete cascade,
  rag_chunk_id uuid,
  source_rank integer not null check (source_rank > 0),
  similarity double precision not null check (similarity >= -1 and similarity <= 1),
  title text not null,
  source_path text not null,
  source_url text not null,
  heading text,
  created_at timestamptz not null default now(),
  unique(interaction_id, source_rank)
);

create index ai_interaction_sources_interaction_idx
  on public.ai_interaction_sources(interaction_id, source_rank);

alter table public.ai_interaction_sources enable row level security;

create policy ai_interaction_sources_select_own
on public.ai_interaction_sources for select to authenticated
using (
  exists (
    select 1 from public.ai_interactions interaction
    where interaction.id = interaction_id
      and interaction.user_id = auth.uid()
  )
);

revoke all on public.ai_interaction_sources from anon, authenticated;
grant select on public.ai_interaction_sources to authenticated;
grant select, insert, update, delete on public.ai_interaction_sources to service_role;

comment on table public.rag_documents is
  'P8 derived RAG document index. GitHub content repository remains the Source of Truth.';
comment on table public.rag_chunks is
  'P8 regenerable Markdown chunks and 384-dimensional embeddings for pgvector retrieval.';
comment on table public.rag_index_runs is
  'P8 indexing audit and freshness/profile tracking.';
comment on table public.ai_interaction_sources is
  'P8 immutable source metadata snapshot for AI Tutor provenance.';
