'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FileUpload } from '@/components/FileUpload';
import { mimeToFileType } from '@/lib/storage';
import { RECORD_TYPE_LABELS } from '@/lib/records';
import type { RecordType } from '@/types';

const inputClass = 'w-full rounded-xl px-4 py-3 text-sm focus:outline-none';
const inputStyle = { border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' };

const RECORD_TYPES: RecordType[] = ['lab_report', 'prescription', 'imaging', 'consultation', 'vaccination', 'discharge_summary'];

export default function AddRecordPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RecordType>('lab_report');
  const [providerName, setProviderName] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setError('');

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let fileType: string | null = null;

    // ── 1. Upload file to Supabase Storage if selected ─────────
    if (selectedFile) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Not signed in.'); setUploading(false); return; }

      const ext = selectedFile.name.split('.').pop();
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('medical-records')
        .upload(storagePath, selectedFile, { contentType: selectedFile.type });

      if (uploadErr) {
        setError(`File upload failed: ${uploadErr.message}`);
        setUploading(false);
        return;
      }

      fileUrl = storagePath;
      fileName = selectedFile.name;
      fileSize = selectedFile.size;
      fileType = mimeToFileType(selectedFile.type);
    }

    // ── 2. Create the record via API ────────────────────────────
    const res = await fetch('/api/patient/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, provider_name: providerName, record_date: recordDate, description, file_url: fileUrl, file_name: fileName, file_size: fileSize, file_type: fileType }),
    });

    const json = await res.json();
    if (!json.success) {
      setError(json.error ?? 'Failed to save record.');
      setUploading(false);
      return;
    }

    router.push(`/patient/records/${json.data.id}`);
    router.refresh();
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <Link href="/patient/records" className="inline-flex items-center gap-1 text-sm mb-4 tap-target" style={{ color: 'var(--muted)' }}>
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7"/>
        </svg>
        Records
      </Link>
      <h1 className="text-2xl font-bold mb-5" style={{ color: 'var(--ink)' }}>Add Record</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Title <span style={{ color: '#FF6B6B' }}>*</span></label>
          <input
            type="text" required className={inputClass} style={inputStyle}
            value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Blood Test Report"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Record Type <span style={{ color: '#FF6B6B' }}>*</span></label>
          <select
            className={inputClass} style={inputStyle}
            value={type} onChange={(e) => setType(e.target.value as RecordType)}
          >
            {RECORD_TYPES.map((t) => (
              <option key={t} value={t}>{RECORD_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* Provider */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Healthcare Provider <span style={{ color: '#FF6B6B' }}>*</span></label>
          <input
            type="text" required className={inputClass} style={inputStyle}
            value={providerName} onChange={(e) => setProviderName(e.target.value)}
            placeholder="e.g. City Diagnostics"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Date <span style={{ color: '#FF6B6B' }}>*</span></label>
          <input
            type="date" required className={inputClass} style={inputStyle}
            value={recordDate} onChange={(e) => setRecordDate(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Notes / Description</label>
          <textarea
            className={`${inputClass} resize-none`} style={inputStyle} rows={3}
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Any additional notes about this record…"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>
            Attach File <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <FileUpload selectedFile={selectedFile} onFileSelected={setSelectedFile} />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', color: '#C23B3B' }}>{error}</div>
        )}

        <button
          type="submit" disabled={uploading}
          className="w-full font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {selectedFile ? 'Uploading file…' : 'Saving…'}
            </>
          ) : 'Save Record'}
        </button>
      </form>
    </div>
  );
}
