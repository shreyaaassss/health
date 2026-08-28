import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateTokenSession } from '@/lib/access';
import type { ApiResponse } from '@/types';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionBody {
  medications: Medication[];
  instructions?: string;
  follow_up_date?: string;
  medical_record_id?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const { token } = await params;

  // Validate the access grant is still active
  const session = await validateTokenSession(token);
  if (!session.valid) {
    return NextResponse.json({ success: false, error: session.code, code: 'ACCESS_DENIED' }, { status: 403 });
  }

  const body: PrescriptionBody = await req.json();
  if (!body.medications?.length) {
    return NextResponse.json({ success: false, error: 'At least one medication required', code: 'SERVER_ERROR' }, { status: 400 });
  }

  const { grant } = session.session;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id: grant.patient_id,
      provider_id: grant.provider_id,
      access_grant_id: grant.id,
      medications: body.medications,
      instructions: body.instructions ?? null,
      follow_up_date: body.follow_up_date ?? null,
      medical_record_id: body.medical_record_id ?? null,
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: error?.message ?? 'Failed', code: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { id: data.id } });
}
