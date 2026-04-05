create table public.external_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null,
  external_user_id text,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  scope text,
  token_type text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint external_connections_provider_check
    check (provider in ('google_drive')),
  constraint external_connections_tenant_provider_unique
    unique (tenant_id, provider)
);

create index idx_external_connections_tenant
  on public.external_connections (tenant_id);
create index idx_external_connections_user
  on public.external_connections (user_id);

create trigger trg_external_connections_updated_at
  before update on public.external_connections
  for each row execute function public.set_updated_at();

create table public.drive_files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  provider text not null default 'google_drive',
  external_file_id text not null,
  parent_external_file_id text,
  project_code text,
  project_name text,
  name text not null,
  path text not null,
  mime_type text not null,
  web_view_link text,
  is_folder boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drive_files_provider_check
    check (provider in ('google_drive')),
  constraint drive_files_tenant_provider_external_file_unique
    unique (tenant_id, provider, external_file_id)
);

create index idx_drive_files_tenant on public.drive_files (tenant_id);
create index idx_drive_files_project_code on public.drive_files (project_code);
create index idx_drive_files_external_file
  on public.drive_files (external_file_id);

create trigger trg_drive_files_updated_at
  before update on public.drive_files
  for each row execute function public.set_updated_at();

alter table public.external_connections enable row level security;
alter table public.drive_files enable row level security;

create policy "external_connections_select" on public.external_connections
  for select using (tenant_id = public.get_tenant_id());

create policy "external_connections_insert" on public.external_connections
  for insert with check (tenant_id = public.get_tenant_id());

create policy "external_connections_update" on public.external_connections
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "external_connections_delete" on public.external_connections
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
