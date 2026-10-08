'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BriefcaseBusiness, Copy, KeyRound, Link2, X } from 'lucide-react';

interface CareerAccount {
  username: string;
  createdAt: string;
}

export function ProfessionalCareerAccountModal({
  isOpen,
  childId,
  childName,
  initialCredentials,
  onSetupDraft,
  onClose,
}: {
  isOpen: boolean;
  childId?: string;
  childName: string;
  initialCredentials?: { username: string; password: string };
  onSetupDraft?: (credentials: { username: string; password: string }) => void;
  onClose: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [account, setAccount] = useState<CareerAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    setCopied('');
    setPassword(initialCredentials?.password || '');
    setShowPassword(false);
    setAccount(null);
    setUsername(
      initialCredentials?.username || childName
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '')
        .slice(0, 24)
    );

    if (!childId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/children/${childId}/professional-career`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load career account.');
        if (cancelled) return;
        if (result.account) {
          setAccount(result.account);
          setUsername(result.account.username);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load career account.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, childId, childName, initialCredentials]);

  const loginUrl = typeof window === 'undefined'
    ? ''
    : `${window.location.origin}/professional-career`;
  const validUsername = /^[a-z0-9][a-z0-9._-]{3,31}$/i.test(username.trim());

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(`${label} copied.`);
    } catch {
      setError(`Could not copy ${label.toLowerCase()}. Please select and copy it manually.`);
    }
  };

  const closeModal = () => {
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  const saveAccount = async () => {
    if (!childId) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const response = await fetch(`/api/children/${childId}/professional-career`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save career access.');

      setAccount(result.account);
      setUsername(result.account.username);
      setSuccess('Career portal access is ready. Share this login link and the password with the graduate.');
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save career access.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-account-title"
        className="w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div>
              <h2 id="career-account-title" className="text-lg font-bold text-slate-900">Professional Career Portal</h2>
              <p className="mt-1 text-sm text-slate-500">{childName || 'Graduate'}</p>
            </div>
          </div>
          <button type="button" onClick={closeModal} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <p className="mb-5 text-sm leading-6 text-slate-600">
          {childId
            ? 'Set the graduate’s username and password. Their saved career updates will be private to this login.'
            : 'Create the graduate’s login details now. Save the child dossier afterward to activate the account and generate the link.'}
        </p>
        {loading && <p className="mb-4 text-sm text-slate-500">Loading account status…</p>}

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Username
            <input
              autoComplete="off"
              maxLength={32}
              minLength={4}
              pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{3,31}"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <div>
            <label htmlFor="career-account-password" className="block text-sm font-semibold text-slate-700">
              {account ? 'Set a new password' : 'Password'}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="career-account-password"
                autoComplete="new-password"
                type={showPassword ? 'text' : 'password'}
                minLength={10}
                maxLength={128}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={account ? 'Enter a new password to rotate access' : 'At least 10 characters'}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="shrink-0 text-xs font-semibold text-emerald-700 hover:underline"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <span className="mt-1 block text-xs font-normal text-slate-500">
              {childId
                ? 'Passwords are stored as secure hashes and cannot be retrieved later. Save the password before closing.'
                : 'The password stays in this form until the child dossier is saved, then it is stored as a secure hash.'}
            </span>
          </div>
        </div>

        {childId ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Link2 className="h-4 w-4" /> Shared login link
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <code className="break-all text-sm text-slate-800">{loginUrl}</code>
                <button type="button" onClick={() => void copyValue('Login link', loginUrl)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </button>
              </div>
              {account && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">Account active since {new Date(account.createdAt).toLocaleDateString()}.</p>
                  <button
                    type="button"
                    disabled={password.length < 10}
                    onClick={() => void copyValue('Login details', `Login link: ${loginUrl}\nUsername: ${username}\nPassword: ${password}`)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Copy login details
                  </button>
                </div>
              )}
              {copied && <p role="status" className="mt-2 text-xs font-semibold text-emerald-700">{copied}</p>}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              After saving the child dossier, the account will be activated and the graduate login link will appear here.
            </div>
          )}

        <footer className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
          <button
            type="button"
            onClick={() => {
              if (childId) {
                void saveAccount();
              } else {
                onSetupDraft?.({ username: username.trim().toLowerCase(), password });
                onClose();
              }
            }}
            disabled={loading || saving || !validUsername || password.length < 10 || (!childId && !onSetupDraft)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            {saving ? 'Saving…' : childId ? (account ? 'Update Login Access' : 'Create Login Access') : 'Continue to Child Dossier'}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
