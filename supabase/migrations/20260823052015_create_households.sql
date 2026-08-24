create table public.households (
  id uuid primary key default gen_random_uuid(),

  household_no text not null unique,

  address text not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);
