'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { FileText, GraduationCap, Plus, Trash2, UploadCloud, HeartHandshake } from 'lucide-react';
import { formatCNIC, formatPhone } from '@/lib/formatters';

interface SubjectMark {
  id: string;
  subject: string;
  totalMarks: string;
  obtainedMarks: string;
  percentage?: string;
  grade?: string;
  result?: string;
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
  sponsorshipSource?: string;
  donorInfo?: {
    name?: string;
    fatherName?: string;
    cnic?: string;
    maritalStatus?: string;
    address?: string;
    contactNo?: string;
    email?: string;
  } | null;
  classYear?: string;
  rollNumber?: string;
  academicPeriod?: string;
  passingYear?: string;
  totalMarks?: string;
  obtainedMarks?: string;
  subjects?: SubjectMark[];
  resultDocument?: { id: string; fileName: string } | null;
  counsellingEntries?: CounsellingEntry[];
  disciplinaryProceedings?: CollegeDisciplinaryProceeding | null;
  disciplinaryDocuments?: Array<{ id: string; title: string; fileName: string }>;
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

interface CounsellingEntry {
  id: string;
  date: string;
  details: string;
}

interface CollegeDisciplinaryProceeding {
  type: '' | 'DROPPED' | 'EXPELLED';
  name: string;
  fatherName: string;
  pshName: string;
  className: string;
  classSection: string;
  rollNumber: string;
  attendance: string;
  pshRegistrationNumber: string;
  instituteName: string;
  totalMarks: string;
  obtainedMarks: string;
  reason: string;
  date: string;
  approved: string;
  remarks: string;
  expulsionCommitteeMinutes: string;
}

type DisciplinaryField = Exclude<keyof CollegeDisciplinaryProceeding, 'type'>;

const droppedDisciplinaryFields: Array<[DisciplinaryField, string]> = [
  ['name', 'Name'], ['fatherName', 'Father Name'], ['pshName', 'PBM Sweet Home'],
  ['pshRegistrationNumber', 'PBM Registration No.'], ['className', 'Class'],
  ['classSection', 'Section'], ['rollNumber', 'Roll No.'], ['attendance', 'Attendance'],
  ['instituteName', 'Institute'], ['totalMarks', 'Total Marks'], ['obtainedMarks', 'Obtained Marks'],
  ['date', 'Date of Dropped out'], ['reason', 'Reason of Dropped out'], ['remarks', 'Remarks'],
];
const expelledDisciplinaryFields: Array<[DisciplinaryField, string]> = [
  ['name', 'Name'], ['fatherName', 'Father Name'], ['pshName', 'PBM Sweet Home'],
  ['pshRegistrationNumber', 'PBM Registration No.'], ['className', 'Class'],
  ['rollNumber', 'Roll No.'], ['instituteName', 'Institute'], ['totalMarks', 'Total Marks'],
  ['obtainedMarks', 'Obtained Marks'], ['reason', 'Reason of Expulsion'],
  ['date', 'Date of Expulsion'], ['remarks', 'Remarks'],
];

interface UniversityCourse {
  id: string;
  courseName: string;
  creditHours: string;
  grade: string;
  totalMarks: string;
  obtainedMarks: string;
  percentage?: string;
}

interface FormValues {
  studentName: string;
  fatherName: string;
  pshRegistrationNumber: string;
  collegeType: string;
  collegeName: string;
  program: string;
  sponsorshipSource: string;
  donorName: string;
  donorFatherName: string;
  donorCnic: string;
  donorMaritalStatus: string;
  donorAddress: string;
  donorContactNo: string;
  donorEmail: string;
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
  sponsorshipSource: '',
  donorName: '',
  donorFatherName: '',
  donorCnic: '',
  donorMaritalStatus: '',
  donorAddress: '',
  donorContactNo: '',
  donorEmail: '',
  classYear: '',
  rollNumber: '',
  academicPeriod: '',
  passingYear: '',
};

function emptyDisciplinaryProceeding(): CollegeDisciplinaryProceeding {
  return {
    type: '',
    name: '',
    fatherName: '',
    pshName: '',
    className: '',
    classSection: '',
    rollNumber: '',
    attendance: '',
    pshRegistrationNumber: '',
    instituteName: '',
    totalMarks: '',
    obtainedMarks: '',
    reason: '',
    date: '',
    approved: '',
    remarks: '',
    expulsionCommitteeMinutes: '',
  };
}

const inputClassName = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';
const collegePrograms = [
  'FSc (Pre-Medical)',
  'FSc (Pre-Engineering)',
  'ICS (Computer Science)',
  'I.Com (Commerce)',
  'FA (Arts / Humanities)',
  'General Science',
  'DAE (Diploma of Associate Engineering)',
  'A Levels',
  'Other',
];
const collegeYears = ['1st Year', '2nd Year'];

function newSubject(): SubjectMark {
  return { id: crypto.randomUUID(), subject: '', totalMarks: '', obtainedMarks: '', grade: '', result: '' };
}

function markSum(subjects: SubjectMark[], key: 'totalMarks' | 'obtainedMarks'): number {
  return subjects.reduce((sum, subject) => sum + (Number(subject[key]) || 0), 0);
}

function subjectPercentage(subject: SubjectMark): string {
  const totalMarks = Number(subject.totalMarks);
  const obtainedMarks = Number(subject.obtainedMarks);
  if (!Number.isFinite(totalMarks) || totalMarks <= 0 || !Number.isFinite(obtainedMarks) || obtainedMarks < 0) return '';
  return ((obtainedMarks / totalMarks) * 100).toFixed(2);
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
  const [counsellingEntries, setCounsellingEntries] = useState<CounsellingEntry[]>([]);
  const [disciplinaryProceeding, setDisciplinaryProceeding] = useState<CollegeDisciplinaryProceeding>(emptyDisciplinaryProceeding);
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [affidavitFile, setAffidavitFile] = useState<File | null>(null);
  const [minutesPhotoFile, setMinutesPhotoFile] = useState<File | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [donorDocumentFile, setDonorDocumentFile] = useState<File | null>(null);
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

  const setDisciplinaryField = (field: DisciplinaryField, value: string) => {
    setDisciplinaryProceeding((current) => ({ ...current, [field]: value }));
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
      formData.append('counsellingEntries', JSON.stringify(counsellingEntries));
      formData.append('disciplinaryProceedings', JSON.stringify(disciplinaryProceeding));
      if (resultFile) formData.append('resultFile', resultFile);
      if (applicationFile) formData.append('applicationFile', applicationFile);
      if (affidavitFile) formData.append('affidavitFile', affidavitFile);
      if (minutesPhotoFile) formData.append('minutesPhotoFile', minutesPhotoFile);
      if (donorDocumentFile) formData.append('donorDocumentFile', donorDocumentFile);

      const response = await fetch('/api/pbm/career/university-progress', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save College Life record.');
      setEntries((current) => [...current, result.entry]);
      setForm((current) => ({ ...initialForm, studentName: current.studentName }));
      setSubjects([newSubject()]);
      setCounsellingEntries([]);
      setDisciplinaryProceeding(emptyDisciplinaryProceeding());
      setApplicationFile(null);
      setAffidavitFile(null);
      setMinutesPhotoFile(null);
      setResultFile(null);
      setDonorDocumentFile(null);
      const fileInput = document.getElementById('college-life-result-file');
      if (fileInput instanceof HTMLInputElement) fileInput.value = '';
      ['college-life-application-file', 'college-life-affidavit-file', 'college-life-minutes-photo-file'].forEach((id) => {
        const input = document.getElementById(id);
        if (input instanceof HTMLInputElement) input.value = '';
      });
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800"><GraduationCap className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">College Life</h2>
            </div>
          </div>
          <label className="block w-full text-sm font-semibold text-slate-700 sm:w-64">
            Sponsored By <span className="text-red-600">*</span>
            <select required value={form.sponsorshipSource} onChange={(event) => setForm((current) => ({ ...current, sponsorshipSource: event.target.value }))} className={inputClassName}>
              <option value="">Select sponsor</option>
              <option value="Sponsored by PBM">Sponsored by PBM</option>
              <option value="Sponsored by Donor">Sponsored by Donor</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}

      <form onSubmit={submit} className="space-y-6">
        {form.sponsorshipSource === 'Sponsored by Donor' && (
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-700 font-bold text-white shadow-xs">
                  <HeartHandshake className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Donor Information</h4>
                  <p className="text-[11px] text-slate-500">Provide personal & contact details of the sponsoring donor</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-emerald-800">
                Sponsored by Donor
              </span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-xs font-semibold text-slate-700">
                Donor Name <span className="text-red-600">*</span>
                <input required maxLength={200} placeholder="Full Name" value={form.donorName} onChange={(e) => setForm((c) => ({ ...c, donorName: e.target.value }))} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Father Name <span className="text-red-600">*</span>
                <input required maxLength={200} placeholder="Father Name" value={form.donorFatherName} onChange={(e) => setForm((c) => ({ ...c, donorFatherName: e.target.value }))} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                ID Card No (CNIC) <span className="text-red-600">*</span>
                <input required maxLength={15} placeholder="XXXXX-XXXXXXX-X" value={form.donorCnic} onChange={(e) => setForm((c) => ({ ...c, donorCnic: formatCNIC(e.target.value) }))} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Marital Status <span className="text-red-600">*</span>
                <select required value={form.donorMaritalStatus} onChange={(e) => setForm((c) => ({ ...c, donorMaritalStatus: e.target.value }))} className={inputClassName}>
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widow">Widow</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Address
                <input maxLength={300} placeholder="Residential Address" value={form.donorAddress} onChange={(e) => setForm((c) => ({ ...c, donorAddress: e.target.value }))} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Contact No.
                <input maxLength={15} placeholder="03XX-XXXXXXX" value={form.donorContactNo} onChange={(e) => setForm((c) => ({ ...c, donorContactNo: formatPhone(e.target.value) }))} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Email
                <input type="email" maxLength={100} placeholder="donor@example.com" value={form.donorEmail} onChange={(e) => setForm((c) => ({ ...c, donorEmail: e.target.value }))} className={inputClassName} />
              </label>

              <div className="sm:col-span-2 lg:col-span-4 pt-3 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Donor Document / Photo</span>
                  <span className="text-[11px] text-slate-500">Upload CNIC, Photo, or Sponsorship Document (PDF / Image)</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs">
                    <UploadCloud className="h-4 w-4 text-emerald-600" />
                    <span>{donorDocumentFile ? 'Change File' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setDonorDocumentFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {donorDocumentFile && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="max-w-[150px] truncate">{donorDocumentFile.name}</span>
                      <button type="button" onClick={() => setDonorDocumentFile(null)} className="text-red-500 hover:text-red-700 ml-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
            PBM Registration No. <span className="text-red-600">*</span>
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
              {collegePrograms.map((program) => <option key={program} value={program}>{program}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Class / Year <span className="text-red-600">*</span>
            <select required value={form.classYear} onChange={(event) => setForm((current) => ({ ...current, classYear: event.target.value }))} className={inputClassName}>
              <option value="">Select year</option>
              {collegeYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Roll Number <span className="text-red-600">*</span>
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
              <div key={subject.id} className="grid gap-3 rounded-xl border border-emerald-100 bg-white p-3 lg:grid-cols-[minmax(0,1fr)_110px_120px_105px_85px_105px_auto] lg:items-end">
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
                <label className="block text-xs font-semibold text-slate-700">
                  Percentage
                  <input readOnly value={subjectPercentage(subject)} className={`${inputClassName} bg-slate-100`} />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Grade
                  <input maxLength={10} value={subject.grade || ''} onChange={(event) => updateSubject(subject.id, 'grade', event.target.value)} className={inputClassName} />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Pass / Fail
                  <select value={subject.result || ''} onChange={(event) => updateSubject(subject.id, 'result', event.target.value)} className={inputClassName}>
                    <option value="">Select result</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
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

        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Counselling</h3>
              <p className="mt-1 text-xs text-slate-600">Add counselling dates and details for this College Life record.</p>
            </div>
            <button
              type="button"
              onClick={() => setCounsellingEntries((current) => [
                ...current,
                { id: crypto.randomUUID(), date: '', details: '' },
              ])}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-800"
            >
              <Plus className="h-3.5 w-3.5" /> Add New
            </button>
          </div>
          {counsellingEntries.length === 0 ? (
            <p className="text-xs text-slate-500">No counselling entries added.</p>
          ) : (
            <div className="space-y-3">
              {counsellingEntries.map((entry, index) => (
                <div key={entry.id} className="grid gap-3 rounded-xl border border-indigo-100 bg-white p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start">
                  <label className="block text-xs font-semibold text-slate-700">
                    Counselling Date
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(event) => setCounsellingEntries((current) => current.map((item) =>
                        item.id === entry.id ? { ...item, date: event.target.value } : item
                      ))}
                      className={inputClassName}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Counselling Details
                    <textarea
                      rows={3}
                      maxLength={3000}
                      value={entry.details}
                      onChange={(event) => setCounsellingEntries((current) => current.map((item) =>
                        item.id === entry.id ? { ...item, details: event.target.value } : item
                      ))}
                      placeholder={`Counselling details ${index + 1}`}
                      className={inputClassName}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCounsellingEntries((current) => current.filter((item) => item.id !== entry.id))}
                    aria-label={`Remove counselling entry ${index + 1}`}
                    className="mt-5 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/40 p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">Disciplinary Proceedings</h3>
            <p className="mt-1 text-xs text-slate-600">Optional; these details will be saved with this College Life record.</p>
          </div>
          <label className="block max-w-sm text-sm font-semibold text-slate-700">
            Proceeding Type
            <select
              value={disciplinaryProceeding.type}
              onChange={(event) => {
                const type = event.target.value as CollegeDisciplinaryProceeding['type'];
                setDisciplinaryProceeding((current) => type
                  ? ({
                      ...current,
                      type,
                      name: current.name || form.studentName,
                      fatherName: current.fatherName || form.fatherName,
                      pshRegistrationNumber: current.pshRegistrationNumber || form.pshRegistrationNumber,
                      className: current.className || form.classYear,
                      rollNumber: current.rollNumber || form.rollNumber,
                      instituteName: current.instituteName || form.collegeName,
                      expulsionCommitteeMinutes: type === 'EXPELLED' ? current.expulsionCommitteeMinutes : '',
                    })
                  : emptyDisciplinaryProceeding());
                if (!type) {
                  setApplicationFile(null);
                  setAffidavitFile(null);
                  setMinutesPhotoFile(null);
                } else if (type !== 'EXPELLED') {
                  setMinutesPhotoFile(null);
                }
              }}
              className={inputClassName}
            >
              <option value="">Select proceeding type</option>
              <option value="DROPPED">DROPPED</option>
              <option value="EXPELLED">EXPELLED</option>
            </select>
          </label>

          {disciplinaryProceeding.type && (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(disciplinaryProceeding.type === 'DROPPED' ? droppedDisciplinaryFields : expelledDisciplinaryFields).map(([field, label]) => (
                  <label key={field} className="block text-sm font-semibold text-slate-700">
                    {label}
                    <input
                      type={field === 'date' ? 'date' : field === 'totalMarks' || field === 'obtainedMarks' ? 'number' : 'text'}
                      min={field === 'totalMarks' || field === 'obtainedMarks' ? 0 : undefined}
                      value={disciplinaryProceeding[field]}
                      onChange={(event) => setDisciplinaryField(field, event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                ))}
                <label className="block text-sm font-semibold text-slate-700">
                  Approved
                  <select value={disciplinaryProceeding.approved} onChange={(event) => setDisciplinaryField('approved', event.target.value)} className={inputClassName}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </select>
                </label>
              </div>

              {disciplinaryProceeding.type === 'EXPELLED' && (
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  Minutes of the Expulsion Committee
                  <textarea
                    rows={4}
                    maxLength={5000}
                    value={disciplinaryProceeding.expulsionCommitteeMinutes}
                    onChange={(event) => setDisciplinaryField('expulsionCommitteeMinutes', event.target.value)}
                    className={inputClassName}
                  />
                </label>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { id: 'college-life-application-file', title: 'Application', file: applicationFile, setFile: setApplicationFile },
                  { id: 'college-life-affidavit-file', title: 'Affidavit', file: affidavitFile, setFile: setAffidavitFile },
                ].map((attachment) => (
                  <label key={attachment.id} className="block text-sm font-semibold text-slate-700">
                    {attachment.title}
                    <input
                      id={attachment.id}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(event) => attachment.setFile(event.target.files?.[0] || null)}
                      className={inputClassName}
                    />
                    <span className="mt-1 block text-xs font-normal text-slate-500">PDF or image; maximum 12 MB.{attachment.file ? ` Selected: ${attachment.file.name}` : ''}</span>
                  </label>
                ))}
                {disciplinaryProceeding.type === 'EXPELLED' && (
                  <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                    Upload Photo of Written Minutes
                    <input
                      id="college-life-minutes-photo-file"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={(event) => setMinutesPhotoFile(event.target.files?.[0] || null)}
                      className={inputClassName}
                    />
                    <span className="mt-1 block text-xs font-normal text-slate-500">JPEG, PNG, or WebP; maximum 8 MB.{minutesPhotoFile ? ` Selected: ${minutesPhotoFile.name}` : ''}</span>
                  </label>
                )}
              </div>
            </>
          )}
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
                  ['PBM Registration No.', entry.pshRegistrationNumber],
                  ['Roll No.', entry.rollNumber],
                  ['Year of Passing', entry.passingYear],
                  ['Total Marks', entry.totalMarks],
                  ['Obtained Marks', entry.obtainedMarks],
                  ['College', entry.collegeName],
                  ['College Type', entry.collegeType],
                  ['Program', entry.program],
                  ['Sponsored By', entry.sponsorshipSource],
                  ['Class / Year', entry.classYear],
                  ['Semester / Academic Year', entry.academicPeriod],
                ].map(([label, value]) => value ? (
                  <div key={label}>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="font-semibold text-slate-700">{value}</dd>
                  </div>
                ) : null)}
              </dl>
              {entry.donorInfo && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-slate-700">
                  <span className="block font-bold text-emerald-900 mb-1.5">Donor Details (SPONSORED BY DONOR):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div><span className="text-slate-500 block text-[10px]">Name:</span> <span className="font-semibold">{entry.donorInfo.name || 'N/A'}</span></div>
                    <div><span className="text-slate-500 block text-[10px]">Father:</span> <span className="font-semibold">{entry.donorInfo.fatherName || 'N/A'}</span></div>
                    <div><span className="text-slate-500 block text-[10px]">CNIC:</span> <span className="font-semibold font-mono">{entry.donorInfo.cnic || 'N/A'}</span></div>
                    <div><span className="text-slate-500 block text-[10px]">Status:</span> <span className="font-semibold">{entry.donorInfo.maritalStatus || 'N/A'}</span></div>
                    {entry.donorInfo.contactNo && <div><span className="text-slate-500 block text-[10px]">Contact:</span> <span className="font-semibold">{entry.donorInfo.contactNo}</span></div>}
                    {entry.donorInfo.email && <div><span className="text-slate-500 block text-[10px]">Email:</span> <span className="font-semibold">{entry.donorInfo.email}</span></div>}
                    {entry.donorInfo.address && <div className="col-span-2"><span className="text-slate-500 block text-[10px]">Address:</span> <span className="font-semibold">{entry.donorInfo.address}</span></div>}
                  </div>
                </div>
              )}
              {entry.subjects?.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead className="text-slate-500"><tr><th className="pb-2 pr-3">Subject</th><th className="pb-2 pr-3">Total Marks</th><th className="pb-2 pr-3">Obtained Marks</th><th className="pb-2 pr-3">Percentage</th><th className="pb-2 pr-3">Grade</th><th className="pb-2">Pass / Fail</th></tr></thead>
                    <tbody>{entry.subjects.map((subject) => <tr key={subject.id} className="border-t border-emerald-100"><td className="py-2 pr-3 font-semibold text-slate-700">{subject.subject}</td><td className="py-2 pr-3">{subject.totalMarks}</td><td className="py-2 pr-3">{subject.obtainedMarks}</td><td className="py-2 pr-3">{subject.percentage ?? subjectPercentage(subject)}%</td><td className="py-2 pr-3">{subject.grade || '—'}</td><td className="py-2">{subject.result || '—'}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : null}
              {entry.counsellingEntries?.length ? (
                <section className="mt-4 rounded-xl border border-indigo-100 bg-white p-3">
                  <h5 className="text-sm font-bold text-indigo-900">Counselling</h5>
                  <div className="mt-2 space-y-2">
                    {entry.counsellingEntries.map((counselling, index) => (
                      <div key={counselling.id || index} className="rounded-lg bg-indigo-50/60 p-2.5 text-sm">
                        {counselling.date && <p className="font-semibold text-slate-700">{counselling.date}</p>}
                        {counselling.details && <p className="mt-1 whitespace-pre-wrap text-slate-600">{counselling.details}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              {entry.disciplinaryProceedings?.type && (
                <section className="mt-4 rounded-xl border border-red-100 bg-white p-3">
                  <h5 className="text-sm font-bold text-red-900">Disciplinary Proceedings: {entry.disciplinaryProceedings.type}</h5>
                  <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    {[
                      ['Name', entry.disciplinaryProceedings.name],
                      ['Father Name', entry.disciplinaryProceedings.fatherName],
                      ['PBM Sweet Home', entry.disciplinaryProceedings.pshName],
                      ['PBM Registration No.', entry.disciplinaryProceedings.pshRegistrationNumber],
                      ['Class', entry.disciplinaryProceedings.className],
                      ['Section', entry.disciplinaryProceedings.classSection],
                      ['Roll No.', entry.disciplinaryProceedings.rollNumber],
                      ['Attendance', entry.disciplinaryProceedings.attendance],
                      ['Institute', entry.disciplinaryProceedings.instituteName],
                      ['Total Marks', entry.disciplinaryProceedings.totalMarks],
                      ['Obtained Marks', entry.disciplinaryProceedings.obtainedMarks],
                      ['Date', entry.disciplinaryProceedings.date],
                      ['Reason', entry.disciplinaryProceedings.reason],
                      ['Approved', entry.disciplinaryProceedings.approved],
                      ['Remarks', entry.disciplinaryProceedings.remarks],
                    ].map(([label, value]) => value ? (
                      <div key={label}>
                        <dt className="text-xs text-slate-500">{label}</dt>
                        <dd className="whitespace-pre-wrap font-semibold text-slate-700">{value}</dd>
                      </div>
                    ) : null)}
                  </dl>
                  {entry.disciplinaryProceedings.expulsionCommitteeMinutes && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      <span className="font-semibold">Committee Minutes: </span>
                      {entry.disciplinaryProceedings.expulsionCommitteeMinutes}
                    </p>
                  )}
                </section>
              )}
              {entry.disciplinaryDocuments?.map((document) => (
                <a
                  key={document.id}
                  href={`/api/pbm/career/university-progress?documentId=${encodeURIComponent(document.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 mr-4 inline-flex items-center gap-2 text-sm font-semibold text-red-800 underline underline-offset-2"
                >
                  <FileText className="h-4 w-4" /> View {document.title}: {document.fileName}
                </a>
              ))}
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
  sponsorshipSource: string;
  donorName: string;
  donorFatherName: string;
  donorCnic: string;
  donorMaritalStatus: string;
  donorAddress: string;
  donorContactNo: string;
  donorEmail: string;
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
  sponsorshipSource: 'Sponsored by PBM',
  donorName: '',
  donorFatherName: '',
  donorCnic: '',
  donorMaritalStatus: '',
  donorAddress: '',
  donorContactNo: '',
  donorEmail: '',
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

function coursePercentage(course: UniversityCourse): string {
  const totalMarks = Number(course.totalMarks);
  const obtainedMarks = Number(course.obtainedMarks);
  if (!course.totalMarks || !course.obtainedMarks || !Number.isFinite(totalMarks) || totalMarks <= 0 || !Number.isFinite(obtainedMarks) || obtainedMarks < 0) return '';
  return ((obtainedMarks / totalMarks) * 100).toFixed(2);
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
  const [counsellingEntries, setCounsellingEntries] = useState<CounsellingEntry[]>([]);
  const [disciplinaryProceeding, setDisciplinaryProceeding] = useState<CollegeDisciplinaryProceeding>(emptyDisciplinaryProceeding);
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [affidavitFile, setAffidavitFile] = useState<File | null>(null);
  const [minutesPhotoFile, setMinutesPhotoFile] = useState<File | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [donorDocumentFile, setDonorDocumentFile] = useState<File | null>(null);
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

  const setDisciplinaryField = (field: DisciplinaryField, value: string) => {
    setDisciplinaryProceeding((current) => ({ ...current, [field]: value }));
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
      formData.append('counsellingEntries', JSON.stringify(counsellingEntries));
      formData.append('disciplinaryProceedings', JSON.stringify(disciplinaryProceeding));
      if (resultFile) formData.append('resultFile', resultFile);
      if (applicationFile) formData.append('applicationFile', applicationFile);
      if (affidavitFile) formData.append('affidavitFile', affidavitFile);
      if (minutesPhotoFile) formData.append('minutesPhotoFile', minutesPhotoFile);
      if (donorDocumentFile) formData.append('donorDocumentFile', donorDocumentFile);

      const response = await fetch('/api/pbm/career/university-progress', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save University Life record.');
      setEntries((current) => [...current, result.entry]);
      setForm((current) => ({ ...initialUniversityForm, studentName: current.studentName, fatherName: current.fatherName, pshRegistrationNumber: current.pshRegistrationNumber }));
      setCourses([newUniversityCourse()]);
      setCounsellingEntries([]);
      setDisciplinaryProceeding(emptyDisciplinaryProceeding());
      setApplicationFile(null);
      setAffidavitFile(null);
      setMinutesPhotoFile(null);
      setResultFile(null);
      setDonorDocumentFile(null);
      const fileInput = document.getElementById('university-life-result-file');
      if (fileInput instanceof HTMLInputElement) fileInput.value = '';
      ['university-life-application-file', 'university-life-affidavit-file', 'university-life-minutes-photo-file'].forEach((id) => {
        const input = document.getElementById(id);
        if (input instanceof HTMLInputElement) input.value = '';
      });
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-sky-100 p-2.5 text-sky-800"><GraduationCap className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">University Life</h2>
              <p className="mt-1 text-sm text-sky-800">Record your university admission, degree progress, semester results, and achievements.</p>
            </div>
          </div>
          <label className="block w-full text-sm font-semibold text-slate-700 sm:w-64">
            Sponsored By <span className="text-red-600">*</span>
            <select required value={form.sponsorshipSource || 'Sponsored by PBM'} onChange={(event) => setField('sponsorshipSource', event.target.value)} className={inputClassName}>
              <option value="">Select sponsor</option>
              <option value="Sponsored by PBM">Sponsored by PBM</option>
              <option value="Sponsored by Donor">Sponsored by Donor</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}

      <form onSubmit={submit} className="space-y-6">
        {form.sponsorshipSource === 'Sponsored by Donor' && (
          <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-slate-50 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-700 font-bold text-white shadow-xs">
                  <HeartHandshake className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Donor Information</h4>
                  <p className="text-[11px] text-slate-500">Provide personal & contact details of the sponsoring donor</p>
                </div>
              </div>
              <span className="rounded-full border border-sky-200 bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-sky-800">
                Sponsored by Donor
              </span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-xs font-semibold text-slate-700">
                Donor Name <span className="text-red-600">*</span>
                <input required maxLength={200} placeholder="Full Name" value={form.donorName} onChange={(e) => setField('donorName', e.target.value)} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Father Name <span className="text-red-600">*</span>
                <input required maxLength={200} placeholder="Father Name" value={form.donorFatherName} onChange={(e) => setField('donorFatherName', e.target.value)} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                ID Card No (CNIC) <span className="text-red-600">*</span>
                <input required maxLength={15} placeholder="XXXXX-XXXXXXX-X" value={form.donorCnic} onChange={(e) => setField('donorCnic', formatCNIC(e.target.value))} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Marital Status <span className="text-red-600">*</span>
                <select required value={form.donorMaritalStatus} onChange={(e) => setField('donorMaritalStatus', e.target.value)} className={inputClassName}>
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widow">Widow</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
                Address
                <input maxLength={300} placeholder="Residential Address" value={form.donorAddress} onChange={(e) => setField('donorAddress', e.target.value)} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Contact No.
                <input maxLength={15} placeholder="03XX-XXXXXXX" value={form.donorContactNo} onChange={(e) => setField('donorContactNo', formatPhone(e.target.value))} className={inputClassName} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Email
                <input type="email" maxLength={100} placeholder="donor@example.com" value={form.donorEmail} onChange={(e) => setField('donorEmail', e.target.value)} className={inputClassName} />
              </label>

              <div className="sm:col-span-2 lg:col-span-4 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Donor Document / Photo</span>
                  <span className="text-[11px] text-slate-500">Upload CNIC, Photo, or Sponsorship Document (PDF / Image)</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors shadow-xs">
                    <UploadCloud className="h-4 w-4 text-sky-600" />
                    <span>{donorDocumentFile ? 'Change File' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setDonorDocumentFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {donorDocumentFile && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-900">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="max-w-[150px] truncate">{donorDocumentFile.name}</span>
                      <button type="button" onClick={() => setDonorDocumentFile(null)} className="text-red-500 hover:text-red-700 ml-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Student information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Student Name <span className="text-red-600">*</span>
              <input required maxLength={200} value={form.studentName} onChange={(event) => setField('studentName', event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Father&apos;s Name <span className="text-red-600">*</span>
              <input required maxLength={200} value={form.fatherName} onChange={(event) => setField('fatherName', event.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">PBM Registration No. <span className="text-red-600">*</span>
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
                <option value="">Select degree level</option><option>Associate Degree</option><option>Bachelor / Undergraduate</option><option>MS</option><option>MPhil</option><option>PhD</option><option>Professional Degree</option><option>Other</option>
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
              <div key={course.id} className="grid gap-3 rounded-xl border border-sky-100 bg-white p-3 xl:grid-cols-[minmax(0,1.4fr)_90px_90px_100px_100px_100px_auto] xl:items-end">
                <label className="block text-xs font-semibold text-slate-700">Course / Subject {index + 1} <span className="text-red-600">*</span><input required maxLength={100} value={course.courseName} onChange={(event) => updateCourse(course.id, 'courseName', event.target.value)} className={inputClassName} /></label>
                <label className="block text-xs font-semibold text-slate-700">Credit Hours <input type="number" min="0.5" max="20" step="0.5" value={course.creditHours} onChange={(event) => updateCourse(course.id, 'creditHours', event.target.value)} className={inputClassName} /></label>
                <label className="block text-xs font-semibold text-slate-700">Grade <input maxLength={10} value={course.grade} onChange={(event) => updateCourse(course.id, 'grade', event.target.value)} className={inputClassName} placeholder="A, B+" /></label>
                <label className="block text-xs font-semibold text-slate-700">Total Marks <input type="number" min="1" step="any" value={course.totalMarks} onChange={(event) => updateCourse(course.id, 'totalMarks', event.target.value)} className={inputClassName} /></label>
                <label className="block text-xs font-semibold text-slate-700">Obtained <input type="number" min="0" step="any" value={course.obtainedMarks} onChange={(event) => updateCourse(course.id, 'obtainedMarks', event.target.value)} className={inputClassName} /></label>
                <label className="block text-xs font-semibold text-slate-700">Percentage <input readOnly value={coursePercentage(course)} className={`${inputClassName} bg-slate-100`} /></label>
                <button type="button" onClick={() => setCourses((current) => current.length > 1 ? current.filter((item) => item.id !== course.id) : current)} disabled={courses.length === 1} aria-label={`Remove course ${index + 1}`} className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Counselling</h3>
              <p className="mt-1 text-xs text-slate-600">Add counselling dates and details for this University Life record.</p>
            </div>
            <button
              type="button"
              onClick={() => setCounsellingEntries((current) => [...current, { id: crypto.randomUUID(), date: '', details: '' }])}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-800"
            >
              <Plus className="h-3.5 w-3.5" /> Add New
            </button>
          </div>
          {counsellingEntries.length === 0 ? (
            <p className="text-xs text-slate-500">No counselling entries added.</p>
          ) : (
            <div className="space-y-3">
              {counsellingEntries.map((entry, index) => (
                <div key={entry.id} className="grid gap-3 rounded-xl border border-indigo-100 bg-white p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start">
                  <label className="block text-xs font-semibold text-slate-700">
                    Counselling Date
                    <input type="date" value={entry.date} onChange={(event) => setCounsellingEntries((current) => current.map((item) =>
                      item.id === entry.id ? { ...item, date: event.target.value } : item
                    ))} className={inputClassName} />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Counselling Details
                    <textarea rows={3} maxLength={3000} value={entry.details} onChange={(event) => setCounsellingEntries((current) => current.map((item) =>
                      item.id === entry.id ? { ...item, details: event.target.value } : item
                    ))} placeholder={`Counselling details ${index + 1}`} className={inputClassName} />
                  </label>
                  <button type="button" onClick={() => setCounsellingEntries((current) => current.filter((item) => item.id !== entry.id))}
                    aria-label={`Remove counselling entry ${index + 1}`} className="mt-5 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/40 p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">Disciplinary Proceedings</h3>
            <p className="mt-1 text-xs text-slate-600">Optional; these details will be saved with this University Life record.</p>
          </div>
          <label className="block max-w-sm text-sm font-semibold text-slate-700">
            Proceeding Type
            <select value={disciplinaryProceeding.type} onChange={(event) => {
              const type = event.target.value as CollegeDisciplinaryProceeding['type'];
              setDisciplinaryProceeding((current) => type ? ({
                ...current,
                type,
                name: current.name || form.studentName,
                fatherName: current.fatherName || form.fatherName,
                pshRegistrationNumber: current.pshRegistrationNumber || form.pshRegistrationNumber,
                className: current.className || form.classYear,
                rollNumber: current.rollNumber || form.rollNumber,
                instituteName: current.instituteName || form.universityName,
                expulsionCommitteeMinutes: type === 'EXPELLED' ? current.expulsionCommitteeMinutes : '',
              }) : emptyDisciplinaryProceeding());
              if (!event.target.value) {
                setApplicationFile(null);
                setAffidavitFile(null);
                setMinutesPhotoFile(null);
              } else if (event.target.value !== 'EXPELLED') {
                setMinutesPhotoFile(null);
              }
            }} className={inputClassName}>
              <option value="">Select proceeding type</option>
              <option value="DROPPED">DROPPED</option>
              <option value="EXPELLED">EXPELLED</option>
            </select>
          </label>
          {disciplinaryProceeding.type && (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(disciplinaryProceeding.type === 'DROPPED' ? droppedDisciplinaryFields : expelledDisciplinaryFields).map(([field, label]) => (
                  <label key={field} className="block text-sm font-semibold text-slate-700">
                    {label}
                    <input type={field === 'date' ? 'date' : field === 'totalMarks' || field === 'obtainedMarks' ? 'number' : 'text'}
                      min={field === 'totalMarks' || field === 'obtainedMarks' ? 0 : undefined}
                      value={disciplinaryProceeding[field]} onChange={(event) => setDisciplinaryField(field, event.target.value)} className={inputClassName} />
                  </label>
                ))}
                <label className="block text-sm font-semibold text-slate-700">
                  Approved
                  <select value={disciplinaryProceeding.approved} onChange={(event) => setDisciplinaryField('approved', event.target.value)} className={inputClassName}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </select>
                </label>
              </div>
              {disciplinaryProceeding.type === 'EXPELLED' && (
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  Minutes of the Expulsion Committee
                  <textarea rows={4} maxLength={5000} value={disciplinaryProceeding.expulsionCommitteeMinutes}
                    onChange={(event) => setDisciplinaryField('expulsionCommitteeMinutes', event.target.value)} className={inputClassName} />
                </label>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Application
                  <input id="university-life-application-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(event) => setApplicationFile(event.target.files?.[0] || null)} className={inputClassName} />
                  <span className="mt-1 block text-xs font-normal text-slate-500">PDF, JPEG, PNG, or WebP; maximum 12 MB.{applicationFile ? ` Selected: ${applicationFile.name}` : ''}</span>
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Affidavit
                  <input id="university-life-affidavit-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(event) => setAffidavitFile(event.target.files?.[0] || null)} className={inputClassName} />
                  <span className="mt-1 block text-xs font-normal text-slate-500">PDF, JPEG, PNG, or WebP; maximum 12 MB.{affidavitFile ? ` Selected: ${affidavitFile.name}` : ''}</span>
                </label>
                {disciplinaryProceeding.type === 'EXPELLED' && (
                  <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                    Upload Photo of Written Minutes
                    <input id="university-life-minutes-photo-file" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={(event) => setMinutesPhotoFile(event.target.files?.[0] || null)} className={inputClassName} />
                    <span className="mt-1 block text-xs font-normal text-slate-500">JPEG, PNG, or WebP; maximum 8 MB.{minutesPhotoFile ? ` Selected: ${minutesPhotoFile.name}` : ''}</span>
                  </label>
                )}
              </div>
            </>
          )}
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
                      ['Sponsored By', entry.sponsorshipSource],
                      ['Semester GPA', entry.gpa], ['Cumulative GPA', entry.cgpa], ['Year of Completion', entry.passingYear],
                      ['Remarks', entry.remarks],
                    ].map(([label, value]) => value ? <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="font-semibold text-slate-700">{value}</dd></div> : null)}
                  </dl>
                  {entry.donorInfo && (
                    <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs text-slate-700">
                      <span className="block font-bold text-sky-900 mb-1.5">Donor Details (SPONSORED BY DONOR):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div><span className="text-slate-500 block text-[10px]">Name:</span> <span className="font-semibold">{entry.donorInfo.name || 'N/A'}</span></div>
                        <div><span className="text-slate-500 block text-[10px]">Father:</span> <span className="font-semibold">{entry.donorInfo.fatherName || 'N/A'}</span></div>
                        <div><span className="text-slate-500 block text-[10px]">CNIC:</span> <span className="font-semibold font-mono">{entry.donorInfo.cnic || 'N/A'}</span></div>
                        <div><span className="text-slate-500 block text-[10px]">Status:</span> <span className="font-semibold">{entry.donorInfo.maritalStatus || 'N/A'}</span></div>
                        {entry.donorInfo.contactNo && <div><span className="text-slate-500 block text-[10px]">Contact:</span> <span className="font-semibold">{entry.donorInfo.contactNo}</span></div>}
                        {entry.donorInfo.email && <div><span className="text-slate-500 block text-[10px]">Email:</span> <span className="font-semibold">{entry.donorInfo.email}</span></div>}
                        {entry.donorInfo.address && <div className="col-span-2"><span className="text-slate-500 block text-[10px]">Address:</span> <span className="font-semibold">{entry.donorInfo.address}</span></div>}
                      </div>
                    </div>
                  )}
                  {entry.courses?.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs">
                    <thead className="text-slate-500"><tr><th className="pb-2 pr-3">Course</th><th className="pb-2 pr-3">Credit Hours</th><th className="pb-2 pr-3">Grade</th><th className="pb-2 pr-3">Total Marks</th><th className="pb-2 pr-3">Obtained</th><th className="pb-2">Percentage</th></tr></thead>
                    <tbody>{entry.courses.map((course) => <tr key={course.id} className="border-t border-sky-100"><td className="py-2 pr-3 font-semibold text-slate-700">{course.courseName}</td><td className="py-2 pr-3">{course.creditHours || '—'}</td><td className="py-2 pr-3">{course.grade || '—'}</td><td className="py-2 pr-3">{course.totalMarks || '—'}</td><td className="py-2 pr-3">{course.obtainedMarks || '—'}</td><td className="py-2">{course.percentage ?? coursePercentage(course)}{course.percentage || coursePercentage(course) ? '%' : '—'}</td></tr>)}</tbody>
                  </table></div> : null}
                  {entry.counsellingEntries?.length ? (
                    <section className="mt-4 rounded-xl border border-indigo-100 bg-white p-3">
                      <h5 className="text-sm font-bold text-indigo-900">Counselling</h5>
                      <div className="mt-2 space-y-2">
                        {entry.counsellingEntries.map((counselling, index) => (
                          <div key={counselling.id || index} className="rounded-lg bg-indigo-50/60 p-2.5 text-sm">
                            {counselling.date && <p className="font-semibold text-slate-700">{counselling.date}</p>}
                            {counselling.details && <p className="mt-1 whitespace-pre-wrap text-slate-600">{counselling.details}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {entry.disciplinaryProceedings?.type && (
                    <section className="mt-4 rounded-xl border border-red-100 bg-white p-3">
                      <h5 className="text-sm font-bold text-red-900">Disciplinary Proceedings: {entry.disciplinaryProceedings.type}</h5>
                      <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                        {[
                          ['Name', entry.disciplinaryProceedings.name], ['Father Name', entry.disciplinaryProceedings.fatherName],
                          ['PBM Sweet Home', entry.disciplinaryProceedings.pshName], ['PBM Registration No.', entry.disciplinaryProceedings.pshRegistrationNumber],
                          ['Class', entry.disciplinaryProceedings.className], ['Section', entry.disciplinaryProceedings.classSection],
                          ['Roll No.', entry.disciplinaryProceedings.rollNumber], ['Attendance', entry.disciplinaryProceedings.attendance],
                          ['Institute', entry.disciplinaryProceedings.instituteName], ['Total Marks', entry.disciplinaryProceedings.totalMarks],
                          ['Obtained Marks', entry.disciplinaryProceedings.obtainedMarks], ['Date', entry.disciplinaryProceedings.date],
                          ['Reason', entry.disciplinaryProceedings.reason], ['Approved', entry.disciplinaryProceedings.approved],
                          ['Remarks', entry.disciplinaryProceedings.remarks], ['Minutes', entry.disciplinaryProceedings.expulsionCommitteeMinutes],
                        ].map(([label, value]) => value ? <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="whitespace-pre-wrap font-semibold text-slate-700">{value}</dd></div> : null)}
                      </dl>
                    </section>
                  )}
                  {entry.disciplinaryDocuments?.map((document) => (
                    <a key={document.id} href={`/api/pbm/career/university-progress?documentId=${encodeURIComponent(document.id)}`}
                      target="_blank" rel="noreferrer" className="mt-3 mr-4 inline-flex items-center gap-2 text-sm font-semibold text-red-800 underline underline-offset-2">
                      <FileText className="h-4 w-4" /> {document.title}: {document.fileName}
                    </a>
                  ))}
                  {entry.resultDocument && <a href={`/api/pbm/career/university-progress?documentId=${encodeURIComponent(entry.resultDocument.id)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 underline underline-offset-2"><FileText className="h-4 w-4" /> View transcript: {entry.resultDocument.fileName}</a>}
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
