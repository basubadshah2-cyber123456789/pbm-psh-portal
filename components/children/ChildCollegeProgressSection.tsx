'use client';

import { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';

export interface CollegeProgressEntry {
  id: string;
  collegeName: string;
  classProgram: string;
  groupSubjects: string;
  boardUniversity: string;
  admissionYear: string;
  registrationNumber: string;
  rollNumber: string;
  currentStatus: string;
  remarks: string;
  createdAt: string;
}

const fields: { name: keyof Omit<CollegeProgressEntry, 'id' | 'createdAt'>; label: string; required?: boolean }[] = [
  { name: 'collegeName', label: 'College / Institute', required: true },
  { name: 'classProgram', label: 'Class / Program', required: true },
  { name: 'groupSubjects', label: 'Group / Subjects' },
  { name: 'boardUniversity', label: 'Board / University' },
  { name: 'admissionYear', label: 'Admission Year' },
  { name: 'registrationNumber', label: 'Registration Number' },
  { name: 'rollNumber', label: 'Roll Number' },
  { name: 'currentStatus', label: 'Current Status' },
  { name: 'remarks', label: 'Remarks' },
];

export function ChildCollegeProgressSection({
  childId,
  initialEntries,
  canManage,
}: {
  childId: string;
  initialEntries: CollegeProgressEntry[];
  canManage: boolean;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map(({ name }) => [name, ''])) as Record<(typeof fields)[number]['name'], string>
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/children/${childId}/college-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save college progress');

      setEntries((current) => [...current, result.entry]);
      setForm(Object.fromEntries(fields.map(({ name }) => [name, ''])) as typeof form);
      setSuccess('College progress saved.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save college progress');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 shadow-xs">
      <div className="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3">
        <BookOpen className="h-4 w-4 text-blue-700" />
        <div>
          <span className="text-[10px] font-bold text-blue-700">EDUCATION TRANSITION</span>
          <h2 className="text-sm font-bold text-slate-800">College Progress</h2>
        </div>
      </div>

      {canManage && (
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ name, label, required }) => (
            <label key={name} className="text-xs font-semibold text-slate-600">
              {label}
              {name === 'remarks' ? (
                <textarea
                  value={form[name]}
                  onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800"
                />
              ) : (
                <input
                  value={form[name]}
                  onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  required={required}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800"
                />
              )}
            </label>
          ))}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Add College Record'}
            </button>
          </div>
        </form>
      )}

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      {success && <p role="status" className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">{success}</p>}

      <div className="mt-5 space-y-3">
        {entries.length === 0 ? (
          <p className="text-xs text-slate-500">No college progress records added yet.</p>
        ) : entries.map((entry) => (
          <article key={entry.id} className="rounded-lg border border-white bg-white p-3">
            <h3 className="text-xs font-bold text-slate-800">{entry.collegeName}</h3>
            <dl className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(({ name, label }) => entry[name] ? (
                <div key={name}>
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="font-semibold text-slate-700 whitespace-pre-wrap">{entry[name]}</dd>
                </div>
              ) : null)}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
