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

// Tailwind color sets per type (bg, text, border, icon bg)
export const RECORD_TYPE_COLORS: Record<
  RecordType,
  { bg: string; text: string; border: string; iconBg: string; dot: string }
> = {
  lab_report:        { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   iconBg: 'bg-blue-100',   dot: 'bg-blue-500'   },
  prescription:      { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', iconBg: 'bg-violet-100', dot: 'bg-violet-500' },
  imaging:           { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', iconBg: 'bg-orange-100', dot: 'bg-orange-500' },
  consultation:      { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   iconBg: 'bg-teal-100',   dot: 'bg-teal-500'   },
  vaccination:       { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  iconBg: 'bg-green-100',  dot: 'bg-green-500'  },
  discharge_summary: { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   iconBg: 'bg-rose-100',   dot: 'bg-rose-500'   },
};

export const RECORD_TYPE_ICONS: Record<RecordType, string> = {
  lab_report:        '🧪',
  prescription:      '💊',
  imaging:           '🩻',
  consultation:      '🩺',
  vaccination:       '💉',
  discharge_summary: '📋',
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
