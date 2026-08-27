'use client';

import { useState } from 'react';
import { WizardProgress } from '@/components/share/WizardProgress';
import { StepProvider } from '@/components/share/StepProvider';
import { StepRecords } from '@/components/share/StepRecords';
import { StepDuration } from '@/components/share/StepDuration';
import { StepReview } from '@/components/share/StepReview';
import { StepSuccess } from '@/components/share/StepSuccess';
import { API } from '@/constants/api';
import type { AccessDuration, MedicalRecord, Provider } from '@/types';

interface Props {
  providers: Provider[];
  records: MedicalRecord[];
  preSelectedRecordId?: string | null;
}

interface SuccessState {
  token: string;
  expiresAt: string;
}

export function ShareWizard({ providers, records, preSelectedRecordId }: Props) {
  const [step, setStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
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
    if (!selectedProvider || selectedRecordIds.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API.patient.grants, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: selectedProvider.id,
          record_ids: selectedRecordIds,
          duration,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? 'Failed to create access grant.');
        return;
      }

      setSuccess({ token: json.data.token, expiresAt: json.data.expires_at });
      setStep(4); // success screen
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedRecords = records.filter((r) => selectedRecordIds.includes(r.id));

  return (
    <div className="flex flex-col min-h-full px-4 pt-6 pb-4">
      {/* Back button (not shown on success) */}
      {step < 4 && step > 0 && (
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

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--blue-tint)', border: '1px solid #2F6BFF30', color: '#1D4FE0' }}>
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="flex-1">
        {step === 0 && (
          <StepProvider
            providers={providers}
            selected={selectedProvider}
            onSelect={setSelectedProvider}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <StepRecords
            records={records}
            selected={selectedRecordIds}
            onToggle={toggleRecord}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <StepDuration
            selected={duration}
            onSelect={setDuration}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && selectedProvider && (
          <StepReview
            provider={selectedProvider}
            records={selectedRecords}
            duration={duration}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}

        {step === 4 && success && selectedProvider && (
          <StepSuccess
            token={success.token}
            expiresAt={success.expiresAt}
            providerName={selectedProvider.name}
            recordCount={selectedRecordIds.length}
            duration={duration}
          />
        )}
      </div>
    </div>
  );
}
