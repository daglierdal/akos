-- Migration: 00001_create_schema
-- Description: AkOs multi-tenant DB schema
-- Tables: users, projects, customers, boq_items, proposals,
--         purchase_orders, subcontracts, progress_payments,
--         site_reports, chat_sessions, chat_messages
-- All tables include tenant_id, created_at, updated_at

-- Helper: auto-update updated_at on row modification
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. users
-- ============================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  email text not null,
  full_name text,
  role text not null default 'member',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_tenant_unique unique (tenant_id, email)
);

create index idx_users_tenant on public.users (tenant_id);

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ============================================================
-- 2. projects
-- ============================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  description text,
  status text not null default 'active',
  start_date date,
  end_date date,
  budget numeric(15,2),
  currency text not null default 'TRY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_tenant on public.projects (tenant_id);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. customers
-- ============================================================
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  tax_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_tenant on public.customers (tenant_id);

create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. boq_items (Bill of Quantities)
-- ============================================================
create table public.boq_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  item_no text not null,
  description text not null,
  unit text not null,
  quantity numeric(15,3) not null default 0,
  unit_price numeric(15,2) not null default 0,
  total_price numeric(15,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_boq_items_tenant on public.boq_items (tenant_id);
create index idx_boq_items_project on public.boq_items (project_id);

create trigger trg_boq_items_updated_at
  before update on public.boq_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. proposals
-- ============================================================
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  proposal_no text not null,
  title text not null,
  status text not null default 'draft',
  total_amount numeric(15,2) not null default 0,
  currency text not null default 'TRY',
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_proposals_tenant on public.proposals (tenant_id);
create index idx_proposals_project on public.proposals (project_id);

create trigger trg_proposals_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

-- ============================================================
-- 6. purchase_orders
-- ============================================================
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  po_no text not null,
  supplier text not null,
  status text not null default 'draft',
  total_amount numeric(15,2) not null default 0,
  currency text not null default 'TRY',
  order_date date,
  delivery_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_purchase_orders_tenant on public.purchase_orders (tenant_id);
create index idx_purchase_orders_project on public.purchase_orders (project_id);

create trigger trg_purchase_orders_updated_at
  before update on public.purchase_orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- 7. subcontracts
-- ============================================================
create table public.subcontracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  contract_no text not null,
  subcontractor text not null,
  scope text,
  status text not null default 'draft',
  total_amount numeric(15,2) not null default 0,
  currency text not null default 'TRY',
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subcontracts_tenant on public.subcontracts (tenant_id);
create index idx_subcontracts_project on public.subcontracts (project_id);

create trigger trg_subcontracts_updated_at
  before update on public.subcontracts
  for each row execute function public.set_updated_at();

-- ============================================================
-- 8. progress_payments
-- ============================================================
create table public.progress_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  payment_no integer not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft',
  gross_amount numeric(15,2) not null default 0,
  deductions numeric(15,2) not null default 0,
  net_amount numeric(15,2) generated always as (gross_amount - deductions) stored,
  currency text not null default 'TRY',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_progress_payments_tenant on public.progress_payments (tenant_id);
create index idx_progress_payments_project on public.progress_payments (project_id);

create trigger trg_progress_payments_updated_at
  before update on public.progress_payments
  for each row execute function public.set_updated_at();

-- ============================================================
-- 9. site_reports
-- ============================================================
create table public.site_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  report_date date not null,
  weather text,
  workforce_count integer default 0,
  summary text,
  issues text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_site_reports_tenant on public.site_reports (tenant_id);
create index idx_site_reports_project on public.site_reports (project_id);

create trigger trg_site_reports_updated_at
  before update on public.site_reports
  for each row execute function public.set_updated_at();

-- ============================================================
-- 10. chat_sessions
-- ============================================================
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_chat_sessions_tenant on public.chat_sessions (tenant_id);
create index idx_chat_sessions_user on public.chat_sessions (user_id);

create trigger trg_chat_sessions_updated_at
  before update on public.chat_sessions
  for each row execute function public.set_updated_at();

-- ============================================================
-- 11. chat_messages
-- ============================================================
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_chat_messages_tenant on public.chat_messages (tenant_id);
create index idx_chat_messages_session on public.chat_messages (session_id);

create trigger trg_chat_messages_updated_at
  before update on public.chat_messages
  for each row execute function public.set_updated_at();
