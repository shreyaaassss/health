import { RECORD_TYPE_COLORS, formatRecordDate } from '@/lib/records';
import { RecordTypeBadge } from '@/components/RecordTypeBadge';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import type { MedicalRecord } from '@/types';

interface Props {
  records: MedicalRecord[];
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepRecords({ records, selected, onToggle, onNext, onBack }: Props) {
  const allSelected = selected.length === records.length;

  function toggleAll() {
    if (allSelected) {
      records.forEach((r) => { if (selected.includes(r.id)) onToggle(r.id); });
    } else {
      records.forEach((r) => { if (!selected.includes(r.id)) onToggle(r.id); });
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold" style={{ color: '#12151C' }}>Select Records</h2>
          <button onClick={toggleAll} className="text-xs font-semibold py-1" style={{ color: '#2F6BFF' }}>
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: '#8A93A3' }}>
          Choose which records to share.{' '}
          <span className="font-medium" style={{ color: '#4B5265' }}>{selected.length} selected</span>
        </p>

        <div className="space-y-2">
          {records.map((record) => {
            const isSelected = selected.includes(record.id);
            const c = RECORD_TYPE_COLORS[record.type];
            return (
              <button
                key={record.id}
                onClick={() => onToggle(record.id)}
                className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl transition-all tap-target"
                style={{
                  border: isSelected ? `2px solid ${c.stroke}` : '2px solid #EEF1F6',
                  background: isSelected ? c.bg : '#FFFFFF',
                }}
              >
                {/* Checkbox */}
                <div
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    borderColor: isSelected ? '#2F6BFF' : '#EEF1F6',
                    background: isSelected ? '#2F6BFF' : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFFFFF' }}
                >
                  <RecordTypeIcon type={record.type} strokeColor={c.stroke} size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#12151C' }}>{record.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RecordTypeBadge type={record.type} />
                    <span className="text-xs" style={{ color: '#8A93A3' }}>{formatRecordDate(record.record_date)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 font-semibold text-sm py-4 rounded-2xl tap-target"
          style={{ background: '#EEF1F6', color: '#4B5265' }}
        >
          Back
        </button>
        <button
          disabled={selected.length === 0}
          onClick={onNext}
          className="flex-[2] font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40 transition-colors"
          style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
        >
          Continue — {selected.length} record{selected.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
