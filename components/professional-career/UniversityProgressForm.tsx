'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { FileText, GraduationCap, Plus, Trash2, UploadCloud } from 'lucide-react';

interface SubjectMark {
  id: string;
  subject: string;
  totalMarks: string;
  obtainedMarks: string;
}

interface CollegeLifeEntry {
  id: string;
  studentName?: string;
  fatherName?: string;
  pshRegistrationNumber?: string;
  collegeType?: string;
  collegeName?: string;
  program?: string;
  classYear?: string;
  rollNumber?: string;
  academicPeriod?: string;
  passingYear?: string;
  totalMarks?: string;
  obtainedMarks?: string;
  subjects?: SubjectMark[];
  resultDocument?: { id: string; fileName: string } | null;
  createdAt: string;
  universityName?: string;
  degreeProgram?: string;
  majorSubjects?: string;
  boardUniversity?: string;
  admissionYear?: string;
  registrationNumber?: string;
  currentStatus?: string;
  remarks?: string;
}

interface FormValues {
  studentName: string;
  fatherName: string;
  pshRegistrationNumber: string;
  collegeType: string;
  collegeName: string;
  program: string;
  classYear: string;
  rollNumber: string;
  academicPeriod: string;
  passingYear: string;
}

const initialForm: FormValues = {
  studentName: '',
  fatherName: '',
  pshRegistrationNumber: '',
  collegeType: '',
  collegeName: '',
  program: '',
  classYear: '',
  rollNumber: '',
  academicPeriod: '',
  passingYear: '',
};

const inputClassName = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

function newSubject(): SubjectMark {
  return { id: crypto.randomUUID(), subject: '', totalMarks: '', obtainedMarks: '' };
}

function markSum(subjects: SubjectMark[], key: 'totalMarks' | 'obtainedMarks'): number {
  return subjects.reduce((sum, subject) => sum + (Number(subject[key]) || 0), 0);
}

export function CollegeLifeForm() {
  const [entries, setEntries] = useState<CollegeLifeEntry[]>([]);
  const [form, setForm] = useState<FormValues>(initialForm);
  const [subjects, setSubjects] = useState<SubjectMark[]>([newSubject()]);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/pbm/career/university-progress')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load College Life history.');
        if (!cancelled) {
          setEntries(Array.isArray(result.entries) ? result.entries : []);
          setForm((current) => ({ ...current, studentName: result.student?.fullName || '' }));
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load College Life history.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSubject = (id: string, key: keyof Omit<SubjectMark, 'id'>, value: string) => {
    setSubjects((current) => current.map((subject) => subject.id === id ? { ...subject, [key]: value } : subject));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('subjects', JSON.stringify(subjects));
      if (resultFile) formData.append('resultFile', resultFile);

      const response = await fetch('/api/pbm/career/university-progress', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save College Life record.');
      setEntries((current) => [...current, result.entry]);
      setForm((current) => ({ ...initialForm, studentName: current.studentName }));
      setSubjects([newSubject()]);
      setResultFile(null);
      const fileInput = document.getElementById('college-life-result-file');
      if (fileInput instanceof HTMLInputElement) fileInput.value = '';
      setSuccess('College Life record and result card saved to your history.');
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save College Life record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 rounded-2xl bg-emerald-50 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800"><GraduationCap className="h-5 w-5" /></span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">College Life</h2>
            <p className="mt-1 text-sm font-semibold text-emerald-800">Recommended for Sponsorship by PBM through IFA</p>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}

      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Student Name <span className="text-red-600">*</span>
            <input required maxLength={200} value={form.studentName} onChange={(event) => setForm((current) => ({ ...current, studentName: event.target.value }))} className={inputClassName} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Father&apos;s Name <span className="text-red-600">*</span>
            <input required maxLength={200} value={form.fatherName} onChange={(event) => setForm((current) => ({ ...current, fatherName: event.target.value }))} className={inputClassName} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            PSH Registration No. <span className="text-red-600">*</span>
            <input required maxLength={100} value={form.pshRegistrationNumber} onChange={(event) => setForm((current) => ({ ...current, pshRegistrationNumber: event.target.value }))} className={inputClassName} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            College Type <span className="text-red-600">*</span>
            <select required value={form.collegeType} onChange={(event) => setForm((current) => ({ ...current, collegeType: event.target.value }))} className={inputClassName}>
              <option value="">Select college type</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            College Name <span className="text-red-600">*</span>
            <input required maxLength={200} value={form.collegeName} onChange={(event) => setForm((current) => ({ ...current, collegeName: event.target.value }))} className={inputClassName} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Program <span className="text-red-600">*</span>
            <select required value={form.program} onChange={(event) => setForm((current) => ({ ...current, program: event.target.value }))} className={inputClassName}>
              <option value="">Select program</option>
              <option value="Medical">Medical</option>
              <option value="Engineering">Engineering</option>
              <option value="BS / General">BS / General</option>
              <option value="Commerce">Commerce</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Class / Year <span className="text-red-600">*</span>
            <input required maxLength={100} placeholder="For example, 1st Year or 3rd Semester" value={form.classYear} onChange={(event) => setForm((current) => ({ ...current, classYear: event.target.value }))} className={inputClassName} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Roll No. <span className="text-red-600">*</span>
            <input required maxLength={100} value={form.rollNumber} onChange={(event) => setForm((current) => ({ ...current, rollNumber: event.target.value }))} className={inputClassName} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Semester / Academic Year <span className="text-red-600">*</span>
            <input required maxLength={100} placeholder="For example, Semester 1 or Annual 2026" value={form.academicPeriod} onChange={(event) => setForm((current) => ({ ...current, academicPeriod: event.target.value }))} className={inputClassName} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Year of Passing <span className="text-red-600">*</span>
            <input required type="number" min="1900" max="2100" step="1" value={form.passingYear} onChange={(event) => setForm((current) => ({ ...current, passingYear: event.target.value }))} className={inputClassName} />
          </label>
        </div>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Subject-wise Result</h3>
              <p className="mt-1 text-xs text-slate-600">Add the subjects and marks for this semester or academic year.</p>
            </div>
            <button type="button" onClick={() => setSubjects((current) => [...current, newSubject()])} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
              <Plus className="h-3.5 w-3.5" /> Add Subject
            </button>
          </div>

          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <div key={subject.id} className="grid gap-3 rounded-xl border border-emerald-100 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_150px_150px_auto] sm:items-end">
                <label className="block text-xs font-semibold text-slate-700">
                  Subject {index + 1} <span className="text-red-600">*</span>
                  <input required maxLength={100} value={subject.subject} onChange={(event) => updateSubject(subject.id, 'subject', event.target.value)} className={inputClassName} />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Total Marks <span className="text-red-600">*</span>
                  <input required type="number" min="1" step="any" value={subject.totalMarks} onChange={(event) => updateSubject(subject.id, 'totalMarks', event.target.value)} className={inputClassName} />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Obtained Marks <span className="text-red-600">*</span>
                  <input required type="number" min="0" step="any" value={subject.obtainedMarks} onChange={(event) => updateSubject(subject.id, 'obtainedMarks', event.target.value)} className={inputClassName} />
                </label>
                <button type="button" onClick={() => setSubjects((current) => current.length > 1 ? current.filter((item) => item.id !== subject.id) : current)} disabled={subjects.length === 1} aria-label={`Remove subject ${index + 1}`} className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Total Marks
              <input readOnly value={markSum(subjects, 'totalMarks')} className={`${inputClassName} bg-slate-100`} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Obtained Marks
              <input readOnly value={markSum(subjects, 'obtainedMarks')} className={`${inputClassName} bg-slate-100`} />
            </label>
          </div>
        </section>

        <label className="block text-sm font-semibold text-slate-700">
          Upload Semester / Year Result <span className="text-red-600">*</span>
          <span className="mt-1 block text-xs font-normal text-slate-500">PDF, JPEG, PNG, or WebP; maximum 12 MB.</span>
          <span className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 px-4 py-3">
            <UploadCloud className="h-5 w-5 text-emerald-700" />
            <input
              id="college-life-result-file"
              required
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => setResultFile(event.target.files?.[0] || null)}
              className="min-w-0 flex-1 text-xs font-normal text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-3 file:py-2 file:font-semibold file:text-white"
            />
          </span>
        </label>

        <div className="flex justify-end">
          <button type="submit" disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
            <Plus className="h-4 w-4" /> {saving ? 'Saving…' : 'Save College Life Record'}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">College Life History</h3>
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading your education history…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-slate-500">No College Life records have been added yet.</p>
          ) : [...entries].reverse().map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900">{entry.collegeName || entry.universityName || 'College record'}</h4>
                  <p className="mt-1 text-sm text-emerald-800">{[entry.collegeType, entry.program || entry.degreeProgram, entry.classYear, entry.academicPeriod].filter(Boolean).join(' · ')}</p>
                </div>
                <time className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</time>
              </div>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ['Student', entry.studentName],
                  ['Father', entry.fatherName],
                  ['PSH Registration No.', entry.pshRegistrationNumber],
                  ['Roll No.', entry.rollNumber],
                  ['Year of Passing', entry.passingYear],
                  ['Total Marks', entry.totalMarks],
                  ['Obtained Marks', entry.obtainedMarks],
                  ['College', entry.collegeName],
                  ['College Type', entry.collegeType],
                  ['Program', entry.program],
                  ['Class / Year', entry.classYear],
                  ['Semester / Academic Year', entry.academicPeriod],
                ].map(([label, value]) => value ? (
                  <div key={label}>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="font-semibold text-slate-700">{value}</dd>
                  </div>
                ) : null)}
              </dl>
              {entry.subjects?.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[360px] text-left text-xs">
                    <thead className="text-slate-500"><tr><th className="pb-2 pr-3">Subject</th><th className="pb-2 pr-3">Total Marks</th><th className="pb-2">Obtained Marks</th></tr></thead>
                    <tbody>{entry.subjects.map((subject) => <tr key={subject.id} className="border-t border-emerald-100"><td className="py-2 pr-3 font-semibold text-slate-700">{subject.subject}</td><td className="py-2 pr-3">{subject.totalMarks}</td><td className="py-2">{subject.obtainedMarks}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : null}
              {entry.resultDocument && (
                <a href={`/api/pbm/career/university-progress?documentId=${encodeURIComponent(entry.resultDocument.id)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline underline-offset-2">
                  <FileText className="h-4 w-4" /> View result: {entry.resultDocument.fileName}
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
