import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';
import { RecordTypeBadge } from '@/components/RecordTypeBadge';
import { RECORD_TYPE_COLORS, RECORD_TYPE_ICONS, formatRecordDate } from '@/lib/records';
import type { MedicalRecord } from '@/types';

async function getRecord(id: string): Promise<MedicalRecord | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', id)
    .eq('patient_id', DEMO.PATIENT_ID)
    .single();
  return data as MedicalRecord | null;
}

export default async function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getRecord(id);

  if (!record) notFound();

  const c = RECORD_TYPE_COLORS[record.type];

  return (
    <div className="pb-6">

      {/* Top bar */}
      <div className={`${c.bg} px-4 pt-6 pb-8`}>
        <Link
          href="/patient/records"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Records
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center text-3xl`}>
            {RECORD_TYPE_ICONS[record.type]}
          </div>
          <div>
            <RecordTypeBadge type={record.type} />
            <h1 className="text-xl font-bold text-slate-900 mt-1 leading-tight">{record.title}</h1>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

          {/* Meta row */}
          <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Provider</p>
              <p className="text-sm font-semibold text-slate-800">{record.provider_name}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Date</p>
              <p className="text-sm font-semibold text-slate-800">{formatRecordDate(record.record_date)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="px-4 py-4 border-b border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-2">Clinical Notes</p>
            <p className="text-sm text-slate-700 leading-relaxed">{record.description}</p>
          </div>

          {/* Document preview placeholder */}
          <div className="px-4 py-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-3">Document</p>
            <div className={`rounded-xl ${c.bg} ${c.border} border-2 border-dashed flex flex-col items-center justify-center py-8 gap-2`}>
              <span className="text-4xl">{RECORD_TYPE_ICONS[record.type]}</span>
              <p className={`text-xs font-semibold ${c.text}`}>{record.title}</p>
              <p className="text-xs text-slate-400">Document preview</p>
            </div>
          </div>
        </div>

        {/* Share this record button */}
        <Link
          href={`/patient/share?record=${record.id}`}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target active:bg-teal-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
          Share This Record
        </Link>

        {/* Privacy note */}
        <p className="text-center text-xs text-slate-400 mt-3">
          Only you decide who can access this record.
        </p>
      </div>
    </div>
  );
}
