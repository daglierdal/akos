-- Migration: 00007_document_search
-- Description: Full-text search helper for parsed document text

create index if not exists idx_documents_parsed_text_fts
  on public.documents
  using gin (to_tsvector('simple', coalesce(parsed_text, '')));

create or replace function public.search_documents_full_text(
  p_query text,
  p_project_id uuid default null
)
returns table (
  id uuid,
  title text,
  project_id uuid,
  original_filename text,
  mime_type text,
  created_at timestamptz,
  rank real,
  snippet text
)
language sql
stable
security invoker
as $$
  with normalized_query as (
    select to_tsquery(
      'simple',
      regexp_replace(trim(p_query), '\s+', ' & ', 'g')
    ) as query
  )
  select
    d.id,
    d.title,
    d.project_id,
    d.original_filename,
    d.mime_type,
    d.created_at,
    ts_rank(
      to_tsvector('simple', coalesce(d.parsed_text, '')),
      nq.query
    ) as rank,
    ts_headline(
      'simple',
      coalesce(d.parsed_text, ''),
      nq.query,
      'MaxWords=30, MinWords=10, ShortWord=2, MaxFragments=1'
    ) as snippet
  from public.documents as d
  cross join normalized_query as nq
  where d.tenant_id = public.get_tenant_id()
    and coalesce(d.parsed_text, '') <> ''
    and (p_project_id is null or d.project_id = p_project_id)
    and to_tsvector('simple', coalesce(d.parsed_text, '')) @@ nq.query
  order by rank desc, d.created_at desc
  limit 10;
$$;
