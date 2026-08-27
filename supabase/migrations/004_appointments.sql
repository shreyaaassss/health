-- ═══════════════════════════════════════════════════════════════
--  Migration 004: Patient profile extension + Appointment Records
-- ═══════════════════════════════════════════════════════════════

-- ── Extend patients with profile fields needed by the Appointment Form ──
alter table patients
  add column if not exists phone             text,
  add column if not exists date_of_birth     date,
  add column if not exists emergency_contact text,
  add column if not exists allergies         text,
  add column if not exists current_medications text;

-- Update demo patient with placeholder profile data so autofill works on first run
update patients set
  phone             = '+91 98765 43210',
  date_of_birth     = '1995-06-14',
  emergency_contact = 'Rajan Sharma (Father) · +91 98001 11222',
  allergies         = null,
  current_medications = null
where id = '00000000-0000-0000-0000-000000000001';

-- ── appointment_records table ─────────────────────────────────
create table if not exists appointment_records (
  id                   uuid primary key default uuid_generate_v4(),
  patient_id           uuid not null references patients(id) on delete cascade,

  -- Source: how the appointment was initiated
  source_type          text not null check (source_type in ('qr_scan', 'manual_entry')),
  source_raw_code      text,             -- whatever code was scanned/entered
  source_hospital_id   text,             -- reserved for future hospital integration
  source_hospital_name text,             -- reserved for future hospital integration

  -- The form fields (stored as jsonb for flexibility)
  form_data            jsonb not null,

  status               text not null default 'submitted'
                         check (status in ('draft', 'submitted')),

  created_at           timestamptz not null default now(),
  submitted_at         timestamptz,

  -- Reserved for future doctor-side prescription phase.
  -- Left null/empty now; doctor phase will populate without schema changes.
  prescription         jsonb
);

create index idx_appointment_records_patient on appointment_records(patient_id);
create index idx_appointment_records_status  on appointment_records(status);
