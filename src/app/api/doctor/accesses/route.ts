import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export interface RecentAccess {
  grant_id: string;
  patient_name: string;
  status: string;
  record_titles: string[];
  created_at: string;
}

export async function GET(): Promise<NextResponse<ApiResponse<RecentAccess[]>>> {
  const user = await getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: provider } = await supabase.from('providers').select('id').eq('user_id', user.id).single();
  if (!provider) return NextResponse.json({ success: false, error: 'Not a provider', code: 'UNAUTHORIZED' }, { status: 403 });

  const { data, error } = await supabase
    .from('access_grants')
    .select('id, status, created_at, patients(name), access_grant_records(medical_records(title))')
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });

  const accesses: RecentAccess[] = (data ?? []).map((row) => ({
    grant_id: row.id,
    patient_name: (row.patients as unknown as { name: string })?.name ?? 'Patient',
    status: row.status,
    record_titles: ((row.access_grant_records as unknown as { medical_records: { title: string } }[]) ?? [])
      .map((r) => r.medical_records?.title)
      .filter((t): t is string => !!t),
    created_at: row.created_at,
  }));

  return NextResponse.json({ success: true, data: accesses });
}
