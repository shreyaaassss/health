'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import type { AppointmentFormData, PatientProfile } from '@/types';

type Step = 'form' | 'review' | 'confirm';
type Source = { type: 'qr_scan' | 'manual_entry'; rawCode?: string };

interface Props {
  profile: PatientProfile | null;
  source: Source;
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>
      {text}
      {required && <span className="ml-0.5" style={{ color: '#FF6B6B' }}>*</span>}
    </label>
  );
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label text={label} required={required} />
      {children}
    </div>
  );
}

const inputClass = 'w-full rounded-xl px-4 py-3 text-sm bg-white focus:outline-none placeholder:text-slate-300';
const inputStyle = { border: '1px solid var(--line)', color: 'var(--ink)' };
const inputFocusStyle = { border: '1px solid #2F6BFF' };

export function AppointmentWizard({ profile, source }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<{ id: string } | null>(null);

  // Pre-fill from existing profile
  const [form, setForm] = useState<AppointmentFormData>({
    name:             profile?.name ?? '',
    phone:            profile?.phone ?? '',
    dateOfBirth:      profile?.date_of_birth ?? '',
    emergencyContact: profile?.emergency_contact ?? '',
    allergies:        profile?.allergies ?? '',
    currentMedications: profile?.current_medications ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormData, string>>>({});

  function set(field: keyof AppointmentFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Required';
    if (!form.phone.trim()) newErrors.phone = 'Required';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Required';
    if (!form.emergencyContact.trim()) newErrors.emergencyContact = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(API.patient.appointments, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, formData: form }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Submission failed.');
        setSubmitting(false);
        return;
      }
      setSavedRecord({ id: json.data.id });
      setStep('confirm');
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  // ── Form step ──────────────────────────────────
  if (step === 'form') {
    return (
      <div className="px-4 pt-4 pb-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2F6BFF' }}>Step 1 of 2</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>· Your Details</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--line)' }}>
            <div className="h-1 rounded-full w-1/2" style={{ background: '#2F6BFF' }} />
          </div>
        </div>

        {/* Auto-fill notice */}
        {profile?.name && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--blue-tint)', border: '1px solid #2F6BFF30' }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-xs" style={{ color: '#1D4FE0' }}>
              Fields pre-filled from your Inochi profile. Review and edit as needed.
            </p>
          </div>
        )}

        {/* Required section */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            Required Fields
          </p>
          <div className="space-y-4">
            <Field label="Full Name" required>
              <input
                className={inputClass}
                style={{ ...inputStyle, ...(errors.name ? { borderColor: '#FF6B6B' } : {}) }}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Priya Sharma"
                autoComplete="name"
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: '#FF6B6B' }}>{errors.name}</p>}
            </Field>

            <Field label="Phone Number" required>
              <input
                type="tel"
                className={inputClass}
                style={{ ...inputStyle, ...(errors.phone ? { borderColor: '#FF6B6B' } : {}) }}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
              {errors.phone && <p className="text-xs mt-1" style={{ color: '#FF6B6B' }}>{errors.phone}</p>}
            </Field>

            <Field label="Date of Birth" required>
              <input
                type="date"
                className={inputClass}
                style={{ ...inputStyle, ...(errors.dateOfBirth ? { borderColor: '#FF6B6B' } : {}) }}
                value={form.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)}
              />
              {errors.dateOfBirth && <p className="text-xs mt-1" style={{ color: '#FF6B6B' }}>{errors.dateOfBirth}</p>}
            </Field>

            <Field label="Emergency Contact" required>
              <input
                className={inputClass}
                style={{ ...inputStyle, ...(errors.emergencyContact ? { borderColor: '#FF6B6B' } : {}) }}
                value={form.emergencyContact}
                onChange={(e) => set('emergencyContact', e.target.value)}
                placeholder="Name + phone number"
                autoComplete="off"
              />
              {errors.emergencyContact && <p className="text-xs mt-1" style={{ color: '#FF6B6B' }}>{errors.emergencyContact}</p>}
            </Field>
          </div>
        </div>

        {/* Optional section */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            Optional
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>Leave blank if not applicable.</p>
          <div className="space-y-4">
            <Field label="Known Allergies">
              <textarea
                className={inputClass + ' resize-none'}
                style={inputStyle}
                rows={2}
                value={form.allergies}
                onChange={(e) => set('allergies', e.target.value)}
                placeholder="e.g. Penicillin, peanuts"
              />
            </Field>

            <Field label="Current Medications">
              <textarea
                className={inputClass + ' resize-none'}
                style={inputStyle}
                rows={2}
                value={form.currentMedications}
                onChange={(e) => set('currentMedications', e.target.value)}
                placeholder="e.g. Vitamin D3 60,000 IU weekly"
              />
            </Field>
          </div>
        </div>

        <button
          onClick={() => { if (validate()) setStep('review'); }}
          className="w-full font-semibold text-sm py-4 rounded-2xl tap-target"
          style={{ background: '#2F6BFF', color: 'var(--card)', borderRadius: 24 }}
        >
          Review →
        </button>
      </div>
    );
  }

  // ── Review step ────────────────────────────────
  if (step === 'review') {
    return (
      <div className="px-4 pt-4 pb-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2F6BFF' }}>Step 2 of 2</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>· Review</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--line)' }}>
            <div className="h-1 rounded-full w-full" style={{ background: '#2F6BFF' }} />
          </div>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          This information will be saved to your Inochi and prepared for your upcoming appointment.
          <span style={{ color: 'var(--muted)' }}> Review everything before submitting.</span>
        </p>

        {/* Summary card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          {[
            { label: 'Full Name',          value: form.name,             required: true },
            { label: 'Phone',              value: form.phone,            required: true },
            { label: 'Date of Birth',      value: form.dateOfBirth,      required: true },
            { label: 'Emergency Contact',  value: form.emergencyContact, required: true },
            { label: 'Allergies',          value: form.allergies || '—', required: false },
            { label: 'Current Medications',value: form.currentMedications || '—', required: false },
          ].map(({ label, value, required }, i, arr) => (
            <div key={label} className={`px-4 py-3 ${i < arr.length - 1 ? 'border-b' : ''}`} style={{ borderColor: 'var(--line)' }}>
              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>
                {label}{!required && <span className="ml-1" style={{ color: 'var(--line)' }}>(optional)</span>}
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5Z" />
          </svg>
          Source: {source.type === 'qr_scan' ? 'QR scan' : 'Manual entry'}
          {source.rawCode && source.rawCode !== 'MANUAL' && ` · ${source.rawCode}`}
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', border: '1px solid #FF6B6B30', color: '#C23B3B' }}>{error}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep('form')}
            disabled={submitting}
            className="flex-1 font-semibold text-sm py-4 rounded-2xl tap-target"
            style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}
          >
            Edit
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-[2] font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: '#2F6BFF', color: 'var(--card)', borderRadius: 24 }}
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </>
            ) : 'Submit Appointment Form'}
          </button>
        </div>
      </div>
    );
  }

  // ── Confirm step ──────────────────────────────
  return (
    <div className="flex flex-col items-center text-center px-4 pt-8 pb-6 gap-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#E9F9F1' }}>
        <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="#1FAA6D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Form Submitted</h2>
        <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
          Your appointment form has been saved to your Inochi. Your details have been updated for future use.
        </p>
      </div>

      <div className="rounded-2xl px-4 py-3 w-full text-left space-y-1.5" style={{ background: 'var(--card-2)', border: '1px solid var(--line)' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Summary</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{form.name}</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{form.phone} · DOB {form.dateOfBirth}</p>
        {savedRecord && (
          <p className="font-mono mt-1" style={{ fontSize: 10, color: 'var(--muted)' }}>ID: {savedRecord.id}</p>
        )}
      </div>

      <button
        onClick={() => router.push('/patient')}
        className="w-full font-semibold text-sm py-4 rounded-2xl tap-target"
        style={{ background: '#2F6BFF', color: 'var(--card)', borderRadius: 24 }}
      >
        Back to Home
      </button>
    </div>
  );
}
