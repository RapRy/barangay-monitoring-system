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
  limit 1;
$$;

