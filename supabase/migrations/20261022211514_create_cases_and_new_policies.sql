create table public.cases (
  id uuid primary key default gen_random_uuid(),

  -- Keep the household association as historical context.
  household_id uuid not null
    references public.households(id)
    on delete restrict,

  -- Null is allowed only after the resident record is deleted.
  resident_id uuid
    references public.residents(id)
    on delete set null,

  -- Preserve the name even if the resident record is later deleted.
  resident_name text not null,

  case_type text not null
    check (case_type in ('SOCIAL_ASSISTANCE', 'HEALTH_CONCERN', 'INCIDENT')),

  title text not null,
  description text,

  status text not null default 'OPEN'
    check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),

  priority text not null default 'MEDIUM'
    check (priority in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),

  assigned_to uuid
    references public.profiles(id)
    on delete set null,

  reported_at date not null default current_date,
  follow_up_date date,
  resolution_notes text,

  created_by uuid default auth.uid()
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cases_household_id_idx
  on public.cases(household_id);

create index cases_resident_id_idx
  on public.cases(resident_id);

create index cases_status_idx
  on public.cases(status);

create index cases_assigned_to_idx
  on public.cases(assigned_to);

-- Require the selected resident to belong to the saved household
-- when inserting a case or changing its resident/household association.
create or replace function public.validate_case_resident_household()
returns trigger
language plpgsql
as $$
declare
  resident_household_id uuid;
begin
  if tg_op = 'INSERT' and new.resident_id is null then
    raise exception 'A case must be linked to a resident.';
  end if;

  if new.resident_id is not null then
    select household_id
      into resident_household_id
      from public.residents
      where id = new.resident_id;

    if not found then
      raise exception 'Resident not found.';
    end if;

    if resident_household_id <> new.household_id then
      raise exception 'Resident must belong to the selected household.';
    end if;
  end if;

  return new;
end;
$$;

create trigger validate_case_resident_household_trigger
before insert or update of resident_id, household_id
on public.cases
for each row
execute function public.validate_case_resident_household();

insert into public.permissions (name, description)
values
  ('case.read', 'View cases'),
  ('case.create', 'Create cases'),
  ('case.update', 'Update cases'),
  ('case.delete', 'Delete cases')
on conflict (name) do nothing;

-- Admins receive all case permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.name like 'case.%'
on conflict do nothing;

-- Staff can view and manage cases, but cannot delete them.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p
  on p.name in ('case.read', 'case.create', 'case.update')
where r.name = 'staff'
on conflict do nothing;

-- Viewers can view cases only.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p
  on p.name = 'case.read'
where r.name = 'viewer'
on conflict do nothing;

alter table public.cases enable row level security;

create policy "Authorized users can view cases"
on public.cases
for select
to authenticated
using (public.get_user_role() in ('admin', 'staff', 'viewer'));

create policy "Admin and staff can create cases"
on public.cases
for insert
to authenticated
with check (public.get_user_role() in ('admin', 'staff'));

create policy "Admin and staff can update cases"
on public.cases
for update
to authenticated
using (public.get_user_role() in ('admin', 'staff'))
with check (public.get_user_role() in ('admin', 'staff'));

create policy "Only admins can delete cases"
on public.cases
for delete
to authenticated
using (public.get_user_role() = 'admin');