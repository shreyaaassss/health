import { requireDoctorId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import { DoctorQRScanner } from '@/components/DoctorQRScanner';
import { DoctorDashboard } from '@/components/doctor/DoctorDashboard';

async function getDoctorData() {
  const user = await getUser();
  if (!user) return null;
  const supabase = createAdminClient();

  const { data: provider } = await supabase
    .from('providers')
    .select('id, name, organization, specialty')
    .eq('user_id', user.id)
    .single();

  if (!provider) return null;

  const [{ data: appointments }, { data: accesses }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, patients(name)')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('access_grants')
      .select('id, status, created_at, patients(name), access_grant_records(medical_records(title))')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const pendingCount = (appointments ?? []).filter((a: { status: string }) => a.status === 'pending').length;
  const activeShares = (accesses ?? []).filter((a: { status: string }) => a.status === 'ACTIVE').length;

  return { provider, appointments: appointments ?? [], accesses: accesses ?? [], pendingCount, activeShares };
}

export default async function DoctorPage() {
  await requireDoctorId();
  const data = await getDoctorData();
  if (!data) return null;

  const { provider, appointments, accesses, pendingCount, activeShares } = data;

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--page)' }}>
      <div className="px-5 pt-12 pb-6" style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7B61FF,#2F6BFF)', color: '#FFF' }}>
              {provider.name.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Provider Account</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{provider.name}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{provider.organization}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--blue-tint)', color: '#1D4FE0' }}>
          <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{provider.specialty}</span>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: pendingCount > 0 ? '#FEF6E7' : 'var(--card)', border: `1px solid ${pendingCount > 0 ? '#E5A02030' : 'var(--line)'}` }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: pendingCount > 0 ? '#E5A020' : 'var(--ink)' }}>{pendingCount}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Pending Requests</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: activeShares > 0 ? '#E9F9F1' : 'var(--card)', border: `1px solid ${activeShares > 0 ? '#1FAA6D30' : 'var(--line)'}` }}>
            <div className="flex items-center gap-1.5">
              <p style={{ fontSize: 28, fontWeight: 800, color: activeShares > 0 ? '#1FAA6D' : 'var(--ink)' }}>{activeShares}</p>
              {activeShares > 0 && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#1FAA6D', marginTop: 4 }} />}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Active Shares</p>
          </div>
        </div>

        <DoctorDashboard
          initialAppointments={appointments.map((a: Record<string, unknown>) => ({
            id: a.id as string,
            patient_id: a.patient_id as string,
            patient_name: (a.patients as { name: string } | null)?.name ?? 'Patient',
            reason: a.reason as string,
            preferred_date: a.preferred_date as string | null,
            preferred_time: a.preferred_time as string | null,
            status: a.status as 'pending' | 'confirmed' | 'cancelled',
            confirmed_date: a.confirmed_date as string | null,
            confirmed_time: a.confirmed_time as string | null,
            doctor_notes: a.doctor_notes as string | null,
            created_at: a.created_at as string,
          }))}
          recentAccesses={accesses.map((g: Record<string, unknown>) => ({
            grant_id: g.id as string,
            patient_name: (g.patients as { name: string } | null)?.name ?? 'Patient',
            status: g.status as string,
            record_titles: ((g.access_grant_records as { medical_records: { title: string } }[]) ?? [])
              .map((r) => r.medical_records?.title).filter(Boolean) as string[],
            created_at: g.created_at as string,
          }))}
        />

        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Scan or enter patient access link</p>
          <DoctorQRScanner />
        </div>
      </div>
    </div>
  );
}
