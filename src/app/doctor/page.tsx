import { requireDoctorId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

async function getDoctorProfile() {
  const user = await getUser();
  if (!user) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('providers')
    .select('name, organization, specialty')
    .eq('user_id', user.id)
    .single();
  return data;
}

export default async function DoctorPage() {
  await requireDoctorId();
  const profile = await getDoctorProfile();

  return (
    <div className="min-h-screen px-5 pt-12 pb-8" style={{ background: 'var(--page)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'linear-gradient(135deg, #7B61FF, #2F6BFF)', color: '#FFF' }}>
            {profile?.name?.charAt(0) ?? 'D'}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Provider Account</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{profile?.name ?? 'Doctor'}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{profile?.organization}</p>
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* Specialty badge */}
      <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full" style={{ background: 'var(--blue-tint)', color: '#1D4FE0' }}>
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{profile?.specialty}</span>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>How to access patient records</p>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Ask the patient to open their Health Wallet and tap Share Records.' },
            { step: '2', text: 'Patient selects the records they want to share and sets a duration.' },
            { step: '3', text: 'Scan the QR code shown on the patient\'s phone, or ask them to copy the access link.' },
            { step: '4', text: 'You\'ll see only the records the patient chose to share with you.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: '#2F6BFF', color: '#FFF' }}>
                {step}
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'var(--blue-tint)', border: '1px solid var(--blue-tint)' }}>
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
          <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
        <p style={{ fontSize: 12, color: '#1D4FE0', lineHeight: 1.5 }}>
          Patients control what you see and for how long. They can revoke your access at any time.
        </p>
      </div>
    </div>
  );
}
