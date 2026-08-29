'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentRequestCard } from '@/components/doctor/AppointmentRequestCard';
import type { DoctorAppointment } from '@/app/api/doctor/appointments/route';
import type { RecentAccess } from '@/app/api/doctor/accesses/route';

interface Props {
  initialAppointments: DoctorAppointment[];
  recentAccesses: RecentAccess[];
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'just now';
}

function fmtDate(date: string | null, time: string | null) {
  if (!date) return 'Date TBD';
  const d = new Date(date + 'T00:00:00');
  const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  return time ? `${label} · ${time}` : label;
}

export function DoctorDashboard({ initialAppointments, recentAccesses }: Props) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(initialAppointments);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(id: string, status: 'confirmed' | 'cancelled') {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    startTransition(() => router.refresh());
  }

  async function handleComplete(id: string) {
    setCompletingId(id);
    await fetch(`/api/doctor/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete' }),
    });
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setCompletingId(null);
    startTransition(() => router.refresh());
  }

  const pending   = appointments.filter((a) => a.status === 'pending');
  const confirmed = appointments.filter((a) => a.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* ── Upcoming confirmed appointments ───────── */}
      {confirmed.length > 0 && (
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
            Upcoming Appointments
          </p>
          <div className="space-y-3">
            {confirmed.map((a) => (
              <div key={a.id} className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--card)', border: '1.5px solid #1FAA6D30' }}>
                {/* Date banner */}
                <div className="px-4 py-2.5 flex items-center justify-between"
                  style={{ background: '#E9F9F1', borderBottom: '1px solid #1FAA6D20' }}>
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#1FAA6D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p className="text-xs font-bold" style={{ color: '#1FAA6D' }}>
                      {fmtDate(a.confirmed_date, a.confirmed_time)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#1FAA6D', color: '#FFF' }}>CONFIRMED</span>
                </div>
                {/* Patient + reason */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#7B61FF,#2F6BFF)', color: '#FFF' }}>
                    {a.patient_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{a.patient_name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{a.reason}</p>
                    {a.doctor_notes && <p className="text-xs mt-0.5 truncate" style={{ color: '#2F6BFF' }}>{a.doctor_notes}</p>}
                  </div>
                  {/* Mark complete */}
                  <button
                    onClick={() => handleComplete(a.id)}
                    disabled={completingId === a.id}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl tap-target disabled:opacity-50"
                    style={{ background: 'var(--blue-tint)', color: '#1D4FE0' }}
                  >
                    {completingId === a.id ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                    Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pending appointment requests ──────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Appointment Requests</p>
            {pending.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                style={{ background: '#E5A020', color: '#FFF' }}>
                {pending.length}
              </span>
            )}
          </div>
          <button onClick={() => startTransition(() => router.refresh())} disabled={isPending}
            className="flex items-center justify-center w-7 h-7 rounded-full tap-target disabled:opacity-40"
            style={{ background: 'var(--line)' }}>
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              className={isPending ? 'animate-spin' : ''}>
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
          </button>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-2xl px-4 py-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((appt) => (
              <AppointmentRequestCard key={appt.id} appt={appt} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent patient accesses (collapsible) ─── */}
      {recentAccesses.length > 0 && (
        <details>
          <summary className="flex items-center justify-between cursor-pointer tap-target list-none">
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Recent Accesses</p>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </summary>
          <div className="mt-3 space-y-2">
            {recentAccesses.map((a) => (
              <div key={a.grant_id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{ background: 'var(--blue-tint)', color: '#1D4FE0' }}>
                  {a.patient_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{a.patient_name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                    {a.record_titles.slice(0, 2).join(', ')}{a.record_titles.length > 2 ? ` +${a.record_titles.length - 2}` : ''} · {timeAgo(a.created_at)}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={a.status === 'ACTIVE' ? { background: '#E9F9F1', color: '#1FAA6D' } : { background: 'var(--line)', color: 'var(--muted)' }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
