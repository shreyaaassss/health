import { RECORD_TYPE_COLORS, RECORD_TYPE_LABELS } from '@/lib/records';
import type { RecordType } from '@/types';

export function RecordTypeBadge({ type }: { type: RecordType }) {
  const c = RECORD_TYPE_COLORS[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${c.bg} ${c.text} ${c.border} border`}>
      {RECORD_TYPE_LABELS[type].toUpperCase()}
    </span>
  );
}
