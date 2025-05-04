create table public.subscriptions (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists subscriptions_user_endpoint_idx on public.subscriptions using btree (user_id, endpoint) TABLESPACE pg_default;

