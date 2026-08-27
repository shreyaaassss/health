import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePatientId } from '@/lib/auth';
import { RecordTypeBadge } from '@/components/RecordTypeBadge';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import { RECORD_TYPE_COLORS, formatRecordDate } from '@/lib/records';
import type { MedicalRecord } from '@/types';

async function getRecord(id: string): Promise<MedicalRecord | null> {
  const patientId = await requirePatientId();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', id)
    .eq('patient_id', patientId)
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
      <div className="px-4 pt-6 pb-8" style={{ background: c.bg }}>
        <Link
          href="/patient/records"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-4"
          style={{ color: 'var(--ink-soft)' }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--ink-soft)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Records
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--card)' }}
          >
            <RecordTypeIcon type={record.type} strokeColor={c.stroke} size={26} />
          </div>
          <div>
            <RecordTypeBadge type={record.type} />
            <h1 className="text-xl font-bold mt-1 leading-tight" style={{ color: 'var(--ink)' }}>{record.title}</h1>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>

          {/* Meta row */}
          <div className="grid grid-cols-2 divide-x border-b" style={{ borderColor: 'var(--line)' }}>
            <div className="px-4 py-3">
              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>Provider</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{record.provider_name}</p>
            </div>
            <div className="px-4 py-3">
              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>Date</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{formatRecordDate(record.record_date)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
            <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>Clinical Notes</p>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{record.description}</p>
          </div>

          {/* Document preview placeholder */}
          <div className="px-4 py-4">
            <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>Document</p>
            <div
              className="rounded-xl flex flex-col items-center justify-center py-8 gap-3"
              style={{ background: c.bg, border: `2px dashed ${c.stroke}` }}
            >
              <RecordTypeIcon type={record.type} strokeColor={c.stroke} size={36} />
              <p style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{record.title}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Document preview</p>
            </div>
          </div>
        </div>

        {/* Share this record button */}
        <Link
          href={`/patient/share?record=${record.id}`}
          className="mt-4 w-full flex items-center justify-center gap-2 font-semibold text-sm py-4 rounded-2xl tap-target active:opacity-90 transition-opacity"
          style={{ background: '#2F6BFF', color: 'var(--card)', borderRadius: 24 }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--card)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share This Record
        </Link>

        {/* Privacy note */}
        <p className="text-center text-xs mt-3" style={{ color: 'var(--muted)' }}>
          Only you decide who can access this record.
        </p>
      </div>
    </div>
  );
}
