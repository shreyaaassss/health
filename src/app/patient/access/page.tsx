import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Active Access · Health Wallet' };
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import { AccessList } from '@/components/AccessList';
import type { AccessGrant, AccessGrantWithDetails, MedicalRecord, Provider } from '@/types';
import Link from 'next/link';

async function getActiveGrants(): Promise<AccessGrantWithDetails[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // Server-side sweep: mark any past-their-time ACTIVE grants as EXPIRED
  // before we even query for active ones. This ensures the page is always accurate.
  const { data: expiredRows } = await supabase
    .from('access_grants')
    .select('id, provider_id')
    .eq('patient_id', DEMO.PATIENT_ID)
    .eq('status', 'ACTIVE')
    .lt('expires_at', now);

  if (expiredRows?.length) {
    const ids = expiredRows.map((g) => g.id);
    await Promise.all([
      supabase.from('access_grants').update({ status: 'EXPIRED' }).in('id', ids),
      supabase.from('access_tokens').update({ expires_at: now }).in('access_grant_id', ids),
      supabase.from('access_logs').insert(
        expiredRows.map((g) => ({
          patient_id: DEMO.PATIENT_ID,
          provider_id: g.provider_id,
          access_grant_id: g.id,
          action: 'ACCESS_EXPIRED',
          metadata: { expired_at: now },
        }))
      ),
    ]);
  }

  const { data, error } = await supabase
    .from('access_grants')
    .select(`
      *,
      providers(*),
      access_grant_records(
        medical_records(*)
      )
    `)
    .eq('patient_id', DEMO.PATIENT_ID)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((raw) => ({
    ...(raw as AccessGrant),
    provider: raw.providers as Provider,
    records: (raw.access_grant_records as { medical_records: MedicalRecord }[])
      .map((r) => r.medical_records)
      .filter(Boolean),
    token: null,
  }));
}

export default async function AccessPage() {
  const grants = await getActiveGrants();
  const activeCount = grants.length;

  return (
    <div className="px-4 pt-6 pb-4">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Active Access</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {activeCount === 0
              ? 'No one currently has access'
              : `${activeCount} provider${activeCount !== 1 ? 's' : ''} with active access`}
          </p>
        </div>
        <Link
          href="/patient/share"
          className="flex items-center gap-1.5 bg-teal-600 text-white text-xs font-semibold px-3 py-2 rounded-xl tap-target"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Share
        </Link>
      </div>

      {/* Hero moment callout — visible when there are active grants */}
      {activeCount > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5">
          <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">You are in control.</span> Tap{' '}
            <span className="font-bold text-red-600">Revoke Access</span> at any time to immediately cut off a provider&apos;s access to your records.
          </p>
        </div>
      )}

      {/* Grant list with revoke UI */}
      <AccessList initialGrants={grants} />
    </div>
  );
}
