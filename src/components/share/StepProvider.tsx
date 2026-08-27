import type { Provider } from '@/types';

interface Props {
  providers: Provider[];
  selected: Provider | null;
  onSelect: (p: Provider) => void;
  onNext: () => void;
}

export function StepProvider({ providers, selected, onSelect, onNext }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-1" style={{ color: '#12151C' }}>Select Provider</h2>
        <p className="text-sm mb-5" style={{ color: '#8A93A3' }}>Who are you sharing your records with?</p>

        <div className="space-y-3">
          {providers.map((p) => {
            const isSelected = selected?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="w-full text-left flex items-center gap-4 p-4 rounded-2xl tap-target transition-all"
                style={{
                  border: isSelected ? '2px solid #2F6BFF' : '2px solid #EEF1F6',
                  background: isSelected ? '#EAF1FF' : '#FFFFFF',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isSelected ? '#FFFFFF' : '#F3F8FF' }}
                >
                  {/* Building / hospital icon */}
                  <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={isSelected ? '#2F6BFF' : '#8A93A3'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 3v18M3 9h18M3 15h18M15 3v18"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: isSelected ? '#1D4FE0' : '#12151C' }}>{p.name}</p>
                  <p className="text-xs truncate" style={{ color: '#8A93A3' }}>{p.organization}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8A93A3' }}>{p.specialty}</p>
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#2F6BFF' }}
                  >
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        disabled={!selected}
        onClick={onNext}
        className="mt-6 w-full font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40 transition-colors"
        style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
      >
        Continue
      </button>
    </div>
  );
}
