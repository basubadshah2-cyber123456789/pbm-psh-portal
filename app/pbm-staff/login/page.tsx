'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, UserRound } from 'lucide-react';

export default function PbmStaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/pbm/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      const requestedPath = new URLSearchParams(window.location.search).get('next') || '/';
      const nextPath = requestedPath.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/';
      router.replace(nextPath);
    } catch (loginError: unknown) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">PBM Children Portal</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Staff Sign In</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-slate-600">
          Use your individual PBM staff account. This login is separate from Sweet Home ERP.
        </p>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={signIn} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Username
            <span className="relative mt-1.5 block">
              <UserRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </span>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <span className="relative mt-1.5 block">
              <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                autoComplete="current-password"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-500">
          First-time setup? <Link href="/pbm-staff/setup" className="font-semibold text-emerald-700 hover:underline">Create the PBM administrator account</Link>
        </p>
      </section>
    </main>
  );
}
