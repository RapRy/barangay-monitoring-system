create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (public.get_user_role() = 'admin');

create policy "Admins can update user activation"
on public.profiles
for update
to authenticated
using (public.get_user_role() = 'admin')
with check (public.get_user_role() = 'admin');