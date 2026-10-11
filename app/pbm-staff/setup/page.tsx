'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function PbmStaffSetupPage() {
  const router = useRouter();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [setupKey, setSetupKey] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/pbm/staff/setup')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to check setup status.');
        setAvailable(Boolean(result.available));
      })
      .catch((statusError: unknown) => {
        setAvailable(false);
        setError(statusError instanceof Error ? statusError.message : 'Unable to check setup status.');
      });
  }, []);

  const createAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/pbm/staff/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupKey, username, displayName, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create the administrator account.');
      router.replace('/');
    } catch (setupError: unknown) {
      setError(setupError instanceof Error ? setupError.message : 'Unable to create the administrator account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">One-time secure setup</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Create PBM Administrator</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-slate-600">
          This initial account is independent of ERP and can create individual staff logins. The setup key is configured privately in the hosting environment.
        </p>
        {available === null ? (
          <p className="text-sm text-slate-500">Checking setup status…</p>
        ) : available ? (
          <form onSubmit={createAdmin} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              One-time setup key
              <input
                type="password"
                autoComplete="off"
                required
                value={setupKey}
                onChange={(event) => setSetupKey(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Your name
              <input required maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Administrator username
              <input required minLength={4} maxLength={32} pattern="[a-z0-9][a-z0-9._-]{3,31}" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Password (12 or more characters)
              <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal" />
            </label>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create administrator account'}
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Initial setup is unavailable because it is not configured or has already been completed. Sign in with an existing PBM staff account.
          </div>
        )}
        {error && available !== true && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      </section>
    </main>
  );
}
