import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import type { ApiResponse } from '@/types';

const SEED_RECORDS = [
  {
    id: '00000000-0000-0000-0002-000000000001',
    patient_id: DEMO.PATIENT_ID,
    title: 'Blood Test Report',
    type: 'lab_report',
    provider_name: 'City Diagnostics',
    record_date: '2026-03-15',
    description: 'Complete blood count and metabolic panel. Vitamin D levels below reference range (18 ng/mL, normal: 30–100 ng/mL). All other parameters within normal range.',
  },
  {
    id: '00000000-0000-0000-0002-000000000002',
    patient_id: DEMO.PATIENT_ID,
    title: 'MRI Scan — Lumbar Spine',
    type: 'imaging',
    provider_name: 'Pune Diagnostics',
    record_date: '2026-01-10',
    description: 'MRI of lumbar spine (L4–L5). Mild disc bulge noted at L4-L5, no significant neural compression. No fractures or lesions detected.',
  },
  {
    id: '00000000-0000-0000-0002-000000000003',
    patient_id: DEMO.PATIENT_ID,
    title: 'Prescription — Vitamin D & Calcium',
    type: 'prescription',
    provider_name: 'Dr. Meena Mehta',
    record_date: '2026-02-20',
    description: 'Vitamin D3 60,000 IU weekly for 8 weeks. Calcium Carbonate 500mg twice daily. Review after 3 months.',
  },
  {
    id: '00000000-0000-0000-0002-000000000004',
    patient_id: DEMO.PATIENT_ID,
    title: 'Vaccination Record',
    type: 'vaccination',
    provider_name: 'Pune City Hospital',
    record_date: '2025-09-05',
    description: 'COVID-19 booster administered (Covishield). Influenza vaccine administered. All vaccinations up to date as of September 2025.',
  },
  {
    id: '00000000-0000-0000-0002-000000000005',
    patient_id: DEMO.PATIENT_ID,
    title: 'Consultation Notes — General Checkup',
    type: 'consultation',
    provider_name: 'Dr. Meena Mehta',
    record_date: '2026-02-20',
    description: 'Patient presented with fatigue and mild back discomfort. History of recurring stomach discomfort over past 6 months. No allergies recorded. Referred for blood work and MRI. Follow-up in 3 months.',
  },
] as const;

export async function POST(): Promise<NextResponse<ApiResponse<{ reset_at: string }>>> {
  const supabase = createAdminClient();

  // ── Step 1: Find all grant IDs for demo patient ──
  const { data: grants } = await supabase
    .from('access_grants')
    .select('id')
    .eq('patient_id', DEMO.PATIENT_ID);

  const grantIds = (grants ?? []).map((g) => g.id);

  // ── Step 2: Delete child rows scoped to demo patient ──
  await supabase.from('access_logs').delete().eq('patient_id', DEMO.PATIENT_ID);

  if (grantIds.length > 0) {
    await supabase.from('access_grant_records').delete().in('access_grant_id', grantIds);
    await supabase.from('access_tokens').delete().in('access_grant_id', grantIds);
  }

  // ── Step 3: Delete grants ──────────────────────
  await supabase.from('access_grants').delete().eq('patient_id', DEMO.PATIENT_ID);

  // ── Step 4: Restore seed medical records ──────
  await supabase.from('medical_records').delete().eq('patient_id', DEMO.PATIENT_ID);

  const { error: insertErr } = await supabase
    .from('medical_records')
    .insert(SEED_RECORDS as unknown as Record<string, unknown>[]);

  if (insertErr) {
    return NextResponse.json(
      { success: false, error: insertErr.message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }

  const reset_at = new Date().toISOString();
  return NextResponse.json({ success: true, data: { reset_at } });
}
