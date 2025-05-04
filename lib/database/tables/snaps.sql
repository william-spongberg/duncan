create table public.snaps (
  id uuid not null default gen_random_uuid (),
  group_id uuid not null,
  uploader_user_id uuid null,
  storage_object_path text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint snaps_pkey primary key (id),
  constraint snaps_storage_object_path_key unique (storage_object_path),
  constraint snaps_group_id_fkey foreign KEY (group_id) references groups (id) on delete CASCADE,
  constraint snaps_uploader_user_id_fkey foreign KEY (uploader_user_id) references auth.users (id) on delete set null
) TABLESPACE pg_default;

create policy "Allow group members read access to snaps"
  on storage.objects for select
  using (
    bucket_id = 'snaps' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from snaps
      join group_members on snaps.group_id = group_members.group_id
      where group_members.user_id = auth.uid()
        and snaps.storage_object_path = storage.objects.name
    )
  );

create policy "Allow group members insert access to snaps"
  on storage.objects for insert
  with check (
    bucket_id = 'snaps' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from group_members
      where group_members.group_id = (string_to_array(storage.objects.name, '/'))[1]::uuid
        and group_members.user_id = auth.uid()
    )
  );

create policy "Allow uploaders to delete their snaps"
  on storage.objects for delete
  using (
    bucket_id = 'snaps' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from snaps
      where snaps.uploader_user_id = auth.uid()
        and snaps.storage_object_path = storage.objects.name
    )
  );