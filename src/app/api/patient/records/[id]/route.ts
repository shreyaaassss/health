import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse, MedicalRecord } from '@/types';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ deleted: true }>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch record first to verify ownership and get file_url for storage cleanup
  const { data: record, error: fetchErr } = await supabase
    .from('medical_records')
    .select('id, patient_id, file_url')
    .eq('id', id)
    .eq('patient_id', patientId)
    .single();

  if (fetchErr || !record) {
    return NextResponse.json({ success: false, error: 'Record not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  // Delete file from Supabase Storage if one exists
  if (record.file_url) {
    await supabase.storage.from('medical-records').remove([record.file_url]);
  }

  // Delete the record (cascade removes it from any access_grant_records)
  const { error: delErr } = await supabase
    .from('medical_records')
    .delete()
    .eq('id', id)
    .eq('patient_id', patientId);

  if (delErr) {
    return NextResponse.json({ success: false, error: delErr.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { deleted: true } });
}

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
