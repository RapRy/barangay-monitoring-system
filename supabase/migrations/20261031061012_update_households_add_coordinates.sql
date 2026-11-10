alter table public.households
  add column latitude numeric(8, 6),
  add column longitude numeric(9, 6);

alter table public.households
  add constraint households_latitude_range
    check (latitude is null or latitude between -90 and 90),
  add constraint households_longitude_range
    check (longitude is null or longitude between -180 and 180),
  add constraint households_coordinates_paired
    check ((latitude is null) = (longitude is null));