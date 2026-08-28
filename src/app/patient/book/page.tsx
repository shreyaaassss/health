import { requirePatientId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Appointments · Health Wallet' };

async function getAppointments(patientId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('appointments')
    .select('*, providers(name, specialty)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

const STATUS_STYLE = {
  pending:   { bg: '#FEF6E7', text: '#E5A020', dot: '#E5A020', label: 'Pending' },
  confirmed: { bg: '#E9F9F1', text: '#1FAA6D', dot: '#1FAA6D', label: 'Confirmed' },
  cancelled: { bg: '#FFEDED', text: '#C23B3B', dot: '#FF6B6B', label: 'Cancelled' },
} as const;

export default async function BookPage() {
  const patientId = await requirePatientId();
  const appointments = await getAppointments(patientId);

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>My Appointments</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Book and manage appointments</p>
        </div>
        <Link
          href="/patient/book/new"
          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl tap-target"
          style={{ background: '#2F6BFF', color: '#FFF' }}
        >
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Book
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--line)' }}>
            <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p className="font-medium text-sm mb-1" style={{ color: 'var(--ink-soft)' }}>No appointments yet</p>
          <p className="text-xs mb-6 max-w-[220px]" style={{ color: 'var(--muted)' }}>Book an appointment with a doctor and they will confirm a date and time.</p>
          <Link
            href="/patient/book/new"
            className="font-semibold text-sm px-5 py-3 rounded-2xl tap-target"
            style={{ background: '#2F6BFF', color: '#FFF' }}
          >
            Book First Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a: Record<string, unknown>) => {
            const provider = a.providers as { name: string; specialty: string } | null;
            const status = (a.status as string) as 'pending' | 'confirmed' | 'cancelled';
            const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
            return (
              <div key={a.id as string} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                <div className="px-4 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{provider?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{provider?.specialty}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: s.bg, color: s.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {s.label}
                    </span>
                  </div>

                  <p className="text-sm mb-2" style={{ color: 'var(--ink-soft)' }}>{a.reason as string}</p>

                  {status === 'confirmed' && (a.confirmed_date || a.confirmed_time) ? (
                    <div className="rounded-xl px-3 py-2" style={{ background: '#E9F9F1', border: '1px solid #1FAA6D20' }}>
                      <p className="text-xs font-semibold" style={{ color: '#1FAA6D' }}>
                        {String(a.confirmed_date ?? '')}{a.confirmed_time ? ` · ${String(a.confirmed_time)}` : ''}
                      </p>
                      {a.doctor_notes != null && <p className="text-xs mt-0.5" style={{ color: '#1FAA6D' }}>{String(a.doctor_notes)}</p>}
                    </div>
                  ) : status === 'pending' ? (
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Awaiting confirmation
                      {a.preferred_date ? ` · Prefers ${a.preferred_date as string}${a.preferred_time ? ` ${a.preferred_time as string}` : ''}` : ''}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
