import { NextResponse } from 'next/server';
import { validateTokenSession, logAccessAction } from '@/lib/access';
import type { ApiError, ApiResponse, ProviderAccessSession } from '@/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse<ApiResponse<ProviderAccessSession>>> {
  const { token } = await params;

  const result = await validateTokenSession(token);

  if (!result.valid) {
    const codeMap: Record<string, ApiError['code']> = {
      TOKEN_INVALID: 'TOKEN_INVALID',
      ACCESS_REVOKED: 'ACCESS_REVOKED',
      ACCESS_EXPIRED: 'ACCESS_EXPIRED',
    };
    return NextResponse.json(
      { success: false, error: result.code, code: codeMap[result.code] ?? 'ACCESS_DENIED' },
      { status: 403 }
    );
  }

  const { session } = result;

  // Audit: log session opened
  await logAccessAction({
    patient_id: session.grant.patient_id,
    provider_id: session.grant.provider_id,
    access_grant_id: session.grant.id,
    action: 'ACCESS_SESSION_OPENED',
  });

  return NextResponse.json({ success: true, data: session });
}
