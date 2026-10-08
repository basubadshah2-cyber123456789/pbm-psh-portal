'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { GraduationCap, Plus } from 'lucide-react';

interface UniversityEntry {
  id: string;
  universityName: string;
  degreeProgram: string;
  majorSubjects: string;
  boardUniversity: string;
  admissionYear: string;
  registrationNumber: string;
  rollNumber: string;
  currentStatus: string;
  remarks: string;
  createdAt: string;
}

type FormValues = Omit<UniversityEntry, 'id' | 'createdAt'>;

const emptyForm: FormValues = {
  universityName: '',
  degreeProgram: '',
  majorSubjects: '',
  boardUniversity: '',
  admissionYear: '',
  registrationNumber: '',
  rollNumber: '',
  currentStatus: '',
  remarks: '',
};

const fields: { name: keyof FormValues; label: string; required?: boolean }[] = [
  { name: 'universityName', label: 'University / Institute', required: true },
  { name: 'degreeProgram', label: 'Degree / Program', required: true },
  { name: 'majorSubjects', label: 'Major / Subjects' },
  { name: 'boardUniversity', label: 'Board / Accrediting Body' },
  { name: 'admissionYear', label: 'Admission Year' },
  { name: 'registrationNumber', label: 'Registration Number' },
  { name: 'rollNumber', label: 'Roll Number / Student ID' },
  { name: 'currentStatus', label: 'Current Status' },
  { name: 'remarks', label: 'Remarks' },
];

export function UniversityProgressForm() {
  const [entries, setEntries] = useState<UniversityEntry[]>([]);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/professional-career/university-progress')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load university records.');
        if (!cancelled) setEntries(Array.isArray(result.entries) ? result.entries : []);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load university records.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/professional-career/university-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save university record.');
      setEntries((current) => [...current, result.entry]);
      setForm(emptyForm);
      setSuccess('University record saved.');
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save university record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-xl bg-blue-100 p-2.5 text-blue-800"><GraduationCap className="h-5 w-5" /></span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">University Progress</h2>
          <p className="mt-1 text-sm text-slate-600">Add your university admission and study details here.</p>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}

      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ name, label, required }) => (
          <label key={name} className={`block text-sm font-semibold text-slate-700 ${name === 'remarks' ? 'sm:col-span-2' : ''}`}>
            {label}{required && <span className="text-red-600"> *</span>}
            {name === 'remarks' ? (
              <textarea
                maxLength={1000}
                rows={3}
                required={required}
                value={form[name]}
                onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            ) : (
              <input
                maxLength={1000}
                required={required}
                value={form[name]}
                onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            )}
          </label>
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {saving ? 'Saving…' : 'Add University Record'}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading your university records…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-500">No university records added yet.</p>
        ) : entries.map((entry) => (
          <article key={entry.id} className="rounded-2xl border border-blue-100 bg-white p-4">
            <h3 className="font-bold text-slate-900">{entry.universityName}</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {fields.map(({ name, label }) => entry[name] ? (
                <div key={name}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-700">{entry[name]}</dd>
                </div>
              ) : null)}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
