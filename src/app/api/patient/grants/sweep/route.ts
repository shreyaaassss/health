import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse } from '@/types';

// Called before rendering the access page.
// Marks any ACTIVE grants whose expires_at has passed as EXPIRED,
// then logs ACCESS_EXPIRED for each one.
export async function POST(): Promise<NextResponse<ApiResponse<{ expired_count: number }>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // 1. Find all ACTIVE grants that should now be EXPIRED
  const { data: expiredGrants } = await supabase
    .from('access_grants')
    .select('id, provider_id')
    .eq('patient_id', patientId)
    .eq('status', 'ACTIVE')
    .lt('expires_at', now);

  if (!expiredGrants?.length) {
    return NextResponse.json({ success: true, data: { expired_count: 0 } });
  }

  const ids = expiredGrants.map((g) => g.id);

  // 2. Mark them EXPIRED
  await supabase
    .from('access_grants')
    .update({ status: 'EXPIRED' })
    .in('id', ids);

  // 3. Also expire their tokens so the DB-level check is consistent
  await supabase
    .from('access_tokens')
    .update({ expires_at: now })
    .in('access_grant_id', ids);

  // 4. Audit log one entry per expired grant
  const logs = expiredGrants.map((g) => ({
    patient_id: patientId,
    provider_id: g.provider_id,
    access_grant_id: g.id,
    action: 'ACCESS_EXPIRED' as const,
    metadata: { expired_at: now },
  }));
  await supabase.from('access_logs').insert(logs);

  return NextResponse.json({ success: true, data: { expired_count: ids.length } });
}
