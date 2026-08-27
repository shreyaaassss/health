'use client';

import Link from 'next/link';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { ACCESS_DURATION_LABELS } from '@/types';
import type { AccessDuration } from '@/types';

interface Props {
  token: string;
  expiresAt: string;
  providerName: string;
  recordCount: number;
  duration: AccessDuration;
}

export function StepSuccess({ token, expiresAt, providerName, recordCount, duration }: Props) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const accessUrl = `${appUrl}/provider/access/${token}`;

  const expires = new Date(expiresAt);
  const isUntilRevoked = expires.getFullYear() > new Date().getFullYear() + 50;
  const expiresLabel = isUntilRevoked
    ? 'Until manually revoked'
    : expires.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="flex flex-col items-center text-center pb-4">

      {/* Success header */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: '#E9F9F1' }}
      >
        <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="#1FAA6D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-1" style={{ color: '#12151C' }}>Access Created</h2>
      <p className="text-sm mb-2" style={{ color: '#8A93A3' }}>
        <span className="font-semibold" style={{ color: '#4B5265' }}>{providerName}</span> can now access{' '}
        <span className="font-semibold" style={{ color: '#4B5265' }}>
          {recordCount} record{recordCount !== 1 ? 's' : ''}
        </span>
      </p>

      {/* Expiry pill */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
        style={isUntilRevoked
          ? { background: '#FEF6E7', color: '#E5A020', border: '1px solid #E5A02030' }
          : { background: '#E9F9F1', color: '#1FAA6D', border: '1px solid #1FAA6D30' }
        }
      >
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3"/>
        </svg>
        {ACCESS_DURATION_LABELS[duration]} · Expires {expiresLabel}
      </div>

      {/* Real QR code + copy/share buttons */}
      <div className="w-full">
        <QRCodeDisplay value={accessUrl} size={220} />
      </div>

      {/* Access URL preview */}
      <div className="w-full mt-4 rounded-xl px-3 py-2.5 text-left" style={{ background: '#F3F8FF', border: '1px solid #EEF1F6' }}>
        <p style={{ fontSize: 10, color: '#8A93A3', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Access URL</p>
        <p className="font-mono break-all leading-relaxed" style={{ fontSize: 12, color: '#4B5265' }}>{accessUrl}</p>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 mt-4 px-1 text-left">
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
          <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
        <p className="text-xs" style={{ color: '#8A93A3' }}>
          The link contains only an opaque token. No medical data is exposed in the URL.
          You can revoke access at any time.
        </p>
      </div>

      {/* Nav CTAs */}
      <div className="w-full space-y-3 mt-6">
        <Link
          href="/patient/access"
          className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-4 rounded-2xl tap-target transition-colors"
          style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="17" r="3"/>
            <path d="M10 17h4a2 2 0 0 0 2-2v-2"/>
            <path d="M14 10V7a3 3 0 0 1 6 0v3"/>
            <rect x="14" y="10" width="6" height="5" rx="1"/>
          </svg>
          View Active Access
        </Link>
        <Link
          href="/patient/records"
          className="w-full flex items-center justify-center text-sm py-2 tap-target"
          style={{ color: '#8A93A3' }}
        >
          Back to Records
        </Link>
      </div>
    </div>
  );
}
