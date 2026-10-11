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
  recordType?: 'college' | 'university';
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
  institutionType?: string;
  campus?: string;
  city?: string;
  province?: string;
  degreeLevel?: string;
  universityRegistrationNumber?: string;
  courses?: UniversityCourse[];
  gpa?: string;
  cgpa?: string;
}

interface UniversityCourse {
  id: string;
  courseName: string;
  creditHours: string;
  grade: string;
  totalMarks: string;
  obtainedMarks: string;
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

function isUniversityLifeEntry(entry: CollegeLifeEntry): boolean {
  return entry.recordType === 'university' || (!entry.recordType && Boolean(entry.universityName || entry.degreeProgram));
}

function isCollegeLifeEntry(entry: CollegeLifeEntry): boolean {
  return entry.recordType === 'college' || (!entry.recordType && !entry.universityName && !entry.degreeProgram);
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
          ) : entries.filter(isCollegeLifeEntry).length === 0 ? (
            <p className="text-sm text-slate-500">No College Life records have been added yet.</p>
          ) : [...entries].filter(isCollegeLifeEntry).reverse().map((entry) => (
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

interface UniversityFormValues {
  studentName: string;
  fatherName: string;
  pshRegistrationNumber: string;
  institutionType: string;
  universityName: string;
  campus: string;
  city: string;
  province: string;
  degreeLevel: string;
  degreeProgram: string;
  majorSubjects: string;
  universityRegistrationNumber: string;
  rollNumber: string;
  admissionYear: string;
  classYear: string;
  academicPeriod: string;
  currentStatus: string;
  gpa: string;
  cgpa: string;
  passingYear: string;
  remarks: string;
}

const initialUniversityForm: UniversityFormValues = {
  studentName: '',
  fatherName: '',
  pshRegistrationNumber: '',
  institutionType: '',
  universityName: '',
  campus: '',
  city: '',
  province: '',
  degreeLevel: '',
  degreeProgram: '',
  majorSubjects: '',
  universityRegistrationNumber: '',
  rollNumber: '',
  admissionYear: '',
  classYear: '',
  academicPeriod: '',
  currentStatus: 'Enrolled',
  gpa: '',
  cgpa: '',
  passingYear: '',
  remarks: '',
};

function newUniversityCourse(): UniversityCourse {
  return { id: crypto.randomUUID(), courseName: '', creditHours: '', grade: '', totalMarks: '', obtainedMarks: '' };
}

const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Azad Jammu and Kashmir', 'Gilgit-Baltistan'];
const degreePrograms = [
  'Associate Degree',
  'BA / BS Arts and Humanities',
  'BS Computer Science / IT',
  'BS Natural Sciences',
  'BBA / Business Administration',
  'BCom / Accounting and Finance',
  'LLB / Law',
  'MBBS',
  'BDS',
  'Pharm-D',
  'DPT / Allied Health Sciences',
  'BE / Engineering',
  'BEd / Education',
  'Agriculture and Veterinary Sciences',
  'Other',
];

export function UniversityLifeForm() {
  const [entries, setEntries] = useState<CollegeLifeEntry[]>([]);
  const [form, setForm] = useState<UniversityFormValues>(initialUniversityForm);
  const [courses, setCourses] = useState<UniversityCourse[]>([newUniversityCourse()]);
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
        if (!response.ok) throw new Error(result.error || 'Unable to load University Life history.');
        if (!cancelled) {
          setEntries(Array.isArray(result.entries) ? result.entries : []);
          setForm((current) => ({ ...current, studentName: result.student?.fullName || '' }));
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load University Life history.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateCourse = (id: string, key: keyof Omit<UniversityCourse, 'id'>, value: string) => {
    setCourses((current) => current.map((course) => course.id === id ? { ...course, [key]: value } : course));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('recordType', 'university');
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('courses', JSON.stringify(courses));
      if (resultFile) formData.append('resultFile', resultFile);

      const response = await fetch('/api/pbm/career/university-progress', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save University Life record.');
      setEntries((current) => [...current, result.entry]);
      setForm((current) => ({ ...initialUniversityForm, studentName: current.studentName, fatherName: current.fatherName, pshRegistrationNumber: current.pshRegistrationNumber }));
      setCourses([newUniversityCourse()]);
      setResultFile(null);
      const fileInput = document.getElementById('university-life-result-file');
      if (fileInput instanceof HTMLInputElement) fileInput.value = '';
      setSuccess('University Life semester record and transcript saved to your history.');
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save University Life record.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof UniversityFormValues, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="mt-6 rounded-3xl border border-sky-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 rounded-2xl bg-sky-50 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-sky-100 p-2.5 text-sky-800"><GraduationCap className="h-5 w-5" /></span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">University Life</h2>
            <p className="mt-1 text-sm text-sky-800">Record your university admission, degree progress, semester results, and achievements.</p>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}

      <form onSubmit={submit} className="space-y-6">
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Student information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Student Name <span className="text-red-600">*</span>
              <input required maxLength={200} value={form.studentName} onChange={(event) => setField('studentName', event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Father&apos;s Name <span className="text-red-600">*</span>
              <input required maxLength={200} value={form.fatherName} onChange={(event) => setField('fatherName', event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">PSH Registration No. <span className="text-red-600">*</span>
              <input required maxLength={100} value={form.pshRegistrationNumber} onChange={(event) => setField('pshRegistrationNumber', event.target.value)} className={inputClassName} />
            </label>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">University and degree</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">University / Institute Type <span className="text-red-600">*</span>
              <select required value={form.institutionType} onChange={(event) => setField('institutionType', event.target.value)} className={inputClassName}>
                <option value="">Select institution type</option><option>Public Sector</option><option>Private</option><option>Affiliated College</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">University / Institute Name <span className="text-red-600">*</span>
              <input required maxLength={200} value={form.universityName} onChange={(event) => setField('universityName', event.target.value)} className={inputClassName} placeholder="Name as shown on official records" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Campus / Affiliated College
              <input maxLength={200} value={form.campus} onChange={(event) => setField('campus', event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">City <span className="text-red-600">*</span>
              <input required maxLength={100} value={form.city} onChange={(event) => setField('city', event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Province / Region <span className="text-red-600">*</span>
              <select required value={form.province} onChange={(event) => setField('province', event.target.value)} className={inputClassName}>
                <option value="">Select province / region</option>{provinces.map((province) => <option key={province}>{province}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Degree Level <span className="text-red-600">*</span>
              <select required value={form.degreeLevel} onChange={(event) => setField('degreeLevel', event.target.value)} className={inputClassName}>
                <option value="">Select degree level</option><option>Associate Degree</option><option>Bachelor / Undergraduate</option><option>Professional Degree</option><option>Other</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Degree / Program <span className="text-red-600">*</span>
              <select required value={form.degreeProgram} onChange={(event) => setField('degreeProgram', event.target.value)} className={inputClassName}>
                <option value="">Select degree / program</option>{degreePrograms.map((program) => <option key={program}>{program}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Major / Specialization <span className="text-red-600">*</span>
              <input required maxLength={200} value={form.majorSubjects} onChange={(event) => setField('majorSubjects', event.target.value)} className={inputClassName} placeholder="For example, Computer Science or Cardiology" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">University Registration No.
              <input maxLength={100} value={form.universityRegistrationNumber} onChange={(event) => setField('universityRegistrationNumber', event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">University Roll No.
              <input maxLength={100} value={form.rollNumber} onChange={(event) => setField('rollNumber', event.target.value)} className={inputClassName} />
            </label>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Enrollment and current progress</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Admission Year <span className="text-red-600">*</span>
              <input required type="number" min="1900" max="2100" step="1" value={form.admissionYear} onChange={(event) => setField('admissionYear', event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Current Year / Semester <span className="text-red-600">*</span>
              <input required maxLength={100} value={form.classYear} onChange={(event) => setField('classYear', event.target.value)} className={inputClassName} placeholder="For example, 3rd Year or Semester 5" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Result Term <span className="text-red-600">*</span>
              <input required maxLength={100} value={form.academicPeriod} onChange={(event) => setField('academicPeriod', event.target.value)} className={inputClassName} placeholder="For example, Fall 2026 or Semester 5" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Enrollment Status <span className="text-red-600">*</span>
              <select required value={form.currentStatus} onChange={(event) => setField('currentStatus', event.target.value)} className={inputClassName}>
                <option>Enrolled</option><option>On Leave</option><option>Completed</option><option>Withdrawn</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Semester GPA (GPA)
              <input type="number" min="0" max="5" step="0.01" value={form.gpa} onChange={(event) => setField('gpa', event.target.value)} className={inputClassName} placeholder="0.00 – 5.00" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Cumulative GPA (CGPA)
              <input type="number" min="0" max="5" step="0.01" value={form.cgpa} onChange={(event) => setField('cgpa', event.target.value)} className={inputClassName} placeholder="0.00 – 5.00" />
            </label>
            {form.currentStatus === 'Completed' && <label className="block text-sm font-semibold text-slate-700">Year of Completion <span className="text-red-600">*</span>
              <input required type="number" min="1900" max="2100" step="1" value={form.passingYear} onChange={(event) => setField('passingYear', event.target.value)} className={inputClassName} />
            </label>}
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Academic Achievements / Remarks
              <textarea maxLength={1000} rows={3} value={form.remarks} onChange={(event) => setField('remarks', event.target.value)} className={inputClassName} placeholder="Scholarships, awards, internship, or other important academic notes." />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-bold text-slate-900">Course-wise Semester Result</h3><p className="mt-1 text-xs text-slate-600">Add each course with credit hours, grade, and marks where your transcript provides them.</p></div>
            <button type="button" onClick={() => setCourses((current) => [...current, newUniversityCourse()])} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-700 px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100"><Plus className="h-3.5 w-3.5" /> Add Course</button>
          </div>
          <div className="space-y-3">
            {courses.map((course, index) => (
              <div key={course.id} className="grid gap-3 rounded-xl border border-sky-100 bg-white p-3 sm:grid-cols-[minmax(0,1.4fr)_100px_100px_110px_110px_auto] sm:items-end">
                <label className="block text-xs font-semibold text-slate-700">Course / Subject {index + 1} <span className="text-red-600">*</span><input required maxLength={100} value={course.courseName} onChange={(event) => updateCourse(course.id, 'courseName', event.target.value)} className={inputClassName} /></label>
                <label className="block text-xs font-semibold text-slate-700">Credit Hours <input type="number" min="0.5" max="20" step="0.5" value={course.creditHours} onChange={(event) => updateCourse(course.id, 'creditHours', event.target.value)} className={inputClassName} /></label>
                <label className="block text-xs font-semibold text-slate-700">Grade <input maxLength={10} value={course.grade} onChange={(event) => updateCourse(course.id, 'grade', event.target.value)} className={inputClassName} placeholder="A, B+" /></label>
                <label className="block text-xs font-semibold text-slate-700">Total Marks <input type="number" min="1" step="any" value={course.totalMarks} onChange={(event) => updateCourse(course.id, 'totalMarks', event.target.value)} className={inputClassName} /></label>
                <label className="block text-xs font-semibold text-slate-700">Obtained <input type="number" min="0" step="any" value={course.obtainedMarks} onChange={(event) => updateCourse(course.id, 'obtainedMarks', event.target.value)} className={inputClassName} /></label>
                <button type="button" onClick={() => setCourses((current) => current.length > 1 ? current.filter((item) => item.id !== course.id) : current)} disabled={courses.length === 1} aria-label={`Remove course ${index + 1}`} className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>

        <label className="block text-sm font-semibold text-slate-700">Upload Official Semester Transcript / Result <span className="text-red-600">*</span>
          <span className="mt-1 block text-xs font-normal text-slate-500">Upload a clear university-issued transcript or result card. PDF, JPEG, PNG, or WebP; maximum 12 MB.</span>
          <span className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/40 px-4 py-3"><UploadCloud className="h-5 w-5 text-sky-700" />
            <input id="university-life-result-file" required type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setResultFile(event.target.files?.[0] || null)} className="min-w-0 flex-1 text-xs font-normal text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-700 file:px-3 file:py-2 file:font-semibold file:text-white" />
          </span>
        </label>

        <div className="flex justify-end">
          <button type="submit" disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 text-sm font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
            <Plus className="h-4 w-4" /> {saving ? 'Saving…' : 'Save University Semester'}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">University Life History</h3>
        <div className="space-y-3">
          {loading ? <p className="text-sm text-slate-500">Loading university history…</p> :
            entries.filter(isUniversityLifeEntry).length === 0 ? <p className="text-sm text-slate-500">No University Life records have been added yet.</p> :
              [...entries].filter(isUniversityLifeEntry).reverse().map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><h4 className="font-bold text-slate-900">{entry.universityName || 'University record'}</h4><p className="mt-1 text-sm text-sky-800">{[entry.degreeProgram, entry.majorSubjects, entry.classYear, entry.academicPeriod].filter(Boolean).join(' · ')}</p></div>
                    <time className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</time>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      ['Student', entry.studentName], ['Father', entry.fatherName], ['PSH Registration No.', entry.pshRegistrationNumber],
                      ['University Type', entry.institutionType], ['Campus', entry.campus], ['City / Region', [entry.city, entry.province].filter(Boolean).join(', ')],
                      ['Degree Level', entry.degreeLevel], ['Major / Specialization', entry.majorSubjects], ['University Registration No.', entry.universityRegistrationNumber],
                      ['University Roll No.', entry.rollNumber], ['Admission Year', entry.admissionYear], ['Enrollment Status', entry.currentStatus],
                      ['Semester GPA', entry.gpa], ['Cumulative GPA', entry.cgpa], ['Year of Completion', entry.passingYear],
                      ['Remarks', entry.remarks],
                    ].map(([label, value]) => value ? <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="font-semibold text-slate-700">{value}</dd></div> : null)}
                  </dl>
                  {entry.courses?.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[540px] text-left text-xs">
                    <thead className="text-slate-500"><tr><th className="pb-2 pr-3">Course</th><th className="pb-2 pr-3">Credit Hours</th><th className="pb-2 pr-3">Grade</th><th className="pb-2 pr-3">Total Marks</th><th className="pb-2">Obtained</th></tr></thead>
                    <tbody>{entry.courses.map((course) => <tr key={course.id} className="border-t border-sky-100"><td className="py-2 pr-3 font-semibold text-slate-700">{course.courseName}</td><td className="py-2 pr-3">{course.creditHours || '—'}</td><td className="py-2 pr-3">{course.grade || '—'}</td><td className="py-2 pr-3">{course.totalMarks || '—'}</td><td className="py-2">{course.obtainedMarks || '—'}</td></tr>)}</tbody>
                  </table></div> : null}
                  {entry.resultDocument && <a href={`/api/pbm/career/university-progress?documentId=${encodeURIComponent(entry.resultDocument.id)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 underline underline-offset-2"><FileText className="h-4 w-4" /> View transcript: {entry.resultDocument.fileName}</a>}
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
