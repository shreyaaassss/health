import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePatientId } from '@/lib/auth';
import { RecordsList } from '@/components/RecordsList';
import type { MedicalRecord } from '@/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My Records · Inochi' };

async function getPageData() {
  const patientId = await requirePatientId();
  const supabase = createAdminClient();

  const [{ data: records }, { data: prescriptions }] = await Promise.all([
    supabase.from('medical_records').select('*').eq('patient_id', patientId).order('record_date', { ascending: false }),
    supabase.from('prescriptions').select('*, providers(name, specialty)').eq('patient_id', patientId).order('prescribed_at', { ascending: false }),
  ]);

  return { records: (records ?? []) as MedicalRecord[], prescriptions: prescriptions ?? [] };
}

export default async function RecordsPage() {
  const { records, prescriptions } = await getPageData();

  return (
    <div className="px-4 pt-6 pb-4">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#2F6BFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Records</p>
          <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--ink)' }}>My Health Records</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{records.length} records · {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/patient/records/new" className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl tap-target" style={{ background: 'var(--blue-tint)', color: '#1D4FE0' }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Add
          </Link>
          <Link href="/patient/share" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl tap-target" style={{ background: '#2F6BFF', color: 'var(--card)' }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--card)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </Link>
        </div>
      </div>

      {/* Privacy banner */}
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5" style={{ background: 'var(--blue-tint)', border: '1px solid #2F6BFF20' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--card)' }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1D4FE0' }}>You own your data</p>
          <p style={{ fontSize: 12, color: '#2F6BFF' }}>You decide who sees it, what they see, and for how long.</p>
        </div>
      </div>

      {/* Records list with category tabs */}
      {/* RecordsList handles both records + doctor prescriptions, filtered by tab */}
      <RecordsList records={records} prescriptions={prescriptions as Parameters<typeof RecordsList>[0]['prescriptions']} />
    </div>
  );
}
