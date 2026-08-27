import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePatientId } from '@/lib/auth';
import { AppointmentWizard } from '@/components/AppointmentWizard';
import type { PatientProfile } from '@/types';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Appointment Form · Health Wallet' };

async function getProfile(): Promise<PatientProfile | null> {
  const patientId = await requirePatientId();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();
  return data as PatientProfile | null;
}

export default async function AppointmentFormPage({
  searchParams,
}: {
  searchParams: Promise<{ sourceType?: string; rawCode?: string }>;
}) {
  const { sourceType, rawCode } = await searchParams;

  const profile = await getProfile();

  const source = {
    type: (sourceType === 'qr_scan' ? 'qr_scan' : 'manual_entry') as 'qr_scan' | 'manual_entry',
    rawCode: rawCode ?? undefined,
  };

  return (
    <div className="min-h-full pb-6">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <Link href="/patient/appointment" className="inline-flex items-center gap-1 text-sm text-slate-500 mb-4 tap-target">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-0.5">Your Details</h1>
        <p className="text-sm text-slate-500">Fill in the form for your upcoming appointment.</p>
      </div>

      <AppointmentWizard profile={profile} source={source} />
    </div>
  );
}
