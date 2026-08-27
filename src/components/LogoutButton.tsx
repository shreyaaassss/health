'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (compact) {
    return (
      <button
        onClick={handleLogout}
        className="tap-target flex items-center justify-center w-9 h-9 rounded-full"
        style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}
        aria-label="Sign out"
      >
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl tap-target"
      style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}
    >
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Sign out
    </button>
  );
}
