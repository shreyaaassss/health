import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Access History · Inochi' };
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePatientId } from '@/lib/auth';
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
  const patientId = await requirePatientId();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('access_grants')
    .select(`
      *,
      providers(*),
      access_grant_records( medical_records(*) ),
      access_logs( * )
    `)
    .eq('patient_id', patientId)
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Access History</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>A complete log of all access you have granted.</p>
      </div>

      {/* Status summary pills */}
      {entries.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {counts.active > 0 && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: '#E9F9F1', color: '#1FAA6D', border: '1px solid #1FAA6D30' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#1FAA6D' }} />
              {counts.active} Active
            </span>
          )}
          {counts.revoked > 0 && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: '#FFEDED', color: '#C23B3B', border: '1px solid #FF6B6B30' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: '#FF6B6B' }} />
              {counts.revoked} Revoked
            </span>
          )}
          {counts.expired > 0 && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: '#FEF6E7', color: '#E5A020', border: '1px solid #E5A02030' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: '#E5A020' }} />
              {counts.expired} Expired
            </span>
          )}
        </div>
      )}

      {/* History list */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--line)' }}>
            <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
          </div>
          <p className="font-medium text-sm mb-1" style={{ color: 'var(--ink-soft)' }}>No access history yet</p>
          <p className="text-xs max-w-[220px] mb-6" style={{ color: 'var(--muted)' }}>
            Every time you share records with a provider, it will appear here.
          </p>
          <Link
            href="/patient/share"
            className="text-sm font-semibold px-5 py-3 rounded-2xl tap-target"
            style={{ background: '#2F6BFF', color: 'var(--card)' }}
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
        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted)' }}>
          {entries.length} total access event{entries.length !== 1 ? 's' : ''} · Tap any card to see the full timeline
        </p>
      )}
    </div>
  );
}
