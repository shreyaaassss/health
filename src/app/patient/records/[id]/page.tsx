import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePatientId } from '@/lib/auth';
import { RecordTypeBadge } from '@/components/RecordTypeBadge';
import { DeleteRecordButton } from '@/components/DeleteRecordButton';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import { RECORD_TYPE_COLORS, formatRecordDate } from '@/lib/records';
import { getSignedUrl, getFileTypeLabel, formatFileSize } from '@/lib/storage';
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

export const dynamic = 'force-dynamic';

async function getPrescriptions(patientId: string, recordId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('prescriptions')
    .select('*, providers(name, specialty)')
    .eq('patient_id', patientId)
    .eq('medical_record_id', recordId)
    .order('prescribed_at', { ascending: false });
  return data ?? [];
}

export default async function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getRecord(id);

  if (!record) notFound();

  const patientId = record.patient_id;
  const c = RECORD_TYPE_COLORS[record.type];
  const signedUrl = record.file_url ? await getSignedUrl(record.file_url, 3600) : null;
  const prescriptions = await getPrescriptions(patientId, id);

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

          {/* Document section */}
          <div className="px-4 py-4">
            <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>Document</p>
            {signedUrl && record.file_name ? (
              /* Real file — show download */
              <a
                href={signedUrl}
                download={record.file_name}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 tap-target active:opacity-80 transition-opacity"
                style={{ background: 'var(--blue-tint)', border: '1px solid #2F6BFF30' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--card)' }}>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
                    <path d="M12 12v6M9 15l3 3 3-3"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1D4FE0' }}>{record.file_name}</p>
                  <p className="text-xs" style={{ color: '#2F6BFF' }}>
                    {getFileTypeLabel(record.file_type, record.file_name)} · {formatFileSize(record.file_size)} · Tap to download
                  </p>
                </div>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </a>
            ) : (
              /* No file uploaded yet */
              <div
                className="rounded-xl flex flex-col items-center justify-center py-8 gap-3"
                style={{ background: c.bg, border: `2px dashed ${c.stroke}` }}
              >
                <RecordTypeIcon type={record.type} strokeColor={c.stroke} size={36} />
                <p style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{record.title}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>No file attached</p>
              </div>
            )}
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

        {/* Prescriptions from doctor for this record */}
        {prescriptions.length > 0 && (
          <div className="mt-4 space-y-3">
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Prescriptions for this record
            </p>
            {prescriptions.map((p: Record<string, unknown>) => {
              const meds = p.medications as { name: string; dosage: string; frequency: string; duration: string }[];
              const provider = p.providers as { name: string; specialty: string } | null;
              return (
                <div key={p.id as string} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2F6BFF30' }}>
                  <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'var(--blue-tint)', borderBottom: '1px solid #2F6BFF20' }}>
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#1D4FE0' }}>{provider?.name}</p>
                      <p className="text-[10px]" style={{ color: '#2F6BFF' }}>
                        {new Date(p.prescribed_at as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 2v4M14 2v4M9 16l2 2 4-4"/><rect x="4" y="4" width="16" height="18" rx="2"/>
                    </svg>
                  </div>
                  <div className="px-4 py-3 space-y-1.5" style={{ background: 'var(--card)' }}>
                    {meds.map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#2F6BFF' }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{m.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}</p>
                        </div>
                      </div>
                    ))}
                    {p.instructions != null && (
                      <p className="text-xs mt-1 pt-1" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--line)' }}>{String(p.instructions)}</p>
                    )}
                    {p.follow_up_date != null && (
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>Follow-up: {new Date(String(p.follow_up_date)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete record */}
        <div className="mt-3">
          <DeleteRecordButton recordId={record.id} recordTitle={record.title} />
        </div>

        <p className="text-center text-xs mt-3" style={{ color: 'var(--muted)' }}>
          Only you decide who can access this record.
        </p>
      </div>
    </div>
  );
}
