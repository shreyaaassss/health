'use client';

import { useState } from 'react';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import { RECORD_TYPE_COLORS } from '@/lib/records';
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
  ACTIVE:  { label: 'ACTIVE',  bg: '#E9F9F1', text: '#1FAA6D', dot: '#1FAA6D' },
  REVOKED: { label: 'REVOKED', bg: '#FFEDED',  text: '#C23B3B', dot: '#FF6B6B' },
  EXPIRED: { label: 'EXPIRED', bg: '#FEF6E7', text: '#E5A020', dot: '#E5A020' },
};

// ── Timeline event icon components ─────────────
function TimelineIcon({ action }: { action: AccessAction }) {
  switch (action) {
    case 'ACCESS_GRANTED':
      return (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#1FAA6D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      );
    case 'ACCESS_SESSION_OPENED':
      return (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
        </svg>
      );
    case 'RECORD_VIEWED':
      return (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#7B61FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
        </svg>
      );
    case 'ACCESS_REVOKED':
      return (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#FF6B6B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M15 9l-6 6M9 9l6 6"/>
        </svg>
      );
    case 'ACCESS_EXPIRED':
      return (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#E5A020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3"/>
        </svg>
      );
    case 'ACCESS_DENIED':
      return (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M4.93 4.93l14.14 14.14"/>
        </svg>
      );
    default:
      return null;
  }
}

const LOG_LABELS: Record<AccessAction, string> = {
  ACCESS_GRANTED:        'Access granted',
  ACCESS_SESSION_OPENED: 'Provider opened portal',
  RECORD_VIEWED:         'Record viewed',
  ACCESS_REVOKED:        'Access revoked by patient',
  ACCESS_EXPIRED:        'Access expired',
  ACCESS_DENIED:         'Access denied',
};

const LOG_ICON_BG: Record<AccessAction, string> = {
  ACCESS_GRANTED:        '#E9F9F1',
  ACCESS_SESSION_OPENED: 'var(--blue-tint)',
  RECORD_VIEWED:         '#F1EEFF',
  ACCESS_REVOKED:        '#FFEDED',
  ACCESS_EXPIRED:        '#FEF6E7',
  ACCESS_DENIED:         'var(--line)',
};

const LOG_TEXT_COLOR: Record<AccessAction, string> = {
  ACCESS_GRANTED:        '#1FAA6D',
  ACCESS_SESSION_OPENED: '#1D4FE0',
  RECORD_VIEWED:         '#7B61FF',
  ACCESS_REVOKED:        '#C23B3B',
  ACCESS_EXPIRED:        '#E5A020',
  ACCESS_DENIED:         'var(--muted)',
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
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-4 flex items-start gap-3 tap-target"
      >
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
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{provider.name}</p>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: s.bg, color: s.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
              {s.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{provider.organization}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {records.length} record{records.length !== 1 ? 's' : ''} shared
            </span>
            <span style={{ color: 'var(--line)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{formatShortDate(grant.created_at)}</span>
            {viewedRecordIds.size > 0 && (
              <>
                <span style={{ color: 'var(--line)' }}>·</span>
                <span className="text-xs font-medium" style={{ color: '#7B61FF' }}>
                  {viewedRecordIds.size} viewed
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-4 py-4 space-y-5" style={{ borderColor: 'var(--line)' }}>

          {/* Records shared */}
          <div>
            <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>Records Shared</p>
            <div className="space-y-1.5">
              {records.map((r) => {
                const c = RECORD_TYPE_COLORS[r.type];
                return (
                  <div key={r.id} className="flex items-center gap-2">
                    <RecordTypeIcon type={r.type} strokeColor={c.stroke} size={16} />
                    <span className="text-sm flex-1" style={{ color: 'var(--ink-soft)' }}>{r.title}</span>
                    {viewedRecordIds.has(r.id) && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: '#F1EEFF', color: '#7B61FF', border: '1px solid #7B61FF30' }}
                      >
                        VIEWED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expiry / revoke info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl px-3 py-2" style={{ background: 'var(--card-2)' }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>Created</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>{formatTime(grant.created_at)}</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ background: 'var(--card-2)' }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>
                {grant.status === 'REVOKED' ? 'Revoked' : grant.status === 'EXPIRED' ? 'Expired' : 'Expires'}
              </p>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>
                {grant.revoked_at
                  ? formatTime(grant.revoked_at)
                  : formatTime(grant.expires_at)}
              </p>
            </div>
          </div>

          {/* Timeline */}
          {logs.length > 0 && (
            <div>
              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>Timeline</p>
              <div className="relative space-y-3">
                {/* Vertical line */}
                <div className="absolute left-[14px] top-2 bottom-2 w-px" style={{ background: 'var(--line)' }} />

                {logs.map((log, i) => {
                  const meta = log.metadata as { record_id?: string; record_title?: string } | null;
                  const textColor = LOG_TEXT_COLOR[log.action] ?? 'var(--muted)';
                  const iconBg = LOG_ICON_BG[log.action] ?? 'var(--line)';
                  const label = LOG_LABELS[log.action] ?? 'Unknown event';

                  return (
                    <div key={`${log.id}-${i}`} className="flex items-start gap-3 relative">
                      {/* Dot */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                        style={{ background: iconBg }}
                      >
                        <TimelineIcon action={log.action} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-semibold" style={{ color: textColor }}>
                          {log.action === 'RECORD_VIEWED' && meta?.record_title
                            ? `"${meta.record_title}" viewed`
                            : label}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{formatTime(log.timestamp)}</p>
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
