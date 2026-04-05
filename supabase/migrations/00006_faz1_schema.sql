-- Migration: 00006_faz1_schema
-- Description: Faz 1 schema v3 additions for proposals, documents, pricing, and BOQ hierarchy

alter table public.tenants
  add column if not exists project_code_prefix text not null default 'AKR';

alter table public.chat_sessions
  add column if not exists project_id uuid references public.projects(id);

drop table if exists public.proposal_boq_items cascade;
drop table if exists public.drive_files cascade;
drop table if exists public.document_annotations cascade;
drop table if exists public.document_processing_jobs cascade;
drop table if exists public.document_versions cascade;
drop table if exists public.documents cascade;
drop table if exists public.price_records cascade;
drop table if exists public.price_lists cascade;
drop table if exists public.boq_items cascade;
drop table if exists public.boq_subcategories cascade;
drop table if exists public.boq_categories cascade;
drop table if exists public.boq_disciplines cascade;
drop table if exists public.import_jobs cascade;
drop table if exists public.boq_import_rows cascade;
drop table if exists public.proposals cascade;

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  project_id uuid not null references public.projects(id) on delete cascade,
  revision_no integer not null default 0,
  revision_code text not null default 'REV-00',
  status text not null default 'draft' check (status in ('draft', 'pending', 'submitted', 'accepted', 'rejected')),
  drive_revision_folder_id text,
  margin_percent numeric,
  discount_type text,
  discount_value numeric,
  total_cost numeric,
  total_price numeric,
  total_vat numeric,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_proposals_tenant on public.proposals (tenant_id);
create index idx_proposals_project on public.proposals (project_id);

create trigger trg_proposals_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

create table public.drive_files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  project_id uuid references public.projects(id) on delete cascade,
  proposal_id uuid references public.proposals(id) on delete cascade,
  file_role text,
  document_type text,
  discipline text,
  revision_label text,
  drive_file_id text not null,
  drive_parent_id text,
  mime_type text,
  web_view_link text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_drive_files_tenant on public.drive_files (tenant_id);
create index idx_drive_files_project on public.drive_files (project_id);
create index idx_drive_files_proposal on public.drive_files (proposal_id);

create trigger trg_drive_files_updated_at
  before update on public.drive_files
  for each row execute function public.set_updated_at();

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  project_id uuid references public.projects(id) on delete cascade,
  proposal_id uuid references public.proposals(id) on delete cascade,
  title text,
  category text check (category in ('drawing', 'spec', 'boq', 'contract', 'photo', 'model', 'other')),
  storage_type text check (storage_type in ('supabase', 'drive')),
  storage_path text,
  original_filename text,
  standard_filename text,
  mime_type text,
  file_size bigint,
  parsed_text text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_documents_tenant on public.documents (tenant_id);
create index idx_documents_project on public.documents (project_id);
create index idx_documents_proposal on public.documents (proposal_id);

create trigger trg_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_no integer not null,
  storage_path text,
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_document_versions_tenant on public.document_versions (tenant_id);
create index idx_document_versions_document on public.document_versions (document_id);

create trigger trg_document_versions_updated_at
  before update on public.document_versions
  for each row execute function public.set_updated_at();

create table public.document_annotations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  document_id uuid not null references public.documents(id) on delete cascade,
  page_no integer,
  annotation_type text,
  payload jsonb,
  boq_item_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_document_annotations_tenant on public.document_annotations (tenant_id);
create index idx_document_annotations_document on public.document_annotations (document_id);

create trigger trg_document_annotations_updated_at
  before update on public.document_annotations
  for each row execute function public.set_updated_at();

create table public.document_processing_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  document_id uuid not null references public.documents(id) on delete cascade,
  job_type text not null check (job_type in ('parse', 'embed', 'pdf_gen')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_document_processing_jobs_tenant on public.document_processing_jobs (tenant_id);
create index idx_document_processing_jobs_document on public.document_processing_jobs (document_id);

create trigger trg_document_processing_jobs_updated_at
  before update on public.document_processing_jobs
  for each row execute function public.set_updated_at();

create table public.price_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  item_name text,
  item_category text,
  discipline text,
  price_type text check (price_type in ('malzeme', 'iscilik')),
  unit text,
  unit_price numeric,
  currency text not null default 'TRY',
  source_type text check (source_type in ('project', 'supplier_list', 'manual')),
  source_name text,
  source_date date,
  city text,
  supplier_name text,
  project_id uuid,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_price_records_tenant on public.price_records (tenant_id);
create index idx_price_records_project on public.price_records (project_id);

create trigger trg_price_records_updated_at
  before update on public.price_records
  for each row execute function public.set_updated_at();

create table public.price_lists (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  supplier_name text,
  list_date date,
  source_type text check (source_type in ('pdf', 'excel')),
  document_id uuid,
  currency text not null default 'TRY',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_price_lists_tenant on public.price_lists (tenant_id);

create trigger trg_price_lists_updated_at
  before update on public.price_lists
  for each row execute function public.set_updated_at();

create table public.boq_disciplines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  project_id uuid references public.projects(id) on delete cascade,
  name text,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_boq_disciplines_tenant on public.boq_disciplines (tenant_id);
create index idx_boq_disciplines_project on public.boq_disciplines (project_id);

create trigger trg_boq_disciplines_updated_at
  before update on public.boq_disciplines
  for each row execute function public.set_updated_at();

create table public.boq_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  discipline_id uuid not null references public.boq_disciplines(id) on delete cascade,
  name text,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_boq_categories_tenant on public.boq_categories (tenant_id);
create index idx_boq_categories_discipline on public.boq_categories (discipline_id);

create trigger trg_boq_categories_updated_at
  before update on public.boq_categories
  for each row execute function public.set_updated_at();

create table public.boq_subcategories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  category_id uuid not null references public.boq_categories(id) on delete cascade,
  name text,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_boq_subcategories_tenant on public.boq_subcategories (tenant_id);
create index idx_boq_subcategories_category on public.boq_subcategories (category_id);

create trigger trg_boq_subcategories_updated_at
  before update on public.boq_subcategories
  for each row execute function public.set_updated_at();

create table public.boq_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  subcategory_id uuid not null references public.boq_subcategories(id) on delete cascade,
  poz_no text,
  is_tanimi text,
  aciklama text,
  birim text,
  miktar numeric,
  malzeme_bf numeric,
  iscilik_bf numeric,
  toplam_bf numeric generated always as (coalesce(malzeme_bf, 0) + coalesce(iscilik_bf, 0)) stored,
  tutar numeric generated always as (coalesce(miktar, 0) * (coalesce(malzeme_bf, 0) + coalesce(iscilik_bf, 0))) stored,
  tedarik_tipi text check (tedarik_tipi in ('malzeme', 'iscilik', 'karma')),
  proje_marka text,
  yuklenici_marka text,
  urun_kodu text,
  source_document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_boq_items_tenant on public.boq_items (tenant_id);
create index idx_boq_items_subcategory on public.boq_items (subcategory_id);

create trigger trg_boq_items_updated_at
  before update on public.boq_items
  for each row execute function public.set_updated_at();

create table public.proposal_boq_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  revision_no integer not null,
  boq_item_id uuid not null references public.boq_items(id) on delete cascade,
  quantity numeric,
  malzeme_bf numeric,
  iscilik_bf numeric,
  is_excluded boolean not null default false,
  discount_type text,
  discount_value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_proposal_boq_items_tenant on public.proposal_boq_items (tenant_id);
create index idx_proposal_boq_items_proposal on public.proposal_boq_items (proposal_id);

create trigger trg_proposal_boq_items_updated_at
  before update on public.proposal_boq_items
  for each row execute function public.set_updated_at();

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  project_id uuid references public.projects(id) on delete cascade,
  file_name text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  row_count integer,
  error_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_import_jobs_tenant on public.import_jobs (tenant_id);
create index idx_import_jobs_project on public.import_jobs (project_id);

create trigger trg_import_jobs_updated_at
  before update on public.import_jobs
  for each row execute function public.set_updated_at();

create table public.boq_import_rows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_data jsonb,
  validation_status text check (validation_status in ('valid', 'warning', 'error')),
  validation_message text,
  mapped_boq_item_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_boq_import_rows_tenant on public.boq_import_rows (tenant_id);
create index idx_boq_import_rows_import_job on public.boq_import_rows (import_job_id);

create trigger trg_boq_import_rows_updated_at
  before update on public.boq_import_rows
  for each row execute function public.set_updated_at();

alter table public.proposals enable row level security;
alter table public.drive_files enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_annotations enable row level security;
alter table public.document_processing_jobs enable row level security;
alter table public.price_records enable row level security;
alter table public.price_lists enable row level security;
alter table public.boq_disciplines enable row level security;
alter table public.boq_categories enable row level security;
alter table public.boq_subcategories enable row level security;
alter table public.boq_items enable row level security;
alter table public.proposal_boq_items enable row level security;
alter table public.import_jobs enable row level security;
alter table public.boq_import_rows enable row level security;

create policy "proposals_select" on public.proposals
  for select using (tenant_id = public.get_tenant_id());
create policy "proposals_insert" on public.proposals
  for insert with check (tenant_id = public.get_tenant_id());
create policy "proposals_update" on public.proposals
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "proposals_delete" on public.proposals
  for delete using (tenant_id = public.get_tenant_id());

create policy "drive_files_select" on public.drive_files
  for select using (tenant_id = public.get_tenant_id());
create policy "drive_files_insert" on public.drive_files
  for insert with check (tenant_id = public.get_tenant_id());
create policy "drive_files_update" on public.drive_files
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "drive_files_delete" on public.drive_files
  for delete using (tenant_id = public.get_tenant_id());

create policy "documents_select" on public.documents
  for select using (tenant_id = public.get_tenant_id());
create policy "documents_insert" on public.documents
  for insert with check (tenant_id = public.get_tenant_id());
create policy "documents_update" on public.documents
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "documents_delete" on public.documents
  for delete using (tenant_id = public.get_tenant_id());

create policy "document_versions_select" on public.document_versions
  for select using (tenant_id = public.get_tenant_id());
create policy "document_versions_insert" on public.document_versions
  for insert with check (tenant_id = public.get_tenant_id());
create policy "document_versions_update" on public.document_versions
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "document_versions_delete" on public.document_versions
  for delete using (tenant_id = public.get_tenant_id());

create policy "document_annotations_select" on public.document_annotations
  for select using (tenant_id = public.get_tenant_id());
create policy "document_annotations_insert" on public.document_annotations
  for insert with check (tenant_id = public.get_tenant_id());
create policy "document_annotations_update" on public.document_annotations
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "document_annotations_delete" on public.document_annotations
  for delete using (tenant_id = public.get_tenant_id());

create policy "document_processing_jobs_select" on public.document_processing_jobs
  for select using (tenant_id = public.get_tenant_id());
create policy "document_processing_jobs_insert" on public.document_processing_jobs
  for insert with check (tenant_id = public.get_tenant_id());
create policy "document_processing_jobs_update" on public.document_processing_jobs
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "document_processing_jobs_delete" on public.document_processing_jobs
  for delete using (tenant_id = public.get_tenant_id());

create policy "price_records_select" on public.price_records
  for select using (tenant_id = public.get_tenant_id());
create policy "price_records_insert" on public.price_records
  for insert with check (tenant_id = public.get_tenant_id());
create policy "price_records_update" on public.price_records
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "price_records_delete" on public.price_records
  for delete using (tenant_id = public.get_tenant_id());

create policy "price_lists_select" on public.price_lists
  for select using (tenant_id = public.get_tenant_id());
create policy "price_lists_insert" on public.price_lists
  for insert with check (tenant_id = public.get_tenant_id());
create policy "price_lists_update" on public.price_lists
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "price_lists_delete" on public.price_lists
  for delete using (tenant_id = public.get_tenant_id());

create policy "boq_disciplines_select" on public.boq_disciplines
  for select using (tenant_id = public.get_tenant_id());
create policy "boq_disciplines_insert" on public.boq_disciplines
  for insert with check (tenant_id = public.get_tenant_id());
create policy "boq_disciplines_update" on public.boq_disciplines
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "boq_disciplines_delete" on public.boq_disciplines
  for delete using (tenant_id = public.get_tenant_id());

create policy "boq_categories_select" on public.boq_categories
  for select using (tenant_id = public.get_tenant_id());
create policy "boq_categories_insert" on public.boq_categories
  for insert with check (tenant_id = public.get_tenant_id());
create policy "boq_categories_update" on public.boq_categories
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "boq_categories_delete" on public.boq_categories
  for delete using (tenant_id = public.get_tenant_id());

create policy "boq_subcategories_select" on public.boq_subcategories
  for select using (tenant_id = public.get_tenant_id());
create policy "boq_subcategories_insert" on public.boq_subcategories
  for insert with check (tenant_id = public.get_tenant_id());
create policy "boq_subcategories_update" on public.boq_subcategories
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "boq_subcategories_delete" on public.boq_subcategories
  for delete using (tenant_id = public.get_tenant_id());

create policy "boq_items_select" on public.boq_items
  for select using (tenant_id = public.get_tenant_id());
create policy "boq_items_insert" on public.boq_items
  for insert with check (tenant_id = public.get_tenant_id());
create policy "boq_items_update" on public.boq_items
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "boq_items_delete" on public.boq_items
  for delete using (tenant_id = public.get_tenant_id());

create policy "proposal_boq_items_select" on public.proposal_boq_items
  for select using (tenant_id = public.get_tenant_id());
create policy "proposal_boq_items_insert" on public.proposal_boq_items
  for insert with check (tenant_id = public.get_tenant_id());
create policy "proposal_boq_items_update" on public.proposal_boq_items
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "proposal_boq_items_delete" on public.proposal_boq_items
  for delete using (tenant_id = public.get_tenant_id());

create policy "import_jobs_select" on public.import_jobs
  for select using (tenant_id = public.get_tenant_id());
create policy "import_jobs_insert" on public.import_jobs
  for insert with check (tenant_id = public.get_tenant_id());
create policy "import_jobs_update" on public.import_jobs
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "import_jobs_delete" on public.import_jobs
  for delete using (tenant_id = public.get_tenant_id());

create policy "boq_import_rows_select" on public.boq_import_rows
  for select using (tenant_id = public.get_tenant_id());
create policy "boq_import_rows_insert" on public.boq_import_rows
  for insert with check (tenant_id = public.get_tenant_id());
create policy "boq_import_rows_update" on public.boq_import_rows
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());
create policy "boq_import_rows_delete" on public.boq_import_rows
  for delete using (tenant_id = public.get_tenant_id());
