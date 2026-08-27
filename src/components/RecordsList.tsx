'use client';

import { useState } from 'react';
import { RecordCard } from '@/components/RecordCard';
import { CATEGORY_TABS } from '@/lib/records';
import type { MedicalRecord, RecordType } from '@/types';
import type { CategoryKey } from '@/lib/records';

export function RecordsList({ records }: { records: MedicalRecord[] }) {
  const [active, setActive] = useState<CategoryKey>('all');

  const filtered = active === 'all'
    ? records
    : records.filter((r) => r.type === active);

  return (
    <>
      {/* Category tabs — horizontally scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 mb-4">
        {CATEGORY_TABS.map(({ key, label }) => {
          const isActive = active === key;

          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="flex-shrink-0 px-4 py-2 text-xs font-semibold transition-colors tap-target"
              style={{
                borderRadius: 20,
                background: isActive ? '#2F6BFF' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#4B5265',
                border: isActive ? 'none' : '1px solid #EEF1F6',
              }}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({records.filter((r) => r.type === key).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Record list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: '#8A93A3', fontSize: 14 }}>No records in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}

      <p className="text-center text-xs mt-6 mb-2" style={{ color: '#8A93A3' }}>
        {records.length} record{records.length !== 1 ? 's' : ''} total
      </p>
    </>
  );
}
