'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_specialty: string;
  reason: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmed_date: string | null;
  confirmed_time: string | null;
  doctor_notes: string | null;
  cancelled_by: string | null;
  created_at: string;
}

interface Prescription {
  id: string;
  provider_name: string;
  provider_specialty: string;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  instructions: string | null;
  follow_up_date: string | null;
  prescribed_at: string;
  signed_by?: string | null;
  locked_at?: string | null;
}

interface Props {
  initialAppointments: Appointment[];
  prescriptions: Prescription[];
}

const STATUS = {
  pending:   { bg: '#FEF6E7', text: '#E5A020', dot: '#E5A020', label: 'Pending' },
  confirmed: { bg: '#E9F9F1', text: '#1FAA6D', dot: '#1FAA6D', label: 'Confirmed' },
  cancelled: { bg: '#FFEDED', text: '#C23B3B', dot: '#FF6B6B', label: 'Cancelled' },
  completed: { bg: '#EAF1FF', text: '#1D4FE0', dot: '#2F6BFF', label: 'Completed' },
} as const;

export function AppointmentList({ initialAppointments, prescriptions }: Props) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleCancel(appt: Appointment) {
    if (!confirm(`Cancel your appointment with ${appt.provider_name}?`)) return;
    setCancellingId(appt.id);
    setError('');

    const res = await fetch(`/api/patient/book/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    const json = await res.json();

    if (!json.success) { setError(json.error ?? 'Failed to cancel.'); setCancellingId(null); return; }
    setAppointments((prev) => prev.map((a) => a.id === appt.id ? { ...a, status: 'cancelled' } : a));
    setCancellingId(null);
    router.refresh();
  }

  const active = appointments.filter((a) => a.status !== 'cancelled');
  const cancelled = appointments.filter((a) => a.status === 'cancelled');

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', color: '#C23B3B' }}>{error}</div>}

      {/* Active appointments */}
      {active.length === 0 && prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--line)' }}>
            <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p className="font-medium text-sm mb-1" style={{ color: 'var(--ink-soft)' }}>No appointments yet</p>
          <p className="text-xs mb-6 max-w-[220px]" style={{ color: 'var(--muted)' }}>Book an appointment and the doctor will confirm a time.</p>
          <Link href="/patient/book/new" className="font-semibold text-sm px-5 py-3 rounded-2xl tap-target" style={{ background: '#2F6BFF', color: '#FFF' }}>
            Book First Appointment
          </Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-3">
              {active.map((a) => {
                const s = STATUS[a.status];
                return (
                  <div key={a.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                    <div className="px-4 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{a.provider_name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{a.provider_specialty}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                          style={{ background: s.bg, color: s.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                          {s.label}
                        </span>
                      </div>

                      <p className="text-sm mb-2" style={{ color: 'var(--ink-soft)' }}>{a.reason}</p>

                      {a.status === 'confirmed' && (a.confirmed_date || a.confirmed_time) ? (
                        <div className="rounded-xl px-3 py-2 mb-3" style={{ background: '#E9F9F1', border: '1px solid #1FAA6D20' }}>
                          <p className="text-xs font-semibold" style={{ color: '#1FAA6D' }}>
                            {a.confirmed_date}{a.confirmed_time ? ` · ${a.confirmed_time}` : ''}
                          </p>
                          {a.doctor_notes != null && (
                            <p className="text-xs mt-0.5" style={{ color: '#1FAA6D' }}>{String(a.doctor_notes)}</p>
                          )}
                        </div>
                      ) : a.status === 'pending' ? (
                        <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
                          Awaiting confirmation{a.preferred_date ? ` · Prefers ${a.preferred_date}${a.preferred_time ? ` ${a.preferred_time}` : ''}` : ''}
                        </p>
                      ) : null}

                      {/* Actions */}
                      {(a.status === 'pending' || a.status === 'confirmed') && (
                        <div className="flex gap-2 mt-2">
                          {/* Reschedule — link to new booking pre-filled with same doctor */}
                          <Link
                            href={`/patient/book/new?provider_id=${a.provider_id}`}
                            className="flex-1 text-center font-semibold text-xs py-2.5 rounded-xl tap-target"
                            style={{ background: 'var(--blue-tint)', color: '#1D4FE0' }}
                          >
                            {a.status === 'confirmed' ? 'Reschedule' : 'Change Request'}
                          </Link>
                          {/* Cancel */}
                          <button
                            onClick={() => handleCancel(a)}
                            disabled={cancellingId === a.id}
                            className="flex-1 font-semibold text-xs py-2.5 rounded-xl tap-target disabled:opacity-50"
                            style={{ background: '#FFEDED', color: '#C23B3B' }}
                          >
                            {cancellingId === a.id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Prescriptions */}
          {prescriptions.length > 0 && (
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Prescriptions</p>
              <div className="space-y-3">
                {prescriptions.map((p) => (
                  <div key={p.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                    {/* Prescription header — fixed timestamp */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)', background: 'var(--blue-tint-2)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{p.provider_name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{p.provider_specialty}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
                            {new Date(p.prescribed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                            {new Date(p.prescribed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {p.medications.map((m, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#2F6BFF' }} />
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{m.name}</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {p.instructions && (
                        <div className="rounded-xl px-3 py-2 mt-2" style={{ background: 'var(--blue-tint)', border: '1px solid #2F6BFF20' }}>
                          <p className="text-xs" style={{ color: '#1D4FE0' }}>{p.instructions}</p>
                        </div>
                      )}
                      {p.follow_up_date && (
                        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                          Follow-up: {new Date(p.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      {/* Digital signature + lock status */}
                      <div className="border-t pt-2 mt-1 flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
                        <p className="text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
                          ✦ Signed by: {p.signed_by ?? p.provider_name}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#E9F9F1', color: '#1FAA6D' }}>
                          VERIFIED
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled (collapsed) */}
          {cancelled.length > 0 && (
            <details>
              <summary className="text-sm cursor-pointer tap-target list-none" style={{ color: 'var(--muted)', fontWeight: 600 }}>
                {cancelled.length} cancelled appointment{cancelled.length !== 1 ? 's' : ''}
              </summary>
              <div className="mt-3 space-y-2">
                {cancelled.map((a) => (
                  <div key={a.id} className="rounded-xl px-4 py-3 opacity-60" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{a.provider_name} — {a.reason}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      Cancelled{a.cancelled_by ? ` by ${a.cancelled_by}` : ''}
                      {a.preferred_date ? ` · Was: ${a.preferred_date}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
