import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export interface ActivePatientAccess {
  grant_id: string;
  token: string;
  patient_name: string;
  record_count: number;
  expires_at: string;
  created_at: string;
  record_titles: string[];
}

export async function GET(): Promise<NextResponse<ApiResponse<ActivePatientAccess[]>>> {
  const user = await getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: provider } = await supabase.from('providers').select('id').eq('user_id', user.id).single();
  if (!provider) return NextResponse.json({ success: false, error: 'Not a provider', code: 'UNAUTHORIZED' }, { status: 403 });

  // Fetch all active grants for this doctor + their tokens + patient info + records
  const { data, error } = await supabase
    .from('access_grants')
    .select(`
      id, expires_at, created_at,
      patients(name),
      access_tokens(token),
      access_grant_records(medical_records(title))
    `)
    .eq('provider_id', provider.id)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });

  const accesses: ActivePatientAccess[] = (data ?? []).map((row) => {
    const tokens = row.access_tokens as { token: string }[];
    const token = tokens?.[0]?.token ?? '';
    const titles = ((row.access_grant_records as unknown as { medical_records: { title: string } }[]) ?? [])
      .map((r) => r.medical_records?.title).filter(Boolean) as string[];

    return {
      grant_id: row.id,
      token,
      patient_name: (row.patients as unknown as { name: string })?.name ?? 'Patient',
      record_count: titles.length,
      expires_at: row.expires_at,
      created_at: row.created_at,
      record_titles: titles,
    };
  }).filter((a) => !!a.token); // only include grants that have a token

  return NextResponse.json({ success: true, data: accesses });
}
