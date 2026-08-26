import { RECORD_TYPE_COLORS, RECORD_TYPE_ICONS, RECORD_TYPE_LABELS, formatRecordDate } from '@/lib/records';
import type { MedicalRecord } from '@/types';

interface Props {
  record: MedicalRecord;
  onClick: () => void;
  loading?: boolean;
}

export function ProviderRecordCard({ record, onClick, loading }: Props) {
  const c = RECORD_TYPE_COLORS[record.type];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full text-left flex items-center gap-4 bg-white rounded-2xl px-4 py-4 border border-slate-200 shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60 tap-target"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${c.iconBg}`}>
        {loading ? (
          <svg className="w-5 h-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          RECORD_TYPE_ICONS[record.type]
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{record.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{record.provider_name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
            {RECORD_TYPE_LABELS[record.type].toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">{formatRecordDate(record.record_date)}</span>
        </div>
      </div>

      <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
