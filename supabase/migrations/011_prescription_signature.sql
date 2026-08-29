-- Migration 011: Digital signature + lock timestamp on prescriptions

-- 1. Add signed_by (doctor name at time of signing)
ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS signed_by TEXT;

-- 2. Add locked_at as a regular column (set on insert = prescribed_at + 1 hour)
--    GENERATED ALWAYS is not usable here because timestamptz + interval is not immutable in PG
ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- 3. Backfill locked_at for existing rows
UPDATE prescriptions
  SET locked_at = prescribed_at + INTERVAL '1 hour'
  WHERE locked_at IS NULL;

-- 4. Backfill signed_by from providers table for existing rows
UPDATE prescriptions p
  SET signed_by = (SELECT name FROM providers WHERE id = p.provider_id)
  WHERE p.signed_by IS NULL AND p.provider_id IS NOT NULL;
