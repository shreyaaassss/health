-- ═══════════════════════════════════════════════════════════════
--  Health Wallet — Initial Database Schema
--  Phase 1: All 7 data models from the implementation plan
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
--  1. patients
-- ─────────────────────────────────────────────
create table if not exists patients (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null unique,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
--  2. providers (doctors / hospitals)
-- ─────────────────────────────────────────────
create table if not exists providers (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  organization  text not null,
  specialty     text not null
);

-- ─────────────────────────────────────────────
--  3. medical_records
-- ─────────────────────────────────────────────
create type record_type as enum (
  'lab_report',
  'prescription',
  'imaging',
  'consultation',
  'vaccination',
  'discharge_summary'
);

create table if not exists medical_records (
  id             uuid primary key default uuid_generate_v4(),
  patient_id     uuid not null references patients(id) on delete cascade,
  title          text not null,
  type           record_type not null,
  provider_name  text not null,
  record_date    date not null,
  description    text not null default '',
  file_url       text,                        -- null for demo (structured data used)
  created_at     timestamptz not null default now()
);

create index idx_medical_records_patient on medical_records(patient_id);

-- ─────────────────────────────────────────────
--  4. access_grants
-- ─────────────────────────────────────────────
create type access_grant_status as enum (
  'ACTIVE',
  'REVOKED',
  'EXPIRED'
);

create table if not exists access_grants (
  id           uuid primary key default uuid_generate_v4(),
  patient_id   uuid not null references patients(id) on delete cascade,
  provider_id  uuid not null references providers(id) on delete cascade,
  status       access_grant_status not null default 'ACTIVE',
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now(),
  revoked_at   timestamptz
);

create index idx_access_grants_patient    on access_grants(patient_id);
create index idx_access_grants_provider   on access_grants(provider_id);
create index idx_access_grants_status     on access_grants(status);

-- ─────────────────────────────────────────────
--  5. access_grant_records  (join: grant ↔ record)
-- ─────────────────────────────────────────────
create table if not exists access_grant_records (
  id                uuid primary key default uuid_generate_v4(),
  access_grant_id   uuid not null references access_grants(id) on delete cascade,
  medical_record_id uuid not null references medical_records(id) on delete cascade,
  unique(access_grant_id, medical_record_id)
);

create index idx_agr_grant  on access_grant_records(access_grant_id);
create index idx_agr_record on access_grant_records(medical_record_id);

-- ─────────────────────────────────────────────
--  6. access_tokens  (the opaque QR / link token)
-- ─────────────────────────────────────────────
create table if not exists access_tokens (
  id               uuid primary key default uuid_generate_v4(),
  access_grant_id  uuid not null references access_grants(id) on delete cascade,
  token            text not null unique,    -- opaque UUID, no medical data
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null
);

create index idx_access_tokens_token on access_tokens(token);
create index idx_access_tokens_grant on access_tokens(access_grant_id);

-- ─────────────────────────────────────────────
--  7. access_logs  (audit trail)
-- ─────────────────────────────────────────────
create type access_action as enum (
  'ACCESS_GRANTED',
  'ACCESS_SESSION_OPENED',
  'RECORD_VIEWED',
  'ACCESS_REVOKED',
  'ACCESS_EXPIRED',
  'ACCESS_DENIED'
);

create table if not exists access_logs (
  id               uuid primary key default uuid_generate_v4(),
  patient_id       uuid not null references patients(id) on delete cascade,
  provider_id      uuid not null references providers(id) on delete cascade,
  access_grant_id  uuid not null references access_grants(id) on delete cascade,
  action           access_action not null,
  metadata         jsonb,                  -- e.g. { "record_id": "..." }
  timestamp        timestamptz not null default now()
);

create index idx_access_logs_patient on access_logs(patient_id);
create index idx_access_logs_grant   on access_logs(access_grant_id);
create index idx_access_logs_action  on access_logs(action);

-- ═══════════════════════════════════════════════════════════════
--  CORE ACCESS VALIDATION FUNCTION
--  Answers: "Can this provider access this specific record right now?"
--  Called on every provider record request.
-- ═══════════════════════════════════════════════════════════════
create or replace function can_access_record(
  p_token       text,
  p_record_id   uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_token       record;
  v_grant       record;
  v_record_auth record;
begin
  -- 1. Token must exist
  select * into v_token
  from access_tokens
  where token = p_token;

  if not found then
    return jsonb_build_object('allowed', false, 'code', 'TOKEN_INVALID');
  end if;

  -- 2. Fetch the linked access grant
  select * into v_grant
  from access_grants
  where id = v_token.access_grant_id;

  -- 3. Check revocation
  if v_grant.status = 'REVOKED' then
    return jsonb_build_object('allowed', false, 'code', 'ACCESS_REVOKED');
  end if;

  -- 4. Check expiry (lazy: mark as expired on first check)
  if now() > v_grant.expires_at then
    update access_grants set status = 'EXPIRED' where id = v_grant.id;
    return jsonb_build_object('allowed', false, 'code', 'ACCESS_EXPIRED');
  end if;

  -- 5. Record must be in the grant
  select * into v_record_auth
  from access_grant_records
  where access_grant_id = v_grant.id
    and medical_record_id = p_record_id;

  if not found then
    return jsonb_build_object('allowed', false, 'code', 'ACCESS_DENIED');
  end if;

  -- All checks passed
  return jsonb_build_object(
    'allowed',          true,
    'access_grant_id',  v_grant.id::text,
    'patient_id',       v_grant.patient_id::text,
    'provider_id',      v_grant.provider_id::text,
    'expires_at',       v_grant.expires_at
  );
end;
$$;

-- ═══════════════════════════════════════════════════════════════
--  SEED DATA — Demo patient, providers, and medical records
-- ═══════════════════════════════════════════════════════════════

-- Demo patient
insert into patients (id, name, email) values
  ('00000000-0000-0000-0000-000000000001', 'Priya Sharma', 'priya@healthwallet.demo')
on conflict do nothing;

-- Demo providers
insert into providers (id, name, organization, specialty) values
  ('00000000-0000-0000-0001-000000000001', 'Dr. Arjun Sharma', 'Bangalore Health Clinic', 'General Physician'),
  ('00000000-0000-0000-0001-000000000002', 'Dr. Meena Mehta', 'Pune City Hospital', 'Internal Medicine'),
  ('00000000-0000-0000-0001-000000000003', 'City Diagnostics', 'City Diagnostics Center', 'Radiology')
on conflict do nothing;

-- Demo medical records (5 sample records from the plan)
insert into medical_records (id, patient_id, title, type, provider_name, record_date, description) values
  (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Blood Test Report',
    'lab_report',
    'City Diagnostics',
    '2026-03-15',
    'Complete blood count and metabolic panel. Vitamin D levels below reference range (18 ng/mL, normal: 30–100 ng/mL). All other parameters within normal range.'
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'MRI Scan — Lumbar Spine',
    'imaging',
    'Pune Diagnostics',
    '2026-01-10',
    'MRI of lumbar spine (L4–L5). Mild disc bulge noted at L4-L5, no significant neural compression. No fractures or lesions detected.'
  ),
  (
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Prescription — Vitamin D & Calcium',
    'prescription',
    'Dr. Meena Mehta',
    '2026-02-20',
    'Vitamin D3 60,000 IU weekly for 8 weeks. Calcium Carbonate 500mg twice daily. Review after 3 months.'
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Vaccination Record',
    'vaccination',
    'Pune City Hospital',
    '2025-09-05',
    'COVID-19 booster administered (Covishield). Influenza vaccine administered. All vaccinations up to date as of September 2025.'
  ),
  (
    '00000000-0000-0000-0002-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Consultation Notes — General Checkup',
    'consultation',
    'Dr. Meena Mehta',
    '2026-02-20',
    'Patient presented with fatigue and mild back discomfort. History of recurring stomach discomfort over past 6 months. No allergies recorded. Referred for blood work and MRI. Follow-up in 3 months.'
  )
on conflict do nothing;
