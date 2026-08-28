'use client';

import { useState } from 'react';
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

export function DoctorDashboard({ initialAppointments, recentAccesses }: Props) {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(initialAppointments);

  function handleUpdate(id: string, status: 'confirmed' | 'cancelled') {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  const pending = appointments.filter((a) => a.status === 'pending');
  const confirmed = appointments.filter((a) => a.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* Appointment Requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
            Appointment Requests
            {pending.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                style={{ background: '#E5A020', color: '#FFF' }}>
                {pending.length}
              </span>
            )}
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-2xl px-4 py-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
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

      {/* Confirmed upcoming */}
      {confirmed.length > 0 && (
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Upcoming</p>
          <div className="space-y-2">
            {confirmed.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7B61FF,#2F6BFF)', color: '#FFF' }}>
                  {a.patient_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{a.patient_name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                    {a.reason} · {a.confirmed_date ?? a.preferred_date ?? 'TBD'}{a.confirmed_time ? ` · ${a.confirmed_time}` : ''}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: '#E9F9F1', color: '#1FAA6D' }}>CONFIRMED</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent patient accesses */}
      {recentAccesses.length > 0 && (
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Recent Patient Accesses</p>
          <div className="space-y-2">
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
                  style={a.status === 'ACTIVE'
                    ? { background: '#E9F9F1', color: '#1FAA6D' }
                    : { background: 'var(--line)', color: 'var(--muted)' }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
