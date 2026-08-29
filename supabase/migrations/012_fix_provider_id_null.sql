-- Fix can_access_record: return NULL not '' when provider_id is null
-- Empty string was being passed as UUID FK → insert failed → doctor couldn't view records

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

  -- Return null (not '') for provider_id when grant has no specific provider
  RETURN jsonb_build_object(
    'allowed',          true,
    'access_grant_id',  v_grant.id::text,
    'patient_id',       v_grant.patient_id::text,
    'provider_id',      v_grant.provider_id::text,  -- null when no provider
    'expires_at',       v_grant.expires_at
  );
END;
$$;
