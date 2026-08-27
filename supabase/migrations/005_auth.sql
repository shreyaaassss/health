-- ═══════════════════════════════════════════════════════════════
--  Migration 005: Supabase Auth integration
--  Links patients and providers to auth.users.
--  Enables RLS on all patient-data tables.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Add user_id to patients (FK → auth.users) ─────────────
alter table patients
  add column if not exists user_id uuid unique references auth.users(id) on delete cascade;

-- ── 2. Add user_id to providers (for doctor login) ───────────
alter table providers
  add column if not exists user_id uuid unique references auth.users(id) on delete set null;

-- ── 3. Enable RLS on all patient-data tables ──────────────────
alter table patients             enable row level security;
alter table medical_records      enable row level security;
alter table access_grants        enable row level security;
alter table access_grant_records enable row level security;
alter table access_tokens        enable row level security;
alter table access_logs          enable row level security;
alter table appointment_records  enable row level security;
alter table providers            enable row level security;

-- ── 4. Drop any old policies that might conflict ──────────────
drop policy if exists "patients_own"          on patients;
drop policy if exists "records_own"           on medical_records;
drop policy if exists "grants_own"            on access_grants;
drop policy if exists "grant_records_own"     on access_grant_records;
drop policy if exists "tokens_own"            on access_tokens;
drop policy if exists "logs_own"              on access_logs;
drop policy if exists "appointments_own"      on appointment_records;
drop policy if exists "providers_readable"    on providers;

-- ── 5. RLS policies ───────────────────────────────────────────
-- All API routes use the service-role client (bypasses RLS).
-- These policies protect direct DB access from the browser client.

-- Patients: can only see/edit own row
create policy "patients_own" on patients
  for all using (auth.uid() = user_id);

-- Medical records: patient sees only their own
create policy "records_own" on medical_records
  for all using (
    patient_id in (select id from patients where user_id = auth.uid())
  );

-- Access grants: patient sees only their own
create policy "grants_own" on access_grants
  for all using (
    patient_id in (select id from patients where user_id = auth.uid())
  );

-- Access grant records: patient sees only their own (via grant)
create policy "grant_records_own" on access_grant_records
  for all using (
    access_grant_id in (
      select id from access_grants
      where patient_id in (select id from patients where user_id = auth.uid())
    )
  );

-- Access tokens: patient sees only their own (via grant)
create policy "tokens_own" on access_tokens
  for all using (
    access_grant_id in (
      select id from access_grants
      where patient_id in (select id from patients where user_id = auth.uid())
    )
  );

-- Access logs: patient sees only their own
create policy "logs_own" on access_logs
  for all using (
    patient_id in (select id from patients where user_id = auth.uid())
  );

-- Appointment records: patient sees only their own
create policy "appointments_own" on appointment_records
  for all using (
    patient_id in (select id from patients where user_id = auth.uid())
  );

-- Providers: publicly readable (needed for share wizard provider list)
create policy "providers_readable" on providers
  for select using (true);

-- ── 6. Update can_access_record to work with RLS ─────────────
-- The function is security definer so it runs as the function owner
-- (postgres/service role) and bypasses RLS — no change needed.

-- ── 7. Update demo patient to have a placeholder user_id ─────
-- This keeps existing demo data valid until you set up real auth users.
-- After creating a real auth user for the demo patient, run:
-- UPDATE patients SET user_id = '<auth-user-uuid>' WHERE id = '00000000-0000-0000-0000-000000000001';
