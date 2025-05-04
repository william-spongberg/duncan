create table public.group_members (
  group_id uuid not null,
  user_id uuid not null,
  joined_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint group_members_pkey primary key (group_id, user_id),
  constraint group_members_group_id_fkey foreign KEY (group_id) references groups (id) on delete CASCADE,
  constraint group_members_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;