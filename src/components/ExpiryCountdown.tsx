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

  const bg = isDanger ? '#FFEDED' : isUrgent ? '#FFEDED' : '#FEF6E7';
  const border = isDanger ? '#FF6B6B' : isUrgent ? '#FF6B6B' : '#E5A020';
  const textColor = isDanger ? '#C23B3B' : isUrgent ? '#C23B3B' : '#E5A020';
  const subColor = isDanger ? '#FF6B6B' : isUrgent ? '#FF6B6B' : '#E5A020';

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isDanger ? 'animate-pulse' : ''}`}
      style={{ background: bg, border: `1px solid ${border}30` }}
    >
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={border} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
      </svg>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: textColor }}>
          {remaining <= 0 ? 'Expired' : `Expires in ${formatMs(remaining)}`}
        </p>
        <p style={{ fontSize: 10, color: subColor }}>
          {isDanger ? 'Access ending now' : 'Access expiring soon'}
        </p>
      </div>
    </div>
  );
}
