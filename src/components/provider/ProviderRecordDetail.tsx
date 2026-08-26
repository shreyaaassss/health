import { RECORD_TYPE_COLORS, RECORD_TYPE_ICONS, RECORD_TYPE_LABELS, formatRecordDate } from '@/lib/records';
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
          className="w-full bg-red-50 rounded-t-3xl p-6 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-4xl mb-3">🚫</p>
          <h3 className="text-lg font-bold text-red-800 mb-2">
            {accessError === 'ACCESS_REVOKED' ? 'Access Revoked' : 'Access Expired'}
          </h3>
          <p className="text-sm text-red-600 mb-6">
            {accessError === 'ACCESS_REVOKED'
              ? 'The patient has revoked access to their records.'
              : 'Access to this record has expired.'}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl tap-target"
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
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header band */}
        <div className={`${c.bg} mx-4 mt-2 rounded-2xl px-4 py-4 mb-4`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center text-2xl`}>
              {RECORD_TYPE_ICONS[record.type]}
            </div>
            <div>
              <span className={`text-[10px] font-bold tracking-widest ${c.text}`}>
                {RECORD_TYPE_LABELS[record.type].toUpperCase()}
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-tight mt-0.5">{record.title}</h2>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-4">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl px-3 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">Provider</p>
              <p className="text-sm font-semibold text-slate-800">{record.provider_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">Date</p>
              <p className="text-sm font-semibold text-slate-800">{formatRecordDate(record.record_date)}</p>
            </div>
          </div>

          {/* Clinical notes */}
          <div className="bg-slate-50 rounded-xl px-4 py-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-2">Clinical Notes</p>
            <p className="text-sm text-slate-700 leading-relaxed">{record.description}</p>
          </div>

          {/* Read-only notice */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <p className="text-xs text-blue-700 font-medium">Read-only access granted by patient</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-semibold py-4 rounded-2xl tap-target active:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
