'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRScanner } from '@/components/QRScanner';

type Mode = 'scanner' | 'manual';

// ─────────────────────────────────────────────
//  resolveAppointmentSource
//  Isolates "what happens after a code is captured" per spec.
//  TODO: In a future phase, fetch hospital-specific form fields here
//  using the scanned code. For now, proceed with the generic field set.
// ─────────────────────────────────────────────
function resolveAppointmentSource(code: string, type: 'qr_scan' | 'manual_entry') {
  return {
    source: { type, rawCode: code, hospitalId: undefined, hospitalName: undefined },
    // Future: const hospitalConfig = await fetchHospitalConfig(code);
    // For now: use standard form fields (no hospital-specific customisation)
  };
}

export default function AppointmentEntryPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('scanner');
  const [manualCode, setManualCode] = useState('');

  const handleCode = useCallback((code: string, type: 'qr_scan' | 'manual_entry') => {
    const resolved = resolveAppointmentSource(code, type);
    // Pass source through URL state → form page reads it
    const params = new URLSearchParams({
      sourceType: resolved.source.type,
      ...(resolved.source.rawCode && { rawCode: resolved.source.rawCode }),
    });
    router.push(`/patient/appointment/form?${params.toString()}`);
  }, [router]);

  const handleManualSubmit = () => {
    const code = manualCode.trim() || 'MANUAL';
    handleCode(code, 'manual_entry');
  };

  return (
    <div className="min-h-full flex flex-col px-4 pt-6 pb-4">
      {/* Back */}
      <Link href="/patient" className="inline-flex items-center gap-1 text-sm mb-4 tap-target" style={{ color: '#8A93A3' }}>
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#8A93A3" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Home
      </Link>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#12151C' }}>Appointment Form</h1>
      <p className="text-sm mb-6" style={{ color: '#8A93A3' }}>
        Scan the QR code from the hospital or enter your appointment code manually.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: '#EEF1F6' }}>
        {(['scanner', 'manual'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors tap-target"
            style={{
              background: mode === m ? '#FFFFFF' : 'transparent',
              color: mode === m ? '#12151C' : '#8A93A3',
              boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {m === 'scanner' ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                  <rect x="7" y="7" width="10" height="10" rx="1"/>
                </svg>
                Scan QR
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Enter Code
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center flex-1">
        {mode === 'scanner' ? (
          <>
            <QRScanner onCodeDetected={(code) => handleCode(code, 'qr_scan')} />
            <button
              onClick={() => setMode('manual')}
              className="mt-6 text-sm font-medium tap-target"
              style={{ color: '#2F6BFF' }}
            >
              Can&apos;t scan? Enter code manually →
            </button>
          </>
        ) : (
          <div className="w-full max-w-sm space-y-4">
            <div
              className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3"
              style={{ background: '#F3F8FF', borderColor: '#EEF1F6' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#EAF1FF' }}
              >
                <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
              <p className="text-sm text-center font-medium" style={{ color: '#4B5265' }}>
                Enter the appointment or hospital code
              </p>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. HOSP-2026-12345"
                className="w-full rounded-xl px-4 py-3 text-sm text-center font-mono focus:outline-none"
                style={{ border: '1px solid #EEF1F6', background: '#FFFFFF', color: '#12151C' }}
                autoFocus
              />
            </div>

            <button
              onClick={handleManualSubmit}
              className="w-full font-semibold text-sm py-4 rounded-2xl tap-target"
              style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
            >
              Continue to Form
            </button>

            <p className="text-xs text-center" style={{ color: '#8A93A3' }}>
              No code? Leave it blank and tap Continue — you can fill the form manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
