'use client';

import { BookOpen, X } from 'lucide-react';

type HistoryEntry = Record<string, unknown>;

type ChildHistoryModalProps = {
  child: {
    fullName: string;
    admissionNo: string;
    collegeProgress?: unknown;
    universityProgress?: unknown;
    careerProfile?: unknown;
  };
  dossier: unknown;
  onClose: () => void;
};

function asRecord(value: unknown): HistoryEntry | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as HistoryEntry
    : null;
}

function asEntries(value: unknown): HistoryEntry[] {
  return Array.isArray(value)
    ? value.map(asRecord).filter((entry): entry is HistoryEntry => entry !== null)
    : [];
}

function displayValue(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return null;
}

function labelFor(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (first) => first.toUpperCase());
}

function HistorySection({
  title,
  entries,
}: {
  title: string;
  entries: HistoryEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {entries.length}
        </span>
      </div>
      <div className="space-y-3">
        {entries.map((entry, index) => {
          const headingKeys = ['collegeName', 'universityName', 'instituteName', 'employer', 'school', 'jobTitle'];
          const headingKey = headingKeys.find((key) => displayValue(entry[key]));
          const heading = headingKey ? displayValue(entry[headingKey]) : `${title} #${index + 1}`;
          const date = displayValue(entry.createdAt) || displayValue(entry.passingYear) ||
            displayValue(entry.academicPeriod) || displayValue(entry.year);
          const details = Object.entries(entry).filter(([key, value]) =>
            !['id', 'createdAt', 'resultDocument', 'subjects', 'courses'].includes(key) &&
            key !== headingKey &&
            displayValue(value) !== null
          );
          const resultDocument = asRecord(entry.resultDocument);
          const subjects = asEntries(entry.subjects);
          const courses = asEntries(entry.courses);

          return (
            <article key={displayValue(entry.id) || `${title}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-[#0D5C3A]">{heading}</h4>
                {date && <span className="text-xs font-medium text-slate-500">{date}</span>}
              </div>
              {details.length > 0 && (
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {details.map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{labelFor(key)}</dt>
                      <dd className="break-words text-xs font-medium text-slate-800">{displayValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {(subjects.length > 0 || courses.length > 0) && (
                <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                  {(subjects.length > 0 ? subjects : courses).map((item, itemIndex) => {
                    const name = displayValue(item.subject) || displayValue(item.courseName) || `Item ${itemIndex + 1}`;
                    const marks = [displayValue(item.obtainedMarks), displayValue(item.totalMarks)].filter(Boolean).join(' / ');
                    const grade = displayValue(item.grade);
                    return (
                      <p key={displayValue(item.id) || `${name}-${itemIndex}`} className="text-xs text-slate-700">
                        <span className="font-semibold">{name}</span>
                        {marks && <span> — {marks}</span>}
                        {grade && <span> · Grade {grade}</span>}
                      </p>
                    );
                  })}
                </div>
              )}
              {resultDocument && displayValue(resultDocument.fileName) && (
                <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-600">
                  Result document: {displayValue(resultDocument.fileName)}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ChildHistoryModal({ child, dossier, onClose }: ChildHistoryModalProps) {
  const notes = asRecord(dossier) || {};
  const careerProfile = asRecord(child.careerProfile) || {};
  const resultHistory = asEntries(notes.resultInfoHistory);
  if (resultHistory.length === 0) resultHistory.push(...asEntries(notes.resultInfo ? [notes.resultInfo] : []));
  const appearanceHistory = asEntries(notes.appearanceHistory);
  if (appearanceHistory.length === 0) {
    appearanceHistory.push(...asEntries(asRecord(notes.appearance)?.measurements));
  }
  if (appearanceHistory.length === 0 && asRecord(notes.appearance)) {
    appearanceHistory.push(asRecord(notes.appearance)!);
  }

  const sections = [
    { title: 'School & Academic Records', entries: resultHistory },
    { title: 'Follow-up Records', entries: asEntries(notes.followUps) },
    { title: 'College & University Progress', entries: [
      ...asEntries(child.collegeProgress),
      ...asEntries(child.universityProgress),
    ].sort((left, right) =>
      new Date(displayValue(right.createdAt) || 0).getTime() -
      new Date(displayValue(left.createdAt) || 0).getTime()
    ) },
    { title: 'Professional Life Records', entries: asEntries(careerProfile.professionalLifeEntries) },
    { title: 'Growth & Appearance Records', entries: appearanceHistory },
    { title: 'Interests & Activities', entries: asEntries(notes.areaOfInterestHistory) },
  ].filter((section) => section.entries.length > 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="child-history-title"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-violet-50 p-2 text-violet-700">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 id="child-history-title" className="text-lg font-bold text-slate-900">Child History</h2>
              <p className="mt-1 text-xs text-slate-500">{child.fullName} · Registration {child.admissionNo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close child history"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
          {sections.length > 0 ? sections.map((section) => (
            <HistorySection key={section.title} title={section.title} entries={section.entries} />
          )) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No saved history yet</p>
              <p className="mt-1 text-xs text-slate-500">Follow-up and education records will appear here once added.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
