import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import { ACCESS_DURATION_MS } from '@/types';
import type { AccessDuration, AccessGrant, AccessGrantWithDetails, ApiResponse, MedicalRecord, Provider } from '@/types';

// ── GET: fetch all grants with provider + records joined ──
export async function GET(): Promise<NextResponse<ApiResponse<AccessGrantWithDetails[]>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('access_grants')
    .select(`*, providers(*), access_grant_records(medical_records(*))`)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  const grants: AccessGrantWithDetails[] = (data ?? []).map((raw) => ({
    ...(raw as AccessGrant),
    provider: raw.providers as Provider,
    records: (raw.access_grant_records as { medical_records: MedicalRecord }[])
      .map((r) => r.medical_records).filter(Boolean),
    token: null,
  }));

  return NextResponse.json({ success: true, data: grants });
}

interface CreateGrantBody {
  record_ids: string[];
  duration: AccessDuration;
  provider_id?: string; // optional — null means any registered doctor can scan
}

interface GrantResult {
  grant_id: string;
  token: string;
  expires_at: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<GrantResult>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }

  let body: CreateGrantBody;
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, error: 'Invalid request body', code: 'SERVER_ERROR' }, { status: 400 }); }

  const { record_ids, duration, provider_id } = body;

  if (!record_ids?.length || !duration) {
    return NextResponse.json({ success: false, error: 'Missing required fields', code: 'SERVER_ERROR' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const ms = ACCESS_DURATION_MS[duration];
  const expires_at = ms
    ? new Date(Date.now() + ms).toISOString()
    : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();

  const { data: grant, error: grantErr } = await supabase
    .from('access_grants')
    .insert({ patient_id: patientId, provider_id: provider_id ?? null, status: 'ACTIVE', expires_at })
    .select().single();

  if (grantErr || !grant) {
    return NextResponse.json({ success: false, error: grantErr?.message ?? 'Failed to create grant', code: 'SERVER_ERROR' }, { status: 500 });
  }

  const { error: grErr } = await supabase.from('access_grant_records')
    .insert(record_ids.map((rid) => ({ access_grant_id: grant.id, medical_record_id: rid })));
  if (grErr) {
    await supabase.from('access_grants').delete().eq('id', grant.id);
    return NextResponse.json({ success: false, error: grErr.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  const token = crypto.randomUUID();
  const { error: tokenErr } = await supabase.from('access_tokens')
    .insert({ access_grant_id: grant.id, token, expires_at });
  if (tokenErr) {
    return NextResponse.json({ success: false, error: tokenErr.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  await supabase.from('access_logs').insert({
    patient_id: patientId,
    provider_id: provider_id ?? null,
    access_grant_id: grant.id,
    action: 'ACCESS_GRANTED',
    metadata: { record_count: record_ids.length, duration },
  });

  return NextResponse.json({ success: true, data: { grant_id: grant.id, token, expires_at } });
}
