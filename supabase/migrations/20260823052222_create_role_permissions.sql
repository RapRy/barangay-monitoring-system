create table public.role_permissions (
  role_id uuid not null
    references public.roles(id)
    on delete cascade,

  permission_id uuid not null
    references public.permissions(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  primary key (role_id, permission_id)
);

insert into public.role_permissions (
  role_id,
  permission_id
)
select
  r.id,
  p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
on conflict do nothing;

insert into public.role_permissions (
  role_id,
  permission_id
)
select
  r.id,
  p.id
from public.roles r
join public.permissions p
  on p.name in (
    'household.read',
    'resident.read',
    'reports.read'
  )
where r.name = 'viewer'
on conflict do nothing;

insert into public.role_permissions (
  role_id,
  permission_id
)
select
  r.id,
  p.id
from public.roles r
join public.permissions p
  on p.name in (
    'household.read',
    'household.create',
    'household.update',

    'resident.read',
    'resident.create',
    'resident.update',

    'reports.read'
  )
where r.name = 'staff'
on conflict do nothing;