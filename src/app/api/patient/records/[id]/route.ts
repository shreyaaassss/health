import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse, MedicalRecord } from '@/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<MedicalRecord>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', id)
    .eq('patient_id', patientId)   // ensures patient can only see own records
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Record not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
