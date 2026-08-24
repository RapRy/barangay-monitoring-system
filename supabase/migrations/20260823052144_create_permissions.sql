create table public.permissions (
  id uuid primary key default gen_random_uuid(),

  name text not null unique,

  description text,

  created_at timestamptz not null default now()
);

insert into public.permissions (name, description)
values
  ('household.read', 'View households'),
  ('household.create', 'Create households'),
  ('household.update', 'Update households'),
  ('household.delete', 'Delete households'),

  ('resident.read', 'View residents'),
  ('resident.create', 'Create residents'),
  ('resident.update', 'Update residents'),
  ('resident.delete', 'Delete residents'),

  ('reports.read', 'View reports'),

  ('users.read', 'View users'),
  ('users.create', 'Create users'),
  ('users.update', 'Update users'),
  ('users.delete', 'Delete users')
on conflict (name) do nothing;