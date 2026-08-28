'use client';

import { useEffect, useState } from 'react';

function fmt(ms: number) {
  if (ms <= 0) return 'Expired';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  if (m > 0) return `${m}:${String(sec).padStart(2, '0')} remaining`;
  return `${sec}s remaining`;
}

export function AccessTimer({ expiresAt }: { expiresAt: string }) {
  const isForever = new Date(expiresAt).getFullYear() > new Date().getFullYear() + 50;
  const [ms, setMs] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    if (isForever) return;
    const t = setInterval(() => setMs(new Date(expiresAt).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt, isForever]);

  if (isForever) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: '#FFFFFF15', color: '#8A93A3' }}>
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
        </svg>
        Until patient revokes
      </span>
    );
  }

  const isUrgent = ms < 10 * 60 * 1000;  // < 10 min
  const isDanger = ms < 2 * 60 * 1000;   // < 2 min

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${isDanger ? 'animate-pulse' : ''}`}
      style={isDanger
        ? { background: '#FFEDED', color: '#C23B3B' }
        : isUrgent
        ? { background: '#FEF6E7', color: '#E5A020' }
        : { background: '#FFFFFF15', color: '#8A93A3' }
      }
    >
      <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
      </svg>
      {fmt(ms)}
    </span>
  );
}
