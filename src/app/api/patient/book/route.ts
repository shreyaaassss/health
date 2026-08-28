import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export interface PatientAppointment {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_specialty: string;
  reason: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmed_date: string | null;
  confirmed_time: string | null;
  doctor_notes: string | null;
  created_at: string;
}

export async function GET(): Promise<NextResponse<ApiResponse<PatientAppointment[]>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*, providers(name, specialty)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });

  const appointments: PatientAppointment[] = (data ?? []).map((row) => ({
    id: row.id,
    provider_id: row.provider_id,
    provider_name: (row.providers as { name: string; specialty: string })?.name ?? 'Doctor',
    provider_specialty: (row.providers as { name: string; specialty: string })?.specialty ?? '',
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

interface BookBody {
  provider_id: string;
  reason: string;
  preferred_date?: string;
  preferred_time?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<PatientAppointment>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });

  const { provider_id, reason, preferred_date, preferred_time }: BookBody = await req.json();
  if (!provider_id || !reason) return NextResponse.json({ success: false, error: 'Missing fields', code: 'SERVER_ERROR' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert({ patient_id: patientId, provider_id, reason, preferred_date: preferred_date ?? null, preferred_time: preferred_time ?? null, status: 'pending' })
    .select('*, providers(name, specialty)')
    .single();

  if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? 'Failed', code: 'SERVER_ERROR' }, { status: 500 });

  return NextResponse.json({
    success: true,
    data: {
      id: data.id,
      provider_id: data.provider_id,
      provider_name: (data.providers as { name: string; specialty: string })?.name ?? 'Doctor',
      provider_specialty: (data.providers as { name: string; specialty: string })?.specialty ?? '',
      reason: data.reason,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      status: data.status,
      confirmed_date: null,
      confirmed_time: null,
      doctor_notes: null,
      created_at: data.created_at,
    },
  });
}
