import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse, MedicalRecord } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<MedicalRecord[]>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('record_date', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}
