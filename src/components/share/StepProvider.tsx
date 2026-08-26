import type { Provider } from '@/types';

interface Props {
  providers: Provider[];
  selected: Provider | null;
  onSelect: (p: Provider) => void;
  onNext: () => void;
}

const SPECIALTY_ICONS: Record<string, string> = {
  'General Physician': '🩺',
  'Internal Medicine': '💊',
  'Radiology': '🩻',
};

export function StepProvider({ providers, selected, onSelect, onNext }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Select Provider</h2>
        <p className="text-sm text-slate-500 mb-5">Who are you sharing your records with?</p>

        <div className="space-y-3">
          {providers.map((p) => {
            const isSelected = selected?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition-all tap-target
                  ${isSelected
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 bg-white'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                  ${isSelected ? 'bg-teal-100' : 'bg-slate-100'}`}>
                  {SPECIALTY_ICONS[p.specialty] ?? '🏥'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isSelected ? 'text-teal-800' : 'text-slate-900'}`}>{p.name}</p>
                  <p className="text-xs text-slate-500 truncate">{p.organization}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.specialty}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
        className="mt-6 w-full bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40 active:bg-teal-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
