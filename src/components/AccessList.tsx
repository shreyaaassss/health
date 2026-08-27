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
        <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', border: '1px solid #FF6B6B30', color: '#C23B3B' }}>
          {error}
        </div>
      )}

      {/* Success / expiry message */}
      {removedMessage && activeGrants.length === 0 && (
        <div className="mb-4 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: '#EAF1FF', border: '1px solid #2F6BFF30' }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#2F6BFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium" style={{ color: '#1D4FE0' }}>{removedMessage}</p>
        </div>
      )}

      {activeGrants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#EEF1F6' }}>
            <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="#8A93A3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="17" r="3"/>
              <path d="M10 17h4a2 2 0 0 0 2-2v-2"/>
              <path d="M14 10V7a3 3 0 0 1 6 0v3"/>
              <rect x="14" y="10" width="6" height="5" rx="1"/>
            </svg>
          </div>
          <p className="font-medium text-sm mb-1" style={{ color: '#4B5265' }}>No active access</p>
          <p className="text-xs max-w-[200px]" style={{ color: '#8A93A3' }}>
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
