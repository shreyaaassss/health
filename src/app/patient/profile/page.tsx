'use client';

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

  const inputStyle = {
    width: '100%',
    border: '1px solid #EEF1F6',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    color: '#12151C',
    background: '#FFFFFF',
    outline: 'none',
  };

  function Row({ label, value, field, type = 'text' }: {
    label: string; value?: string | null; field: keyof PatientProfile; type?: string;
  }) {
    return (
      <div className={`px-4 py-3 ${editing ? '' : 'border-b last:border-0'}`} style={{ borderColor: '#EEF1F6' }}>
        <p style={{ fontSize: 10, color: '#8A93A3', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {editing ? (
          field === 'allergies' || field === 'current_medications' ? (
            <textarea
              className="resize-none"
              style={inputStyle}
              rows={2}
              value={(form[field] as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            />
          ) : (
            <input
              type={type}
              style={inputStyle}
              value={(form[field] as string) ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            />
          )
        ) : (
          <p className="text-sm font-medium" style={{ color: '#12151C' }}>
            {value || <span style={{ color: '#EEF1F6', fontStyle: 'italic' }}>Not set</span>}
          </p>
        )}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 pt-6">
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: '#EEF1F6' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <Link href="/patient" className="inline-flex items-center gap-1 text-sm mb-4 tap-target" style={{ color: '#8A93A3' }}>
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#8A93A3" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Home
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#12151C' }}>My Profile</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8A93A3' }}>Used to autofill appointment forms</p>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-sm font-semibold tap-target px-3 py-2"
          style={{ color: '#2F6BFF' }}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ background: '#EAF1FF', color: '#2F6BFF' }}
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold" style={{ color: '#12151C' }}>{profile.name}</p>
          <p className="text-sm" style={{ color: '#8A93A3' }}>{profile.email}</p>
        </div>
      </div>

      {saved && (
        <div className="mb-4 rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ background: '#EAF1FF', border: '1px solid #2F6BFF30' }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium" style={{ color: '#1D4FE0' }}>Profile updated</p>
        </div>
      )}

      <div className={`rounded-2xl overflow-hidden ${editing ? 'space-y-2 p-3' : ''}`} style={{ background: '#FFFFFF', border: '1px solid #EEF1F6' }}>
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
          className="mt-4 w-full font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
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
