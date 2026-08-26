import { ACCESS_DURATION_LABELS } from '@/types';
import type { AccessDuration } from '@/types';

interface Props {
  selected: AccessDuration;
  onSelect: (d: AccessDuration) => void;
  onNext: () => void;
  onBack: () => void;
}

const DURATION_OPTIONS: { value: AccessDuration; description: string; isDemo?: boolean }[] = [
  { value: '1_MINUTE',      description: 'Access expires in 60 seconds. For demo use only.', isDemo: true },
  { value: '30_MINUTES',    description: 'Short-term access for a brief consultation.' },
  { value: '24_HOURS',      description: 'Access for a full day — ideal for new patients.' },
  { value: '7_DAYS',        description: 'Extended access for ongoing treatment.' },
  { value: 'UNTIL_REVOKED', description: 'Access remains active until you revoke it manually.' },
];

export function StepDuration({ selected, onSelect, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Set Access Duration</h2>
        <p className="text-sm text-slate-500 mb-5">How long should the provider have access?</p>

        <div className="space-y-2">
          {DURATION_OPTIONS.map(({ value, description, isDemo }) => {
            const isSelected = selected === value;
            return (
              <button
                key={value}
                onClick={() => onSelect(value)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border-2 transition-all tap-target
                  ${isSelected ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}
              >
                {/* Radio circle */}
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'border-teal-500' : 'border-slate-300'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isSelected ? 'text-teal-800' : 'text-slate-900'}`}>
                      {ACCESS_DURATION_LABELS[value]}
                    </p>
                    {isDemo && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full tracking-wide">
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{description}</p>
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
          onClick={onNext}
          className="flex-[2] bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target active:bg-teal-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
