import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import type { ApiResponse, AppointmentFormData, AppointmentRecord } from '@/types';

interface CreateAppointmentBody {
  source: {
    type: 'qr_scan' | 'manual_entry';
    rawCode?: string;
    hospitalId?: string;
    hospitalName?: string;
  };
  formData: AppointmentFormData;
}

export async function GET(): Promise<NextResponse<ApiResponse<AppointmentRecord[]>>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('appointment_records')
    .select('*')
    .eq('patient_id', DEMO.PATIENT_ID)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  const records: AppointmentRecord[] = (data ?? []).map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    source: {
      type: row.source_type,
      rawCode: row.source_raw_code,
      hospitalId: row.source_hospital_id,
      hospitalName: row.source_hospital_name,
    },
    formData: row.form_data as AppointmentFormData,
    status: row.status,
    createdAt: row.created_at,
    submittedAt: row.submitted_at,
    prescription: row.prescription ?? undefined,
  }));

  return NextResponse.json({ success: true, data: records });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<AppointmentRecord>>> {
  let body: CreateAppointmentBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body', code: 'SERVER_ERROR' }, { status: 400 });
  }

  const { source, formData } = body;
  if (!formData?.name || !formData?.phone || !formData?.dateOfBirth || !formData?.emergencyContact) {
    return NextResponse.json({ success: false, error: 'Missing required form fields', code: 'SERVER_ERROR' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // ── 1. Persist updated profile fields back to patients table ──
  await supabase.from('patients').update({
    name: formData.name,
    phone: formData.phone,
    date_of_birth: formData.dateOfBirth,
    emergency_contact: formData.emergencyContact,
    ...(formData.allergies !== undefined && { allergies: formData.allergies }),
    ...(formData.currentMedications !== undefined && { current_medications: formData.currentMedications }),
  }).eq('id', DEMO.PATIENT_ID);

  // ── 2. Create appointment record ──────────────
  const { data, error } = await supabase
    .from('appointment_records')
    .insert({
      patient_id:          DEMO.PATIENT_ID,
      source_type:         source.type,
      source_raw_code:     source.rawCode ?? null,
      source_hospital_id:  source.hospitalId ?? null,
      source_hospital_name: source.hospitalName ?? null,
      form_data:           formData,
      status:              'submitted',
      submitted_at:        now,
      prescription:        null, // reserved for future doctor-side phase
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: error?.message ?? 'Failed to save', code: 'SERVER_ERROR' }, { status: 500 });
  }

  const record: AppointmentRecord = {
    id: data.id,
    patientId: data.patient_id,
    source: {
      type: data.source_type,
      rawCode: data.source_raw_code,
      hospitalId: data.source_hospital_id,
      hospitalName: data.source_hospital_name,
    },
    formData: data.form_data as AppointmentFormData,
    status: data.status,
    createdAt: data.created_at,
    submittedAt: data.submitted_at,
  };

  return NextResponse.json({ success: true, data: record });
}
