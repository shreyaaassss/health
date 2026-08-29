'use client';

import { useState } from 'react';
import { RecordCard } from '@/components/RecordCard';
import { CATEGORY_TABS } from '@/lib/records';
import type { MedicalRecord, RecordType } from '@/types';
import type { CategoryKey } from '@/lib/records';

interface DoctorPrescription {
  id: string;
  providers: { name: string; specialty: string } | null;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  instructions: string | null;
  prescribed_at: string;
  signed_by: string | null;
}

interface Props {
  records: MedicalRecord[];
  prescriptions?: DoctorPrescription[];
}

export function RecordsList({ records, prescriptions = [] }: Props) {
  const [active, setActive] = useState<CategoryKey>('all');

  const filtered = active === 'all'
    ? records
    : records.filter((r) => r.type === active);

  // Show doctor prescriptions only on All or Prescription tab
  const showRx = active === 'all' || active === 'prescription';

  return (
    <>
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 mb-4">
        {CATEGORY_TABS.map(({ key, label }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="flex-shrink-0 px-4 py-2 text-xs font-semibold transition-colors tap-target"
              style={{ borderRadius: 20, background: isActive ? '#2F6BFF' : 'var(--card)', color: isActive ? '#FFFFFF' : 'var(--ink-soft)', border: isActive ? 'none' : '1px solid var(--line)' }}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({records.filter((r) => r.type === key).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Record list */}
      {filtered.length === 0 && !showRx ? (
        <div className="text-center py-12">
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No records in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}

      {/* Doctor-issued prescriptions — only on All or Prescription tab */}
      {showRx && prescriptions.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v4M14 2v4M9 16l2 2 4-4"/><rect x="4" y="4" width="16" height="18" rx="2"/>
            </svg>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Prescriptions from Doctors
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#E9F9F1', color: '#1FAA6D' }}>
              {prescriptions.length}
            </span>
          </div>

          {/* Horizontal scroll cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="flex-shrink-0 rounded-2xl overflow-hidden"
                style={{ width: 260, background: 'var(--card)', border: '1.5px solid #2F6BFF20' }}
              >
                {/* Header */}
                <div className="px-3 py-2.5 flex items-center justify-between" style={{ background: 'var(--blue-tint-2)', borderBottom: '1px solid #2F6BFF15' }}>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--ink)' }}>{p.providers?.name ?? 'Doctor'}</p>
                    <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      {new Date(p.prescribed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(p.prescribed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2" style={{ background: '#E9F9F1', color: '#1FAA6D' }}>✓</span>
                </div>

                {/* Medications */}
                <div className="px-3 py-2.5 space-y-1.5">
                  {p.medications.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#2F6BFF' }} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink)' }}>{m.name}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>{[m.dosage, m.frequency].filter(Boolean).join(' · ')}</p>
                      </div>
                    </div>
                  ))}
                  {p.medications.length > 3 && (
                    <p className="text-[10px]" style={{ color: 'var(--muted)' }}>+{p.medications.length - 3} more</p>
                  )}
                  {p.instructions && (
                    <p className="text-[10px] pt-1.5 mt-1 truncate" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--line)' }}>{p.instructions}</p>
                  )}

                  {/* Signature */}
                  <p className="text-[10px] font-semibold pt-1 mt-0.5" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--line)' }}>
                    ✦ {p.signed_by ?? p.providers?.name ?? 'Doctor'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(filtered.length > 0 || prescriptions.length > 0) && (
        <p className="text-center text-xs mt-4 mb-2" style={{ color: 'var(--muted)' }}>
          {records.length} record{records.length !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );
}
