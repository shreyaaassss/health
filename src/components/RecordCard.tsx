import Link from 'next/link';
import { RECORD_TYPE_COLORS, formatRecordDate } from '@/lib/records';
import { RecordTypeBadge } from '@/components/RecordTypeBadge';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import type { MedicalRecord } from '@/types';

export function RecordCard({ record }: { record: MedicalRecord }) {
  const c = RECORD_TYPE_COLORS[record.type];

  return (
    <Link
      href={`/patient/records/${record.id}`}
      className="flex items-center gap-4 rounded-2xl px-4 py-4 active:scale-[0.98] transition-transform"
      style={{ background: '#FFFFFF', borderRadius: 18 }}
    >
      {/* Type icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg }}
      >
        <RecordTypeIcon type={record.type} strokeColor={c.stroke} size={22} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="truncate" style={{ fontSize: 14.5, fontWeight: 700, color: '#12151C' }}>{record.title}</p>
        <p className="truncate mt-0.5" style={{ fontSize: 12, color: '#8A93A3' }}>{record.provider_name}</p>
        <div className="flex items-center gap-2 mt-2">
          <RecordTypeBadge type={record.type} />
          <span style={{ fontSize: 12, color: '#8A93A3' }}>{formatRecordDate(record.record_date)}</span>
        </div>
      </div>

      {/* Chevron */}
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#EEF1F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M9 5l7 7-7 7" stroke="#8A93A3"/>
      </svg>
    </Link>
  );
}
