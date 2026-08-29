import { NextResponse } from 'next/server';
import { canAccessRecord, logAccessAction } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ApiError, ApiResponse, MedicalRecord } from '@/types';

interface ProviderRecordResponse {
  record: MedicalRecord;
  signed_url: null; // Doctors cannot download files — view-only access
}

// Re-validated on every single request — makes revocation instant.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string; recordId: string }> }
): Promise<NextResponse<ApiResponse<ProviderRecordResponse>>> {
  const { token, recordId } = await params;

  const check = await canAccessRecord(token, recordId);

  if (!check.allowed) {
    const codeMap: Record<string, ApiError['code']> = {
      TOKEN_INVALID:  'TOKEN_INVALID',
      ACCESS_REVOKED: 'ACCESS_REVOKED',
      ACCESS_EXPIRED: 'ACCESS_EXPIRED',
      ACCESS_DENIED:  'ACCESS_DENIED',
    };
    return NextResponse.json(
      { success: false, error: check.code, code: codeMap[check.code] ?? 'ACCESS_DENIED' },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { data: record, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', recordId)
    .single();

  if (error || !record) {
    return NextResponse.json({ success: false, error: 'Record not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  // signed_url is intentionally null — doctors get VIEW access only, no download
  await logAccessAction({
    patient_id: check.grant.patient_id,
    provider_id: check.grant.provider_id || null,
    access_grant_id: check.grant.id,
    action: 'RECORD_VIEWED',
    metadata: { record_id: recordId, record_title: record.title },
  });

  return NextResponse.json({ success: true, data: { record: record as MedicalRecord, signed_url: null } });
}
