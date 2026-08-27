import type { RecordType } from '@/types';

// ── Display helpers for record types ──────────
export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  lab_report:        'Lab Report',
  prescription:      'Prescription',
  imaging:           'Imaging',
  consultation:      'Consultation',
  vaccination:       'Vaccination',
  discharge_summary: 'Discharge Summary',
};

// Hex color sets per type (bg, text, stroke)
export const RECORD_TYPE_COLORS: Record<RecordType, { bg: string; text: string; stroke: string }> = {
  lab_report:        { bg: '#EAF1FF', text: '#1D4FE0', stroke: '#2F6BFF' },
  prescription:      { bg: '#E9F9F1', text: '#1FAA6D', stroke: '#1FAA6D' },
  imaging:           { bg: '#F1EEFF', text: '#7B61FF', stroke: '#7B61FF' },
  vaccination:       { bg: '#FEF6E7', text: '#E5A020', stroke: '#E5A020' },
  consultation:      { bg: '#FFEDED', text: '#C23B3B', stroke: '#FF6B6B' },
  discharge_summary: { bg: '#FFEDED', text: '#C23B3B', stroke: '#FF6B6B' },
};

// Format a date string like "2026-03-15" → "Mar 15, 2026"
export function formatRecordDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Category filter tabs shown above the record list
export const CATEGORY_TABS = [
  { key: 'all',              label: 'All'          },
  { key: 'lab_report',       label: 'Lab'          },
  { key: 'prescription',     label: 'Prescription' },
  { key: 'imaging',          label: 'Imaging'      },
  { key: 'consultation',     label: 'Consultation' },
  { key: 'vaccination',      label: 'Vaccination'  },
] as const;

export type CategoryKey = (typeof CATEGORY_TABS)[number]['key'];
