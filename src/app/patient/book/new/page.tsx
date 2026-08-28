'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Provider } from '@/types';

const inputClass = 'w-full rounded-xl px-4 py-3 text-sm focus:outline-none';
const inputStyle = { border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' };

const TIME_SLOTS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'];

export default function BookNewPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  // Pre-select provider from ?provider_id= (used by reschedule flow)
  const [providerId, setProviderId] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('provider_id') ?? '';
    }
    return '';
  });
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/patient/providers')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setProviders(j.data);
          // Only set default if not already pre-selected via URL
          if (!providerId) setProviderId(j.data[0]?.id ?? '');
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId || !reason.trim()) { setError('Please select a doctor and enter a reason.'); return; }
    setLoading(true);
    setError('');

    const res = await fetch('/api/patient/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: providerId, reason, preferred_date: date || undefined, preferred_time: time || undefined }),
    });
    const json = await res.json();

    if (!json.success) { setError(json.error ?? 'Failed to book.'); setLoading(false); return; }
    router.push('/patient/book');
    router.refresh();
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <Link href="/patient/book" className="inline-flex items-center gap-1 text-sm mb-4 tap-target" style={{ color: 'var(--muted)' }}>
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7"/>
        </svg>
        My Appointments
      </Link>

      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Book Appointment</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Request an appointment with a doctor. They will confirm a date and time.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Doctor */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>
            Doctor <span style={{ color: '#FF6B6B' }}>*</span>
          </label>
          <select
            className={inputClass} style={inputStyle}
            value={providerId} onChange={(e) => setProviderId(e.target.value)}
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.specialty}</option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>
            Reason for visit <span style={{ color: '#FF6B6B' }}>*</span>
          </label>
          <textarea
            required rows={3} className={`${inputClass} resize-none`} style={inputStyle}
            value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Back pain, routine checkup, follow-up…"
          />
        </div>

        {/* Preferred date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>
            Preferred Date <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            type="date" className={inputClass} style={inputStyle}
            value={date} onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Preferred time */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>
            Preferred Time <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <select className={inputClass} style={inputStyle} value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="">Any time</option>
            {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--blue-tint)', border: '1px solid #2F6BFF20' }}>
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <p className="text-xs" style={{ color: '#1D4FE0' }}>
            The doctor will review your request and confirm a time. You&apos;ll see updates in My Appointments.
          </p>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', color: '#C23B3B' }}>{error}</div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: '#2F6BFF', color: '#FFF', borderRadius: 24 }}
        >
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending request…</>
          ) : 'Send Appointment Request'}
        </button>
      </form>
    </div>
  );
}
