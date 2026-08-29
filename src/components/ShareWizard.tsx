'use client';

import { useEffect, useState } from 'react';
import { WizardProgress } from '@/components/share/WizardProgress';
import { StepRecords } from '@/components/share/StepRecords';
import { StepDuration } from '@/components/share/StepDuration';
import { StepReview } from '@/components/share/StepReview';
import { StepSuccess } from '@/components/share/StepSuccess';
import { API } from '@/constants/api';
import type { AccessDuration, MedicalRecord } from '@/types';

interface Props {
  preSelectedRecordId?: string | null;
}

interface SuccessState {
  token: string;
  expiresAt: string;
}

export function ShareWizard({ preSelectedRecordId }: Props) {
  // Fetch records client-side — fixes "no records" bug on direct navigation from home
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    fetch(API.patient.records)
      .then((r) => r.json())
      .then((j) => { if (j.success) setRecords(j.data); })
      .finally(() => setLoadingRecords(false));
  }, []);

  const [step, setStep] = useState(0); // 0:Records 1:Duration 2:Review 3:Success
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>(
    preSelectedRecordId ? [preSelectedRecordId] : []
  );
  const [duration, setDuration] = useState<AccessDuration>('24_HOURS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  function toggleRecord(id: string) {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function handleConfirm() {
    if (!selectedRecordIds.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.patient.grants, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_ids: selectedRecordIds, duration }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? 'Failed to create access grant.'); return; }
      setSuccess({ token: json.data.token, expiresAt: json.data.expires_at });
      setStep(3);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedRecords = records.filter((r) => selectedRecordIds.includes(r.id));

  return (
    <div className="flex flex-col min-h-full px-4 pt-6 pb-4">
      {step < 3 && step > 0 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="flex items-center gap-1 text-sm font-medium mb-2 -ml-1 tap-target"
          style={{ color: 'var(--ink-soft)' }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--ink-soft)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      <WizardProgress current={step} />

      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--blue-tint)', border: '1px solid #2F6BFF30', color: '#1D4FE0' }}>
          {error}
        </div>
      )}

      <div className="flex-1">
        {step === 0 && (
          loadingRecords ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#2F6BFF" strokeWidth="4"/>
                <path className="opacity-75" fill="#2F6BFF" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading your records…</p>
            </div>
          ) : (
            <StepRecords
              records={records}
              selected={selectedRecordIds}
              onToggle={toggleRecord}
              onNext={() => setStep(1)}
              onBack={() => {}}
            />
          )
        )}

        {step === 1 && (
          <StepDuration
            selected={duration}
            onSelect={setDuration}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <StepReview
            provider={null}
            records={selectedRecords}
            duration={duration}
            onConfirm={handleConfirm}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )}

        {step === 3 && success && (
          <StepSuccess
            token={success.token}
            expiresAt={success.expiresAt}
            providerName="any registered doctor"
            recordCount={selectedRecordIds.length}
            duration={duration}
          />
        )}
      </div>
    </div>
  );
}
