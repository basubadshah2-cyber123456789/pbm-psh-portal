import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { verifyPbmChildSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

const allowedWorkStatuses = new Set([
  'Employed',
  'Self-employed',
  'Business owner',
  'Freelancer',
  'Student',
  'Seeking employment',
  'Not currently working',
]);
const allowedEmploymentTypes = new Set(['Government', 'Private', 'NGO / Non-profit', 'Self-employed', 'Other']);
const allowedMaritalStatuses = new Set(['Single', 'Married', 'Engaged', 'Separated', 'Widowed', 'Prefer not to say']);
const fields = [
  'studentName',
  'fatherName',
  'pshRegistrationNumber',
  'workStatus',
  'jobTitle',
  'employmentType',
  'employer',
  'workCity',
  'workStartDate',
  'highestQualification',
  'skills',
  'maritalStatus',
  'marriageYear',
  'monthlyIncome',
  'achievements',
  'careerGoals',
] as const;

type ProfessionalLifeFields = Record<(typeof fields)[number], string>;

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string' || value.length > maxLength) return null;
  return value.trim();
}

function validYear(value: string): boolean {
  return !value || (/^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= 2100);
}

export async function GET() {
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const storedProfile = graduate.child.careerProfile;
    const profile = storedProfile && typeof storedProfile === 'object' && !Array.isArray(storedProfile)
      ? storedProfile as Record<string, unknown>
      : {};
    const entries = Array.isArray(profile.professionalLifeEntries) ? profile.professionalLifeEntries : [];
    return NextResponse.json({
      success: true,
      student: { fullName: graduate.child.fullName },
      entries,
    });
  } catch (error) {
    console.error('Load PBM professional life history error:', error);
    return NextResponse.json({ error: 'Unable to load your professional life history.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter valid professional life details.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const limits: Record<(typeof fields)[number], number> = {
      studentName: 200,
      fatherName: 200,
      pshRegistrationNumber: 100,
      workStatus: 40,
      jobTitle: 150,
      employmentType: 40,
      employer: 200,
      workCity: 100,
      workStartDate: 10,
      highestQualification: 200,
      skills: 1000,
      maritalStatus: 30,
      marriageYear: 4,
      monthlyIncome: 12,
      achievements: 1000,
      careerGoals: 1000,
    };
    const profile = {} as ProfessionalLifeFields;
    for (const field of fields) {
      const value = cleanString(input[field], limits[field]);
      if (value === null) {
        return NextResponse.json({ error: 'Please check your details; one or more fields are invalid or too long.' }, { status: 400 });
      }
      profile[field] = value;
    }

    if (!profile.studentName || !profile.fatherName || !profile.pshRegistrationNumber || !profile.workStatus || !profile.maritalStatus) {
      return NextResponse.json({ error: 'Student name, father name, PSH Registration No., work status, and marital status are required.' }, { status: 400 });
    }
    if (!allowedWorkStatuses.has(profile.workStatus) || !allowedMaritalStatuses.has(profile.maritalStatus)) {
      return NextResponse.json({ error: 'Select a valid work status and marital status.' }, { status: 400 });
    }
    if (profile.employmentType && !allowedEmploymentTypes.has(profile.employmentType)) {
      return NextResponse.json({ error: 'Select a valid employment sector.' }, { status: 400 });
    }
    const hasJob = ['Employed', 'Self-employed', 'Business owner', 'Freelancer'].includes(profile.workStatus);
    if (hasJob && (!profile.jobTitle || !profile.employmentType)) {
      return NextResponse.json({ error: 'Enter your job title or business activity and select the employment sector.' }, { status: 400 });
    }
    if (!validYear(profile.marriageYear)) {
      return NextResponse.json({ error: 'Enter a valid marriage year.' }, { status: 400 });
    }
    if (profile.workStartDate && !/^\d{4}-\d{2}-\d{2}$/.test(profile.workStartDate)) {
      return NextResponse.json({ error: 'Enter a valid work start date.' }, { status: 400 });
    }
    if (profile.monthlyIncome && (!/^\d{1,9}(\.\d{1,2})?$/.test(profile.monthlyIncome) || Number(profile.monthlyIncome) < 0)) {
      return NextResponse.json({ error: 'Enter a valid optional monthly income.' }, { status: 400 });
    }
    if (profile.maritalStatus !== 'Married' && profile.marriageYear) {
      return NextResponse.json({ error: 'Marriage year can only be provided when marital status is Married.' }, { status: 400 });
    }

    const entry = { id: randomUUID(), ...profile, createdAt: new Date().toISOString() };
    const client = await getPbmPrismaReady();
    const saved = await client.$transaction(async (transaction) => {
      const rows = await transaction.$queryRaw<Array<{ careerProfile: unknown }>>`
        SELECT "careerProfile"
        FROM "PbmChildRecord"
        WHERE id = ${graduate.child.id} AND "careerUsername" = ${graduate.session.username}
        FOR UPDATE
      `;
      if (!rows[0]) return false;

      const current = rows[0].careerProfile && typeof rows[0].careerProfile === 'object' && !Array.isArray(rows[0].careerProfile)
        ? rows[0].careerProfile as Record<string, unknown>
        : {};
      const existingEntries = Array.isArray(current.professionalLifeEntries)
        ? current.professionalLifeEntries
        : [];
      await transaction.$executeRaw`
        UPDATE "PbmChildRecord"
        SET "careerProfile" = ${JSON.stringify({
          ...current,
          professionalLifeEntries: [...existingEntries, entry],
        })}::jsonb,
            "updatedAt" = NOW()
        WHERE id = ${graduate.child.id}
          AND "careerUsername" = ${graduate.session.username}
      `;
      return true;
    });

    if (!saved) return NextResponse.json({ error: 'Your session is no longer valid. Please sign in again.' }, { status: 401 });
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error('Save PBM professional life history error:', error);
    return NextResponse.json({ error: 'Unable to save your professional life details.' }, { status: 500 });
  }
}
