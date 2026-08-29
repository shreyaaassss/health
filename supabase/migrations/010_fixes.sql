-- ═══════════════════════════════════════════════════════════════
--  Migration 010: Appointment completed status + nullable provider
-- ═══════════════════════════════════════════════════════════════

-- 1. Add 'completed' to appointment status enum
ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments
  ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('pending','confirmed','cancelled','completed'));

-- 2. Make provider_id nullable in access_grants
--    (any registered doctor can now scan the QR — no pre-selection required)
ALTER TABLE access_grants
  ALTER COLUMN provider_id DROP NOT NULL;

-- 3. Make provider_id nullable in access_logs
--    (grants with null provider_id can still be logged)
ALTER TABLE access_logs
  ALTER COLUMN provider_id DROP NOT NULL;

-- 4. Update can_access_record function to handle null provider_id
CREATE OR REPLACE FUNCTION can_access_record(
  p_token     text,
  p_record_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token       record;
  v_grant       record;
  v_record_auth record;
BEGIN
  SELECT * INTO v_token FROM access_tokens WHERE token = p_token;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'TOKEN_INVALID');
  END IF;

  SELECT * INTO v_grant FROM access_grants WHERE id = v_token.access_grant_id;

  IF v_grant.status = 'REVOKED' THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'ACCESS_REVOKED');
  END IF;

  IF now() > v_grant.expires_at THEN
    UPDATE access_grants SET status = 'EXPIRED' WHERE id = v_grant.id;
    RETURN jsonb_build_object('allowed', false, 'code', 'ACCESS_EXPIRED');
  END IF;

  SELECT * INTO v_record_auth
  FROM access_grant_records
  WHERE access_grant_id = v_grant.id AND medical_record_id = p_record_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'code', 'ACCESS_DENIED');
  END IF;

  RETURN jsonb_build_object(
    'allowed',          true,
    'access_grant_id',  v_grant.id::text,
    'patient_id',       v_grant.patient_id::text,
    'provider_id',      COALESCE(v_grant.provider_id::text, ''),
    'expires_at',       v_grant.expires_at
  );
END;
$$;
