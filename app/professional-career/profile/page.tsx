'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, LogOut } from 'lucide-react';
import { CollegeLifeForm, UniversityLifeForm } from '@/components/professional-career/UniversityProgressForm';
import { ProfessionalLifeForm } from '@/components/professional-career/ProfessionalLifeForm';

export default function ProfessionalCareerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/pbm/career/profile')
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 401) {
          router.replace('/professional-career');
          return;
        }
        if (!response.ok) throw new Error(result.error || 'Unable to load profile.');
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

  const signOut = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/pbm/career/logout', { method: 'POST' });
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
              <h1 className="mt-1 text-xl font-extrabold sm:text-2xl">Education &amp; Professional Growth Portal</h1>
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

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <CollegeLifeForm />
        <UniversityLifeForm />
        <ProfessionalLifeForm />
      </div>
    </main>
  );
}
