create table public.friends (
  user_id_1 uuid not null,
  user_id_2 uuid not null,
  status text null,
  requested_at timestamp with time zone not null default timezone ('utc'::text, now()),
  accepted_at timestamp with time zone null,
  constraint friends_pkey primary key (user_id_1, user_id_2),
  constraint friends_user_id_1_fkey foreign KEY (user_id_1) references auth.users (id) on delete CASCADE,
  constraint friends_user_id_2_fkey foreign KEY (user_id_2) references auth.users (id) on delete CASCADE,
  constraint check_different_users check ((user_id_1 <> user_id_2)),
  constraint friends_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'accepted'::text,
          'blocked'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

