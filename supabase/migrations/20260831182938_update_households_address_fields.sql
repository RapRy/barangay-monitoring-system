-- Rename household_no to household_code
alter table public.households
rename column household_no to household_code;

-- Add new location fields as nullable first
alter table public.households
add column purok text,
add column sector text,
add column barangay text,
add column municipality text,
add column province text,
add column postal_code text;