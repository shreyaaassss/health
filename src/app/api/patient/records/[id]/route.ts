import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import type { ApiResponse, MedicalRecord } from '@/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<MedicalRecord>>> {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', id)
    .eq('patient_id', DEMO.PATIENT_ID)   // ensures patient can only see own records
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Record not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
