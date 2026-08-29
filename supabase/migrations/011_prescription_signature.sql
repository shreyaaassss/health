-- Migration 011: Digital signature + lock timestamp on prescriptions

-- 1. Add signed_by (doctor name at time of signing)
ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS signed_by TEXT;

-- 2. Add locked_at (prescribed_at + 1 hour) — after this, prescription is immutable
ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ
  GENERATED ALWAYS AS (prescribed_at + INTERVAL '1 hour') STORED;

-- 3. Backfill signed_by from providers table for existing rows
UPDATE prescriptions p
  SET signed_by = (SELECT name FROM providers WHERE id = p.provider_id)
  WHERE p.signed_by IS NULL AND p.provider_id IS NOT NULL;
