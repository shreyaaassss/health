'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const inputClass = 'w-full rounded-xl px-4 py-3 text-sm focus:outline-none';
const inputStyle = { border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' };

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Server-side: create auth user + patient row via admin client
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();

    if (!json.success) {
      setError(json.error ?? 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // 2. Sign in with the newly created credentials to get a session
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      setError('Account created. Please sign in.');
      router.push('/login');
      return;
    }

    router.push('/patient');
    router.refresh();
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
      <h2 className="font-bold mb-1" style={{ fontSize: 18, color: 'var(--ink)' }}>Create your Health Wallet</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Register as a patient — free forever</p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Full Name</label>
          <input
            type="text" required className={inputClass} style={inputStyle}
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Priya Sharma" autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Email</label>
          <input
            type="email" required className={inputClass} style={inputStyle}
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Password</label>
          <input
            type="password" required className={inputClass} style={inputStyle}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters" autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', color: '#C23B3B' }}>
            {error}
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full font-semibold text-sm py-4 rounded-2xl tap-target disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: '#2F6BFF', color: '#FFFFFF', borderRadius: 24 }}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Creating account…
            </>
          ) : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: 'var(--muted)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold" style={{ color: '#2F6BFF' }}>Sign in</Link>
      </p>
    </div>
  );
}
