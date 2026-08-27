'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRScanner } from '@/components/QRScanner';

export function DoctorQRScanner() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const handleCode = useCallback((raw: string) => {
    setScanning(false);
    setError('');

    // The QR encodes a full URL like https://app.com/provider/access/{token}
    // or just a token string — handle both
    try {
      const url = new URL(raw);
      // Extract /provider/access/{token} path
      const match = url.pathname.match(/\/provider\/access\/([^/]+)/);
      if (match) {
        router.push(`/provider/access/${match[1]}`);
        return;
      }
    } catch {
      // Not a URL — treat the raw value as the token directly
    }

    // Fallback: raw value might just be the token
    if (raw.match(/^[0-9a-f-]{36}$/i)) {
      router.push(`/provider/access/${raw}`);
      return;
    }

    setError('Unrecognised QR code. Ask the patient to share their access link again.');
  }, [router]);

  if (scanning) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{ background: 'var(--page)', zIndex: 200 }}>
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Scan Patient QR</p>
            <button
              onClick={() => setScanning(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center tap-target"
              style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <QRScanner onCodeDetected={handleCode} />

          <p className="text-sm text-center mt-5" style={{ color: 'var(--muted)' }}>
            Point at the QR code on the patient&apos;s phone
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Primary: scan QR */}
      <button
        onClick={() => { setError(''); setScanning(true); }}
        className="w-full flex items-center justify-center gap-3 font-bold text-sm py-4 rounded-2xl tap-target active:opacity-90 transition-opacity"
        style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
      >
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
          <rect x="7" y="7" width="10" height="10" rx="1"/>
        </svg>
        Scan Patient QR Code
      </button>

      {/* Secondary: paste link */}
      <PasteLinkEntry onToken={(token) => router.push(`/provider/access/${token}`)} />

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', color: '#C23B3B' }}>
          {error}
        </div>
      )}
    </div>
  );
}

function PasteLinkEntry({ onToken }: { onToken: (token: string) => void }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState('');

  function handleGo() {
    const trimmed = link.trim();
    try {
      const url = new URL(trimmed);
      const match = url.pathname.match(/\/provider\/access\/([^/]+)/);
      if (match) { onToken(match[1]); return; }
    } catch { /* not a URL */ }
    // raw token
    if (trimmed) onToken(trimmed);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-sm font-medium py-3 tap-target"
        style={{ color: 'var(--muted)' }}
      >
        Or paste an access link instead
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="url"
        autoFocus
        className="flex-1 rounded-xl px-3 py-3 text-sm focus:outline-none"
        style={{ border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }}
        placeholder="Paste access link…"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGo()}
      />
      <button
        onClick={handleGo}
        className="px-4 rounded-xl font-semibold text-sm tap-target"
        style={{ background: '#2F6BFF', color: '#FFFFFF' }}
      >
        Go
      </button>
    </div>
  );
}
