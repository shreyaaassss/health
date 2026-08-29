'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type State = 'idle' | 'confirming' | 'resetting' | 'done' | 'error';

const RESET_ITEMS = [
  {
    svg: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#E5A020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    ),
    label: 'All access grants (ACTIVE / REVOKED / EXPIRED)',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#E5A020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="17" r="3"/>
        <path d="M10 17h4a2 2 0 0 0 2-2v-2"/>
        <path d="M14 10V7a3 3 0 0 1 6 0v3"/>
        <rect x="14" y="10" width="6" height="5" rx="1"/>
      </svg>
    ),
    label: 'All access tokens',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#E5A020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
        <path d="M9 15h6M9 11h2"/>
      </svg>
    ),
    label: 'All audit logs',
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#1FAA6D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    label: 'Seed records restored to original state',
  },
];

export default function DemoResetPage() {
  const router = useRouter();
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleReset() {
    setState('resetting');
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.error ?? 'Reset failed.');
        setState('error');
        return;
      }
      setState('done');
      // Auto-redirect to records after 2 seconds
      setTimeout(() => router.push('/patient/records'), 2000);
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: '#12151C' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/inochi-logo.jpeg" alt="Inochi" width={36} height={36} style={{ borderRadius: 8, mixBlendMode: 'screen' }} />
          <div>
            <p className="text-xs" style={{ color: '#8A93A3' }}>Demo Control Panel</p>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#1E2229', border: '1px solid #2A2E38' }}>

          {state === 'done' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#1FAA6D20' }}>
                <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#1FAA6D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white font-bold text-lg mb-1">Demo Reset Complete</h2>
              <p className="text-sm mb-1" style={{ color: '#8A93A3' }}>All access grants, tokens, and logs cleared.</p>
              <p className="text-sm" style={{ color: '#8A93A3' }}>Seed records restored.</p>
              <p className="text-xs mt-4" style={{ color: '#2F6BFF' }}>Redirecting to records…</p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-lg mb-1">Reset Demo Data</h2>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: '#8A93A3' }}>
                This will clear <span className="text-white font-medium">all access grants, tokens, and audit logs</span>, then restore the original 5 seed medical records. Use before each demo run.
              </p>

              {/* What gets cleared */}
              <div className="space-y-2 mb-5">
                {RESET_ITEMS.map(({ svg, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="flex-shrink-0">{svg}</span>
                    <p className="text-xs" style={{ color: '#8A93A3' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Error */}
              {state === 'error' && (
                <div className="mb-4 rounded-xl px-3 py-2.5" style={{ background: '#FF6B6B15', border: '1px solid #FF6B6B30' }}>
                  <p className="text-sm" style={{ color: '#FF6B6B' }}>{errorMsg}</p>
                </div>
              )}

              {/* Confirm gate */}
              {state === 'idle' && (
                <button
                  onClick={() => setState('confirming')}
                  className="w-full text-white font-semibold text-sm py-3.5 rounded-2xl tap-target transition-colors"
                  style={{ background: '#2A2E38' }}
                >
                  Reset Demo Data
                </button>
              )}

              {state === 'confirming' && (
                <div className="space-y-3">
                  <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: '#E5A02015', border: '1px solid #E5A02030' }}>
                    <div className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#E5A020" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      <p className="text-xs font-semibold" style={{ color: '#E5A020' }}>This cannot be undone. Are you sure?</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setState('idle')}
                      className="flex-1 font-semibold text-sm py-3.5 rounded-2xl tap-target"
                      style={{ background: '#2A2E38', color: '#8A93A3' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-[2] font-bold text-sm py-3.5 rounded-2xl tap-target transition-colors"
                      style={{ background: '#FFEDED', color: '#C23B3B' }}
                    >
                      Yes, Reset
                    </button>
                  </div>
                </div>
              )}

              {state === 'resetting' && (
                <div className="flex items-center justify-center gap-3 py-3.5">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="#2F6BFF">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: '#8A93A3' }}>Resetting demo data…</p>
                </div>
              )}

              {state === 'error' && (
                <button
                  onClick={() => setState('idle')}
                  className="w-full text-white font-semibold text-sm py-3.5 rounded-2xl tap-target mt-2"
                  style={{ background: '#2A2E38' }}
                >
                  Try Again
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-center mt-4" style={{ color: '#4B5265' }}>
          Inochi · Demo Control Panel · Not visible to patients
        </p>
      </div>
    </div>
  );
}
