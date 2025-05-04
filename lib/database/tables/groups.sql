create table public.groups (
  id uuid not null default gen_random_uuid (),
  name text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  created_by uuid null,
  constraint groups_pkey primary key (id),
  constraint groups_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null
) TABLESPACE pg_default;