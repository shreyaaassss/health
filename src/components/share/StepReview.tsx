import { ACCESS_DURATION_LABELS } from '@/types';
import { RECORD_TYPE_ICONS, formatRecordDate } from '@/lib/records';
import type { AccessDuration, MedicalRecord, Provider } from '@/types';

interface Props {
  provider: Provider;
  records: MedicalRecord[];
  duration: AccessDuration;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export function StepReview({ provider, records, duration, onConfirm, onBack, loading }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Review & Share</h2>
        <p className="text-sm text-slate-500 mb-5">Confirm the details before sharing.</p>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

          {/* Provider */}
          <div className="px-4 py-4 border-b border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Sharing with</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl">🩺</div>
              <div>
                <p className="text-sm font-bold text-slate-900">{provider.name}</p>
                <p className="text-xs text-slate-500">{provider.organization}</p>
              </div>
            </div>
          </div>

          {/* Records */}
          <div className="px-4 py-4 border-b border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
              Records ({records.length})
            </p>
            <div className="space-y-1.5">
              {records.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="text-base">{RECORD_TYPE_ICONS[r.type]}</span>
                  <span className="text-sm text-slate-700 flex-1 truncate">{r.title}</span>
                  <span className="text-xs text-slate-400">{formatRecordDate(r.record_date)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="px-4 py-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Access duration</p>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-sm font-semibold text-slate-800">{ACCESS_DURATION_LABELS[duration]}</p>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mt-4 flex items-start gap-2 px-1">
          <svg className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <p className="text-xs text-slate-500">
            You can revoke this access at any time from the Active Access tab. The provider will immediately lose access.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          disabled={loading}
          onClick={onBack}
          className="flex-1 bg-slate-100 text-slate-700 font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40"
        >
          Back
        </button>
        <button
          disabled={loading}
          onClick={onConfirm}
          className="flex-[2] bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 active:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating access…
            </>
          ) : (
            'Share Records'
          )}
        </button>
      </div>
    </div>
  );
}
