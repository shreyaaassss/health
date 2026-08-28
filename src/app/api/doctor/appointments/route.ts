import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export interface DoctorAppointment {
  id: string;
  patient_name: string;
  patient_id: string;
  reason: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmed_date: string | null;
  confirmed_time: string | null;
  doctor_notes: string | null;
  created_at: string;
}

export async function GET(): Promise<NextResponse<ApiResponse<DoctorAppointment[]>>> {
  const user = await getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();

  const { data: provider } = await supabase.from('providers').select('id').eq('user_id', user.id).single();
  if (!provider) return NextResponse.json({ success: false, error: 'Not a provider', code: 'UNAUTHORIZED' }, { status: 403 });

  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });

  const appointments: DoctorAppointment[] = (data ?? []).map((row) => ({
    id: row.id,
    patient_id: row.patient_id,
    patient_name: (row.patients as { name: string })?.name ?? 'Patient',
    reason: row.reason,
    preferred_date: row.preferred_date,
    preferred_time: row.preferred_time,
    status: row.status,
    confirmed_date: row.confirmed_date,
    confirmed_time: row.confirmed_time,
    doctor_notes: row.doctor_notes,
    created_at: row.created_at,
  }));

  return NextResponse.json({ success: true, data: appointments });
}
