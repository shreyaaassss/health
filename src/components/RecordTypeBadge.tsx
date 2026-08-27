import { RECORD_TYPE_COLORS, RECORD_TYPE_LABELS } from '@/lib/records';
import type { RecordType } from '@/types';

export function RecordTypeBadge({ type }: { type: RecordType }) {
  const c = RECORD_TYPE_COLORS[type];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full"
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.stroke}`,
      }}
    >
      {RECORD_TYPE_LABELS[type].toUpperCase()}
    </span>
  );
}
