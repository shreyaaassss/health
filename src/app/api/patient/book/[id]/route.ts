import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPatientIdFromRequest } from '@/lib/auth';
import type { ApiResponse } from '@/types';

// Patient cancels their own appointment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ status: string }>>> {
  const patientId = await getPatientIdFromRequest();
  if (!patientId) return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  if (action !== 'cancel') {
    return NextResponse.json({ success: false, error: 'Invalid action', code: 'SERVER_ERROR' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify patient owns this appointment and it's not already cancelled
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('id', id)
    .eq('patient_id', patientId)
    .single();

  if (!appt) return NextResponse.json({ success: false, error: 'Appointment not found', code: 'NOT_FOUND' }, { status: 404 });
  if (appt.status === 'cancelled') return NextResponse.json({ success: false, error: 'Already cancelled', code: 'SERVER_ERROR' }, { status: 409 });

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', cancelled_by: 'patient', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('status')
    .single();

  if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? 'Failed', code: 'SERVER_ERROR' }, { status: 500 });

  return NextResponse.json({ success: true, data: { status: data.status } });
}
