'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

interface Props {
  value: string;       // the full URL encoded in the QR
  size?: number;
}

export function QRCodeDisplay({ value, size = 220 }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ url: value, title: 'Medical Record Access Link' });
    } catch {
      // share cancelled or not supported
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR code frame */}
      <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid var(--line)' }}>
        <QRCode
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="var(--ink)"
          style={{ display: 'block' }}
        />
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
        Doctor scans this to open the secure portal
      </p>

      {/* Actions */}
      <div className="w-full space-y-2">
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 font-medium text-sm py-3 rounded-2xl tap-target transition-colors"
          style={{ border: '1px solid var(--blue-tint)', background: 'var(--blue-tint)', color: copied ? '#1FAA6D' : '#2F6BFF' }}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#1FAA6D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span style={{ color: '#1FAA6D' }}>Copied!</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />
              </svg>
              Copy Access Link
            </>
          )}
        </button>

        {/* Native share — only rendered if Web Share API is available */}
        <NativeShareButton url={value} />
      </div>
    </div>
  );
}

// Conditionally renders the native share button only when the API is available
function NativeShareButton({ url }: { url: string }) {
  if (typeof navigator === 'undefined' || !navigator.share) return null;

  return (
    <button
      onClick={() => navigator.share({ url, title: 'Medical Record Access Link' }).catch(() => {})}
      className="w-full flex items-center justify-center gap-2 font-medium text-sm py-3 rounded-2xl tap-target transition-colors"
      style={{ background: 'var(--blue-tint)', color: '#2F6BFF', border: '1px solid #2F6BFF30' }}
    >
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      Share via…
    </button>
  );
}
