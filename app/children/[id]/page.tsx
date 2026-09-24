import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { requireModuleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/layout/AppLayout';
import { formatDate, parsePshNotes } from '@/lib/utils';
import { childPhotoDisplaySrc } from '@/lib/child-photo';
import { ChildComplaintsSection } from '@/components/children/ChildComplaintsSection';
import { ChildDocumentsSection } from '@/components/children/ChildDocumentsSection';
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
        </section>

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
                  {psh?.basicInfo?.isSponsored === 'Yes'
                    ? `Sponsored (Rs. ${psh.basicInfo.sponsorshipAmount || '15,000'}/mo)`
                    : 'Institutional Support'}
                </dd>
              </div>
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

        {/* 4, 5, 6: Father, Mother & Guardian Info */}
        {psh && (psh.fatherInfo || psh.motherInfo || psh.guardianInfo) && (
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
                    <dt className="text-slate-400">Native Location</dt>
                    <dd className="font-semibold">{psh.motherInfo.address || `${psh.motherInfo.city}, ${psh.motherInfo.province}`}</dd>
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
                    <dt className="text-slate-400">Full Address</dt>
                    <dd className="font-semibold">{psh.guardianInfo.address || 'N/A'}</dd>
                  </div>
                </dl>
              </Section>
            )}
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
                      <div className="text-[10px] text-slate-400 mt-1">Status: {s.maritalStatus || 'Single'}</div>
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
                      <div className="text-[10px] text-slate-400 mt-1">Contact: {w.contact || 'N/A'} • {w.address || 'Multan'}</div>
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
        {psh?.resultInfo?.subjectResults?.length > 0 && (
          <Section label="SECTION 10: RESULT INFO" title={`Academic Record: ${psh.resultInfo.examType} (${psh.resultInfo.class})`} tone="blue">
            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-blue-100/60 rounded-lg font-bold text-blue-900">
                <span>School: {psh.resultInfo.schoolName || 'Govt School'}</span>
                <span>Date: {formatDate(psh.resultInfo.examDate)}</span>
                <span>Aggregate: {psh.resultInfo.totalObtained} / {psh.resultInfo.totalMax} ({psh.resultInfo.percentage})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {psh.resultInfo.subjectResults.map((sr: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white border border-blue-200">
                    <span className="block font-bold text-slate-800">{sr.subject}</span>
                    <span className="text-xs font-bold text-blue-800 mt-1 block">
                      {sr.obtainedMarks} / {sr.totalMarks}
                    </span>
                    <span className="text-[10px] text-slate-400">Grade: {sr.grade || 'Pass'}</span>
                  </div>
                ))}
              </div>
            </div>
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
                    {child.medicalRecord.heightCm ? `${child.medicalRecord.heightCm} cm` : '-'} •{' '}
                    {child.medicalRecord.weightKg ? `${child.medicalRecord.weightKg} kg` : '-'}
                  </dd>
                </div>
                {psh?.healthCare?.checkFrequency && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Check Frequency</dt>
                    <dd className="font-bold text-red-700">{psh.healthCare.checkFrequency}</dd>
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
                </>
              ) : (
                <p className="text-xs text-slate-500">No behavioral evaluation report recorded.</p>
              )}
            </div>
          </Section>

          <Section label="SECTION 13: INTEREST" title="Area of Interest – Child" tone="amber">
            <div className="space-y-2 text-xs">
              {psh?.areaOfInterest ? (
                <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                  {psh.areaOfInterest}
                </p>
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
