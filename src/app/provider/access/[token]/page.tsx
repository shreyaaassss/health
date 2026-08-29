import { validateTokenSession, logAccessAction } from '@/lib/access';
import { getUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProviderPortal } from '@/components/provider/ProviderPortal';
import { AccessErrorScreen } from '@/components/provider/AccessErrorScreen';
import type { Provider } from '@/types';

// Re-validates on every request — revocation is instant.
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

  // If grant has no specific provider_id, identify the doctor from their session
  // (doctors are logged in on their own device when they scan the QR)
  let resolvedProvider = session.provider;
  if (!resolvedProvider) {
    const user = await getUser();
    if (user) {
      const supabase = createAdminClient();
      const { data: doctorRow } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (doctorRow) {
        resolvedProvider = doctorRow as Provider;
        // Link this grant to the scanning doctor so future requests know who accessed it
        await supabase
          .from('access_grants')
          .update({ provider_id: doctorRow.id })
          .eq('id', session.grant.id);
      }
    }
  }

  const enhancedSession = { ...session, provider: resolvedProvider };

  await logAccessAction({
    patient_id:      session.grant.patient_id,
    provider_id:     resolvedProvider?.id ?? null,
    access_grant_id: session.grant.id,
    action:          'ACCESS_SESSION_OPENED',
  });

  return <ProviderPortal session={enhancedSession} token={token} />;
}
