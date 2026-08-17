create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text not null,

  role_id uuid not null references public.roles(id),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);