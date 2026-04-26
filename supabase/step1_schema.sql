-- ===============================================
-- ViralVantage-AI: Phase 1 Supabase SQL
-- Run this entire script in Supabase SQL Editor.
-- ===============================================

-- Extension for UUID generation (safe if already enabled)
create extension if not exists pgcrypto;

-- 1) AI audit logs table
create table if not exists public.ai_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  input_type text not null check (input_type in ('text', 'image', 'video', 'audio', 'mixed')),
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  model_provider text not null default 'google',
  model_name text not null default 'gemini-1.5-pro',
  model_version text,
  request_id text,
  status text not null default 'completed' check (status in ('queued', 'processing', 'completed', 'failed', 'timeout')),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  token_usage_input integer check (token_usage_input is null or token_usage_input >= 0),
  token_usage_output integer check (token_usage_output is null or token_usage_output >= 0),
  error_message text,
  source_file_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_ai_audit_logs_user_id_created_at
  on public.ai_audit_logs (user_id, created_at desc);

create index if not exists idx_ai_audit_logs_status_created_at
  on public.ai_audit_logs (status, created_at desc);

create index if not exists idx_ai_audit_logs_model_name_created_at
  on public.ai_audit_logs (model_name, created_at desc);

-- Auto-maintain updated_at
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_ai_audit_logs_set_updated_at on public.ai_audit_logs;

create trigger trg_ai_audit_logs_set_updated_at
before update on public.ai_audit_logs
for each row
execute function public.set_current_timestamp_updated_at();

-- Enable RLS
alter table public.ai_audit_logs enable row level security;

-- Users can read their own logs
create policy if not exists "ai_audit_logs_select_own"
on public.ai_audit_logs
for select
using (auth.uid() = user_id);

-- Users can insert logs only for themselves
create policy if not exists "ai_audit_logs_insert_own"
on public.ai_audit_logs
for insert
with check (auth.uid() = user_id);

-- Users can update only their own rows
create policy if not exists "ai_audit_logs_update_own"
on public.ai_audit_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can delete only their own rows
create policy if not exists "ai_audit_logs_delete_own"
on public.ai_audit_logs
for delete
using (auth.uid() = user_id);

-- 2) Storage bucket for creator uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creator_content',
  'creator_content',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Enable RLS on objects table (usually already enabled in Supabase)
alter table storage.objects enable row level security;

-- Allow authenticated users to upload only inside their own folder:
-- e.g. creator_content/<auth.uid()>/filename.ext
create policy if not exists "creator_content_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'creator_content'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read only their own files
create policy if not exists "creator_content_select_own_folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'creator_content'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update only their own files
create policy if not exists "creator_content_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'creator_content'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'creator_content'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete only their own files
create policy if not exists "creator_content_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'creator_content'
  and (storage.foldername(name))[1] = auth.uid()::text
);
