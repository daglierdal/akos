-- Migration: 00002_enable_rls
-- Description: Enable Row Level Security and create tenant-isolation policies
-- Strategy: Each user's JWT contains a tenant_id claim (app_metadata.tenant_id).
--           Rows are visible/modifiable only when they match the caller's tenant.

-- Helper: extract tenant_id from the authenticated user's JWT
create or replace function public.get_tenant_id()
returns uuid as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ language sql stable security definer;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.customers enable row level security;
alter table public.boq_items enable row level security;
alter table public.proposals enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.subcontracts enable row level security;
alter table public.progress_payments enable row level security;
alter table public.site_reports enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- ============================================================
-- RLS Policies: users
-- ============================================================
create policy "users_select" on public.users
  for select using (tenant_id = public.get_tenant_id());

create policy "users_insert" on public.users
  for insert with check (tenant_id = public.get_tenant_id());

create policy "users_update" on public.users
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "users_delete" on public.users
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: projects
-- ============================================================
create policy "projects_select" on public.projects
  for select using (tenant_id = public.get_tenant_id());

create policy "projects_insert" on public.projects
  for insert with check (tenant_id = public.get_tenant_id());

create policy "projects_update" on public.projects
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "projects_delete" on public.projects
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: customers
-- ============================================================
create policy "customers_select" on public.customers
  for select using (tenant_id = public.get_tenant_id());

create policy "customers_insert" on public.customers
  for insert with check (tenant_id = public.get_tenant_id());

create policy "customers_update" on public.customers
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "customers_delete" on public.customers
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: boq_items
-- ============================================================
create policy "boq_items_select" on public.boq_items
  for select using (tenant_id = public.get_tenant_id());

create policy "boq_items_insert" on public.boq_items
  for insert with check (tenant_id = public.get_tenant_id());

create policy "boq_items_update" on public.boq_items
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "boq_items_delete" on public.boq_items
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: proposals
-- ============================================================
create policy "proposals_select" on public.proposals
  for select using (tenant_id = public.get_tenant_id());

create policy "proposals_insert" on public.proposals
  for insert with check (tenant_id = public.get_tenant_id());

create policy "proposals_update" on public.proposals
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "proposals_delete" on public.proposals
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: purchase_orders
-- ============================================================
create policy "purchase_orders_select" on public.purchase_orders
  for select using (tenant_id = public.get_tenant_id());

create policy "purchase_orders_insert" on public.purchase_orders
  for insert with check (tenant_id = public.get_tenant_id());

create policy "purchase_orders_update" on public.purchase_orders
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "purchase_orders_delete" on public.purchase_orders
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: subcontracts
-- ============================================================
create policy "subcontracts_select" on public.subcontracts
  for select using (tenant_id = public.get_tenant_id());

create policy "subcontracts_insert" on public.subcontracts
  for insert with check (tenant_id = public.get_tenant_id());

create policy "subcontracts_update" on public.subcontracts
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "subcontracts_delete" on public.subcontracts
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: progress_payments
-- ============================================================
create policy "progress_payments_select" on public.progress_payments
  for select using (tenant_id = public.get_tenant_id());

create policy "progress_payments_insert" on public.progress_payments
  for insert with check (tenant_id = public.get_tenant_id());

create policy "progress_payments_update" on public.progress_payments
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "progress_payments_delete" on public.progress_payments
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: site_reports
-- ============================================================
create policy "site_reports_select" on public.site_reports
  for select using (tenant_id = public.get_tenant_id());

create policy "site_reports_insert" on public.site_reports
  for insert with check (tenant_id = public.get_tenant_id());

create policy "site_reports_update" on public.site_reports
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "site_reports_delete" on public.site_reports
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: chat_sessions
-- ============================================================
create policy "chat_sessions_select" on public.chat_sessions
  for select using (tenant_id = public.get_tenant_id());

create policy "chat_sessions_insert" on public.chat_sessions
  for insert with check (tenant_id = public.get_tenant_id());

create policy "chat_sessions_update" on public.chat_sessions
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "chat_sessions_delete" on public.chat_sessions
  for delete using (tenant_id = public.get_tenant_id());

-- ============================================================
-- RLS Policies: chat_messages
-- ============================================================
create policy "chat_messages_select" on public.chat_messages
  for select using (tenant_id = public.get_tenant_id());

create policy "chat_messages_insert" on public.chat_messages
  for insert with check (tenant_id = public.get_tenant_id());

create policy "chat_messages_update" on public.chat_messages
  for update using (tenant_id = public.get_tenant_id())
  with check (tenant_id = public.get_tenant_id());

create policy "chat_messages_delete" on public.chat_messages
  for delete using (tenant_id = public.get_tenant_id());
