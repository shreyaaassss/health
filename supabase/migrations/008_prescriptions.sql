-- ═══════════════════════════════════════════════════════════════
--  Migration 008: Prescriptions table
-- ═══════════════════════════════════════════════════════════════

create table if not exists prescriptions (
  id               uuid primary key default uuid_generate_v4(),
  patient_id       uuid not null references patients(id) on delete cascade,
  provider_id      uuid not null references providers(id) on delete cascade,
  access_grant_id  uuid references access_grants(id) on delete set null,
  medications      jsonb not null default '[]',
  instructions     text,
  follow_up_date   date,
  prescribed_at    timestamptz not null default now()
);

create index idx_prescriptions_patient  on prescriptions(patient_id);
create index idx_prescriptions_provider on prescriptions(provider_id);

-- RLS
alter table prescriptions enable row level security;

-- Patient sees their own prescriptions
create policy "prescriptions_patient" on prescriptions
  for select using (
    patient_id in (select id from patients where user_id = auth.uid())
  );

-- Add cancel status to appointments
alter table appointments
  add column if not exists cancelled_by text check (cancelled_by in ('patient','doctor'));
