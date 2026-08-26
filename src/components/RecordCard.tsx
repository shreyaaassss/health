import Link from 'next/link';
import { RECORD_TYPE_COLORS, RECORD_TYPE_ICONS, formatRecordDate } from '@/lib/records';
import { RecordTypeBadge } from '@/components/RecordTypeBadge';
import type { MedicalRecord } from '@/types';

export function RecordCard({ record }: { record: MedicalRecord }) {
  const c = RECORD_TYPE_COLORS[record.type];

  return (
    <Link
      href={`/patient/records/${record.id}`}
      className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
    >
      {/* Type icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${c.iconBg}`}>
        {RECORD_TYPE_ICONS[record.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{record.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{record.provider_name}</p>
        <div className="flex items-center gap-2 mt-2">
          <RecordTypeBadge type={record.type} />
          <span className="text-xs text-slate-400">{formatRecordDate(record.record_date)}</span>
        </div>
      </div>

      {/* Chevron */}
      <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
