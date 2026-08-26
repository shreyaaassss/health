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
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to load</h2>
      <p className="text-sm text-slate-500 mb-6">{error.message || 'Please try again.'}</p>
      <button
        onClick={reset}
        className="bg-teal-600 text-white font-semibold text-sm px-5 py-3 rounded-2xl tap-target"
      >
        Retry
      </button>
    </div>
  );
}
