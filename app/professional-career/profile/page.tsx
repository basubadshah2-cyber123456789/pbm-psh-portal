'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, LogOut, Save } from 'lucide-react';
import { UniversityProgressForm } from '@/components/professional-career/UniversityProgressForm';

interface CareerProfile {
  name: string;
  currentStatus: string;
  schoolOrUniversity: string;
  programOrDegree: string;
  currentClassYear: string;
  employer: string;
  jobTitle: string;
  location: string;
  notes: string;
  updatedAt: string;
}

const emptyProfile: CareerProfile = {
  name: '',
  currentStatus: '',
  schoolOrUniversity: '',
  programOrDegree: '',
  currentClassYear: '',
  employer: '',
  jobTitle: '',
  location: '',
  notes: '',
  updatedAt: '',
};

const textFields: { key: keyof Omit<CareerProfile, 'currentStatus' | 'updatedAt'>; label: string; placeholder: string }[] = [
  { key: 'name', label: 'Your name', placeholder: 'Enter your full name' },
  { key: 'schoolOrUniversity', label: 'School, college, or university', placeholder: 'Where are you studying?' },
  { key: 'programOrDegree', label: 'Program or degree', placeholder: 'For example, BS Computer Science' },
  { key: 'currentClassYear', label: 'Class or current year', placeholder: 'For example, 3rd year' },
  { key: 'employer', label: 'Employer or organization', placeholder: 'Where do you work?' },
  { key: 'jobTitle', label: 'Job title or role', placeholder: 'Your current position' },
  { key: 'location', label: 'City / location', placeholder: 'Your current city' },
];

export default function ProfessionalCareerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CareerProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/professional-career/profile')
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 401) {
          router.replace('/professional-career');
          return;
        }
        if (!response.ok) throw new Error(result.error || 'Unable to load profile.');
        if (!cancelled) setProfile({ ...emptyProfile, ...(result.profile || {}), name: result.profile?.name || result.name || '' });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load profile.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/professional-career/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.replace('/professional-career');
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Unable to save profile.');
      setProfile({ ...emptyProfile, ...result.profile });
      setNotice('Your career details have been saved.');
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/professional-career/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to sign out. Please try again.');
      router.replace('/professional-career');
    } catch (logoutError: unknown) {
      setError(logoutError instanceof Error ? logoutError.message : 'Unable to sign out.');
      setLoggingOut(false);
    }
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Loading your profile…</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-emerald-800 p-5 text-white shadow-lg sm:p-7">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-white/15 p-3"><BriefcaseBusiness className="h-6 w-6" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-100">Pakistan Sweet Home</p>
              <h1 className="mt-1 text-xl font-extrabold sm:text-2xl">Professional Career Profile</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" /> {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">What are you doing now?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Keep your information current. You can return and update it whenever your studies or work changes.
            </p>
          </div>

          {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

          <form onSubmit={saveProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              {textFields.map(({ key, label, placeholder }) => (
                <label key={key} className={`block text-sm font-semibold text-slate-700 ${key === 'name' ? 'sm:col-span-2' : ''}`}>
                  {label}{key === 'name' && <span className="text-red-600"> *</span>}
                  <input
                    required={key === 'name'}
                    maxLength={1000}
                    value={profile[key]}
                    onChange={(event) => setProfile((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={placeholder}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              ))}
              <label className="block text-sm font-semibold text-slate-700">
                Current status<span className="text-red-600"> *</span>
                <select
                  required
                  value={profile.currentStatus}
                  onChange={(event) => setProfile((current) => ({ ...current, currentStatus: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select your current status</option>
                  <option>Studying</option>
                  <option>Working</option>
                  <option>Studying and working</option>
                  <option>Looking for work</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                More about your current studies or work
                <textarea
                  maxLength={1000}
                  rows={4}
                  value={profile.notes}
                  onChange={(event) => setProfile((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Share your achievements, goals, or other career details."
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>
            {profile.updatedAt && (
              <p className="mt-4 text-xs text-slate-500">Last updated {new Date(profile.updatedAt).toLocaleString()}.</p>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Career Profile'}
              </button>
            </div>
          </form>
        </section>
        <UniversityProgressForm />
      </div>
    </main>
  );
}
