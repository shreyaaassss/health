'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ActivePatientAccess } from '@/app/api/doctor/active-patients/route';

function timeLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

export default function ActivePatientsPage() {
  const router = useRouter();
  const [accesses, setAccesses] = useState<ActivePatientAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctor/active-patients')
      .then((r) => r.json())
      .then((j) => { if (j.success) setAccesses(j.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-5 pt-10 pb-8" style={{ background: 'var(--page)' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/doctor')} className="tap-target" style={{ color: 'var(--muted)' }}>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>Active Patient Accesses</h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Patients who have shared records with you</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--line)' }} />)}
        </div>
      ) : accesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--line)' }}>
            <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p className="font-medium text-sm" style={{ color: 'var(--ink-soft)' }}>No active patient accesses</p>
          <p className="text-xs mt-1 max-w-[220px]" style={{ color: 'var(--muted)' }}>When a patient shares records with you, they'll appear here for the duration of access.</p>
          <Link href="/doctor" className="mt-6 font-semibold text-sm px-5 py-3 rounded-2xl tap-target" style={{ background: '#2F6BFF', color: '#FFF' }}>
            Scan a QR Code
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {accesses.map((a) => {
            const isExpiringSoon = new Date(a.expires_at).getTime() - Date.now() < 60 * 60 * 1000;
            return (
              <div key={a.grant_id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: `1.5px solid ${isExpiringSoon ? '#E5A02030' : 'var(--line)'}` }}>
                {/* Expiry banner */}
                <div className="px-4 py-2 flex items-center justify-between"
                  style={{ background: isExpiringSoon ? '#FEF6E7' : '#E9F9F1', borderBottom: `1px solid ${isExpiringSoon ? '#E5A02030' : '#1FAA6D20'}` }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: isExpiringSoon ? '#E5A020' : '#1FAA6D' }} />
                    <p className="text-xs font-bold" style={{ color: isExpiringSoon ? '#E5A020' : '#1FAA6D' }}>
                      ACCESS ACTIVE · {timeLeft(a.expires_at)}
                    </p>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>

                {/* Patient + records */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7B61FF,#2F6BFF)', color: '#FFF' }}>
                      {a.patient_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{a.patient_name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {a.record_count} record{a.record_count !== 1 ? 's' : ''} shared
                      </p>
                    </div>
                  </div>

                  {/* Record chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {a.record_titles.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--blue-tint-2)', color: '#1D4FE0' }}>
                        {t}
                      </span>
                    ))}
                    {a.record_titles.length > 3 && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--line)', color: 'var(--muted)' }}>
                        +{a.record_titles.length - 3} more
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/provider/access/${a.token}`}
                    className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-xl tap-target"
                    style={{ background: '#2F6BFF', color: '#FFF' }}
                  >
                    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
                      <path d="M9 13h6M9 17h4"/>
                    </svg>
                    View Records
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
