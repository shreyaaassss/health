'use client';

export default function PatientError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#FFEDED' }}>
        <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#C23B3B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--ink)' }}>Failed to load</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>{error.message || 'Please try again.'}</p>
      <button
        onClick={reset}
        className="font-semibold text-sm px-5 py-3 rounded-2xl tap-target"
        style={{ background: '#2F6BFF', color: 'var(--card)' }}
      >
        Retry
      </button>
    </div>
  );
}
