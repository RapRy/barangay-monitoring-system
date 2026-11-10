alter table public.profiles
  add column is_active boolean not null default true;

-- Existing accounts stay active; accounts created after this migration are pending.
alter table public.profiles
  alter column is_active set default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role_id uuid;
begin
  select id
    into default_role_id
    from public.roles
    where name = 'viewer';

  if default_role_id is null then
    raise exception 'Default viewer role does not exist.';
  end if;

  insert into public.profiles (
    id,
    full_name,
    role_id,
    is_active
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    default_role_id,
    false
  );

  return new;
end;
$$;

create or replace function public.get_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r
    on r.id = p.role_id
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;