-- ═══════════════════════════════════════════════════════════════
--  Migration 007: Appointment Booking System (two-way)
-- ═══════════════════════════════════════════════════════════════

create table if not exists appointments (
  id               uuid primary key default uuid_generate_v4(),
  patient_id       uuid not null references patients(id) on delete cascade,
  provider_id      uuid not null references providers(id) on delete cascade,
  reason           text not null,
  preferred_date   date,
  preferred_time   text,                  -- e.g. "10:00 AM"
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','cancelled')),
  confirmed_date   date,
  confirmed_time   text,
  doctor_notes     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_appointments_patient  on appointments(patient_id);
create index idx_appointments_provider on appointments(provider_id);
create index idx_appointments_status   on appointments(status);

-- RLS
alter table appointments enable row level security;

-- Patient sees their own
create policy "appointments_patient" on appointments
  for all using (
    patient_id in (select id from patients where user_id = auth.uid())
  );

-- Providers see appointments assigned to them
create policy "appointments_provider" on appointments
  for all using (
    provider_id in (select id from providers where user_id = auth.uid())
  );
