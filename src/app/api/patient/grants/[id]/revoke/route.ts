import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import type { ApiResponse } from '@/types';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ revoked_at: string }>>> {
  const { id } = await params;
  const supabase = createAdminClient();

  // ── 1. Verify grant belongs to demo patient and is ACTIVE ──
  const { data: grant, error: fetchErr } = await supabase
    .from('access_grants')
    .select('*')
    .eq('id', id)
    .eq('patient_id', DEMO.PATIENT_ID)
    .single();

  if (fetchErr || !grant) {
    return NextResponse.json({ success: false, error: 'Grant not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (grant.status !== 'ACTIVE') {
    return NextResponse.json(
      { success: false, error: `Grant is already ${grant.status}`, code: 'ACCESS_DENIED' },
      { status: 409 }
    );
  }

  const revoked_at = new Date().toISOString();

  // ── 2. Mark grant as REVOKED ───────────────────
  const { error: updateErr } = await supabase
    .from('access_grants')
    .update({ status: 'REVOKED', revoked_at })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json({ success: false, error: updateErr.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  // ── 3. Expire the access token immediately ─────
  // Setting expires_at to now ensures the DB-level check also fails
  // even if the status check were bypassed.
  await supabase
    .from('access_tokens')
    .update({ expires_at: revoked_at })
    .eq('access_grant_id', id);

  // ── 4. Audit log: ACCESS_REVOKED ──────────────
  await supabase.from('access_logs').insert({
    patient_id: DEMO.PATIENT_ID,
    provider_id: grant.provider_id,
    access_grant_id: id,
    action: 'ACCESS_REVOKED',
    metadata: { revoked_at },
  });

  return NextResponse.json({ success: true, data: { revoked_at } });
}
