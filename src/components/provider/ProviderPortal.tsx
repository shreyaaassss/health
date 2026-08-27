'use client';

import { useState } from 'react';
import { ProviderRecordCard } from '@/components/provider/ProviderRecordCard';
import { ProviderRecordDetail } from '@/components/provider/ProviderRecordDetail';
import { AccessErrorScreen } from '@/components/provider/AccessErrorScreen';
import type { MedicalRecord, ProviderAccessSession } from '@/types';

interface Props {
  session: ProviderAccessSession;
  token: string;
}

export function ProviderPortal({ session, token }: Props) {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
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
        // Access was revoked or expired while the portal was open
        if (json.code === 'ACCESS_REVOKED' || json.code === 'ACCESS_EXPIRED') {
          setAccessError(json.code);
        } else {
          setRecordError(json.code);
        }
        return;
      }

      setSelectedRecord(json.data);
    } catch {
      setRecordError('Network error. Please try again.');
    } finally {
      setLoadingId(null);
    }
  }

  // If access was revoked/expired during this session — show full-screen error
  if (accessError === 'ACCESS_REVOKED' || accessError === 'ACCESS_EXPIRED') {
    return <AccessErrorScreen code={accessError} />;
  }

  const expires = new Date(session.expires_at);
  const isUntilRevoked = expires.getFullYear() > new Date().getFullYear() + 50;
  const expiresLabel = isUntilRevoked
    ? 'Until patient revokes'
    : expires.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen" style={{ background: '#F2F4F8' }}>
      {/* Portal header — visually distinct from patient app */}
      <div className="px-4 pt-10 pb-6" style={{ background: '#12151C' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#2F6BFF' }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#2F6BFF', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Health Wallet</p>
            <p style={{ fontSize: 10, color: '#8A93A3' }}>Provider Access Portal</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-1">Patient Medical Records</h1>

        {/* Provider + patient info */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs" style={{ color: '#8A93A3' }}>Viewing as</span>
          <span className="text-xs font-semibold text-white">{session.provider.name}</span>
          <span style={{ color: '#4B5265' }}>·</span>
          <span className="text-xs" style={{ color: '#8A93A3' }}>{session.provider.organization}</span>
        </div>

        {/* Access meta pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: '#1FAA6D20', border: '1px solid #1FAA6D40', color: '#1FAA6D' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1FAA6D' }} />
            ACCESS ACTIVE
          </span>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full"
            style={{ background: '#FFFFFF15', color: '#8A93A3' }}
          >
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
            {expiresLabel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-5">
        {/* Grant info card */}
        <div className="rounded-2xl px-4 py-3 mb-5 flex items-center gap-3" style={{ background: '#FFFFFF', border: '1px solid #EEF1F6' }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#EAF1FF' }}
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#8A93A3' }}>Access granted by</p>
            <p className="text-sm font-semibold" style={{ color: '#12151C' }}>{session.patient_name}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs" style={{ color: '#8A93A3' }}>Records shared</p>
            <p className="text-sm font-bold" style={{ color: '#12151C' }}>{session.records.length}</p>
          </div>
        </div>

        {/* Section label */}
        <p style={{ fontSize: 10, fontWeight: 700, color: '#8A93A3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
          Authorized Records
        </p>

        {/* Record error banner */}
        {recordError && (
          <div className="mb-3 rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', border: '1px solid #FF6B6B30', color: '#C23B3B' }}>
            {recordError}
          </div>
        )}

        {/* Records list — only authorized ones */}
        <div className="space-y-3">
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
        <div className="mt-8 flex items-start gap-2 rounded-2xl px-4 py-3" style={{ background: '#EEF1F6' }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#8A93A3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
            <path d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: '#4B5265' }}>
            You can only see records explicitly shared by the patient.
            The patient may revoke this access at any time.
          </p>
        </div>
      </div>

      {/* Record detail sheet */}
      {selectedRecord && (
        <ProviderRecordDetail
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          accessError={null}
        />
      )}
    </div>
  );
}
