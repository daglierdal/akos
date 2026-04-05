create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  settings jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tenants_slug on public.tenants(slug);

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

create table public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  constraint unique_tenant_user unique (tenant_id, user_id)
);

create index idx_memberships_tenant on public.tenant_memberships(tenant_id);
create index idx_memberships_user on public.tenant_memberships(user_id);

alter table public.users
  add constraint fk_users_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.projects
  add constraint fk_projects_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.customers
  add constraint fk_customers_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.boq_items
  add constraint fk_boq_items_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.proposals
  add constraint fk_proposals_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.purchase_orders
  add constraint fk_purchase_orders_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.subcontracts
  add constraint fk_subcontracts_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.progress_payments
  add constraint fk_progress_payments_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.site_reports
  add constraint fk_site_reports_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.chat_sessions
  add constraint fk_chat_sessions_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.chat_messages
  add constraint fk_chat_messages_tenant
  foreign key (tenant_id) references public.tenants(id);

alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;

create policy "tenants_select" on public.tenants
  for select using (id = public.get_tenant_id());

create policy "tenants_insert" on public.tenants
  for insert with check (id = public.get_tenant_id());

create policy "tenants_update" on public.tenants
  for update using (id = public.get_tenant_id())
  with check (id = public.get_tenant_id());

create policy "tenants_delete" on public.tenants
  for delete using (id = public.get_tenant_id());

create policy "tenant_memberships_select" on public.tenant_memberships
  for select using (tenant_id = public.get_tenant_id());

create policy "tenant_memberships_insert" on public.tenant_memberships
  for insert with check (tenant_id = public.get_tenant_id());

create policy "tenant_memberships_update" on public.tenant_memberships
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "tenant_memberships_delete" on public.tenant_memberships
  for delete using (tenant_id = public.get_tenant_id());
