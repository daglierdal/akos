-- Faz 0.1: Remove tenant dependency from external_connections and drive_files.
-- RLS is now user_id based (auth.uid() = user_id).

-- external_connections: drop tenant FK, add user-scoped unique constraint
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'external_connections'
      and column_name = 'tenant_id'
  ) then
    alter table public.external_connections
      drop constraint if exists external_connections_tenant_provider_unique,
      drop constraint if exists external_connections_tenant_id_fkey;

    alter table public.external_connections
      alter column tenant_id drop not null;

    drop index if exists public.idx_external_connections_tenant;
  end if;
end $$;

-- Add user-scoped unique constraint if not already present
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'external_connections'
      and constraint_name = 'external_connections_user_provider_unique'
  ) then
    alter table public.external_connections
      add constraint external_connections_user_provider_unique
      unique (user_id, provider);
  end if;
end $$;

-- Replace tenant-based RLS policies with user-based policies
drop policy if exists "external_connections_select" on public.external_connections;
drop policy if exists "external_connections_insert" on public.external_connections;
drop policy if exists "external_connections_update" on public.external_connections;
drop policy if exists "external_connections_delete" on public.external_connections;

create policy "external_connections_select" on public.external_connections
  for select using (user_id = auth.uid());

create policy "external_connections_insert" on public.external_connections
  for insert with check (user_id = auth.uid());

create policy "external_connections_update" on public.external_connections
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "external_connections_delete" on public.external_connections
  for delete using (user_id = auth.uid());

-- drive_files: replace tenant-based RLS with project-membership check
drop policy if exists "drive_files_select" on public.drive_files;
drop policy if exists "drive_files_insert" on public.drive_files;
drop policy if exists "drive_files_update" on public.drive_files;
drop policy if exists "drive_files_delete" on public.drive_files;

create policy "drive_files_select" on public.drive_files
  for select using (
    project_id in (
      select id from public.projects where created_by = auth.uid()
    )
  );

create policy "drive_files_insert" on public.drive_files
  for insert with check (
    project_id in (
      select id from public.projects where created_by = auth.uid()
    )
  );

create policy "drive_files_update" on public.drive_files
  for update using (
    project_id in (
      select id from public.projects where created_by = auth.uid()
    )
  );

create policy "drive_files_delete" on public.drive_files
  for delete using (
    project_id in (
      select id from public.projects where created_by = auth.uid()
    )
  );
