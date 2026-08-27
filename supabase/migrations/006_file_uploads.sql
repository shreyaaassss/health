-- ═══════════════════════════════════════════════════════════════
--  Migration 006: File upload columns + Supabase Storage setup
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Add file metadata columns to medical_records ───────────
-- file_url already exists (was null in demo); now repurposed as storage path
alter table medical_records
  add column if not exists file_name text,         -- original filename
  add column if not exists file_size integer,       -- bytes
  add column if not exists file_type text;          -- 'pdf' | 'docx' | 'image'

-- ── 2. Create private storage bucket ──────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medical-records',
  'medical-records',
  false,
  10485760,   -- 10 MB limit per file
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
)
on conflict (id) do nothing;

-- ── 3. Storage RLS policies ────────────────────────────────────
-- Patient can upload/read/delete only within their own folder
-- Storage path convention: {auth_user_id}/{random_uuid}.{ext}

drop policy if exists "patient_storage_insert" on storage.objects;
drop policy if exists "patient_storage_select" on storage.objects;
drop policy if exists "patient_storage_delete" on storage.objects;

create policy "patient_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'medical-records'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "patient_storage_select" on storage.objects
  for select using (
    bucket_id = 'medical-records'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "patient_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'medical-records'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
