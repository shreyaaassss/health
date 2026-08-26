import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import type { ApiResponse, MedicalRecord } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<MedicalRecord[]>>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', DEMO.PATIENT_ID)
    .order('record_date', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}
