import { RECORD_TYPE_COLORS, RECORD_TYPE_LABELS, formatRecordDate } from '@/lib/records';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import type { MedicalRecord } from '@/types';

interface Props {
  record: MedicalRecord;
  onClose: () => void;
  accessError?: string | null;
}

export function ProviderRecordDetail({ record, onClose, accessError }: Props) {
  const c = RECORD_TYPE_COLORS[record.type];

  if (accessError) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
        <div
          className="w-full rounded-t-3xl p-6 text-center"
          style={{ background: '#FFEDED' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#FFFFFF' }}>
            <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#C23B3B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#C23B3B' }}>
            {accessError === 'ACCESS_REVOKED' ? 'Access Revoked' : 'Access Expired'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#FF6B6B' }}>
            {accessError === 'ACCESS_REVOKED'
              ? 'The patient has revoked access to their records.'
              : 'Access to this record has expired.'}
          </p>
          <button
            onClick={onClose}
            className="w-full font-semibold py-3 rounded-xl tap-target"
            style={{ background: '#FFEDED', color: '#C23B3B', border: '1px solid #FF6B6B40' }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#EEF1F6' }} />
        </div>

        {/* Header band */}
        <div className="mx-4 mt-2 rounded-2xl px-4 py-4 mb-4" style={{ background: c.bg }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: '#FFFFFF' }}
            >
              <RecordTypeIcon type={record.type} strokeColor={c.stroke} size={24} />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: c.text, textTransform: 'uppercase' }}>
                {RECORD_TYPE_LABELS[record.type].toUpperCase()}
              </span>
              <h2 className="text-base font-bold leading-tight mt-0.5" style={{ color: '#12151C' }}>{record.title}</h2>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-4">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl px-3 py-3" style={{ background: '#F3F8FF' }}>
              <p style={{ fontSize: 10, color: '#8A93A3', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Provider</p>
              <p className="text-sm font-semibold" style={{ color: '#12151C' }}>{record.provider_name}</p>
            </div>
            <div className="rounded-xl px-3 py-3" style={{ background: '#F3F8FF' }}>
              <p style={{ fontSize: 10, color: '#8A93A3', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Date</p>
              <p className="text-sm font-semibold" style={{ color: '#12151C' }}>{formatRecordDate(record.record_date)}</p>
            </div>
          </div>

          {/* Clinical notes */}
          <div className="rounded-xl px-4 py-4" style={{ background: '#F3F8FF' }}>
            <p style={{ fontSize: 10, color: '#8A93A3', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>Clinical Notes</p>
            <p className="text-sm leading-relaxed" style={{ color: '#4B5265' }}>{record.description}</p>
          </div>

          {/* Read-only notice */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: '#EAF1FF', border: '1px solid #2F6BFF30' }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <p className="text-xs font-medium" style={{ color: '#1D4FE0' }}>Read-only access granted by patient</p>
          </div>

          <button
            onClick={onClose}
            className="w-full font-semibold py-4 rounded-2xl tap-target"
            style={{ background: '#12151C', color: '#FFFFFF' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
