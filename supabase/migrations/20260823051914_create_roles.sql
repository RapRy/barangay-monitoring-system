create table public.roles (
  id uuid primary key default gen_random_uuid(),

  name text not null unique,

  description text,

  created_at timestamptz not null default now()
);

insert into public.roles (name, description)
values
  ('admin', 'Full system access'),
  ('staff', 'Barangay staff with operational access'),
  ('viewer', 'Read-only access')
on conflict (name) do nothing;