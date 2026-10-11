'use client';

import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { createEmptyFollowUp, type FollowUpRecord } from './follow-up';

type FollowUpModalProps = {
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
  childName,
  className = '',
  instituteName = '',
  onClose,
  onSave,
}: FollowUpModalProps) {
  const [draft, setDraft] = useState(() => createEmptyFollowUp({
    name: childName,
    className,
    instituteName,
  }));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('Enter the student name before adding this follow-up.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave({ ...draft, name: draft.name.trim() });
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this follow-up.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="follow-up-title"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="follow-up-title" className="text-lg font-bold text-slate-900">Follow Up Form</h2>
            <p className="mt-1 text-xs text-slate-500">
              Follow-up details are saved directly to {childName}&apos;s dossier.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            aria-label="Close follow-up form"
          >
            ×
          </button>
        </div>

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
            disabled={isSaving}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-[#0D5C3A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0b4d30] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving Follow Up...' : 'Add Follow Up'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
