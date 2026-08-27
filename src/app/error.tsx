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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#F2F4F8' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#FFEDED' }}>
        <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="#C23B3B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#12151C' }}>Something went wrong</h2>
      <p className="text-sm mb-6 max-w-[260px]" style={{ color: '#8A93A3' }}>
        An unexpected error occurred. Please try again or reset the demo if the issue persists.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="font-semibold text-sm px-5 py-3 rounded-2xl tap-target"
          style={{ background: '#2F6BFF', color: '#FFFFFF' }}
        >
          Try Again
        </button>
        <a
          href="/patient/records"
          className="font-semibold text-sm px-5 py-3 rounded-2xl tap-target"
          style={{ background: '#EEF1F6', color: '#4B5265' }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
