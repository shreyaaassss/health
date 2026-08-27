import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import { RecordCard } from '@/components/RecordCard';
import { RECORD_TYPE_COLORS } from '@/lib/records';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { MedicalRecord, AccessGrant, Provider, AccessGrantWithDetails } from '@/types';

export const metadata: Metadata = { title: 'Home · Health Wallet' };

async function getDashboardData() {
  const supabase = createAdminClient();

  const [
    { count: recordCount },
    { count: activeGrants },
    { data: patient },
    { data: recentRecords },
    { data: grantData },
  ] = await Promise.all([
    supabase.from('medical_records').select('*', { count: 'exact', head: true }).eq('patient_id', DEMO.PATIENT_ID),
    supabase.from('access_grants').select('*', { count: 'exact', head: true }).eq('patient_id', DEMO.PATIENT_ID).eq('status', 'ACTIVE'),
    supabase.from('patients').select('name').eq('id', DEMO.PATIENT_ID).single(),
    supabase.from('medical_records').select('*').eq('patient_id', DEMO.PATIENT_ID).order('record_date', { ascending: false }).limit(3),
    supabase.from('access_grants').select(`*, providers(*), access_grant_records( medical_records(*) )`).eq('patient_id', DEMO.PATIENT_ID).eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(1),
  ]);

  const firstGrant: AccessGrantWithDetails | null = grantData && grantData.length > 0
    ? {
        ...(grantData[0] as AccessGrant),
        provider: grantData[0].providers as Provider,
        records: ((grantData[0].access_grant_records as { medical_records: MedicalRecord }[]) ?? [])
          .map((r) => r.medical_records)
          .filter(Boolean),
        token: null,
      }
    : null;

  return {
    recordCount: recordCount ?? 0,
    activeGrants: activeGrants ?? 0,
    name: patient?.name ?? 'Patient',
    recentRecords: (recentRecords ?? []) as MedicalRecord[],
    firstGrant,
  };
}

export default async function HomePage() {
  const { recordCount, activeGrants, name, recentRecords, firstGrant } = await getDashboardData();
  const firstName = name.split(' ')[0];

  const pct = Math.min(Math.round((recordCount / 15) * 100), 100);
  const circumference = 238.76;
  const dashOffset = circumference * (1 - pct / 100);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-4 pt-6 pb-4" style={{ background: 'var(--page)', minHeight: '100%' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{greeting}</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>Hello, {firstName}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />
          {/* Notification bell */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7B61FF 0%, #2F6BFF 100%)' }}
          >
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--card)' }}>{firstName.charAt(0)}</span>
          </div>
        </div>
      </div>

      {/* Hero card */}
      <div
        className="mb-4 p-5"
        style={{ background: 'var(--card)', borderRadius: 26 }}
      >
        <div className="flex items-center gap-5">
          {/* Ring SVG */}
          <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
            <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="44" cy="44" r="38" fill="none" stroke="var(--line)" strokeWidth="9"/>
              <circle cx="44" cy="44" r="38" fill="none" stroke="#2F6BFF" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{pct}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Health Wallet</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginTop: 4, lineHeight: 1.3 }}>Your records, your control</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {recordCount} record{recordCount !== 1 ? 's' : ''} synced &middot; Last updated today
            </p>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link
          href="/patient/records"
          className="active:scale-[0.98] transition-transform"
          style={{ background: 'var(--card)', borderRadius: 18, padding: '14px 16px', display: 'block' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
            style={{ background: 'var(--blue-tint)' }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
              <path d="M9 15h6M9 11h2"/>
            </svg>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>{recordCount}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Medical Record{recordCount !== 1 ? 's' : ''}</p>
        </Link>
        <Link
          href="/patient/access"
          className="active:scale-[0.98] transition-transform"
          style={{ background: 'var(--card)', borderRadius: 18, padding: '14px 16px', display: 'block' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
            style={{ background: '#E9F9F1' }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#1FAA6D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>{activeGrants}</p>
            {activeGrants > 0 && (
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#1FAA6D', marginTop: 2 }} />
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Active Share{activeGrants !== 1 ? 's' : ''}</p>
        </Link>
      </div>

      {/* Active access card */}
      {firstGrant && (
        <div className="mb-4">
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Active Access</p>
          <div
            style={{ background: 'var(--card)', borderRadius: 18, border: '1.5px solid var(--blue-tint)', padding: '14px 16px' }}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Doctor avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--blue-tint)' }}
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{firstGrant.provider.name}</p>
                <p className="truncate" style={{ fontSize: 12, color: 'var(--muted)' }}>{firstGrant.provider.organization}</p>
              </div>
              {/* LIVE badge */}
              <span
                className="inline-flex items-center gap-1 flex-shrink-0"
                style={{ background: '#E9F9F1', color: '#1FAA6D', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '4px 10px' }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1FAA6D' }} />
                LIVE
              </span>
            </div>

            {/* Record chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {firstGrant.records.slice(0, 3).map((r) => {
                const c = RECORD_TYPE_COLORS[r.type];
                return (
                  <span
                    key={r.id}
                    style={{ background: 'var(--card-2)', color: '#1D4FE0', fontSize: 11, fontWeight: 600, borderRadius: 10, padding: '3px 8px' }}
                  >
                    {r.title}
                  </span>
                );
              })}
              {firstGrant.records.length > 3 && (
                <span style={{ background: 'var(--card-2)', color: 'var(--muted)', fontSize: 11, fontWeight: 600, borderRadius: 10, padding: '3px 8px' }}>
                  +{firstGrant.records.length - 3} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                {(() => {
                  const exp = new Date(firstGrant.expires_at);
                  const isUntilRevoked = exp.getFullYear() > new Date().getFullYear() + 50;
                  return isUntilRevoked ? 'Until revoked' : `Expires ${exp.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}`;
                })()}
              </p>
              <Link
                href="/patient/access"
                style={{ background: '#FFEDED', color: '#C23B3B', fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '6px 14px' }}
              >
                Revoke
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* My health records */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>My health records</p>
          <Link href="/patient/records" style={{ fontSize: 13, fontWeight: 600, color: '#2F6BFF' }}>See all</Link>
        </div>
        {recentRecords.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>No records yet</p>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>

      {/* Share CTA */}
      <Link
        href="/patient/share"
        className="w-full flex items-center justify-center gap-2 tap-target active:opacity-90 transition-opacity"
        style={{ background: '#2F6BFF', color: 'var(--card)', borderRadius: 24, padding: '16px', fontSize: 15, fontWeight: 700 }}
      >
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--card)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share medical records
      </Link>

    </div>
  );
}
