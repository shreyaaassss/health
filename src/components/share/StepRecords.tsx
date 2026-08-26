import { RECORD_TYPE_COLORS, RECORD_TYPE_ICONS, formatRecordDate } from '@/lib/records';
import { RecordTypeBadge } from '@/components/RecordTypeBadge';
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
          <h2 className="text-xl font-bold text-slate-900">Select Records</h2>
          <button onClick={toggleAll} className="text-xs font-semibold text-teal-600 py-1">
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          Choose which records to share.{' '}
          <span className="font-medium text-slate-700">{selected.length} selected</span>
        </p>

        <div className="space-y-2">
          {records.map((record) => {
            const isSelected = selected.includes(record.id);
            const c = RECORD_TYPE_COLORS[record.type];
            return (
              <button
                key={record.id}
                onClick={() => onToggle(record.id)}
                className={`w-full text-left flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all tap-target
                  ${isSelected ? `${c.border} ${c.bg}` : 'border-slate-200 bg-white'}`}
              >
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${isSelected ? `${c.text.replace('text', 'border')} bg-current` : 'border-slate-300'}`}
                  style={isSelected ? { backgroundColor: 'currentColor' } : {}}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${c.iconBg}`}>
                  {RECORD_TYPE_ICONS[record.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{record.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RecordTypeBadge type={record.type} />
                    <span className="text-xs text-slate-400">{formatRecordDate(record.record_date)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={onBack} className="flex-1 bg-slate-100 text-slate-700 font-semibold text-sm py-4 rounded-2xl tap-target">
          Back
        </button>
        <button
          disabled={selected.length === 0}
          onClick={onNext}
          className="flex-[2] bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40 active:bg-teal-700 transition-colors"
        >
          Continue — {selected.length} record{selected.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
