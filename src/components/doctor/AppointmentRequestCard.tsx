'use client';

import { useState } from 'react';
import type { DoctorAppointment } from '@/app/api/doctor/appointments/route';

interface Props {
  appt: DoctorAppointment;
  onUpdate: (id: string, status: 'confirmed' | 'cancelled') => void;
}

export function AppointmentRequestCard({ appt, onUpdate }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [date, setDate] = useState(appt.preferred_date ?? '');
  const [time, setTime] = useState(appt.preferred_time ?? '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPending = appt.status === 'pending';
  const isConfirmed = appt.status === 'confirmed';
  const isCancelled = appt.status === 'cancelled';

  const statusStyle = isConfirmed
    ? { bg: '#E9F9F1', text: '#1FAA6D', dot: '#1FAA6D' }
    : isCancelled
    ? { bg: '#FFEDED', text: '#C23B3B', dot: '#FF6B6B' }
    : { bg: '#FEF6E7', text: '#E5A020', dot: '#E5A020' };

  async function handleAction(action: 'confirm' | 'cancel') {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/doctor/appointments/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, confirmed_date: date, confirmed_time: time, doctor_notes: notes }),
    });
    const json = await res.json();
    if (!json.success) { setError(json.error ?? 'Failed'); setLoading(false); return; }
    onUpdate(appt.id, json.data.status);
    setConfirming(false);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
      <div className="px-4 py-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7B61FF,#2F6BFF)', color: '#FFF' }}>
              {appt.patient_name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{appt.patient_name}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {new Date(appt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: statusStyle.bg, color: statusStyle.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.dot }} />
            {appt.status.toUpperCase()}
          </span>
        </div>

        {/* Reason */}
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>{appt.reason}</p>

        {/* Preferred time */}
        {(appt.preferred_date || appt.preferred_time) && (
          <div className="flex items-center gap-1.5 mb-3">
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Prefers: {appt.preferred_date ?? 'Any date'}{appt.preferred_time ? ` · ${appt.preferred_time}` : ''}
            </p>
          </div>
        )}

        {/* Confirmed slot */}
        {isConfirmed && appt.confirmed_date && (
          <div className="rounded-xl px-3 py-2 mb-3" style={{ background: '#E9F9F1', border: '1px solid #1FAA6D30' }}>
            <p className="text-xs font-semibold" style={{ color: '#1FAA6D' }}>
              Confirmed: {appt.confirmed_date}{appt.confirmed_time ? ` · ${appt.confirmed_time}` : ''}
            </p>
            {appt.doctor_notes && <p className="text-xs mt-0.5" style={{ color: '#1FAA6D' }}>{appt.doctor_notes}</p>}
          </div>
        )}

        {error && <p className="text-xs mb-2" style={{ color: '#C23B3B' }}>{error}</p>}

        {/* Actions */}
        {isPending && !confirming && (
          <div className="flex gap-2">
            <button onClick={() => setConfirming(true)}
              className="flex-1 font-semibold text-sm py-2.5 rounded-xl tap-target"
              style={{ background: '#2F6BFF', color: '#FFF' }}>
              Confirm
            </button>
            <button onClick={() => handleAction('cancel')} disabled={loading}
              className="flex-1 font-semibold text-sm py-2.5 rounded-xl tap-target disabled:opacity-50"
              style={{ background: '#FFEDED', color: '#C23B3B' }}>
              Decline
            </button>
          </div>
        )}

        {/* Confirm form */}
        {confirming && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: 'var(--muted)' }}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{ border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }}/>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: 'var(--muted)' }}>Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{ border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }}/>
              </div>
            </div>
            <input placeholder="Notes for patient (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }}/>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)}
                className="flex-1 font-semibold text-sm py-2.5 rounded-xl tap-target"
                style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>
                Back
              </button>
              <button onClick={() => handleAction('confirm')} disabled={loading}
                className="flex-[2] font-semibold text-sm py-2.5 rounded-xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#2F6BFF', color: '#FFF' }}>
                {loading ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : null}
                Confirm Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
