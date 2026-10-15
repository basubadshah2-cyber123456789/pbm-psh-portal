'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { BriefcaseBusiness, Save } from 'lucide-react';

interface ProfessionalLifeEntry {
  id: string;
  studentName: string;
  fatherName: string;
  pshRegistrationNumber: string;
  workStatus: string;
  jobTitle: string;
  employmentType: string;
  employer: string;
  workCity: string;
  workStartDate: string;
  highestQualification: string;
  skills: string;
  maritalStatus: string;
  marriageYear: string;
  monthlyIncome: string;
  achievements: string;
  careerGoals: string;
  createdAt: string;
}

type ProfessionalLifeValues = Omit<ProfessionalLifeEntry, 'id' | 'createdAt'>;

const initialValues: ProfessionalLifeValues = {
  studentName: '',
  fatherName: '',
  pshRegistrationNumber: '',
  workStatus: '',
  jobTitle: '',
  employmentType: '',
  employer: '',
  workCity: '',
  workStartDate: '',
  highestQualification: '',
  skills: '',
  maritalStatus: '',
  marriageYear: '',
  monthlyIncome: '',
  achievements: '',
  careerGoals: '',
};

const inputClassName = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100';
const workStatuses = ['Employed', 'Self-employed', 'Business owner', 'Freelancer', 'Student', 'Seeking employment', 'Not currently working'];
const jobStatuses = new Set(['Employed', 'Self-employed', 'Business owner', 'Freelancer']);

function toFormValues(entry?: ProfessionalLifeEntry): ProfessionalLifeValues {
  if (!entry) return initialValues;
  return {
    studentName: entry.studentName || '',
    fatherName: entry.fatherName || '',
    pshRegistrationNumber: entry.pshRegistrationNumber || '',
    workStatus: entry.workStatus || '',
    jobTitle: entry.jobTitle || '',
    employmentType: entry.employmentType || '',
    employer: entry.employer || '',
    workCity: entry.workCity || '',
    workStartDate: entry.workStartDate || '',
    highestQualification: entry.highestQualification || '',
    skills: entry.skills || '',
    maritalStatus: entry.maritalStatus || '',
    marriageYear: entry.marriageYear || '',
    monthlyIncome: entry.monthlyIncome || '',
    achievements: entry.achievements || '',
    careerGoals: entry.careerGoals || '',
  };
}

export function ProfessionalLifeForm() {
  const [entries, setEntries] = useState<ProfessionalLifeEntry[]>([]);
  const [form, setForm] = useState<ProfessionalLifeValues>(initialValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/pbm/career/professional-life')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load Professional Life details.');
        const loadedEntries = Array.isArray(result.entries) ? result.entries as ProfessionalLifeEntry[] : [];
        if (!cancelled) {
          setEntries(loadedEntries);
          const latestEntry = loadedEntries.at(-1);
          setForm({ ...toFormValues(latestEntry), studentName: latestEntry?.studentName || result.student?.fullName || '' });
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load Professional Life details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (key: keyof ProfessionalLifeValues, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/pbm/career/professional-life', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save Professional Life details.');
      setEntries((current) => [...current, result.entry]);
      setSuccess('Professional Life details saved. Your previous updates remain in your history.');
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save Professional Life details.');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (
    key: keyof ProfessionalLifeValues,
    label: string,
    options: { required?: boolean; type?: string; maxLength?: number; placeholder?: string; min?: string; max?: string; step?: string } = {},
  ) => (
    <label key={key} className="block text-sm font-semibold text-slate-700">
      {label}{options.required && <span className="text-red-600"> *</span>}
      <input
        required={options.required}
        type={options.type || 'text'}
        maxLength={options.maxLength}
        min={options.min}
        max={options.max}
        step={options.step}
        value={form[key]}
        onChange={(event) => setField(key, event.target.value)}
        placeholder={options.placeholder}
        className={inputClassName}
      />
    </label>
  );

  return (
    <section className="mt-6 rounded-3xl border border-indigo-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 rounded-2xl bg-indigo-50 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-indigo-100 p-2.5 text-indigo-800"><BriefcaseBusiness className="h-5 w-5" /></span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Professional Life</h2>
            <p className="mt-1 text-sm text-indigo-800">Share your work, skills, achievements, and important personal updates.</p>
          </div>
        </div>
      </div>

      <p className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        Your details are saved to this account and are visible only after signing in. Income is optional. Each save adds a dated history record instead of replacing earlier updates.
      </p>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}

      <form onSubmit={submit} className="space-y-6">
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Personal information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {renderInput('studentName', 'Full Name', { required: true, maxLength: 200 })}
            {renderInput('fatherName', 'Father’s Name', { required: true, maxLength: 200 })}
            {renderInput('pshRegistrationNumber', 'PBM Registration No.', { required: true, maxLength: 100 })}
            <label className="block text-sm font-semibold text-slate-700">Marital Status <span className="text-red-600">*</span>
              <select required value={form.maritalStatus} onChange={(event) => setField('maritalStatus', event.target.value)} className={inputClassName}>
                <option value="">Select marital status</option>
                <option>Single</option><option>Married</option><option>Engaged</option><option>Separated</option><option>Widowed</option><option>Prefer not to say</option>
              </select>
            </label>
            {form.maritalStatus === 'Married' && renderInput('marriageYear', 'Marriage Year', { type: 'number', min: '1900', max: '2100' })}
          </div>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Employment and occupation</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Current Work Status <span className="text-red-600">*</span>
              <select required value={form.workStatus} onChange={(event) => {
                const workStatus = event.target.value;
                setForm((current) => ({
                  ...current,
                  workStatus,
                  ...(jobStatuses.has(workStatus) ? {} : { jobTitle: '', employmentType: '', employer: '', workCity: '', workStartDate: '', monthlyIncome: '' }),
                }));
              }} className={inputClassName}>
                <option value="">Select current status</option>{workStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            {jobStatuses.has(form.workStatus) && (
              <>
                {renderInput('jobTitle', 'Job Title / Type of Work', { required: true, maxLength: 150, placeholder: 'For example, Teacher, Doctor, Electrician, Shop owner' })}
                <label className="block text-sm font-semibold text-slate-700">Employment Sector <span className="text-red-600">*</span>
                  <select required value={form.employmentType} onChange={(event) => setField('employmentType', event.target.value)} className={inputClassName}>
                    <option value="">Select sector</option><option>Government</option><option>Private</option><option>NGO / Non-profit</option><option>Self-employed</option><option>Other</option>
                  </select>
                </label>
                {renderInput('employer', 'Employer / Business Name', { maxLength: 200 })}
                {renderInput('workCity', 'Work City', { maxLength: 100 })}
                {renderInput('workStartDate', 'Work Start Date', { type: 'date' })}
                {renderInput('monthlyIncome', 'Approximate Monthly Income (PKR, optional)', { type: 'number', min: '0', max: '999999999', step: '0.01' })}
              </>
            )}
            {renderInput('highestQualification', 'Highest Qualification', { maxLength: 200, placeholder: 'For example, BA, BS, DAE, Matric' })}
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Skills / Professional Training
              <textarea maxLength={1000} rows={3} value={form.skills} onChange={(event) => setField('skills', event.target.value)} className={inputClassName} placeholder="List skills, certifications, vocational training, or licenses." />
            </label>
          </div>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Achievements and future goals</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Achievements / Work Experience
              <textarea maxLength={1000} rows={4} value={form.achievements} onChange={(event) => setField('achievements', event.target.value)} className={inputClassName} placeholder="Share important responsibilities, experience, awards, or achievements." />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Career Goals / Support Needed
              <textarea maxLength={1000} rows={4} value={form.careerGoals} onChange={(event) => setField('careerGoals', event.target.value)} className={inputClassName} placeholder="What are your next goals? Is there any guidance or support you need?" />
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Professional Life'}
          </button>
        </div>
      </form>

      <section className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Professional Life History</h3>
        <div className="space-y-3">
          {loading ? <p className="text-sm text-slate-500">Loading your professional history…</p> :
            entries.length === 0 ? <p className="text-sm text-slate-500">No Professional Life details have been added yet.</p> :
              [...entries].reverse().map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><h4 className="font-bold text-slate-900">{entry.studentName}</h4><p className="mt-1 text-sm text-indigo-800">{[entry.jobTitle || entry.workStatus, entry.employer, entry.workCity].filter(Boolean).join(' · ')}</p></div>
                    <time className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</time>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      ['Father', entry.fatherName], ['PBM Registration No.', entry.pshRegistrationNumber], ['Work Status', entry.workStatus],
                      ['Job Title / Occupation', entry.jobTitle], ['Employment Sector', entry.employmentType], ['Employer / Business', entry.employer],
                      ['Work City', entry.workCity], ['Work Start Date', entry.workStartDate], ['Highest Qualification', entry.highestQualification],
                      ['Marital Status', entry.maritalStatus], ['Marriage Year', entry.marriageYear],
                      ['Approx. Monthly Income (PKR)', entry.monthlyIncome], ['Skills / Training', entry.skills],
                      ['Achievements', entry.achievements], ['Career Goals / Support Needed', entry.careerGoals],
                    ].map(([label, value]) => value ? <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="font-semibold text-slate-700">{value}</dd></div> : null)}
                  </dl>
                </article>
              ))}
        </div>
      </section>
    </section>
  );
}
