ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS project_code text;

WITH ranked_projects AS (
  SELECT
    projects.id,
    COALESCE(
      NULLIF(
        UPPER(REGEXP_REPLACE(TRIM(tenants.project_code_prefix), '[^A-Za-z0-9-]', '', 'g')),
        ''
      ),
      'PRJ'
    ) AS prefix,
    EXTRACT(YEAR FROM timezone('UTC', projects.created_at))::int AS year,
    ROW_NUMBER() OVER (
      PARTITION BY
        projects.tenant_id,
        EXTRACT(YEAR FROM timezone('UTC', projects.created_at))
      ORDER BY projects.created_at, projects.id
    ) AS sequence
  FROM public.projects
  INNER JOIN public.tenants ON tenants.id = projects.tenant_id
  WHERE projects.project_code IS NULL
)
UPDATE public.projects
SET project_code = CONCAT(
  ranked_projects.prefix,
  '-',
  ranked_projects.year,
  '-',
  LPAD(ranked_projects.sequence::text, 4, '0')
)
FROM ranked_projects
WHERE public.projects.id = ranked_projects.id;

ALTER TABLE public.projects
ALTER COLUMN project_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_tenant_project_code
ON public.projects (tenant_id, project_code);
