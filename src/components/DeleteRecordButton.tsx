'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteRecordButton({ recordId, recordTitle }: { recordId: string; recordTitle: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');

    const res = await fetch(`/api/patient/records/${recordId}`, { method: 'DELETE' });
    const json = await res.json();

    if (!json.success) {
      setError(json.error ?? 'Failed to delete record.');
      setDeleting(false);
      return;
    }

    router.refresh();
    router.push('/patient/records');
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-4 rounded-2xl tap-target active:opacity-80 transition-opacity"
        style={{ background: '#FFEDED', color: '#C23B3B', borderRadius: 24 }}
      >
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#C23B3B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
        Delete Record
      </button>

      {/* Confirmation modal */}
      {confirming && (
        <div className="fixed inset-0 flex items-end bg-black/50" style={{ zIndex: 100 }} onClick={() => !deleting && setConfirming(false)}>
          <div
            className="w-full rounded-t-3xl px-5 pt-5"
            style={{ background: 'var(--card)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} />
            </div>

            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FFEDED' }}>
              <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#C23B3B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>

            <h2 className="text-xl font-bold text-center mb-1" style={{ color: 'var(--ink)' }}>Delete Record?</h2>
            <p className="text-sm text-center mb-2" style={{ color: 'var(--muted)' }}>
              This will permanently delete
            </p>
            <p className="text-sm font-semibold text-center mb-5" style={{ color: 'var(--ink)' }}>
              &ldquo;{recordTitle}&rdquo;
            </p>
            <p className="text-xs text-center mb-6" style={{ color: 'var(--muted)' }}>
              Any attached file will also be deleted. If this record is currently shared with a provider, they will lose access to it.
            </p>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ background: '#FFEDED', color: '#C23B3B' }}>{error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="flex-1 font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40"
                style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-[2] font-bold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#FFEDED', color: '#C23B3B' }}
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Deleting…
                  </>
                ) : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
