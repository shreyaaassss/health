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
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <QRCode
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#0f172a"
          style={{ display: 'block' }}
        />
      </div>

      <p className="text-xs text-slate-500 text-center">
        Doctor scans this to open the secure portal
      </p>

      {/* Actions */}
      <div className="w-full space-y-2">
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 font-medium text-sm py-3 rounded-2xl tap-target active:bg-slate-50 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-teal-600">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />
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
      className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-medium text-sm py-3 rounded-2xl tap-target active:bg-slate-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
      </svg>
      Share via…
    </button>
  );
}
