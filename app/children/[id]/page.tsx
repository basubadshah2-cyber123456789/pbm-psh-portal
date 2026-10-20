import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { requireModuleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/layout/AppLayout';
import { formatDate, parsePshNotes } from '@/lib/utils';
import { formatAddress } from '@/lib/formatters';
import { childPhotoDisplaySrc } from '@/lib/child-photo';
import { ChildComplaintsSection } from '@/components/children/ChildComplaintsSection';
import { ChildDocumentsSection } from '@/components/children/ChildDocumentsSection';
import { ChildCollegeProgressSection } from '@/components/children/ChildCollegeProgressSection';
import { ProfessionalCareerAccountControl } from '@/components/children/ProfessionalCareerAccountControl';
import {
  Users,
  Shield,
  GraduationCap,
  Sparkles,
  HeartPulse,
  User,
  Stethoscope,
  Pill,
  BookOpen,
  Award,
  FileText,
} from 'lucide-react';

function calculateAge(dateOfBirth: Date) {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDelta = today.getMonth() - dateOfBirth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())) age -= 1;
  return Math.max(0, age);
}

function formatAppearanceAge(age: string | number | null | undefined) {
  if (age === null || age === undefined || age === '') return 'N/A';
  const numericAge = Number(age);
  return Number.isFinite(numericAge)
    ? `${numericAge} ${numericAge === 1 ? 'year' : 'years'}`
    : String(age);
}

function Section({
  label,
  title,
  children,
  tone = 'slate',
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  tone?: 'slate' | 'red' | 'emerald' | 'blue' | 'purple' | 'amber';
}) {
  const toneClasses = {
    slate: 'border-slate-200 bg-white',
    red: 'border-red-200 bg-red-50/40',
    emerald: 'border-emerald-200 bg-emerald-50/30',
    blue: 'border-blue-200 bg-blue-50/30',
    purple: 'border-purple-200 bg-purple-50/30',
    amber: 'border-amber-200 bg-amber-50/30',
  };

  const labelToneClasses = {
    slate: 'text-slate-700',
    red: 'text-red-700',
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
    amber: 'text-amber-700',
  };

  return (
    <section className={`rounded-xl border p-5 shadow-xs ${toneClasses[tone] || toneClasses.slate}`}>
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className={`text-[10px] font-bold ${labelToneClasses[tone] || labelToneClasses.slate}`}>
          {label}
        </span>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default async function ChildProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireModuleAccess('children');
  const { id } = await params;
  let child = null;

  try {
    child = await prisma.child.findUnique({
      where: { id },
      include: {
        room: true,
        bed: true,
        class: true,
        motherMaid: { select: { id: true, fullName: true } },
        medicalRecord: true,
        medicalVisits: { orderBy: { visitDate: 'desc' }, take: 5 },
        educationRecords: { include: { class: true }, orderBy: { createdAt: 'desc' }, take: 5 },
        attendances: { orderBy: { date: 'desc' }, take: 10 },
        complaints: { orderBy: { createdAt: 'desc' }, take: 20 },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });
  } catch (err) {
    console.warn('Could not load child record from database:', err);
  }

  if (!child) notFound();
  if (user.role === Role.MOTHER_MAID && child.motherMaidId && child.motherMaidId !== user.employeeId) {
    redirect('/dashboard?unauthorized=1');
  }

  const attendancePresent = child.attendances.filter((record) => record.status === 'PRESENT').length;
  const psh = parsePshNotes(child.notes);
  const careerProfile = psh?.professionalCareer?.profile;
  const disciplinaryProceedings = psh?.disciplinaryProceedings;
  const disciplinaryType = disciplinaryProceedings?.type ||
    (child.status === 'DROPPED' || child.status === 'EXPELLED' ? child.status : '');
  const getHistoryYear = (value: string | number | Date | null | undefined) => {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
    if (typeof value === 'string') {
      const yearPrefix = value.match(/^(\d{4})(?:-|$)/);
      if (yearPrefix) return Number(yearPrefix[1]);
    }
    if (value) {
      const date = value instanceof Date ? value : new Date(value);
      if (!Number.isNaN(date.getTime())) return date.getFullYear();
    }
    return new Date().getFullYear();
  };
  const resultInfoHistory = (
    Array.isArray(psh?.resultInfoHistory) && psh.resultInfoHistory.length > 0
      ? psh.resultInfoHistory
      : psh?.resultInfo
        ? [psh.resultInfo]
        : []
  ).sort((left: any, right: any) =>
    getHistoryYear(right.year ?? right.examDate ?? child.updatedAt) -
    getHistoryYear(left.year ?? left.examDate ?? child.updatedAt)
  );
  const appearanceHistory = (
    Array.isArray(psh?.appearanceHistory) && psh.appearanceHistory.length > 0
      ? psh.appearanceHistory
      : Array.isArray(psh?.appearance?.measurements) && psh.appearance.measurements.length > 0
        ? psh.appearance.measurements
        : psh?.appearance
          ? [psh.appearance]
          : []
  ).sort((left: any, right: any) =>
    getHistoryYear(right.year ?? child.updatedAt) - getHistoryYear(left.year ?? child.updatedAt)
  );
  const areaOfInterestHistory = (
    Array.isArray(psh?.areaOfInterestHistory) && psh.areaOfInterestHistory.length > 0
      ? psh.areaOfInterestHistory
      : psh?.areaOfInterest || psh?.areaOfInterestEntries?.length
        ? [{
            year: getHistoryYear(child.updatedAt),
            areaOfInterest: psh.areaOfInterest || '',
            entries: psh.areaOfInterestEntries || [],
          }]
        : []
  ).sort((left: any, right: any) =>
    getHistoryYear(right.year ?? child.updatedAt) - getHistoryYear(left.year ?? child.updatedAt)
  );
  const profilePhotoHistory = Array.isArray(psh?.profilePhotoHistory) && psh.profilePhotoHistory.length > 0
    ? [...psh.profilePhotoHistory]
        .filter((entry: any) => typeof entry.photo === 'string' && entry.photo)
        .sort((left: any, right: any) =>
          getHistoryYear(right.year ?? child.updatedAt) - getHistoryYear(left.year ?? child.updatedAt)
        )
    : child.photo
      ? [{ year: getHistoryYear(child.admissionDate), photo: child.photo }]
      : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/children" className="text-xs font-semibold text-emerald-700">
              ← Back to Children Care & Management
            </Link>
            <h1 className="mt-1 text-xl font-bold text-slate-900">Child Dossier & Profile</h1>
            <p className="text-xs text-slate-500">
              Authorized consolidated record conforming to Pakistan Bait-ul-Mal standards.
            </p>
          </div>
          <Link
            href="/children"
            className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
          >
            Manage in Children Directory
          </Link>
          {(user.role === Role.INCHARGE || user.role === Role.ACCOUNT_ASSISTANT || user.role === Role.CLERK) && (
            <ProfessionalCareerAccountControl childId={child.id} childName={child.fullName} />
          )}
        </div>

        {/* Header Profile Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-32 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              {childPhotoDisplaySrc(child.photo) ? (
                <img
                  src={childPhotoDisplaySrc(child.photo)!}
                  alt={`${child.fullName} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-extrabold text-emerald-300">PBM</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {child.fullName} {psh?.basicInfo?.nickName ? `(${psh.basicInfo.nickName})` : ''}
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  {child.status}
                </span>
                {psh?.category?.type && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-900 border border-amber-300">
                    Category: {psh.category.type} {psh.category.replacedRegistrationNo ? `(Replaced: ${psh.category.replacedRegistrationNo})` : ''}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm font-bold text-emerald-700">
                {child.childId} · Admission No: {child.admissionNo} · B-Form: {child.bFormNo || 'N/A'}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <span className="block text-slate-400 font-medium">Age</span>
                  <strong>{calculateAge(child.dateOfBirth)} years</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Gender</span>
                  <strong>{child.gender}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Date of Birth</span>
                  <strong>{formatDate(child.dateOfBirth)}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Admission Date</span>
                  <strong>{formatDate(child.admissionDate)}</strong>
                </div>
              </div>
            </div>
          </div>
          {profilePhotoHistory.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="mb-2 text-xs font-bold text-slate-700">Profile Photo History</h3>
              <div className="flex flex-wrap gap-3">
                {profilePhotoHistory.map((entry: any, index: number) => {
                  const photoSrc = childPhotoDisplaySrc(entry.photo);
                  return photoSrc ? (
                    <div key={`${entry.year}-${index}`} className="w-20">
                      <div className="h-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        <img src={photoSrc} alt={`${child.fullName} profile from ${entry.year}`} className="h-full w-full object-cover" />
                      </div>
                      <p className="mt-1 text-center text-[11px] font-semibold text-slate-600">{entry.year}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </section>

        {appearanceHistory.length > 0 && (
          <Section label="YEARLY APPEARANCE" title="Growth & Appearance History" tone="emerald">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {appearanceHistory.map((entry: any, index: number) => (
                <div key={`${entry.year || 'year'}-${index}`} className="rounded-lg border border-emerald-100 bg-white p-3 text-xs">
                  <p className="font-bold text-emerald-900">{entry.year || getHistoryYear(child.updatedAt)}</p>
                  <p className="mt-1 text-slate-700">
                    Height: {entry.height ? `${entry.height} cm` : 'N/A'} · Weight: {entry.weight ? `${entry.weight} kg` : 'N/A'}
                  </p>
                  <p className="mt-1 text-slate-600">Age: {formatAppearanceAge(entry.age)}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 1 & 2: Basic Biometrics & Institutional Care */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Section label="SECTION 2: BASIC INFO" title="Biographics & Sponsorship" tone="emerald">
            <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Father / Guardian</dt>
                <dd className="font-semibold text-slate-800">{child.fatherGuardianName}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Religion / Caste</dt>
                <dd className="font-semibold text-slate-800">
                  {psh?.basicInfo?.religion || 'Islam'} {psh?.basicInfo?.caste ? `(${psh.basicInfo.caste})` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Mother Tongue</dt>
                <dd className="font-semibold text-slate-800">{psh?.basicInfo?.motherTongue || 'Saraiki / Urdu'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Sponsorship Status</dt>
                <dd className="font-semibold text-slate-800">
                  {psh?.basicInfo?.isSponsored && psh?.basicInfo?.isSponsored !== 'No'
                    ? `${psh.basicInfo.isSponsored !== 'Yes' ? psh.basicInfo.isSponsored : 'Sponsored'} (Rs. ${psh.basicInfo.sponsorshipAmount || '15,000'}/mo)`
                    : 'Institutional Support'}
                </dd>
              </div>
              {(psh?.donorInfo?.name || psh?.basicInfo?.donorName) && (
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                  <dt className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1.5">
                    Donor Details ({psh?.basicInfo?.isSponsored || 'SPONSORED BY DONOR'})
                  </dt>
                  <dd className="text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div><span className="text-slate-400 block text-[10px]">Donor Name:</span> <span className="font-semibold text-slate-800">{psh?.donorInfo?.name || psh?.basicInfo?.donorName}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Father Name:</span> <span className="font-semibold text-slate-800">{psh?.donorInfo?.fatherName || psh?.basicInfo?.donorFatherName || 'N/A'}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">ID Card No:</span> <span className="font-semibold font-mono text-slate-800">{psh?.donorInfo?.cnic || psh?.basicInfo?.donorCnic || 'N/A'}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Marital Status:</span> <span className="font-semibold text-slate-800">{psh?.donorInfo?.maritalStatus || psh?.basicInfo?.donorMaritalStatus || 'N/A'}</span></div>
                    {(psh?.donorInfo?.address || psh?.basicInfo?.donorAddress) && (
                      <div className="col-span-2"><span className="text-slate-400 block text-[10px]">Address:</span> <span className="font-semibold text-slate-800">{psh?.donorInfo?.address || psh?.basicInfo?.donorAddress}</span></div>
                    )}
                    {(psh?.donorInfo?.contactNo || psh?.basicInfo?.donorContactNo) && (
                      <div><span className="text-slate-400 block text-[10px]">Contact No:</span> <span className="font-semibold text-slate-800">{psh?.donorInfo?.contactNo || psh?.basicInfo?.donorContactNo}</span></div>
                    )}
                    {(psh?.donorInfo?.email || psh?.basicInfo?.donorEmail) && (
                      <div><span className="text-slate-400 block text-[10px]">Email:</span> <span className="font-semibold text-slate-800">{psh?.donorInfo?.email || psh?.basicInfo?.donorEmail}</span></div>
                    )}
                    {(psh?.donorInfo?.document?.fileName || psh?.donorInfo?.fileName) && (
                      <div><span className="text-slate-400 block text-[10px]">Document:</span> <span className="font-semibold text-emerald-700 underline">{psh?.donorInfo?.document?.fileName || psh?.donorInfo?.fileName}</span></div>
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-slate-400">Previous School</dt>
                <dd className="font-semibold text-slate-800">{psh?.basicInfo?.previousSchool || 'Not recorded'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Medium of Education</dt>
                <dd className="font-semibold text-slate-800">{psh?.basicInfo?.mediumOfEducation || 'Urdu'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-400">Residential Native Address</dt>
                <dd className="font-semibold text-slate-800">{child.address || 'Not recorded'}</dd>
              </div>
            </dl>
          </Section>

          <Section label="ADM & HOSTEL" title="Institutional Placement & Living" tone="slate">
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Academic Class</dt>
                <dd className="font-semibold text-slate-800">{child.class?.name || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Hostel Bed</dt>
                <dd className="font-semibold text-slate-800">{child.bed?.bedNumber || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Assigned Mother Maid</dt>
                <dd className="font-semibold text-slate-800">{child.motherMaid?.fullName || 'Relief Supervision'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Hostel Room</dt>
                <dd className="font-semibold text-slate-800">{child.room?.roomNumber || 'Unassigned'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400">Dietary & Uniform Details</dt>
                <dd className="font-semibold text-slate-800">
                  {child.clothingIssued || 'Standard 2 Uniforms & Seasonal Bedding'} • {child.dietaryNotes || 'Nutritious Diet'}
                </dd>
              </div>
            </dl>
          </Section>
        </div>

        {disciplinaryType && (
          <Section label="DISCIPLINARY PROCEEDINGS" title={disciplinaryType} tone="red">
            {disciplinaryProceedings ? (
              <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                {(disciplinaryType === 'DROPPED' ? [
                  ['Name', disciplinaryProceedings.name],
                  ['Father Name', disciplinaryProceedings.fatherName],
                  ['PBM Sweet Home', disciplinaryProceedings.pshName],
                  ['PBM Registration No.', disciplinaryProceedings.pshRegistrationNumber],
                  ['Class', disciplinaryProceedings.className],
                  ['Section', disciplinaryProceedings.classSection],
                  ['Roll No.', disciplinaryProceedings.rollNumber],
                  ['Attendance', disciplinaryProceedings.attendance],
                  ['Institute', disciplinaryProceedings.instituteName],
                  ['Total Marks', disciplinaryProceedings.totalMarks],
                  ['Obtained Marks', disciplinaryProceedings.obtainedMarks],
                  ['Date of Dropped out', disciplinaryProceedings.date],
                  ['Reason of Dropped out', disciplinaryProceedings.reason],
                  ['Approved', disciplinaryProceedings.approved],
                  ['Remarks', disciplinaryProceedings.remarks],
                  ...(Array.isArray(disciplinaryProceedings.counsellingEntries)
                    ? disciplinaryProceedings.counsellingEntries.map((entry: { date?: string; details?: string }, index: number) => [
                        `Counselling ${index + 1}`,
                        [entry.date, entry.details].filter(Boolean).join(' — '),
                      ] as const)
                    : []),
                ] : [
                  ['Name', disciplinaryProceedings.name],
                  ['Father Name', disciplinaryProceedings.fatherName],
                  ['Which PBM Sweet Home', disciplinaryProceedings.pshName],
                  ['PBM Registration No.', disciplinaryProceedings.pshRegistrationNumber],
                  ['Class', disciplinaryProceedings.className],
                  ['Roll No.', disciplinaryProceedings.rollNumber],
                  ['Institute', disciplinaryProceedings.instituteName],
                  ['Total Marks', disciplinaryProceedings.totalMarks],
                  ['Obtained Marks', disciplinaryProceedings.obtainedMarks],
                  ['Reason of Expulsion', disciplinaryProceedings.reason],
                  ['Date of Expulsion', disciplinaryProceedings.date],
                  ['Approved', disciplinaryProceedings.approved],
                  ['Remarks', disciplinaryProceedings.remarks],
                  ['Minutes of the Expulsion Committee', disciplinaryProceedings.expulsionCommitteeMinutes],
                  ...(Array.isArray(disciplinaryProceedings.counsellingEntries)
                    ? disciplinaryProceedings.counsellingEntries.map((entry: { date?: string; details?: string }, index: number) => [
                        `Counselling ${index + 1}`,
                        [entry.date, entry.details].filter(Boolean).join(' — '),
                      ] as const)
                    : []),
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-slate-400">{label}</dt>
                    <dd className="whitespace-pre-wrap font-semibold text-slate-800">{value || 'Not recorded'}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-xs text-slate-600">
                This child has a legacy {disciplinaryType.toLowerCase()} status. Additional proceeding details have not been recorded.
              </p>
            )}
          </Section>
        )}

        {/* 4, 5, 6: Father, Mother & Guardian Info */}
        {psh && (psh.fatherInfo || psh.motherInfo || psh.guardianInfo || psh.additionalGuardians?.length > 0) && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {psh.fatherInfo && (
              <Section label="SECTION 4: FATHER INFO" title="Father's Particulars" tone="slate">
                <dl className="space-y-2 text-xs">
                  <div>
                    <dt className="text-slate-400">Name & Status</dt>
                    <dd className="font-bold text-slate-900">
                      {psh.fatherInfo.name} ({psh.fatherInfo.isAlive === 'No' ? 'Deceased / مرحوم' : 'Alive'})
                    </dd>
                  </div>
                  {psh.fatherInfo.isAlive === 'No' && psh.fatherInfo.dod && (
                    <div>
                      <dt className="text-slate-400">Date of Death</dt>
                      <dd className="font-semibold text-red-700">{formatDate(psh.fatherInfo.dod)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-slate-400">CNIC / Contact</dt>
                    <dd className="font-semibold">{psh.fatherInfo.cnic || 'N/A'} • {psh.fatherInfo.contact || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Profession / Qualification</dt>
                    <dd className="font-semibold">{psh.fatherInfo.profession || 'N/A'} ({psh.fatherInfo.qualification || 'Matric'})</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Native Location</dt>
                    <dd className="font-semibold">{psh.fatherInfo.city}, {psh.fatherInfo.province}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Address</dt>
                    <dd className="font-semibold">{formatAddress(psh.fatherInfo)}</dd>
                  </div>
                </dl>
              </Section>
            )}

            {psh.motherInfo && (
              <Section label="SECTION 5: MOTHER INFO" title="Mother's Particulars" tone="slate">
                <dl className="space-y-2 text-xs">
                  <div>
                    <dt className="text-slate-400">Name & Status</dt>
                    <dd className="font-bold text-slate-900">
                      {psh.motherInfo.name} ({psh.motherInfo.isAlive === 'No' ? 'Deceased / مرحومہ' : 'Alive'})
                    </dd>
                  </div>
                  {psh.motherInfo.isAlive === 'No' && psh.motherInfo.dod && (
                    <div>
                      <dt className="text-slate-400">Date of Death</dt>
                      <dd className="font-semibold text-red-700">{formatDate(psh.motherInfo.dod)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-slate-400">CNIC / Contact</dt>
                    <dd className="font-semibold">{psh.motherInfo.cnic || 'N/A'} • {psh.motherInfo.contact || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Profession / Qualification</dt>
                    <dd className="font-semibold">{psh.motherInfo.profession || 'Housewife'} ({psh.motherInfo.qualification || 'Primary'})</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Address</dt>
                    <dd className="font-semibold">{formatAddress(psh.motherInfo)}</dd>
                  </div>
                </dl>
              </Section>
            )}

            {psh.guardianInfo && (
              <Section label="SECTION 6: GUARDIAN INFO" title="Guardian / Next of Kin" tone="slate">
                <dl className="space-y-2 text-xs">
                  <div>
                    <dt className="text-slate-400">Guardian Name</dt>
                    <dd className="font-bold text-slate-900">{psh.guardianInfo.name || child.guardianName || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Relationship</dt>
                    <dd className="font-semibold">{psh.guardianInfo.relation || child.guardianRelation || 'Mother / Widow'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">CNIC / Contact</dt>
                    <dd className="font-semibold">{psh.guardianInfo.cnic || 'N/A'} • {psh.guardianInfo.contact || child.guardianContact || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Profession / Income</dt>
                    <dd className="font-semibold">{psh.guardianInfo.profession || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Permanent Address</dt>
                    <dd className="font-semibold">{formatAddress(psh.guardianInfo)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Current Address</dt>
                    <dd className="font-semibold">{formatAddress(psh.guardianInfo.currentAddress)}</dd>
                  </div>
                </dl>
              </Section>
            )}
            {Array.isArray(psh.additionalGuardians) && psh.additionalGuardians.map((guardian: any, index: number) => (
              <Section key={guardian.id || index} label={`ADDITIONAL GUARDIAN ${index + 1}`} title={guardian.name || 'Guardian Details'} tone="slate">
                <dl className="space-y-2 text-xs">
                  <div>
                    <dt className="text-slate-400">Relationship</dt>
                    <dd className="font-semibold">{guardian.relation || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">CNIC / Contact</dt>
                    <dd className="font-semibold">{guardian.cnic || 'N/A'} • {guardian.contact || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Qualification / Profession</dt>
                    <dd className="font-semibold">{guardian.qualification || 'N/A'} • {guardian.profession || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Address</dt>
                    <dd className="font-semibold">{formatAddress(guardian)}</dd>
                  </div>
                </dl>
              </Section>
            ))}
          </div>
        )}

        {/* 7, 8, 9: Meeting Persons, Siblings, Witnesses */}
        {psh && (psh.meetingPersons?.length > 0 || psh.siblings?.length > 0 || psh.witnesses?.length > 0) && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Meeting Persons */}
            <Section label="SECTION 7: VISITORS" title="Authorized Meeting Persons" tone="blue">
              {psh.meetingPersons?.length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {psh.meetingPersons.map((p: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-blue-100">
                      <div className="font-bold text-slate-800">{p.name} ({p.relation})</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Schedule: {p.visitFrequency} • Timing: {p.visitTiming}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Contact: {p.contact || 'N/A'} • CNIC: {p.cnic || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Address: {formatAddress(p)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No meeting persons registered.</p>
              )}
            </Section>

            {/* Siblings */}
            <Section label="SECTION 8: SIBLINGS" title="Registered Siblings" tone="emerald">
              {psh.siblings?.length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {psh.siblings.map((s: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-emerald-100">
                      <div className="font-bold text-slate-800">{s.name} ({s.gender})</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Age: {s.age || 'N/A'} • {s.schoolName || 'School'} ({s.gradeClass || 'Class'})
                      </div>
                      <div className="text-[11px] text-slate-600">Profession: {s.profession || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Address: {formatAddress(s)}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Status: {s.maritalStatus || 'Single'}</div>
                      {s.maritalStatus === 'Married' && s.marriedAddress && (
                        <div className="text-[10px] text-slate-400 mt-1">Address After Marriage: {formatAddress({
                          address: s.marriedAddress,
                          addressType: s.marriedAddressType,
                          villageName: s.marriedVillageName,
                          postOffice: s.marriedPostOffice,
                          cityName: s.marriedCityName,
                          colony: s.marriedColony,
                          district: s.marriedDistrict,
                          tehsil: s.marriedTehsil,
                          ucNumber: s.marriedUcNumber,
                          ucName: s.marriedUcName,
                          streetNumber: s.marriedStreetNumber,
                          houseNumber: s.marriedHouseNumber,
                        })}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No sibling records registered.</p>
              )}
            </Section>

            {/* Witnesses */}
            <Section label="SECTION 9: WITNESSES" title="Community Verifiers" tone="purple">
              {psh.witnesses?.length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {psh.witnesses.map((w: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-purple-100">
                      <div className="font-bold text-slate-800">{w.name}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {w.profession || 'Community Elder'} • CNIC: {w.cnic || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Contact: {w.contact || 'N/A'} • Address: {formatAddress(w)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No community witness records registered.</p>
              )}
            </Section>
          </div>
        )}

        {/* 10: Academic Results */}
        {resultInfoHistory.length > 0 && (
          <Section label="SECTION 10: RESULT INFO" title="Academic Result History" tone="blue">
            <div className="space-y-4">
              {resultInfoHistory.map((result: any, resultIndex: number) => (
                <div key={result.id || `${result.year}-${resultIndex}`} className="rounded-lg border border-blue-100 bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-100/60 p-2 text-xs font-bold text-blue-900">
                    <span>{result.year || getHistoryYear(result.examDate ?? child.updatedAt)} · {result.examType || 'Exam'}</span>
                    {result.gradeClass || result.class ? <span>Class: {result.gradeClass || result.class}</span> : null}
                    {result.examDate ? <span>Date: {formatDate(result.examDate)}</span> : null}
                    <span>School: {result.school || result.schoolName || 'Govt School'}</span>
                    {result.passingScore ? <span>Passing Score: {result.passingScore}</span> : null}
                    {result.totalObtained !== undefined && (
                      <span>
                        Aggregate: {result.totalObtained} / {result.totalMax ?? '-'}
                        {result.percentage ? ` (${result.percentage})` : ''}
                      </span>
                    )}
                  </div>
                  {Array.isArray(result.subjectResults) && result.subjectResults.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                      {result.subjectResults.map((subject: any, subjectIndex: number) => (
                        <div key={subject.id || `${resultIndex}-${subjectIndex}`} className="rounded-lg border border-blue-200 p-2.5">
                          <span className="block font-bold text-slate-800">{subject.subject || 'Subject'}</span>
                          <span className="mt-1 block text-xs font-bold text-blue-800">
                            {subject.obtainedMarks ?? '-'} / {subject.totalMarks ?? '-'}
                          </span>
                          {subject.grade && <span className="text-[10px] text-slate-400">Grade: {subject.grade}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No subject marks recorded.</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {((Array.isArray(psh?.counsellingEntries) && psh.counsellingEntries.length > 0) ||
          (typeof psh?.counsellingReport === 'string' && psh.counsellingReport.trim())) && (
          <Section label="COUNSELLING" title="Counselling Records" tone="purple">
            <div className="space-y-3">
              {Array.isArray(psh?.counsellingEntries) && psh.counsellingEntries.length > 0
                ? psh.counsellingEntries.map((entry: { id?: string; date?: string; details?: string }, index: number) => (
                    <article key={entry.id || index} className="rounded-lg border border-purple-100 bg-white p-3">
                      <p className="text-xs font-semibold text-slate-700">
                        Counselling {index + 1}{entry.date ? ` · ${formatDate(entry.date)}` : ''}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">{entry.details || 'No details recorded.'}</p>
                    </article>
                  ))
                : <p className="whitespace-pre-wrap text-sm text-slate-700">{psh.counsellingReport}</p>}
            </div>
          </Section>
        )}

        {Array.isArray(psh?.followUps) && psh.followUps.length > 0 && (
          <Section label="FOLLOW UP" title="Academic Follow-Up Records" tone="purple">
            <div className="space-y-3">
              {psh.followUps.map((followUp: any, index: number) => (
                <div key={followUp.id || index} className="rounded-lg border border-indigo-100 bg-white p-3">
                  <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    {([
                      ['Name', followUp.name],
                      ['Class', followUp.className],
                      ['Institute Name', followUp.instituteName],
                      ['Passed From', followUp.passedFrom],
                      ['Board Registration Number', followUp.boardRegistrationNumber],
                      ['Roll Number', followUp.rollNumber],
                      ['Passing Year', followUp.passingYear],
                      ['Total Marks', followUp.totalMarks],
                      ['Obtained Marks', followUp.obtainedMarks],
                      ['PSH Registration Number', followUp.pshRegistrationNumber],
                      ['Passed From Which PSH', followUp.passedFromPsh],
                    ] as const).map(([label, value]) => (
                      <div key={label}>
                        <span className="text-slate-400">{label}: </span>
                        <span className="font-semibold text-slate-800">{value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <ChildCollegeProgressSection
          childId={child.id}
          initialEntries={Array.isArray(psh?.collegeProgress) ? psh.collegeProgress : []}
          canManage={
            user.role === Role.INCHARGE ||
            user.role === Role.ACCOUNT_ASSISTANT ||
            user.role === Role.CLERK
          }
        />

        {Array.isArray(psh?.universityProgress) && psh.universityProgress.length > 0 && (
          <Section label="UNIVERSITY PROGRESS" title="Graduate-Submitted University Records" tone="blue">
            <div className="space-y-3">
              {psh.universityProgress.map((entry: Record<string, string>, index: number) => (
                <article key={entry.id || index} className="rounded-lg border border-blue-100 bg-white p-3">
                  <h3 className="text-xs font-bold text-slate-800">{entry.universityName || 'University record'}</h3>
                  <dl className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    {([
                      ['Degree / Program', entry.degreeProgram],
                      ['Major / Subjects', entry.majorSubjects],
                      ['Board / Accrediting Body', entry.boardUniversity],
                      ['Admission Year', entry.admissionYear],
                      ['Registration Number', entry.registrationNumber],
                      ['Roll Number / Student ID', entry.rollNumber],
                      ['Current Status', entry.currentStatus],
                      ['Remarks', entry.remarks],
                    ] as const).map(([label, value]) => value ? (
                      <div key={label}>
                        <dt className="text-slate-400">{label}</dt>
                        <dd className="whitespace-pre-wrap font-semibold text-slate-700">{value}</dd>
                      </div>
                    ) : null)}
                  </dl>
                </article>
              ))}
            </div>
          </Section>
        )}

        {careerProfile && (
          <Section label="PROFESSIONAL CAREER" title="Graduate Career Update" tone="blue">
            <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
              {([
                ['Name', careerProfile.name],
                ['Current status', careerProfile.currentStatus],
                ['School / University', careerProfile.schoolOrUniversity],
                ['Program / Degree', careerProfile.programOrDegree],
                ['Class / Year', careerProfile.currentClassYear],
                ['Employer', careerProfile.employer],
                ['Job title', careerProfile.jobTitle],
                ['Location', careerProfile.location],
              ] as const).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">{value || 'Not provided'}</dd>
                </div>
              ))}
              {careerProfile.notes && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <dt className="text-slate-400">Additional information</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap font-semibold text-slate-800">{careerProfile.notes}</dd>
                </div>
              )}
              {careerProfile.updatedAt && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <dt className="text-slate-400">Last updated</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">{formatDate(new Date(careerProfile.updatedAt))}</dd>
                </div>
              )}
            </dl>
          </Section>
        )}

        {/* 3 & 11: Medical & Health Summary */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Section label="SECTION 3 & 11: HEALTH" title="Medical Summary & Prescription" tone="red">
            {child.medicalRecord ? (
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Blood Group</dt>
                  <dd className="font-bold text-red-800">{child.medicalRecord.bloodGroup || 'Not recorded'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Allergies</dt>
                  <dd className="font-semibold">{child.medicalRecord.allergies || 'None recorded'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Height / Weight</dt>
                  <dd className="font-semibold">
                    {psh?.appearance?.height || (child.medicalRecord.heightCm ? `${child.medicalRecord.heightCm} cm` : '-')} •{' '}
                    {psh?.appearance?.weight || (child.medicalRecord.weightKg ? `${child.medicalRecord.weightKg} kg` : '-')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Age</dt>
                  <dd className="font-semibold">
                    {psh?.appearance?.age
                      ? formatAppearanceAge(psh.appearance.age)
                      : `${calculateAge(child.dateOfBirth)} years`}
                  </dd>
                </div>
                {psh?.healthCare?.checkFrequency && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Check Frequency</dt>
                    <dd className="font-bold text-red-700">{psh.healthCare.checkFrequency}</dd>
                  </div>
                )}
                {psh?.healthCare?.disease && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Disease</dt>
                    <dd className="font-semibold">{psh.healthCare.disease}</dd>
                  </div>
                )}
                {psh?.healthCare?.medicineDetails && (
                  <div className="pt-1 border-t border-red-100">
                    <dt className="text-slate-500">Routine Medicine</dt>
                    <dd className="font-medium text-slate-800">{psh.healthCare.medicineDetails}</dd>
                  </div>
                )}
                {psh?.healthCare?.antibioticMedicine && (
                  <div className="p-2 rounded bg-amber-100/80 border border-amber-300 text-[11px] text-amber-900 mt-2">
                    <strong>Separate Antibiotic Track:</strong> {psh.healthCare.antibioticMedicine}
                  </div>
                )}
                {psh?.healthCare?.doctorName && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Doctor Name</dt>
                    <dd className="font-semibold">{psh.healthCare.doctorName}</dd>
                  </div>
                )}
                {psh?.healthCare?.hospitalName && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Hospital Name</dt>
                    <dd className="font-semibold">{psh.healthCare.hospitalName}</dd>
                  </div>
                )}
                {psh?.healthCare?.hospitalType && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Hospital Type</dt>
                    <dd className="font-semibold">{psh.healthCare.hospitalType}</dd>
                  </div>
                )}
                {psh?.healthCare?.doctorContactNo && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Doctor Contact No.</dt>
                    <dd className="font-semibold">{psh.healthCare.doctorContactNo}</dd>
                  </div>
                )}
                {psh?.healthCare?.additionalEntries?.map((entry: any, index: number) => (
                  <div key={`health-${index}`} className="pt-2 border-t border-red-100 space-y-1">
                    <strong className="text-red-800">Additional Medical Follow-up {index + 1}</strong>
                    {entry.checkFrequency && <div>Check Frequency: {entry.checkFrequency}</div>}
                    {entry.disease && <div>Disease: {entry.disease}</div>}
                    {entry.medicineDetails && <div>Medicine: {entry.medicineDetails}</div>}
                    {entry.antibioticMedicine && <div>Antibiotic Medicine: {entry.antibioticMedicine}</div>}
                    {entry.doctorName && <div>Doctor: {entry.doctorName}</div>}
                    {entry.hospitalName && <div>Hospital: {entry.hospitalName}</div>}
                    {entry.hospitalType && <div>Hospital Type: {entry.hospitalType}</div>}
                    {entry.doctorContactNo && <div>Doctor Contact No.: {entry.doctorContactNo}</div>}
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-xs text-slate-500">No medical profile recorded.</p>
            )}
            <Link href={`/medical?childId=${child.id}`} className="mt-4 inline-block text-xs font-bold text-red-700">
              Open Medical Module →
            </Link>
          </Section>

          <Section label="SECTION 12: REPORT" title="Behavior & Islamic Evaluation" tone="purple">
            <div className="space-y-2 text-xs">
              {psh?.reports ? (
                <>
                  <div>
                    <strong className="text-purple-900 block">Discipline & Conduct:</strong>
                    <p className="text-slate-700 text-[11px]">{psh.reports.discipline || 'Compliant with rules'}</p>
                  </div>
                  <div>
                    <strong className="text-purple-900 block">Behavior & Engagement:</strong>
                    <p className="text-slate-700 text-[11px]">{psh.reports.behavior || 'Sociable & polite'}</p>
                  </div>
                  <div>
                    <strong className="text-purple-900 block">Islamic & Moral Character:</strong>
                    <p className="text-slate-700 text-[11px]">{psh.reports.islamic || 'Regular in prayers & Quran'}</p>
                  </div>
                  {psh.reports.additionalEntries?.map((entry: any, index: number) => (
                    <div key={`report-${index}`} className="pt-2 border-t border-purple-100">
                      <strong className="text-purple-900 block">
                        Additional Report / Complaint {index + 1}{entry.category ? ` — ${entry.category}` : ''}
                      </strong>
                      {entry.details && <p className="text-slate-700 text-[11px]">{entry.details}</p>}
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-xs text-slate-500">No behavioral evaluation report recorded.</p>
              )}
            </div>
          </Section>

          <Section label="SECTION 13: INTEREST" title="Area of Interest – Child" tone="amber">
            <div className="space-y-2 text-xs">
              {areaOfInterestHistory.length > 0 ? (
                areaOfInterestHistory.map((entry: any, yearIndex: number) => (
                  <div key={`${entry.year || 'year'}-${yearIndex}`} className="rounded-lg border border-amber-100 bg-white p-3">
                    <p className="mb-1 font-bold text-amber-900">
                      {entry.year || getHistoryYear(child.updatedAt)}
                    </p>
                    {entry.areaOfInterest && (
                      <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-800">{entry.areaOfInterest}</p>
                    )}
                    {(entry.entries || entry.areaOfInterestEntries || []).map((interest: any, index: number) => (
                      <p key={interest.id || `${yearIndex}-${index}`} className="mt-1 whitespace-pre-wrap font-medium leading-relaxed text-slate-800">
                        {interest.details}
                      </p>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No specific hobbies or career aspirations recorded.</p>
              )}
            </div>
          </Section>
        </div>

        {/* Complaints Section */}
        <ChildComplaintsSection
          childId={child.id}
          canManage={user.role === Role.INCHARGE || user.role === Role.ACCOUNT_ASSISTANT}
        />

        {/* Section 14: Attachments & Documents Vault */}
        <ChildDocumentsSection
          childId={child.id}
          canManage={
            user.role === Role.INCHARGE ||
            user.role === Role.ACCOUNT_ASSISTANT ||
            user.role === Role.CLERK
          }
        />
      </div>
    </AppLayout>
  );
}
