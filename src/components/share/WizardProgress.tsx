const STEPS = ['Provider', 'Records', 'Duration', 'Review'];

export function WizardProgress({ current }: { current: number }) {
  if (current >= STEPS.length) return null; // hide on success screen

  return (
    <div className="mb-6">
      {/* Step label */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#2F6BFF' }}>
          Step {current + 1} of {STEPS.length}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{STEPS[current]}</p>
      </div>

      {/* Track */}
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-colors"
            style={{ background: i <= current ? '#2F6BFF' : 'var(--line)' }}
          />
        ))}
      </div>
    </div>
  );
}
