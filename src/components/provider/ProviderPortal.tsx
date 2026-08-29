'use client';

import { useState } from 'react';
import { ProviderRecordCard } from '@/components/provider/ProviderRecordCard';
import { ProviderRecordDetail } from '@/components/provider/ProviderRecordDetail';
import { AccessErrorScreen } from '@/components/provider/AccessErrorScreen';
import { AccessTimer } from '@/components/provider/AccessTimer';
import type { MedicalRecord, ProviderAccessSession } from '@/types';

interface Props {
  session: ProviderAccessSession;
  token: string;
}

interface RecordWithUrl {
  record: MedicalRecord;
  view_url: string | null;
  openedAt: number; // timestamp — ensures key changes on every open, fixing re-open bug
}

export function ProviderPortal({ session, token }: Props) {
  const [selectedData, setSelectedData] = useState<RecordWithUrl | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

  async function handleRecordOpen(recordId: string) {
    setLoadingId(recordId);
    setRecordError(null);
    try {
      const res = await fetch(`/api/provider/access/${token}/records/${recordId}`);
      const json = await res.json();
      if (!json.success) {
        if (json.code === 'ACCESS_REVOKED' || json.code === 'ACCESS_EXPIRED') setAccessError(json.code);
        else setRecordError(json.code);
        return;
      }
      setSelectedData({ ...json.data, openedAt: Date.now() });
    } catch {
      setRecordError('Network error. Please try again.');
    } finally {
      setLoadingId(null);
    }
  }

  if (accessError === 'ACCESS_REVOKED' || accessError === 'ACCESS_EXPIRED') {
    return <AccessErrorScreen code={accessError} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--page)' }}>
      {/* Portal header */}
      <div className="px-4 pt-10 pb-6" style={{ background: 'var(--ink)' }}>
        <div className="flex items-center gap-2 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/inochi-logo.jpeg" alt="Inochi" width={28} height={28}
            style={{ borderRadius: 6, mixBlendMode: 'screen', opacity: 0.9 }} />
          <p style={{ fontSize: 10, color: 'var(--muted)' }}>Provider Access Portal</p>
        </div>

        <h1 className="text-xl font-bold text-white mb-1">Patient Medical Records</h1>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Viewing as</span>
          <span className="text-xs font-semibold text-white">{session.provider?.name ?? 'Verified Provider'}</span>
          {session.provider?.organization && (
            <>
              <span style={{ color: 'var(--ink-soft)' }}>·</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{session.provider.organization}</span>
            </>
          )}
        </div>

        {/* Access status + live timer */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: '#1FAA6D20', border: '1px solid #1FAA6D40', color: '#1FAA6D' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1FAA6D' }} />
            ACCESS ACTIVE
          </span>
          {/* Live countdown timer */}
          <AccessTimer expiresAt={session.expires_at} />
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Patient info card */}
        <div className="rounded-2xl px-4 py-3 mb-5 flex items-center gap-3" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue-tint)' }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Access granted by</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{session.patient_name}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Records shared</p>
            <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{session.records.length}</p>
          </div>
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
          Authorized Records
        </p>

        {recordError && (
          <div className="mb-3 rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', border: '1px solid #FF6B6B30', color: '#C23B3B' }}>
            {recordError}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {session.records.map((record) => (
            <ProviderRecordCard
              key={record.id}
              record={record}
              loading={loadingId === record.id}
              onClick={() => handleRecordOpen(record.id)}
            />
          ))}
        </div>

        {/* Privacy footer */}
        <div className="flex items-start gap-2 rounded-2xl px-4 py-3" style={{ background: 'var(--line)' }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
            <path d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            You can only see records the patient chose to share. Access can be revoked at any time.
          </p>
        </div>
      </div>

      {/* key forces fresh mount each time so state (showRx) resets on re-open */}
      {selectedData && (
        <ProviderRecordDetail
          key={selectedData.record.id + '_' + selectedData.openedAt}
          record={selectedData.record}
          viewUrl={selectedData.view_url}
          token={token}
          doctorName={session.provider?.name}
          onClose={() => setSelectedData(null)}
          accessError={null}
        />
      )}
    </div>
  );
}
