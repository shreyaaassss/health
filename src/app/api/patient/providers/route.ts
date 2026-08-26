import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ApiResponse, Provider } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<Provider[]>>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .order('name');

  if (error) {
    return NextResponse.json({ success: false, error: error.message, code: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}
