'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Shield, UserRound } from 'lucide-react';

function getNextPath() {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to sign in. Please try again.');
      }
      router.replace(getNextPath());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-xl bg-emerald-100 p-3 text-emerald-800">
            <Shield className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pakistan Bait-ul-Mal</p>
            <h1 className="text-xl font-extrabold text-slate-900">Staff Sign In</h1>
          </div>
        </div>

        <p className="mb-5 text-sm text-slate-600">Sign in with your PBM staff username or email and password.</p>
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Username or email
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-emerald-600">
              <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                required
                autoComplete="username"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                className="min-w-0 flex-1 text-sm font-normal text-slate-900 outline-none"
              />
            </span>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-emerald-600">
              <KeyRound className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 text-sm font-normal text-slate-900 outline-none"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <Link href="/" className="mt-5 block text-center text-xs font-semibold text-emerald-700 hover:underline">
          Back to Admission Portal
        </Link>
      </section>
    </main>
  );
}
