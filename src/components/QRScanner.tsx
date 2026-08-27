'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onCodeDetected: (code: string) => void;
}

export function QRScanner({ onCodeDetected }: Props) {
  const scannerRef = useRef<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        // Dynamic import to avoid SSR issues
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (active) {
              scanner.stop().catch(() => {});
              onCodeDetected(decodedText);
            }
          },
          () => {} // ignore scan errors (just means no QR in frame)
        );
        if (active) setStarted(true);
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg.includes('Permission') ? 'Camera permission denied.' : 'Camera not available.');
        }
      }
    }

    init();

    return () => {
      active = false;
      if (scannerRef.current) {
        (scannerRef.current as { stop: () => Promise<void> }).stop().catch(() => {});
      }
    };
  }, [onCodeDetected]);

  return (
    <div className="flex flex-col items-center">
      {/* Camera viewfinder */}
      <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-slate-900 border-2 border-teal-500">
        <div id="qr-reader" className="w-full h-full" />

        {/* Corner frame overlays */}
        {started && !error && (
          <>
            {[
              'top-2 left-2 border-t-2 border-l-2',
              'top-2 right-2 border-t-2 border-r-2',
              'bottom-2 left-2 border-b-2 border-l-2',
              'bottom-2 right-2 border-b-2 border-r-2',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 border-teal-400 rounded-sm ${cls}`} />
            ))}
            {/* Scan line animation */}
            <div className="absolute inset-x-4 h-0.5 bg-teal-400/70 top-1/2 animate-pulse" />
          </>
        )}

        {/* Loading state */}
        {!started && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <svg className="w-8 h-8 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xs text-slate-400">Starting camera…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="text-3xl">📷</span>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-3 text-center">
        Point at a hospital appointment QR code
      </p>
    </div>
  );
}
