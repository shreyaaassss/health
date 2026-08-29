import { ACCESS_DURATION_LABELS } from '@/types';
import { RECORD_TYPE_COLORS, formatRecordDate } from '@/lib/records';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import type { AccessDuration, MedicalRecord, Provider } from '@/types';

interface Props {
  provider: Provider | null; // null = any registered doctor can scan
  records: MedicalRecord[];
  duration: AccessDuration;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export function StepReview({ provider, records, duration, onConfirm, onBack, loading }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Review & Share</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Confirm the details before sharing.</p>

        {/* Summary card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>

          {/* Access method */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
            <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>Access method</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-tint)' }}>
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                  <rect x="7" y="7" width="10" height="10" rx="1"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                  {provider ? provider.name : 'Secure QR Code'}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {provider ? provider.organization : 'Share this QR with your doctor'}
                </p>
              </div>
            </div>
          </div>

          {/* Records */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
            <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
              Records ({records.length})
            </p>
            <div className="space-y-1.5">
              {records.map((r) => {
                const c = RECORD_TYPE_COLORS[r.type];
                return (
                  <div key={r.id} className="flex items-center gap-2">
                    <RecordTypeIcon type={r.type} strokeColor={c.stroke} size={16} />
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--ink-soft)' }}>{r.title}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{formatRecordDate(r.record_date)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="px-4 py-4">
            <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>Access duration</p>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 3"/>
              </svg>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{ACCESS_DURATION_LABELS[duration]}</p>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mt-4 flex items-start gap-2 px-1">
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
            <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            You can revoke this access at any time from the Active Access tab. The provider will immediately lose access.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          disabled={loading}
          onClick={onBack}
          className="flex-1 font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40"
          style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}
        >
          Back
        </button>
        <button
          disabled={loading}
          onClick={onConfirm}
          className="flex-[2] font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          style={{ background: '#2F6BFF', color: 'var(--card)', borderRadius: 24 }}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating access…
            </>
          ) : (
            'Share Records'
          )}
        </button>
      </div>
    </div>
  );
}
