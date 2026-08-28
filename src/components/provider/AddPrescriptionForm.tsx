'use client';

import { useState } from 'react';

interface Medication { name: string; dosage: string; frequency: string; duration: string; }

interface Props {
  token: string;
  recordId?: string;   // links prescription to the specific medical record
  onSuccess: () => void;
  onCancel: () => void;
}

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'Every 12 hours', 'As needed', 'Weekly'];
const inputStyle = { border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', borderRadius: 12, padding: '10px 14px', fontSize: 13, width: '100%', outline: 'none' };

export function AddPrescriptionForm({ token, recordId, onSuccess, onCancel }: Props) {
  const [meds, setMeds] = useState<Medication[]>([{ name: '', dosage: '', frequency: 'Once daily', duration: '' }]);
  const [instructions, setInstructions] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function updateMed(i: number, field: keyof Medication, val: string) {
    setMeds((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  }

  function addMed() {
    setMeds((prev) => [...prev, { name: '', dosage: '', frequency: 'Once daily', duration: '' }]);
  }

  function removeMed(i: number) {
    setMeds((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (meds.some((m) => !m.name.trim())) { setError('All medication names are required.'); return; }
    setSubmitting(true);
    setError('');

    const res = await fetch(`/api/provider/access/${token}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medications: meds, instructions: instructions || undefined, follow_up_date: followUp || undefined, medical_record_id: recordId || undefined }),
    });
    const json = await res.json();

    if (!json.success) { setError(json.error ?? 'Failed to save prescription.'); setSubmitting(false); return; }
    setDone(true);
    setTimeout(onSuccess, 1200);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-6 gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E9F9F1' }}>
          <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="#1FAA6D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
        </div>
        <p className="font-semibold text-sm" style={{ color: '#1FAA6D' }}>Prescription saved!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Add Prescription</p>
        <button onClick={onCancel} className="text-xs tap-target" style={{ color: 'var(--muted)' }}>Cancel</button>
      </div>

      {/* Medications */}
      <div className="space-y-3">
        {meds.map((med, i) => (
          <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: 'var(--blue-tint-2)', border: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between">
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Medication {i + 1}</p>
              {meds.length > 1 && (
                <button onClick={() => removeMed(i)} style={{ color: '#C23B3B', fontSize: 11, fontWeight: 600 }}>Remove</button>
              )}
            </div>
            <input placeholder="Medication name *" value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} style={inputStyle} />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} style={inputStyle} />
              <input placeholder="Duration (e.g. 7 days)" value={med.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} style={inputStyle} />
            </div>
            <select value={med.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} style={inputStyle}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button onClick={addMed} className="w-full text-sm font-semibold py-2.5 rounded-xl tap-target"
        style={{ border: '1px dashed var(--line)', color: '#2F6BFF', background: 'var(--card)' }}>
        + Add Another Medication
      </button>

      {/* Instructions */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Instructions</p>
        <textarea rows={2} placeholder="Additional instructions for patient…" value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          style={{ ...inputStyle, resize: 'none' }} />
      </div>

      {/* Follow-up */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Follow-up Date (optional)</p>
        <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
          min={new Date().toISOString().split('T')[0]} style={inputStyle} />
      </div>

      {error && <p className="text-xs" style={{ color: '#C23B3B' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={submitting}
        className="w-full font-bold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: '#2F6BFF', color: '#FFF', borderRadius: 24 }}>
        {submitting ? (
          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
        ) : 'Save Prescription'}
      </button>
    </div>
  );
}
