'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  expiresAt: string;
  onExpired: () => void;
}

function msLeft(expiresAt: string): number {
  return new Date(expiresAt).getTime() - Date.now();
}

function formatMs(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const hrs  = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// Only show countdown if expiry is within 10 minutes
const COUNTDOWN_THRESHOLD_MS = 10 * 60 * 1000;

export function ExpiryCountdown({ expiresAt, onExpired }: Props) {
  const [remaining, setRemaining] = useState(() => msLeft(expiresAt));
  const firedRef = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => {
      const left = msLeft(expiresAt);
      setRemaining(left);

      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        clearInterval(tick);
        onExpired();
      }
    }, 500);

    return () => clearInterval(tick);
  }, [expiresAt, onExpired]);

  // Don't render if expiry is far away
  if (remaining > COUNTDOWN_THRESHOLD_MS) return null;

  const isUrgent = remaining < 60_000; // < 1 minute
  const isDanger = remaining < 15_000; // < 15 seconds

  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-colors
      ${isDanger
        ? 'bg-red-50 border-red-200 animate-pulse'
        : isUrgent
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <svg
        className={`w-4 h-4 flex-shrink-0 ${isDanger ? 'text-red-500' : 'text-amber-500'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <div>
        <p className={`text-xs font-bold ${isDanger ? 'text-red-700' : 'text-amber-700'}`}>
          {remaining <= 0 ? 'Expired' : `Expires in ${formatMs(remaining)}`}
        </p>
        <p className={`text-[10px] ${isDanger ? 'text-red-500' : 'text-amber-600'}`}>
          {isDanger ? 'Access ending now' : 'Access expiring soon'}
        </p>
      </div>
    </div>
  );
}
