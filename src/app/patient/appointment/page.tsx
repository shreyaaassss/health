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
      <Link href="/patient" className="inline-flex items-center gap-1 text-sm text-slate-500 mb-4 tap-target">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Home
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Appointment Form</h1>
      <p className="text-sm text-slate-500 mb-6">
        Scan the QR code from the hospital or enter your appointment code manually.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
        {(['scanner', 'manual'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors tap-target
              ${mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            {m === 'scanner' ? '📷 Scan QR' : '⌨️ Enter Code'}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center flex-1">
        {mode === 'scanner' ? (
          <>
            <QRScanner onCodeDetected={(code) => handleCode(code, 'qr_scan')} />
            <button
              onClick={() => setMode('manual')}
              className="mt-6 text-sm text-teal-600 font-medium tap-target"
            >
              Can&apos;t scan? Enter code manually →
            </button>
          </>
        ) : (
          <div className="w-full max-w-sm space-y-4">
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center gap-3">
              <span className="text-4xl">🏥</span>
              <p className="text-sm text-slate-600 text-center font-medium">
                Enter the appointment or hospital code
              </p>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. HOSP-2026-12345"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-center font-mono text-slate-800 focus:outline-none focus:border-teal-500"
                autoFocus
              />
            </div>

            <button
              onClick={handleManualSubmit}
              className="w-full bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target active:bg-teal-700"
            >
              Continue to Form
            </button>

            <p className="text-xs text-slate-400 text-center">
              No code? Leave it blank and tap Continue — you can fill the form manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
