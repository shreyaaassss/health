import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import { ACCESS_DURATION_MS } from '@/types';
import type { AccessDuration, AccessGrant, AccessGrantWithDetails, ApiResponse, MedicalRecord, Provider } from '@/types';

// ── GET: fetch all grants with provider + records joined ──
export async function GET(): Promise<NextResponse<ApiResponse<AccessGrantWithDetails[]>>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('access_grants')
    .select(`
      *,
      providers(*),
      access_grant_records(
        medical_records(*)
      )
    `)
    .eq('patient_id', DEMO.PATIENT_ID)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  const grants: AccessGrantWithDetails[] = (data ?? []).map((raw) => ({
    ...(raw as AccessGrant),
    provider: raw.providers as Provider,
    records: (raw.access_grant_records as { medical_records: MedicalRecord }[])
      .map((r) => r.medical_records)
      .filter(Boolean),
    token: null,
  }));

  return NextResponse.json({ success: true, data: grants });
}

interface CreateGrantBody {
  provider_id: string;
  record_ids: string[];
  duration: AccessDuration;
}

interface GrantResult {
  grant_id: string;
  token: string;
  expires_at: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<GrantResult>>> {
  let body: CreateGrantBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body', code: 'SERVER_ERROR' }, { status: 400 });
  }

  const { provider_id, record_ids, duration } = body;

  if (!provider_id || !record_ids?.length || !duration) {
    return NextResponse.json({ success: false, error: 'Missing required fields', code: 'SERVER_ERROR' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // ── 1. Calculate expires_at ───────────────────
  const ms = ACCESS_DURATION_MS[duration];
  const expires_at = ms
    ? new Date(Date.now() + ms).toISOString()
    : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(); // ~100 years = until revoked

  // ── 2. Create AccessGrant ──────────────────────
  const { data: grant, error: grantErr } = await supabase
    .from('access_grants')
    .insert({
      patient_id: DEMO.PATIENT_ID,
      provider_id,
      status: 'ACTIVE',
      expires_at,
    })
    .select()
    .single();

  if (grantErr || !grant) {
    return NextResponse.json({ success: false, error: grantErr?.message ?? 'Failed to create grant', code: 'SERVER_ERROR' }, { status: 500 });
  }

  // ── 3. Create AccessGrantRecords (bulk) ────────
  const grantRecords = record_ids.map((rid) => ({
    access_grant_id: grant.id,
    medical_record_id: rid,
  }));

  const { error: grErr } = await supabase.from('access_grant_records').insert(grantRecords);
  if (grErr) {
    // Rollback grant
    await supabase.from('access_grants').delete().eq('id', grant.id);
    return NextResponse.json({ success: false, error: grErr.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  // ── 4. Generate opaque access token ───────────
  const token = crypto.randomUUID();

  const { error: tokenErr } = await supabase.from('access_tokens').insert({
    access_grant_id: grant.id,
    token,
    expires_at,
  });

  if (tokenErr) {
    return NextResponse.json({ success: false, error: tokenErr.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  // ── 5. Audit log: ACCESS_GRANTED ──────────────
  await supabase.from('access_logs').insert({
    patient_id: DEMO.PATIENT_ID,
    provider_id,
    access_grant_id: grant.id,
    action: 'ACCESS_GRANTED',
    metadata: { record_count: record_ids.length, duration },
  });

  return NextResponse.json({
    success: true,
    data: { grant_id: grant.id, token, expires_at },
  });
}
