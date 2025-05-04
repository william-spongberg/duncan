create table public.profiles (
  id uuid not null,
  username text null,
  full_name text null,
  avatar_url text null,
  updated_at timestamp with time zone null,
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint username_length check ((char_length(username) >= 3))
) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION extensions.moddatetime ('updated_at');