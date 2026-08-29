import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/auth';
import type { ApiResponse } from '@/types';

interface ActionBody {
  action: 'confirm' | 'cancel' | 'complete';
  confirmed_date?: string;
  confirmed_time?: string;
  doctor_notes?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ id: string; status: string }>>> {
  const user = await getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });

  const { id } = await params;
  const body: ActionBody = await req.json();

  const supabase = createAdminClient();
  const { data: provider } = await supabase.from('providers').select('id').eq('user_id', user.id).single();
  if (!provider) return NextResponse.json({ success: false, error: 'Not a provider', code: 'UNAUTHORIZED' }, { status: 403 });

  const statusMap = { confirm: 'confirmed', cancel: 'cancelled', complete: 'completed' };
  const updates: Record<string, unknown> = {
    status: statusMap[body.action] ?? 'cancelled',
    updated_at: new Date().toISOString(),
  };

  if (body.action === 'confirm') {
    if (body.confirmed_date) updates.confirmed_date = body.confirmed_date;
    if (body.confirmed_time) updates.confirmed_time = body.confirmed_time;
    if (body.doctor_notes) updates.doctor_notes = body.doctor_notes;
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .eq('provider_id', provider.id)
    .select('id, status')
    .single();

  if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? 'Update failed', code: 'SERVER_ERROR' }, { status: 500 });

  return NextResponse.json({ success: true, data: { id: data.id, status: data.status } });
}
