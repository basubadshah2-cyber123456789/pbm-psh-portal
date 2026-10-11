'use client';

import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { createEmptyFollowUp, type FollowUpRecord } from './follow-up';

type FollowUpModalProps = {
  childId: string;
  childName: string;
  className?: string;
  instituteName?: string;
  onClose: () => void;
  onSave: (record: FollowUpRecord) => Promise<void>;
};

const fields: { key: Exclude<keyof FollowUpRecord, 'id'>; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'className', label: 'Class' },
  { key: 'instituteName', label: 'Institute Name' },
  { key: 'passedFrom', label: 'Passed From' },
  { key: 'boardRegistrationNumber', label: 'Board Registration Number' },
  { key: 'rollNumber', label: 'Roll Number' },
  { key: 'passingYear', label: 'Passing Year' },
  { key: 'totalMarks', label: 'Total Marks' },
  { key: 'obtainedMarks', label: 'Obtained Marks' },
  { key: 'pshRegistrationNumber', label: 'PSH Registration Number' },
  { key: 'passedFromPsh', label: 'Passed From Which PSH' },
];

export function FollowUpModal({
  childId,
  childName,
  className = '',
  instituteName = '',
  onClose,
  onSave,
}: FollowUpModalProps) {
  const [view, setView] = useState<'follow-up' | 'credentials'>('follow-up');
  const [draft, setDraft] = useState(() => createEmptyFollowUp({
    name: childName,
    className,
    instituteName,
  }));
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentialMode, setCredentialMode] = useState<'create' | 'login'>('create');
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [submittingCredentials, setSubmittingCredentials] = useState(false);
  const [followUpSaved, setFollowUpSaved] = useState(false);

  const handleFollowUpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('Enter the student name before adding this follow-up.');
      return;
    }
    setSavingFollowUp(true);
    setError('');
    try {
      const accountResponse = await fetch(`/api/pbm/children/${childId}/career-account`);
      const accountResult = await accountResponse.json();
      if (!accountResponse.ok) throw new Error(accountResult.error || 'Unable to check the student account.');

      if (!followUpSaved) {
        await onSave(draft);
        setFollowUpSaved(true);
      }

      const account = accountResult.account as { username?: string } | null;
      setCredentialMode(account?.username ? 'login' : 'create');
      setUsername(account?.username || '');
      setView('credentials');
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to continue.');
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleCredentialSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittingCredentials(true);
    setError('');
    try {
      if (credentialMode === 'create') {
        const createResponse = await fetch(`/api/pbm/children/${childId}/career-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const createResult = await createResponse.json();
        if (!createResponse.ok) throw new Error(createResult.error || 'Unable to create the student account.');
      }

      const loginResponse = await fetch('/api/pbm/career/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const loginResult = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginResult.error || 'Unable to sign in.');
      window.location.assign(loginResult.nextPath || '/professional-career/profile');
    } catch (credentialError: unknown) {
      setError(credentialError instanceof Error ? credentialError.message : 'Unable to continue.');
    } finally {
      setSubmittingCredentials(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6">
      <form
        onSubmit={view === 'follow-up' ? handleFollowUpSubmit : handleCredentialSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={view === 'follow-up' ? 'follow-up-title' : 'follow-up-login-title'}
        className={`w-full ${view === 'follow-up' ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id={view === 'follow-up' ? 'follow-up-title' : 'follow-up-login-title'}
              className="text-lg font-bold text-slate-900"
            >
              {view === 'follow-up' ? 'Follow Up Form' : credentialMode === 'create' ? 'Create Student Login' : 'Student Login'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {view === 'follow-up'
                ? `Follow-up details are saved directly to ${childName}'s dossier.`
                : `${childName} · Continue to the College Life form`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close follow-up form"
          >
            ×
          </button>
        </div>

        {view === 'follow-up' ? (
          <>
            {error && (
              <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(({ key, label }) => (
                <div key={key} className="relative">
                  <label
                    htmlFor={`follow-up-${key}`}
                    className="absolute -top-2.5 left-3 z-10 bg-slate-50 px-1 text-[11px] font-bold text-slate-700 sm:text-xs"
                  >
                    {label} {key === 'name' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={`follow-up-${key}`}
                    name={key}
                    value={draft[key]}
                    required={key === 'name'}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, [key]: event.target.value }));
                      if (error) setError('');
                    }}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 text-xs text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:h-11 sm:text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingFollowUp}
                className="rounded-lg bg-[#0D5C3A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0b4d30]"
              >
                {savingFollowUp ? 'Saving…' : 'Add Follow Up'}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}
            {credentialMode === 'create' && (
              <p className="text-xs leading-5 text-slate-600">
                Set a username and password for the student. They can use the same credentials to return to their education history.
              </p>
            )}
            <div className="relative">
              <label
                htmlFor="follow-up-login-username"
                className="absolute -top-2.5 left-3 z-10 bg-slate-50 px-1 text-[11px] font-bold text-slate-700 sm:text-xs"
              >
                Username
              </label>
              <input
                id="follow-up-login-username"
                name="username"
                autoComplete="username"
                required
                minLength={4}
                maxLength={32}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                readOnly={credentialMode === 'login'}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="follow-up-login-password"
                className="absolute -top-2.5 left-3 z-10 bg-slate-50 px-1 text-[11px] font-bold text-slate-700 sm:text-xs"
              >
                Password
              </label>
              <input
                id="follow-up-login-password"
                name="password"
                type="password"
                autoComplete={credentialMode === 'create' ? 'new-password' : 'current-password'}
                required
                minLength={credentialMode === 'create' ? 10 : undefined}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView('follow-up')}
                disabled={submittingCredentials}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submittingCredentials}
                className="rounded-lg bg-[#0D5C3A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0b4d30] disabled:cursor-wait disabled:opacity-60"
              >
                {submittingCredentials ? 'Please wait…' : credentialMode === 'create' ? 'Create Login & Continue' : 'Login'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>,
    document.body
  );
}
