import { RecordTypeIcon } from '@/components/RecordTypeIcon';
import { RECORD_TYPE_COLORS } from '@/lib/records';
import type { AccessGrantWithDetails } from '@/types';

interface Props {
  grant: AccessGrantWithDetails;
  onConfirm: () => void;
  onCancel: () => void;
  revoking: boolean;
}

export function RevokeConfirmModal({ grant, onConfirm, onCancel, revoking }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onCancel}>
      <div
        className="w-full rounded-t-3xl px-5 pt-5 pb-8"
        style={{ background: '#FFFFFF' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full" style={{ background: '#EEF1F6' }} />
        </div>

        {/* Warning icon — coral SVG circle with X */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: '#FFEDED' }}
        >
          <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#C23B3B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        </div>

        <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#12151C' }}>Revoke Access?</h2>
        <p className="text-sm text-center mb-5" style={{ color: '#8A93A3' }}>
          <span className="font-semibold" style={{ color: '#4B5265' }}>{grant.provider.name}</span> will immediately lose access to:
        </p>

        {/* Records list */}
        <div className="rounded-2xl px-4 py-3 mb-5 space-y-2" style={{ background: '#FFEDED', border: '1px solid #FF6B6B30' }}>
          {grant.records.map((r) => {
            const c = RECORD_TYPE_COLORS[r.type];
            return (
              <div key={r.id} className="flex items-center gap-2">
                <RecordTypeIcon type={r.type} strokeColor={c.stroke} size={16} />
                <span className="text-sm" style={{ color: '#4B5265' }}>{r.title}</span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-center mb-6" style={{ color: '#8A93A3' }}>
          This cannot be undone. The provider will need a new access link to view records again.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={revoking}
            className="flex-1 font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40"
            style={{ background: '#EEF1F6', color: '#4B5265' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={revoking}
            className="flex-[2] font-bold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            style={{ background: '#FFEDED', color: '#C23B3B' }}
          >
            {revoking ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Revoking…
              </>
            ) : (
              'Yes, Revoke Access'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
