import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Share Records · Health Wallet' };
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePatientId } from '@/lib/auth';
import { ShareWizard } from '@/components/ShareWizard';
import type { MedicalRecord, Provider } from '@/types';

async function getShareData(): Promise<{ providers: Provider[]; records: MedicalRecord[] }> {
  const patientId = await requirePatientId();
  const supabase = createAdminClient();

  const [{ data: providers }, { data: records }] = await Promise.all([
    supabase.from('providers').select('*').order('name'),
    supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false }),
  ]);

  return {
    providers: (providers ?? []) as Provider[],
    records: (records ?? []) as MedicalRecord[],
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ record?: string }>;
}) {
  const { record: preSelectedRecordId } = await searchParams;
  const { providers, records } = await getShareData();

  return (
    <ShareWizard
      providers={providers}
      records={records}
      preSelectedRecordId={preSelectedRecordId ?? null}
    />
  );
}
