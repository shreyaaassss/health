'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-[260px]">
        An unexpected error occurred. Please try again or reset the demo if the issue persists.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-teal-600 text-white font-semibold text-sm px-5 py-3 rounded-2xl tap-target"
        >
          Try Again
        </button>
        <a
          href="/patient/records"
          className="bg-slate-100 text-slate-700 font-semibold text-sm px-5 py-3 rounded-2xl tap-target"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
