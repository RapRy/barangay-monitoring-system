create table public.residents (
  id uuid primary key default gen_random_uuid(),

  household_id uuid not null
    references public.households(id)
    on delete cascade,

  first_name text not null,

  middle_name text,

  last_name text not null,

  birth_date date not null,

  sex text not null,

  relationship text not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);