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
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');

    const supabase = createClient();

    // 1. Create Supabase auth user
    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authErr || !data.user) {
      setError(authErr?.message ?? 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // 2. Create patient row linked to this auth user
    const { error: dbErr } = await supabase.from('patients').insert({
      name,
      email,
      user_id: data.user.id,
    });

    if (dbErr) {
      setError('Account created but profile setup failed. Please contact support.');
      setLoading(false);
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
            type="text"
            required
            className={inputClass}
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Priya Sharma"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Email</label>
          <input
            type="email"
            required
            className={inputClass}
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>Password</label>
          <input
            type="password"
            required
            className={inputClass}
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FFEDED', color: '#C23B3B' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
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

      <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
        Are you a doctor?{' '}
        <Link href="/login" className="font-semibold" style={{ color: 'var(--muted)' }}>Sign in here</Link>
      </p>
    </div>
  );
}
