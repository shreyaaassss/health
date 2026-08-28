import { requirePatientId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AppointmentList } from '@/components/patient/AppointmentList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'My Appointments · Health Wallet' };

async function getData(patientId: string) {
  const supabase = createAdminClient();

  const [{ data: appointments }, { data: prescriptions }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, providers(id, name, specialty)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false }),
    supabase
      .from('prescriptions')
      .select('*, providers(name, specialty)')
      .eq('patient_id', patientId)
      .order('prescribed_at', { ascending: false }),
  ]);

  return { appointments: appointments ?? [], prescriptions: prescriptions ?? [] };
}

export default async function BookPage() {
  const patientId = await requirePatientId();
  const { appointments, prescriptions } = await getData(patientId);

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

      <AppointmentList
        initialAppointments={appointments.map((a: Record<string, unknown>) => ({
          id: a.id as string,
          provider_id: (a.providers as { id: string })?.id ?? '',
          provider_name: (a.providers as { name: string })?.name ?? 'Doctor',
          provider_specialty: (a.providers as { specialty: string })?.specialty ?? '',
          reason: a.reason as string,
          preferred_date: a.preferred_date as string | null,
          preferred_time: a.preferred_time as string | null,
          status: a.status as 'pending' | 'confirmed' | 'cancelled',
          confirmed_date: a.confirmed_date as string | null,
          confirmed_time: a.confirmed_time as string | null,
          doctor_notes: a.doctor_notes as string | null,
          cancelled_by: a.cancelled_by as string | null,
          created_at: a.created_at as string,
        }))}
        prescriptions={prescriptions.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          provider_name: (p.providers as { name: string })?.name ?? 'Doctor',
          provider_specialty: (p.providers as { specialty: string })?.specialty ?? '',
          medications: p.medications as { name: string; dosage: string; frequency: string; duration: string }[],
          instructions: p.instructions as string | null,
          follow_up_date: p.follow_up_date as string | null,
          prescribed_at: p.prescribed_at as string,
        }))}
      />
    </div>
  );
}
