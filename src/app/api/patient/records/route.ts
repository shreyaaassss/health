import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse, MedicalRecord, RecordType } from '@/types';

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

interface CreateRecordBody {
  title: string;
  type: RecordType;
  provider_name: string;
  record_date: string;
  description: string;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<MedicalRecord>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }

  let body: CreateRecordBody;
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, error: 'Invalid body', code: 'SERVER_ERROR' }, { status: 400 }); }

  const { title, type, provider_name, record_date, description, file_url, file_name, file_size, file_type } = body;
  if (!title || !type || !provider_name || !record_date) {
    return NextResponse.json({ success: false, error: 'Missing required fields', code: 'SERVER_ERROR' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('medical_records')
    .insert({ patient_id: patientId, title, type, provider_name, record_date, description: description ?? '', file_url: file_url ?? null, file_name: file_name ?? null, file_size: file_size ?? null, file_type: file_type ?? null })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: error?.message ?? 'Failed to create record', code: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data as MedicalRecord });
}
