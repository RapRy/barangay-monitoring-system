alter table public.profiles enable row level security;

alter table public.households enable row level security;

alter table public.residents enable row level security;

alter table public.roles enable row level security;

alter table public.permissions enable row level security;

alter table public.role_permissions enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

create policy "Authenticated users can view roles"
on public.roles
for select
to authenticated
using (true);

create policy "Authenticated users can view permissions"
on public.permissions
for select
to authenticated
using (true);

create policy "Authenticated users can view role permissions"
on public.role_permissions
for select
to authenticated
using (true);

create policy "Authenticated users can view households"
on public.households
for select
to authenticated
using (true);

create policy "Admin and staff can create households"
on public.households
for insert
to authenticated
with check (
  public.get_user_role() in ('admin', 'staff')
);

create policy "Admin and staff can update households"
on public.households
for update
to authenticated
using (
  public.get_user_role() in ('admin', 'staff')
)
with check (
  public.get_user_role() in ('admin', 'staff')
);

create policy "Only admins can delete households"
on public.households
for delete
to authenticated
using (
  public.get_user_role() = 'admin'
);

create policy "Authenticated users can view residents"
on public.residents
for select
to authenticated
using (true);

create policy "Admin and staff can create residents"
on public.residents
for insert
to authenticated
with check (
  public.get_user_role() in ('admin', 'staff')
);

create policy "Admin and staff can update residents"
on public.residents
for update
to authenticated
using (
  public.get_user_role() in ('admin', 'staff')
)
with check (
  public.get_user_role() in ('admin', 'staff')
);

create policy "Only admins can delete residents"
on public.residents
for delete
to authenticated
using (
  public.get_user_role() = 'admin'
);