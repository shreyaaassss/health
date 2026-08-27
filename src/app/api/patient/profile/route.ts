import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse, PatientProfile } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<PatientProfile>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Profile not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: data as PatientProfile });
}

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse<PatientProfile>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) {
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' as const }, { status: 401 });
  }
  let body: Partial<PatientProfile>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body', code: 'SERVER_ERROR' }, { status: 400 });
  }

  // Only allow updating profile fields — not id, email, created_at
  const { name, phone, date_of_birth, emergency_contact, allergies, current_medications } = body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
  if (emergency_contact !== undefined) updates.emergency_contact = emergency_contact;
  if (allergies !== undefined) updates.allergies = allergies;
  if (current_medications !== undefined) updates.current_medications = current_medications;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', patientId)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: error?.message ?? 'Update failed', code: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data as PatientProfile });
}
