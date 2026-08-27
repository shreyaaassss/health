'use client';

import type { Metadata } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API } from '@/constants/api';
import type { PatientProfile } from '@/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<PatientProfile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(API.patient.profile)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) { setProfile(j.data); setForm(j.data); }
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(API.patient.profile, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        date_of_birth: form.date_of_birth,
        emergency_contact: form.emergency_contact,
        allergies: form.allergies,
        current_medications: form.current_medications,
      }),
    });
    const json = await res.json();
    if (json.success) { setProfile(json.data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
    setEditing(false);
  }

  const inputClass = 'w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-teal-500';

  function Row({ label, value, field, type = 'text' }: {
    label: string; value?: string | null; field: keyof PatientProfile; type?: string;
  }) {
    return (
      <div className={`px-4 py-3 ${editing ? '' : 'border-b border-slate-100 last:border-0'}`}>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">{label}</p>
        {editing ? (
          field === 'allergies' || field === 'current_medications' ? (
            <textarea
              className={inputClass + ' resize-none'}
              rows={2}
              value={(form[field] as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            />
          ) : (
            <input
              type={type}
              className={inputClass}
              value={(form[field] as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            />
          )
        ) : (
          <p className="text-sm font-medium text-slate-800">{value || <span className="text-slate-300 italic">Not set</span>}</p>
        )}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 pt-6">
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <Link href="/patient" className="inline-flex items-center gap-1 text-sm text-slate-500 mb-4 tap-target">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Home
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-400 mt-0.5">Used to autofill appointment forms</p>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-sm font-semibold text-teal-600 tap-target px-3 py-2"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-2xl font-bold text-teal-700">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-slate-900">{profile.name}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
        </div>
      </div>

      {saved && (
        <div className="mb-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-teal-700 font-medium">Profile updated</p>
        </div>
      )}

      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${editing ? 'space-y-2 p-3' : ''}`}>
        <Row label="Full Name"         value={profile.name}               field="name" />
        <Row label="Phone"             value={profile.phone}              field="phone" type="tel" />
        <Row label="Date of Birth"     value={profile.date_of_birth}      field="date_of_birth" type="date" />
        <Row label="Emergency Contact" value={profile.emergency_contact}  field="emergency_contact" />
        <Row label="Allergies"         value={profile.allergies}          field="allergies" />
        <Row label="Current Medications" value={profile.current_medications} field="current_medications" />
      </div>

      {editing && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full bg-teal-600 text-white font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving…
            </>
          ) : 'Save Profile'}
        </button>
      )}
    </div>
  );
}
