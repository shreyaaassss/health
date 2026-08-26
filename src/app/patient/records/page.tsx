import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import { RecordsList } from '@/components/RecordsList';
import type { MedicalRecord } from '@/types';
import Link from 'next/link';

export const metadata: Metadata = { title: 'My Records · Health Wallet' };

async function getRecords(): Promise<MedicalRecord[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', DEMO.PATIENT_ID)
    .order('record_date', { ascending: false });
  return (data ?? []) as MedicalRecord[];
}

export default async function RecordsPage() {
  const records = await getRecords();

  return (
    <div className="px-4 pt-6 pb-4">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-teal-600 uppercase tracking-widest">Hello, Priya</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">My Health Records</h1>
          <p className="text-sm text-slate-400 mt-0.5">{records.length} records stored securely</p>
        </div>

        {/* Share CTA */}
        <Link
          href="/patient/share"
          className="flex items-center gap-1.5 bg-teal-600 text-white text-xs font-semibold px-3 py-2 rounded-xl tap-target"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
          Share
        </Link>
      </div>

      {/* Privacy banner */}
      <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 mb-5">
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-teal-800">You own your data</p>
          <p className="text-xs text-teal-600">You decide who sees it, what they see, and for how long.</p>
        </div>
      </div>

      {/* Records list with category tabs */}
      <RecordsList records={records} />
    </div>
  );
}
