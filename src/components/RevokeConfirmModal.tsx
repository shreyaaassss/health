import { RECORD_TYPE_ICONS } from '@/lib/records';
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
        className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Warning icon */}
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-900 text-center mb-1">Revoke Access?</h2>
        <p className="text-sm text-slate-500 text-center mb-5">
          <span className="font-semibold text-slate-700">{grant.provider.name}</span> will immediately lose access to:
        </p>

        {/* Records list */}
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-5 space-y-2">
          {grant.records.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <span className="text-base">{RECORD_TYPE_ICONS[r.type]}</span>
              <span className="text-sm text-slate-700">{r.title}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mb-6">
          This cannot be undone. The provider will need a new access link to view records again.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={revoking}
            className="flex-1 bg-slate-100 text-slate-700 font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={revoking}
            className="flex-[2] bg-red-600 text-white font-bold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 active:bg-red-700 transition-colors flex items-center justify-center gap-2"
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
