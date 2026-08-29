'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const inputClass = 'w-full rounded-xl px-4 py-3 text-sm focus:outline-none';
const inputStyle = { border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });

    if (authErr || !data.user) {
      setError(authErr?.message ?? 'Login failed. Check your email and password.');
      setLoading(false);
      return;
    }

    // Detect role: check if user is a doctor or patient
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', data.user.id)
      .single();

    if (provider) {
      router.push('/doctor');
    } else {
      router.push('/patient');
    }
    router.refresh();
  }

  return (
    <>
      {/* Background image — login page only, fixed behind all content */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1,
        backgroundImage: 'url(/login-bg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
    <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
      <h2 className="font-bold mb-1" style={{ fontSize: 18, color: 'var(--ink)' }}>Welcome back</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Sign in to your account</p>

      <form onSubmit={handleLogin} className="space-y-4">
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
            placeholder="••••••••"
            autoComplete="current-password"
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
              Signing in…
            </>
          ) : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: 'var(--muted)' }}>
        New patient?{' '}
        <Link href="/register" className="font-semibold" style={{ color: '#2F6BFF' }}>Create account</Link>
      </p>
    </div>
    </>
  );
}
