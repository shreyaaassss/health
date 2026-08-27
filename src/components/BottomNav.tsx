'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS: { href: string; label: string; exactMatch?: boolean; icon: (active: boolean) => React.ReactNode }[] = [
  {
    href: '/patient',
    label: 'Home',
    exactMatch: true,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" width={22} height={22} stroke={active ? '#2F6BFF' : '#8A93A3'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3l9 9"/>
        <path d="M9 21V12h6v9"/>
        <path d="M3 12v9h18V12"/>
      </svg>
    ),
  },
  {
    href: '/patient/records',
    label: 'Records',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" width={22} height={22} stroke={active ? '#2F6BFF' : '#8A93A3'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
        <path d="M9 13h6M9 17h4"/>
      </svg>
    ),
  },
  {
    href: '/patient/share',
    label: 'Share',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" width={22} height={22} stroke={active ? '#2F6BFF' : '#8A93A3'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
  {
    href: '/patient/access',
    label: 'Access',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" width={22} height={22} stroke={active ? '#2F6BFF' : '#8A93A3'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="17" r="3"/>
        <path d="M10 17h4a2 2 0 0 0 2-2v-2"/>
        <path d="M14 10V7a3 3 0 0 1 6 0v3"/>
        <rect x="14" y="10" width="6" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/patient/history',
    label: 'History',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" width={22} height={22} stroke={active ? '#2F6BFF' : '#8A93A3'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)', borderTop: '1px solid #EEF1F6' }}
    >
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon, exactMatch }) => {
          const active = exactMatch ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 tap-target"
            >
              {active ? (
                <div style={{ background: '#EAF1FF', borderRadius: 14, padding: '6px 16px' }}>
                  {icon(true)}
                </div>
              ) : (
                <div style={{ padding: '6px 16px' }}>
                  {icon(false)}
                </div>
              )}
              <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#2F6BFF' : '#8A93A3' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
