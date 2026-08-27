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
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
      {text}
      {required && <span className="text-red-500 ml-0.5">*</span>}
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

const inputClass =
  'w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 placeholder:text-slate-300';

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
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Step 1 of 2</span>
            <span className="text-xs text-slate-400">· Your Details</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full">
            <div className="h-1 bg-teal-500 rounded-full w-1/2" />
          </div>
        </div>

        {/* Auto-fill notice */}
        {profile?.name && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-xs text-teal-700">
              Fields pre-filled from your Health Wallet profile. Review and edit as needed.
            </p>
          </div>
        )}

        {/* Required section */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Required Fields
          </p>
          <div className="space-y-4">
            <Field label="Full Name" required>
              <input
                className={`${inputClass} ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Priya Sharma"
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </Field>

            <Field label="Phone Number" required>
              <input
                type="tel"
                className={`${inputClass} ${errors.phone ? 'border-red-400' : ''}`}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </Field>

            <Field label="Date of Birth" required>
              <input
                type="date"
                className={`${inputClass} ${errors.dateOfBirth ? 'border-red-400' : ''}`}
                value={form.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)}
              />
              {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
            </Field>

            <Field label="Emergency Contact" required>
              <input
                className={`${inputClass} ${errors.emergencyContact ? 'border-red-400' : ''}`}
                value={form.emergencyContact}
                onChange={(e) => set('emergencyContact', e.target.value)}
                placeholder="Name + phone number"
                autoComplete="off"
              />
              {errors.emergencyContact && <p className="text-xs text-red-500 mt-1">{errors.emergencyContact}</p>}
            </Field>
          </div>
        </div>

        {/* Optional section */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Optional
          </p>
          <p className="text-xs text-slate-400 mb-3">Leave blank if not applicable.</p>
          <div className="space-y-4">
            <Field label="Known Allergies">
              <textarea
                className={inputClass + ' resize-none'}
                rows={2}
                value={form.allergies}
                onChange={(e) => set('allergies', e.target.value)}
                placeholder="e.g. Penicillin, peanuts"
              />
            </Field>

            <Field label="Current Medications">
              <textarea
                className={inputClass + ' resize-none'}
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
          className="w-full bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target active:bg-teal-700"
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
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Step 2 of 2</span>
            <span className="text-xs text-slate-400">· Review</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full">
            <div className="h-1 bg-teal-500 rounded-full w-full" />
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          This information will be saved to your Health Wallet and prepared for your upcoming appointment.
          <span className="text-slate-400"> Review everything before submitting.</span>
        </p>

        {/* Summary card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {[
            { label: 'Full Name',          value: form.name,             required: true },
            { label: 'Phone',              value: form.phone,            required: true },
            { label: 'Date of Birth',      value: form.dateOfBirth,      required: true },
            { label: 'Emergency Contact',  value: form.emergencyContact, required: true },
            { label: 'Allergies',          value: form.allergies || '—', required: false },
            { label: 'Current Medications',value: form.currentMedications || '—', required: false },
          ].map(({ label, value, required }, i, arr) => (
            <div key={label} className={`px-4 py-3 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">
                {label}{!required && <span className="ml-1 text-slate-300">(optional)</span>}
              </p>
              <p className="text-sm font-medium text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5Z" />
          </svg>
          Source: {source.type === 'qr_scan' ? 'QR scan' : 'Manual entry'}
          {source.rawCode && source.rawCode !== 'MANUAL' && ` · ${source.rawCode}`}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep('form')}
            disabled={submitting}
            className="flex-1 bg-slate-100 text-slate-700 font-semibold text-sm py-4 rounded-2xl tap-target"
          >
            Edit
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-[2] bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
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
      <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Form Submitted</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          Your appointment form has been saved to your Health Wallet. Your details have been updated for future use.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full text-left space-y-1.5">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Summary</p>
        <p className="text-sm font-semibold text-slate-800">{form.name}</p>
        <p className="text-xs text-slate-500">{form.phone} · DOB {form.dateOfBirth}</p>
        {savedRecord && (
          <p className="text-[10px] text-slate-300 font-mono mt-1">ID: {savedRecord.id}</p>
        )}
      </div>

      <button
        onClick={() => router.push('/patient')}
        className="w-full bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target"
      >
        Back to Home
      </button>
    </div>
  );
}
