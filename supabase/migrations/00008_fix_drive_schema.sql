do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'drive_files'
  ) then
    alter table public.drive_files
      add column if not exists project_id uuid references public.projects(id) on delete cascade,
      add column if not exists proposal_id uuid references public.proposals(id) on delete cascade,
      add column if not exists file_role text,
      add column if not exists document_type text,
      add column if not exists discipline text,
      add column if not exists revision_label text,
      add column if not exists drive_file_id text,
      add column if not exists drive_parent_id text,
      add column if not exists size_bytes bigint;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'drive_files'
      and column_name = 'external_file_id'
  ) then
    execute '
      update public.drive_files
      set drive_file_id = coalesce(drive_file_id, external_file_id)
      where drive_file_id is null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'drive_files'
      and column_name = 'parent_external_file_id'
  ) then
    execute '
      update public.drive_files
      set drive_parent_id = coalesce(drive_parent_id, parent_external_file_id)
      where drive_parent_id is null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'drive_files'
      and column_name = 'is_folder'
  ) then
    execute '
      update public.drive_files
      set file_role = coalesce(file_role, case when is_folder then ''folder'' else ''file'' end)
      where file_role is null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'drive_files'
      and column_name = 'path'
  ) then
    execute '
      update public.drive_files
      set revision_label = coalesce(revision_label, path)
      where revision_label is null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'drive_files'
      and column_name = 'project_name'
  ) then
    execute '
      update public.drive_files as df
      set project_id = p.id
      from public.projects as p
      where df.project_id is null
        and p.tenant_id = df.tenant_id
        and p.name = df.project_name
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'drive_files'
      and column_name = 'metadata'
  ) then
    execute '
      update public.drive_files
      set discipline = coalesce(discipline, metadata ->> ''customerName'')
      where discipline is null
        and file_role = ''folder''
        and drive_parent_id is null
    ';
  end if;
end $$;

alter table public.drive_files
  alter column drive_file_id set not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'drive_files'
      and column_name = 'mime_type'
      and is_nullable = 'NO'
  ) then
    alter table public.drive_files
      alter column mime_type drop not null;
  end if;
end $$;

drop index if exists public.idx_drive_files_project_code;
drop index if exists public.idx_drive_files_external_file;

alter table public.drive_files
  drop constraint if exists drive_files_provider_check,
  drop constraint if exists drive_files_tenant_provider_external_file_unique;

alter table public.drive_files
  drop column if exists provider,
  drop column if exists external_file_id,
  drop column if exists parent_external_file_id,
  drop column if exists project_code,
  drop column if exists project_name,
  drop column if exists name,
  drop column if exists path,
  drop column if exists is_folder,
  drop column if exists metadata;

create index if not exists idx_drive_files_drive_file_id
  on public.drive_files (drive_file_id);
create index if not exists idx_drive_files_drive_parent_id
  on public.drive_files (drive_parent_id);
