'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActiveGrantCard } from '@/components/ActiveGrantCard';
import { RevokeConfirmModal } from '@/components/RevokeConfirmModal';
import type { AccessGrantWithDetails } from '@/types';

export function AccessList({ initialGrants }: { initialGrants: AccessGrantWithDetails[] }) {
  const [grants, setGrants] = useState(initialGrants);
  const [confirmingGrant, setConfirmingGrant] = useState<AccessGrantWithDetails | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [removedMessage, setRemovedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sweep expired grants on mount (client-side top-up after server render)
  useEffect(() => {
    fetch('/api/patient/grants/sweep', { method: 'POST' }).catch(() => {});
  }, []);

  function removeGrant(id: string, message: string) {
    setGrants((prev) => prev.filter((g) => g.id !== id));
    setRemovedMessage(message);
  }

  // Called when ExpiryCountdown hits zero — auto-removes grant
  const handleExpired = useCallback((grant: AccessGrantWithDetails) => {
    removeGrant(grant.id, `${grant.provider.name}'s access has expired.`);
  }, []);

  async function handleRevoke(grant: AccessGrantWithDetails) {
    setRevokingId(grant.id);
    setError(null);

    try {
      const res = await fetch(`/api/patient/grants/${grant.id}/revoke`, { method: 'POST' });
      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? 'Failed to revoke access.');
        return;
      }

      removeGrant(grant.id, `Access revoked. ${grant.provider.name} can no longer view your records.`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setRevokingId(null);
      setConfirmingGrant(null);
    }
  }

  const activeGrants = grants.filter((g) => g.status === 'ACTIVE');

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success / expiry message */}
      {removedMessage && activeGrants.length === 0 && (
        <div className="mb-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-teal-700 font-medium">{removedMessage}</p>
        </div>
      )}

      {activeGrants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium text-sm mb-1">No active access</p>
          <p className="text-slate-400 text-xs max-w-[200px]">
            When you share records with a provider, their access will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGrants.map((grant) => (
            <ActiveGrantCard
              key={grant.id}
              grant={grant}
              revoking={revokingId === grant.id}
              onRevoke={() => setConfirmingGrant(grant)}
              onExpired={() => handleExpired(grant)}
            />
          ))}
        </div>
      )}

      {confirmingGrant && (
        <RevokeConfirmModal
          grant={confirmingGrant}
          revoking={revokingId === confirmingGrant.id}
          onConfirm={() => handleRevoke(confirmingGrant)}
          onCancel={() => setConfirmingGrant(null)}
        />
      )}
    </>
  );
}
