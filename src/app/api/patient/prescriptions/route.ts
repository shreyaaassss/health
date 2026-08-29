import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export interface PatientPrescription {
  id: string;
  provider_name: string;
  provider_specialty: string;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  instructions: string | null;
  follow_up_date: string | null;
  prescribed_at: string;
  signed_by: string | null;
  locked_at: string | null;
}

export async function GET(): Promise<NextResponse<ApiResponse<PatientPrescription[]>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, providers(name, specialty)')
    .eq('patient_id', patientId)
    .order('prescribed_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });

  const prescriptions: PatientPrescription[] = (data ?? []).map((row) => ({
    id: row.id,
    provider_name: (row.providers as { name: string; specialty: string })?.name ?? 'Doctor',
    provider_specialty: (row.providers as { name: string; specialty: string })?.specialty ?? '',
    medications: row.medications ?? [],
    instructions: row.instructions,
    follow_up_date: row.follow_up_date,
    prescribed_at: row.prescribed_at,
    signed_by: row.signed_by ?? null,
    locked_at: row.locked_at ?? null,
  }));

  return NextResponse.json({ success: true, data: prescriptions });
}
