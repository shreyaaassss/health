'use client';

import { useRef, useState } from 'react';
import { formatFileSize } from '@/lib/storage';

const ACCEPTED = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface Props {
  onFileSelected: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileUpload({ onFileSelected, selectedFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState('');

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setSizeError('File too large. Maximum size is 10 MB.');
      return;
    }
    setSizeError('');
    onFileSelected(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  const ext = selectedFile?.name.split('.').pop()?.toLowerCase();
  const isImage = ext && ['jpg', 'jpeg', 'png'].includes(ext);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {selectedFile ? (
        /* Selected file preview */
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: '#EAF1FF', border: '1px solid #2F6BFF30' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFFFFF' }}>
            {isImage ? (
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#1D4FE0' }}>{selectedFile.name}</p>
            <p className="text-xs" style={{ color: '#2F6BFF' }}>{formatFileSize(selectedFile.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => { onFileSelected(null); if (inputRef.current) inputRef.current.value = ''; }}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#FFFFFF', color: '#8A93A3' }}
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ) : (
        /* Drop zone */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 py-6 transition-colors"
          style={{
            border: `2px dashed ${dragOver ? '#2F6BFF' : 'var(--line)'}`,
            background: dragOver ? '#EAF1FF' : 'var(--card)',
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-tint)' }}>
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#2F6BFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Tap to upload a file</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>PDF, DOCX, JPG, PNG · Max 10 MB</p>
        </button>
      )}

      {sizeError && (
        <p className="text-xs mt-1" style={{ color: '#C23B3B' }}>{sizeError}</p>
      )}
    </div>
  );
}
