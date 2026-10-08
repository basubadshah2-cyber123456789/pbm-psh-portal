'use client';

import { useState, type FormEvent } from 'react';
import { BookOpen, Plus } from 'lucide-react';

export interface AcademicRecord {
  id: string;
  institutionName: string;
  program: string;
  subjects: string;
  awardingBody: string;
  admissionYear: string;
  registrationNumber: string;
  rollNumber: string;
  currentStatus: string;
  remarks: string;
  createdAt: string;
}

export interface AcademicChild {
  id: string;
  childId: string;
  fullName: string;
  collegeProgress: AcademicRecord[];
}

type FormValues = Omit<AcademicRecord, 'id' | 'createdAt'>;

const emptyForm: FormValues = {
  institutionName: '',
  program: '',
  subjects: '',
  awardingBody: '',
  admissionYear: '',
  registrationNumber: '',
  rollNumber: '',
  currentStatus: '',
  remarks: '',
};

const fields: { name: keyof FormValues; label: string; required?: boolean }[] = [
  { name: 'institutionName', label: 'College / Institute', required: true },
  { name: 'program', label: 'Class / Program', required: true },
  { name: 'subjects', label: 'Group / Subjects' },
  { name: 'awardingBody', label: 'Board / University' },
  { name: 'admissionYear', label: 'Admission Year' },
  { name: 'registrationNumber', label: 'Registration Number' },
  { name: 'rollNumber', label: 'Roll Number' },
  { name: 'currentStatus', label: 'Current Status' },
  { name: 'remarks', label: 'Remarks' },
];

export function AcademicManagement({ children }: { children: AcademicChild[] }) {
  const [records, setRecords] = useState(children);
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || '');
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const selectedChild = records.find((child) => child.id === selectedChildId);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChild) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/children/${selectedChild.id}/college-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeName: form.institutionName,
          classProgram: form.program,
          groupSubjects: form.subjects,
          boardUniversity: form.awardingBody,
          admissionYear: form.admissionYear,
          registrationNumber: form.registrationNumber,
          rollNumber: form.rollNumber,
          currentStatus: form.currentStatus,
          remarks: form.remarks,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save college record');

      const newEntry: AcademicRecord = {
        id: result.entry.id,
        ...form,
        createdAt: result.entry.createdAt,
      };
      setRecords((current) => current.map((child) => child.id === selectedChild.id
        ? { ...child, collegeProgress: [...child.collegeProgress, newEntry] }
        : child
      ));
      setForm(emptyForm);
      setSuccess('College record saved.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save college record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-5">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Education transition</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">College Records</h1>
        <p className="mt-1 text-xs text-slate-500">Add college progress for an existing PBM child.</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <label className="block max-w-xl text-xs font-semibold text-slate-600">
          Select child
          <select
            value={selectedChildId}
            onChange={(event) => {
              setSelectedChildId(event.target.value);
              setForm(emptyForm);
              setError('');
              setSuccess('');
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {children.length === 0 && <option value="">No children found</option>}
            {children.map((child) => (
              <option key={child.id} value={child.id}>{child.fullName} — {child.childId}</option>
            ))}
          </select>
        </label>
      </section>

      {selectedChild ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3">
            <BookOpen className="h-4 w-4 text-blue-700" />
            <div>
              <span className="text-[10px] font-bold text-blue-700">COLLEGE PROGRESS</span>
              <h2 className="text-sm font-bold text-slate-800">{selectedChild.fullName}</h2>
            </div>
          </div>

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

          {error && <p role="alert" className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
          {success && <p role="status" className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">{success}</p>}

          <div className="mt-5 space-y-3">
            {selectedChild.collegeProgress.length === 0 ? (
              <p className="text-xs text-slate-500">No college records added yet.</p>
            ) : selectedChild.collegeProgress.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-white bg-white p-3">
                <h3 className="text-xs font-bold text-slate-800">{entry.institutionName}</h3>
                <dl className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                  {fields.map(({ name, label }) => entry[name] ? (
                    <div key={name}>
                      <dt className="text-slate-400">{label}</dt>
                      <dd className="whitespace-pre-wrap font-semibold text-slate-700">{entry[name]}</dd>
                    </div>
                  ) : null)}
                </dl>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No children are available for college records.
        </p>
      )}
    </main>
  );
}
