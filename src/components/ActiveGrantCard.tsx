'use client';

import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import { RECORD_TYPE_COLORS, formatRecordDate } from '@/lib/records';
import { ExpiryCountdown } from '@/components/ExpiryCountdown';
import type { AccessGrantWithDetails } from '@/types';

interface Props {
  grant: AccessGrantWithDetails;
  onRevoke: () => void;
  onExpired: () => void;
  revoking: boolean;
}

const COUNTDOWN_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

export function ActiveGrantCard({ grant, onRevoke, onExpired, revoking }: Props) {
  const expires = new Date(grant.expires_at);
  const isUntilRevoked = expires.getFullYear() > new Date().getFullYear() + 50;
  const msRemaining = expires.getTime() - Date.now();
  const showCountdown = !isUntilRevoked && msRemaining < COUNTDOWN_THRESHOLD_MS;

  const expiresLabel = isUntilRevoked
    ? 'Until you revoke'
    : expires.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>

      {/* Provider header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'var(--card-2)', borderBottom: '1px solid var(--line)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--blue-tint)' }}
        >
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{grant.provider.name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{grant.provider.organization}</p>
        </div>
        <span
          className="inline-flex items-center gap-1 flex-shrink-0"
          style={{ background: '#E9F9F1', color: '#1FAA6D', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '4px 10px' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1FAA6D' }} />
          ACTIVE
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Records shared */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
            Records Shared ({grant.records.length})
          </p>
          <div className="space-y-1.5">
            {grant.records.map((r) => {
              const c = RECORD_TYPE_COLORS[r.type];
              return (
                <div key={r.id} className="flex items-center gap-2">
                  <div style={{ width: 20, height: 20, flexShrink: 0 }}>
                    <RecordTypeIcon type={r.type} strokeColor={c.stroke} size={18} />
                  </div>
                  <span className="text-sm flex-1 truncate" style={{ color: 'var(--ink-soft)' }}>{r.title}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>{formatRecordDate(r.record_date)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiry: live countdown if < 10 min, static label otherwise */}
        {showCountdown ? (
          <ExpiryCountdown expiresAt={grant.expires_at} onExpired={onExpired} />
        ) : (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: '#FEF6E7', border: '1px solid #E5A02030' }}
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#E5A020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>Access expires</p>
              <p style={{ fontSize: 12, color: '#E5A020' }}>{expiresLabel}</p>
            </div>
          </div>
        )}

        {/* Revoke button */}
        <button
          onClick={onRevoke}
          disabled={revoking}
          className="w-full flex items-center justify-center gap-2 font-bold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 transition-colors"
          style={{ background: '#FFEDED', color: '#C23B3B' }}
        >
          {revoking ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Revoking…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#C23B3B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Revoke Access
            </>
          )}
        </button>
      </div>
    </div>
  );
}
