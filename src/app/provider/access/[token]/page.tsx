import { validateTokenSession, logAccessAction } from '@/lib/access';
import { ProviderPortal } from '@/components/provider/ProviderPortal';
import { AccessErrorScreen } from '@/components/provider/AccessErrorScreen';

// Re-validates on every request — this is what makes revocation instant.
// Patient revokes → doctor refreshes → sees ACCESS_REVOKED immediately.
export default async function ProviderAccessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const result = await validateTokenSession(token);

  if (!result.valid) {
    const codeMap: Record<string, 'ACCESS_REVOKED' | 'ACCESS_EXPIRED' | 'TOKEN_INVALID' | 'ACCESS_DENIED'> = {
      ACCESS_REVOKED: 'ACCESS_REVOKED',
      ACCESS_EXPIRED: 'ACCESS_EXPIRED',
      TOKEN_INVALID:  'TOKEN_INVALID',
    };
    return <AccessErrorScreen code={codeMap[result.code] ?? 'TOKEN_INVALID'} />;
  }

  const { session } = result;

  // Log session opened (server-side, before rendering)
  await logAccessAction({
    patient_id: session.grant.patient_id,
    provider_id: session.grant.provider_id,
    access_grant_id: session.grant.id,
    action: 'ACCESS_SESSION_OPENED',
  });

  return <ProviderPortal session={session} token={token} />;
}
