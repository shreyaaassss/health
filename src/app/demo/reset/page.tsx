'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type State = 'idle' | 'confirming' | 'resetting' | 'done' | 'error';

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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Health Wallet</p>
            <p className="text-slate-400 text-xs">Demo Control Panel</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">

          {state === 'done' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white font-bold text-lg mb-1">Demo Reset Complete</h2>
              <p className="text-slate-400 text-sm mb-1">All access grants, tokens, and logs cleared.</p>
              <p className="text-slate-400 text-sm">Seed records restored.</p>
              <p className="text-teal-400 text-xs mt-4">Redirecting to records…</p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-lg mb-1">Reset Demo Data</h2>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                This will clear <span className="text-white font-medium">all access grants, tokens, and audit logs</span>, then restore the original 5 seed medical records. Use before each demo run.
              </p>

              {/* What gets cleared */}
              <div className="space-y-2 mb-5">
                {[
                  { icon: '🗑️', label: 'All access grants (ACTIVE / REVOKED / EXPIRED)' },
                  { icon: '🔑', label: 'All access tokens' },
                  { icon: '📋', label: 'All audit logs' },
                  { icon: '✅', label: 'Seed records restored to original state' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <p className="text-slate-300 text-xs">{label}</p>
                  </div>
                ))}
              </div>

              {/* Error */}
              {state === 'error' && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                </div>
              )}

              {/* Confirm gate */}
              {state === 'idle' && (
                <button
                  onClick={() => setState('confirming')}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm py-3.5 rounded-2xl tap-target transition-colors"
                >
                  Reset Demo Data
                </button>
              )}

              {state === 'confirming' && (
                <div className="space-y-3">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-amber-300 text-xs font-semibold">⚠️ This cannot be undone. Are you sure?</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setState('idle')}
                      className="flex-1 bg-slate-700 text-slate-300 font-semibold text-sm py-3.5 rounded-2xl tap-target"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-[2] bg-red-600 text-white font-bold text-sm py-3.5 rounded-2xl tap-target active:bg-red-700 transition-colors"
                    >
                      Yes, Reset
                    </button>
                  </div>
                </div>
              )}

              {state === 'resetting' && (
                <div className="flex items-center justify-center gap-3 py-3.5">
                  <svg className="w-5 h-5 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-slate-300 text-sm font-medium">Resetting demo data…</p>
                </div>
              )}

              {state === 'error' && (
                <button
                  onClick={() => setState('idle')}
                  className="w-full bg-slate-700 text-white font-semibold text-sm py-3.5 rounded-2xl tap-target mt-2"
                >
                  Try Again
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-slate-600 text-xs text-center mt-4">
          Health Wallet · Demo Control Panel · Not visible to patients
        </p>
      </div>
    </div>
  );
}
