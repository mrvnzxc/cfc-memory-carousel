create extension if not exists "pgcrypto";

create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references folders(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  storage_key text not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists images_folder_id_idx on images(folder_id);
