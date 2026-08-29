import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { AccessGrant, AccessLog, ApiResponse, MedicalRecord, Provider } from '@/types';

export interface HistoryEntry {
  grant: AccessGrant;
  provider: Provider;
  records: MedicalRecord[];
  logs: AccessLog[];
}

export async function GET(): Promise<NextResponse<ApiResponse<HistoryEntry[]>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('access_grants')
    .select(`
      *,
      providers(*),
      access_grant_records( medical_records(*) ),
      access_logs( * )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  const entries: HistoryEntry[] = (data ?? []).map((raw) => ({
    grant: {
      id: raw.id,
      patient_id: raw.patient_id,
      provider_id: raw.provider_id,
      status: raw.status,
      expires_at: raw.expires_at,
      created_at: raw.created_at,
      revoked_at: raw.revoked_at,
    } as AccessGrant,
    provider: (raw.providers as Provider) ?? { id: '', name: 'Doctor', organization: '', specialty: '' },
    records: (raw.access_grant_records as { medical_records: MedicalRecord }[])
      .map((r) => r.medical_records)
      .filter(Boolean),
    logs: ((raw.access_logs as AccessLog[]) ?? []).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
  }));

  return NextResponse.json({ success: true, data: entries });
}
