create table public.surveys (
  id uuid primary key default gen_random_uuid(),

  household_id uuid not null
    references public.households(id)
    on delete cascade,

  survey_date date not null default current_date,

  surveyed_by uuid
    default auth.uid()
    references public.profiles(id)
    on delete set null,

  number_of_family_members integer not null
    check (number_of_family_members > 0),

  source_of_income text,

  monthly_income numeric(12, 2)
    check (monthly_income is null or monthly_income >= 0),

  water_source text,
  has_electricity boolean,
  has_internet boolean,
  housing_condition text,
  assistance_needed text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index surveys_household_id_idx
  on public.surveys(household_id);

create table public.survey_resident_responses (
  id uuid primary key default gen_random_uuid(),

  survey_id uuid not null
    references public.surveys(id)
    on delete cascade,

  resident_id uuid
    references public.residents(id)
    on delete set null,

  -- Preserve the resident's name if their resident record is later removed.
  resident_name text not null,

  employment_status text,
  educational_status text,
  health_concerns text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (survey_id, resident_id)
);

create index survey_resident_responses_resident_id_idx
  on public.survey_resident_responses(resident_id);

insert into public.permissions (name, description)
values
  ('survey.read', 'View household surveys'),
  ('survey.create', 'Create household surveys'),
  ('survey.update', 'Update household surveys'),
  ('survey.delete', 'Delete household surveys'),
  ('survey.resident_response.read', 'View resident-level survey responses')
on conflict (name) do nothing;

-- Admins receive all survey permissions, including resident-response access.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.name like 'survey.%'
on conflict do nothing;

-- Staff can manage surveys and read resident-level responses.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p
  on p.name in (
    'survey.read',
    'survey.create',
    'survey.update',
    'survey.resident_response.read'
  )
where r.name = 'staff'
on conflict do nothing;

-- Viewers can read household-level survey records only.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p
  on p.name = 'survey.read'
where r.name = 'viewer'
on conflict do nothing;

alter table public.surveys enable row level security;
alter table public.survey_resident_responses enable row level security;

create policy "Authenticated users can view surveys"
on public.surveys
for select
to authenticated
using (public.get_user_role() in ('admin', 'staff', 'viewer'));

create policy "Admin and staff can create surveys"
on public.surveys
for insert
to authenticated
with check (public.get_user_role() in ('admin', 'staff'));

create policy "Admin and staff can update surveys"
on public.surveys
for update
to authenticated
using (public.get_user_role() in ('admin', 'staff'))
with check (public.get_user_role() in ('admin', 'staff'));

create policy "Only admins can delete surveys"
on public.surveys
for delete
to authenticated
using (public.get_user_role() = 'admin');

create policy "Admin and staff can view survey resident responses"
on public.survey_resident_responses
for select
to authenticated
using (public.get_user_role() in ('admin', 'staff'));

create policy "Admin and staff can create survey resident responses"
on public.survey_resident_responses
for insert
to authenticated
with check (public.get_user_role() in ('admin', 'staff'));

create policy "Admin and staff can update survey resident responses"
on public.survey_resident_responses
for update
to authenticated
using (public.get_user_role() in ('admin', 'staff'))
with check (public.get_user_role() in ('admin', 'staff'));

create policy "Only admins can delete survey resident responses"
on public.survey_resident_responses
for delete
to authenticated
using (public.get_user_role() = 'admin');