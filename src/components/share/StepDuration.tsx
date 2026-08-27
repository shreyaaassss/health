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
        <h2 className="text-xl font-bold mb-1" style={{ color: '#12151C' }}>Set Access Duration</h2>
        <p className="text-sm mb-5" style={{ color: '#8A93A3' }}>How long should the provider have access?</p>

        <div className="space-y-2">
          {DURATION_OPTIONS.map(({ value, description, isDemo }) => {
            const isSelected = selected === value;
            return (
              <button
                key={value}
                onClick={() => onSelect(value)}
                className="w-full text-left flex items-start gap-3 p-4 rounded-2xl transition-all tap-target"
                style={{
                  border: isSelected ? '2px solid #2F6BFF' : '2px solid #EEF1F6',
                  background: isSelected ? '#EAF1FF' : '#FFFFFF',
                }}
              >
                {/* Radio circle */}
                <div
                  className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: isSelected ? '#2F6BFF' : '#EEF1F6' }}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#2F6BFF' }} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: isSelected ? '#1D4FE0' : '#12151C' }}>
                      {ACCESS_DURATION_LABELS[value]}
                    </p>
                    {isDemo && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wide"
                        style={{ background: '#FEF6E7', color: '#E5A020', border: '1px solid #E5A02030' }}
                      >
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#8A93A3' }}>{description}</p>
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
          onClick={onNext}
          className="flex-[2] font-semibold text-sm py-4 rounded-2xl tap-target transition-colors"
          style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
