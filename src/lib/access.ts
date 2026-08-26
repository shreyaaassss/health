/**
 * Access Validation Library
 *
 * Phase 1 completion criterion:
 * "The team should know exactly how the system will answer:
 *  'Can this provider access this specific record right now?'"
 *
 * All access checks go through this module.
 * The backend calls these — never the frontend alone.
 */

import { createClient } from '@/lib/supabase/server';
import type { AccessAction, AccessGrant, MedicalRecord, Provider, ProviderAccessSession } from '@/types';

// ─────────────────────────────────────────────
//  Core: Can provider access this record?
// ─────────────────────────────────────────────
export type AccessCheckResult =
  | { allowed: true; grant: AccessGrant; patient_id: string; provider_id: string }
  | { allowed: false; code: 'TOKEN_INVALID' | 'ACCESS_REVOKED' | 'ACCESS_EXPIRED' | 'ACCESS_DENIED' };

export async function canAccessRecord(
  token: string,
  recordId: string
): Promise<AccessCheckResult> {
  const supabase = await createClient();

  // Delegate to the DB function — single source of truth
  const { data, error } = await supabase
    .rpc('can_access_record', { p_token: token, p_record_id: recordId });

  if (error || !data) {
    return { allowed: false, code: 'TOKEN_INVALID' };
  }

  if (!data.allowed) {
    return { allowed: false, code: data.code };
  }

  // Fetch full grant for response
  const { data: grant } = await supabase
    .from('access_grants')
    .select('*')
    .eq('id', data.access_grant_id)
    .single();

  return {
    allowed: true,
    grant,
    patient_id: data.patient_id,
    provider_id: data.provider_id,
  };
}

// ─────────────────────────────────────────────
//  Validate token and return full session
//  (used by doctor portal on load)
// ─────────────────────────────────────────────
export async function validateTokenSession(token: string): Promise<
  | { valid: true; session: ProviderAccessSession }
  | { valid: false; code: string }
> {
  const supabase = await createClient();

  // 1. Resolve token → access grant
  const { data: tokenRow, error: tokenErr } = await supabase
    .from('access_tokens')
    .select('*, access_grants(*)')
    .eq('token', token)
    .single();

  if (tokenErr || !tokenRow) {
    return { valid: false, code: 'TOKEN_INVALID' };
  }

  const grant = tokenRow.access_grants as AccessGrant;

  // 2. Check revocation
  if (grant.status === 'REVOKED') {
    return { valid: false, code: 'ACCESS_REVOKED' };
  }

  // 3. Check expiry (lazy mark)
  if (new Date() > new Date(grant.expires_at)) {
    await supabase
      .from('access_grants')
      .update({ status: 'EXPIRED' })
      .eq('id', grant.id);
    return { valid: false, code: 'ACCESS_EXPIRED' };
  }

  // 4. Fetch provider
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('id', grant.provider_id)
    .single() as { data: Provider | null };

  // 5. Fetch authorized records
  const { data: grantRecords } = await supabase
    .from('access_grant_records')
    .select('medical_records(*)')
    .eq('access_grant_id', grant.id);

  const records = (grantRecords ?? [])
    .map((r: { medical_records: unknown }) => r.medical_records as MedicalRecord)
    .filter(Boolean);

  // 6. Fetch patient name
  const { data: patient } = await supabase
    .from('patients')
    .select('name')
    .eq('id', grant.patient_id)
    .single();

  return {
    valid: true,
    session: {
      grant,
      provider: provider!,
      patient_name: patient?.name ?? 'Patient',
      records,
      expires_at: grant.expires_at,
    },
  };
}

// ─────────────────────────────────────────────
//  Log an access action (audit trail)
// ─────────────────────────────────────────────
export async function logAccessAction(params: {
  patient_id: string;
  provider_id: string;
  access_grant_id: string;
  action: AccessAction;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();

  await supabase.from('access_logs').insert({
    patient_id: params.patient_id,
    provider_id: params.provider_id,
    access_grant_id: params.access_grant_id,
    action: params.action,
    metadata: params.metadata ?? null,
  });
}
