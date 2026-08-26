import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Access History · Health Wallet' };
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import { HistoryGrantCard } from '@/components/HistoryGrantCard';
import type { AccessGrant, AccessGrantStatus, AccessLog, MedicalRecord, Provider } from '@/types';
import Link from 'next/link';

interface HistoryEntry {
  grant: AccessGrant;
  provider: Provider;
  records: MedicalRecord[];
  logs: AccessLog[];
}

async function getHistory(): Promise<HistoryEntry[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('access_grants')
    .select(`
      *,
      providers(*),
      access_grant_records( medical_records(*) ),
      access_logs( * )
    `)
    .eq('patient_id', DEMO.PATIENT_ID)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((raw) => ({
    grant: {
      id: raw.id,
      patient_id: raw.patient_id,
      provider_id: raw.provider_id,
      status: raw.status as AccessGrantStatus,
      expires_at: raw.expires_at,
      created_at: raw.created_at,
      revoked_at: raw.revoked_at,
    } as AccessGrant,
    provider: raw.providers as Provider,
    records: (raw.access_grant_records as { medical_records: MedicalRecord }[])
      .map((r) => r.medical_records)
      .filter(Boolean),
    logs: ((raw.access_logs as AccessLog[]) ?? []).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
  }));
}

const STATUS_COUNTS = (entries: HistoryEntry[]) => ({
  active:  entries.filter((e) => e.grant.status === 'ACTIVE').length,
  revoked: entries.filter((e) => e.grant.status === 'REVOKED').length,
  expired: entries.filter((e) => e.grant.status === 'EXPIRED').length,
});

export default async function HistoryPage() {
  const entries = await getHistory();
  const counts = STATUS_COUNTS(entries);

  return (
    <div className="px-4 pt-6 pb-4">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Access History</h1>
        <p className="text-sm text-slate-400 mt-0.5">A complete log of all access you have granted.</p>
      </div>

      {/* Status summary pills */}
      {entries.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {counts.active > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              {counts.active} Active
            </span>
          )}
          {counts.revoked > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {counts.revoked} Revoked
            </span>
          )}
          {counts.expired > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {counts.expired} Expired
            </span>
          )}
        </div>
      )}

      {/* History list */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium text-sm mb-1">No access history yet</p>
          <p className="text-slate-400 text-xs max-w-[220px] mb-6">
            Every time you share records with a provider, it will appear here.
          </p>
          <Link
            href="/patient/share"
            className="bg-teal-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl tap-target"
          >
            Share Records
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <HistoryGrantCard
              key={entry.grant.id}
              grant={entry.grant}
              provider={entry.provider}
              records={entry.records}
              logs={entry.logs}
            />
          ))}
        </div>
      )}

      {/* Privacy note */}
      {entries.length > 0 && (
        <p className="text-center text-xs text-slate-300 mt-6">
          {entries.length} total access event{entries.length !== 1 ? 's' : ''} · Tap any card to see the full timeline
        </p>
      )}
    </div>
  );
}
