'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface StaffAccount {
  id: string;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'STAFF';
  active: boolean;
  createdAt: string;
}

export default function PbmStaffUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<StaffAccount[]>([]);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    const response = await fetch('/api/pbm/staff/users');
    const result = await response.json();
    if (response.status === 401) {
      router.replace('/pbm-staff/login?next=%2Fpbm-staff%2Fusers');
      return;
    }
    if (!response.ok) throw new Error(result.error || 'Unable to load staff accounts.');
    setUsers(result.users);
  }, [router]);

  useEffect(() => {
    loadUsers()
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Unable to load staff accounts.'))
      .finally(() => setLoading(false));
  }, [loadUsers]);

  const addUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const response = await fetch('/api/pbm/staff/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, password, role }),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.replace('/pbm-staff/login?next=%2Fpbm-staff%2Fusers');
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Unable to create staff account.');
      setUsers((current) => [...current, result.user]);
      setUsername('');
      setDisplayName('');
      setPassword('');
      setNotice(`Account for ${result.user.displayName} created.`);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create staff account.');
    } finally {
      setSaving(false);
    }
  };

  const setUserActive = async (user: StaffAccount) => {
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/pbm/staff/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, active: !user.active }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to update the staff account.');
      setUsers((current) => current.map((item) => item.id === user.id ? result.user : item));
      setNotice(`${user.displayName}'s account has been ${result.user.active ? 'enabled' : 'disabled'}.`);
    } catch (updateError: unknown) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update the staff account.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">PBM staff access</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Staff Accounts</h1>
          </div>
          <Link href="/" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Back to portal</Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Create an individual login</h2>
          <p className="mb-5 mt-1 text-sm text-slate-600">Passwords are stored as secure hashes. Share the password directly with the staff member.</p>
          {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
          <form onSubmit={addUser} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Staff name
              <input required maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">Username
              <input required minLength={4} maxLength={32} pattern="[a-z0-9][a-z0-9._-]{3,31}" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">Temporary password (12+ characters)
              <input required minLength={12} maxLength={128} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">Account type
              <select value={role} onChange={(event) => setRole(event.target.value as 'STAFF' | 'ADMIN')} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal">
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </label>
            <button disabled={saving} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2">
              {saving ? 'Creating…' : 'Create PBM account'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Existing accounts</h2>
          {loading ? <p className="text-sm text-slate-500">Loading…</p> : users.length === 0 ? <p className="text-sm text-slate-500">No staff accounts found.</p> : (
            <ul className="divide-y divide-slate-100">
              {users.map((user) => (
                <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div><p className="font-semibold text-slate-800">{user.displayName}</p><p className="text-xs text-slate-500">{user.username}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{user.role}{user.active ? '' : ' · Disabled'}</span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void setUserActive(user)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {user.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
