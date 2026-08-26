'use client';

import { useState } from 'react';
import Link from 'next/link';

// Floating Action Button for demo — gives judges quick access to reset
// Tap the logo to expand, tap reset to go to /demo/reset
export function DemoFab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 items-end">
          <Link
            href="/demo/reset"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg tap-target whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reset Demo
          </Link>
          <Link
            href="/patient/share"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-teal-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg tap-target whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            Share Records
          </Link>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 bg-slate-800 rounded-full shadow-lg flex items-center justify-center tap-target border border-slate-700 active:scale-95 transition-transform"
        aria-label="Demo controls"
      >
        {open ? (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-[10px] font-black text-teal-400">DEV</span>
        )}
      </button>
    </div>
  );
}
