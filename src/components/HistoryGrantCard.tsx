'use client';

import { useState } from 'react';
import { RECORD_TYPE_ICONS } from '@/lib/records';
import type { AccessAction, AccessGrantStatus, AccessLog, MedicalRecord, Provider } from '@/types';
import type { AccessGrant } from '@/types';

interface Props {
  grant: AccessGrant;
  provider: Provider;
  records: MedicalRecord[];
  logs: AccessLog[];
}

// ── Status badge config ────────────────────────
const STATUS_CONFIG: Record<AccessGrantStatus, { label: string; bg: string; text: string; dot: string }> = {
  ACTIVE:  { label: 'ACTIVE',  bg: 'bg-teal-50',  text: 'text-teal-700',  dot: 'bg-teal-500'  },
  REVOKED: { label: 'REVOKED', bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-500'   },
  EXPIRED: { label: 'EXPIRED', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
};

// ── Timeline event config ─────────────────────
const LOG_CONFIG: Record<AccessAction, { icon: string; label: string; color: string; bg: string }> = {
  ACCESS_GRANTED:        { icon: '✓', label: 'Access granted',            color: 'text-teal-600',   bg: 'bg-teal-100'  },
  ACCESS_SESSION_OPENED: { icon: '👁', label: 'Provider opened portal',    color: 'text-blue-600',   bg: 'bg-blue-100'  },
  RECORD_VIEWED:         { icon: '📄', label: 'Record viewed',             color: 'text-violet-600', bg: 'bg-violet-100'},
  ACCESS_REVOKED:        { icon: '✕', label: 'Access revoked by patient',  color: 'text-red-600',    bg: 'bg-red-100'   },
  ACCESS_EXPIRED:        { icon: '⏱', label: 'Access expired',            color: 'text-amber-600',  bg: 'bg-amber-100' },
  ACCESS_DENIED:         { icon: '⊘', label: 'Access denied',             color: 'text-slate-500',  bg: 'bg-slate-100' },
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
}

function formatShortDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function HistoryGrantCard({ grant, provider, records, logs }: Props) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_CONFIG[grant.status];

  // Deduplicate RECORD_VIEWED by record_id for the summary
  const viewedRecordIds = new Set(
    logs
      .filter((l) => l.action === 'RECORD_VIEWED')
      .map((l) => (l.metadata as { record_id?: string })?.record_id)
      .filter(Boolean)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-4 flex items-start gap-3 tap-target"
      >
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          🩺
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 truncate">{provider.name}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{provider.organization}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-slate-400">
              {records.length} record{records.length !== 1 ? 's' : ''} shared
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400">{formatShortDate(grant.created_at)}</span>
            {viewedRecordIds.size > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-violet-500 font-medium">
                  {viewedRecordIds.size} viewed
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-slate-300 flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-5">

          {/* Records shared */}
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Records Shared</p>
            <div className="space-y-1.5">
              {records.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="text-base">{RECORD_TYPE_ICONS[r.type]}</span>
                  <span className="text-sm text-slate-700 flex-1">{r.title}</span>
                  {viewedRecordIds.has(r.id) && (
                    <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded-full font-semibold">
                      VIEWED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expiry / revoke info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Created</p>
              <p className="text-xs font-semibold text-slate-700">{formatTime(grant.created_at)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">
                {grant.status === 'REVOKED' ? 'Revoked' : grant.status === 'EXPIRED' ? 'Expired' : 'Expires'}
              </p>
              <p className="text-xs font-semibold text-slate-700">
                {grant.revoked_at
                  ? formatTime(grant.revoked_at)
                  : formatTime(grant.expires_at)}
              </p>
            </div>
          </div>

          {/* Timeline */}
          {logs.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">Timeline</p>
              <div className="relative space-y-3">
                {/* Vertical line */}
                <div className="absolute left-[14px] top-2 bottom-2 w-px bg-slate-200" />

                {logs.map((log, i) => {
                  const cfg = LOG_CONFIG[log.action] ?? LOG_CONFIG.ACCESS_DENIED;
                  const meta = log.metadata as { record_id?: string; record_title?: string } | null;

                  return (
                    <div key={`${log.id}-${i}`} className="flex items-start gap-3 relative">
                      {/* Dot */}
                      <div className={`w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 text-xs z-10`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-xs font-semibold ${cfg.color}`}>
                          {log.action === 'RECORD_VIEWED' && meta?.record_title
                            ? `"${meta.record_title}" viewed`
                            : cfg.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(log.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
