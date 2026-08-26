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
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-1">Access Created</h2>
      <p className="text-sm text-slate-500 mb-2">
        <span className="font-semibold text-slate-700">{providerName}</span> can now access{' '}
        <span className="font-semibold text-slate-700">
          {recordCount} record{recordCount !== 1 ? 's' : ''}
        </span>
      </p>

      {/* Expiry pill */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-6
        ${isUntilRevoked ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        {ACCESS_DURATION_LABELS[duration]} · Expires {expiresLabel}
      </div>

      {/* Real QR code + copy/share buttons */}
      <div className="w-full">
        <QRCodeDisplay value={accessUrl} size={220} />
      </div>

      {/* Access URL preview */}
      <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-left">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-1">Access URL</p>
        <p className="text-xs font-mono text-slate-600 break-all leading-relaxed">{accessUrl}</p>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 mt-4 px-1 text-left">
        <svg className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
        <p className="text-xs text-slate-500">
          The link contains only an opaque token. No medical data is exposed in the URL.
          You can revoke access at any time.
        </p>
      </div>

      {/* Nav CTAs */}
      <div className="w-full space-y-3 mt-6">
        <Link
          href="/patient/access"
          className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target active:bg-teal-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
          </svg>
          View Active Access
        </Link>
        <Link
          href="/patient/records"
          className="w-full flex items-center justify-center text-slate-500 text-sm py-2 tap-target"
        >
          Back to Records
        </Link>
      </div>
    </div>
  );
}
