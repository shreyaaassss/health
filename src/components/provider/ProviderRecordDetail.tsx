'use client';

import { useState } from 'react';
import { RECORD_TYPE_COLORS, RECORD_TYPE_LABELS, formatRecordDate } from '@/lib/records';
import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import { AddPrescriptionForm } from '@/components/provider/AddPrescriptionForm';
import { ConfidentialWatermark } from '@/components/provider/ConfidentialWatermark';
import type { MedicalRecord } from '@/types';

interface Props {
  record: MedicalRecord;
  signedUrl?: string | null; // always null for doctors — view-only
  token: string;
  doctorName?: string;
  onClose: () => void;
  accessError?: string | null;
}

export function ProviderRecordDetail({ record, token, doctorName, onClose, accessError }: Props) {
  const c = RECORD_TYPE_COLORS[record.type];
  const [showRx, setShowRx] = useState(false);

  if (accessError) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-end" style={{ zIndex: 100 }} onClick={onClose}>
        <div
          className="w-full rounded-t-3xl p-6 text-center"
          style={{ background: '#FFEDED' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--card)' }}>
            <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#C23B3B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#C23B3B' }}>
            {accessError === 'ACCESS_REVOKED' ? 'Access Revoked' : 'Access Expired'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#FF6B6B' }}>
            {accessError === 'ACCESS_REVOKED'
              ? 'The patient has revoked access to their records.'
              : 'Access to this record has expired.'}
          </p>
          <button
            onClick={onClose}
            className="w-full font-semibold py-3 rounded-xl tap-target"
            style={{ background: '#FFEDED', color: '#C23B3B', border: '1px solid #FF6B6B40' }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end" style={{ zIndex: 100 }} onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} />
        </div>

        {/* Header band */}
        <div className="mx-4 mt-2 rounded-2xl px-4 py-4 mb-4" style={{ background: c.bg }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--card)' }}
            >
              <RecordTypeIcon type={record.type} strokeColor={c.stroke} size={24} />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: c.text, textTransform: 'uppercase' }}>
                {RECORD_TYPE_LABELS[record.type].toUpperCase()}
              </span>
              <h2 className="text-base font-bold leading-tight mt-0.5" style={{ color: 'var(--ink)' }}>{record.title}</h2>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-4">
          {/* Confidential watermark — traceable if screenshot is taken */}
          <ConfidentialWatermark doctorName={doctorName ?? 'Provider'} />

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl px-3 py-3" style={{ background: 'var(--card-2)' }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Provider</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{record.provider_name}</p>
            </div>
            <div className="rounded-xl px-3 py-3" style={{ background: 'var(--card-2)' }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Date</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{formatRecordDate(record.record_date)}</p>
            </div>
          </div>

          {/* Clinical notes */}
          <div className="rounded-xl px-4 py-4" style={{ background: 'var(--card-2)' }}>
            <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>Clinical Notes</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{record.description}</p>
          </div>

          {/* File indicator — view only, no download for doctors */}
          {record.file_name && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: 'var(--line)', border: '1px solid var(--line)' }}>
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate font-medium" style={{ color: 'var(--ink-soft)' }}>{record.file_name}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted)' }}>File attached · View-only access</p>
              </div>
            </div>
          )}

          {/* Add / view prescription for this record */}
          {!showRx ? (
            <button
              onClick={() => setShowRx(true)}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 tap-target active:opacity-80"
              style={{ background: 'var(--blue-tint-2)', border: '1px solid var(--line)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue-tint)' }}>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2v4M14 2v4M9 16l2 2 4-4"/><rect x="4" y="4" width="16" height="18" rx="2"/>
                </svg>
              </div>
              <p className="text-sm font-semibold flex-1 text-left" style={{ color: 'var(--ink)' }}>Add Prescription</p>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
              <div className="px-4 py-3" style={{ background: 'var(--blue-tint-2)' }}>
                <AddPrescriptionForm
                  token={token}
                  recordId={record.id}
                  onSuccess={() => setShowRx(false)}
                  onCancel={() => setShowRx(false)}
                />
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full font-semibold py-4 rounded-2xl tap-target"
            style={{ background: 'var(--ink)', color: 'var(--card)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
