'use client';

import { RECORD_TYPE_ICONS, formatRecordDate } from '@/lib/records';
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Provider header */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          🩺
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{grant.provider.name}</p>
          <p className="text-xs text-slate-500 truncate">{grant.provider.organization}</p>
        </div>
        <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          ACTIVE
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Records shared */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
            Records Shared ({grant.records.length})
          </p>
          <div className="space-y-1.5">
            {grant.records.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <span className="text-base">{RECORD_TYPE_ICONS[r.type]}</span>
                <span className="text-sm text-slate-700 flex-1 truncate">{r.title}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">{formatRecordDate(r.record_date)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expiry: live countdown if < 10 min, static label otherwise */}
        {showCountdown ? (
          <ExpiryCountdown expiresAt={grant.expires_at} onExpired={onExpired} />
        ) : (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-slate-600">Access expires</p>
              <p className="text-xs text-slate-400">{expiresLabel}</p>
            </div>
          </div>
        )}

        {/* Revoke button */}
        <button
          onClick={onRevoke}
          disabled={revoking}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 active:bg-red-700 transition-colors"
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Revoke Access
            </>
          )}
        </button>
      </div>
    </div>
  );
}
