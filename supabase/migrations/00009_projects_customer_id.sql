ALTER TABLE public.projects
ADD COLUMN customer_id uuid REFERENCES public.customers(id);

CREATE INDEX idx_projects_customer ON public.projects(customer_id);
