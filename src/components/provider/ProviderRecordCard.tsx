import { RECORD_TYPE_COLORS, RECORD_TYPE_LABELS, formatRecordDate } from '@/lib/records';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
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
      className="w-full text-left flex items-center gap-4 rounded-2xl px-4 py-4 active:scale-[0.98] transition-transform disabled:opacity-60 tap-target"
      style={{ background: '#FFFFFF', border: '1px solid #EEF1F6' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg }}
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="#8A93A3">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <RecordTypeIcon type={record.type} strokeColor={c.stroke} size={22} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#12151C' }}>{record.title}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#8A93A3' }}>{record.provider_name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: c.bg, color: c.text, border: `1px solid ${c.stroke}40` }}
          >
            {RECORD_TYPE_LABELS[record.type].toUpperCase()}
          </span>
          <span className="text-xs" style={{ color: '#8A93A3' }}>{formatRecordDate(record.record_date)}</span>
        </div>
      </div>

      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#8A93A3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
