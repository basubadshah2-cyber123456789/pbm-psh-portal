import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getProfessionalCareerData,
  parseChildDossier,
  PROFESSIONAL_CAREER_COOKIE,
  verifyProfessionalCareerSession,
  type ProfessionalCareerProfile,
} from '@/lib/professional-career';
import { prisma } from '@/lib/prisma';

const profileFields = [
  'name',
  'currentStatus',
  'schoolOrUniversity',
  'programOrDegree',
  'currentClassYear',
  'employer',
  'jobTitle',
  'location',
  'notes',
] as const;

async function getGraduate() {
  const token = (await cookies()).get(PROFESSIONAL_CAREER_COOKIE)?.value;
  const session = token ? verifyProfessionalCareerSession(token) : null;
  if (!session) return null;

  const child = await prisma.child.findUnique({
    where: { id: session.childId },
    select: { id: true, fullName: true, notes: true },
  });
  if (!child) return null;

  const careerData = getProfessionalCareerData(parseChildDossier(child.notes));
  if (careerData.account?.username !== session.username) return null;
  return { child, careerData };
}

export async function GET() {
  try {
    const graduate = await getGraduate();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    return NextResponse.json({
      success: true,
      name: graduate.careerData.profile?.name || graduate.child.fullName,
      profile: graduate.careerData.profile || null,
    });
  } catch (error) {
    console.error('Load professional career profile error:', error);
    return NextResponse.json({ error: 'Unable to load your profile.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid profile data.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const values: Record<(typeof profileFields)[number], string> = {
      name: '',
      currentStatus: '',
      schoolOrUniversity: '',
      programOrDegree: '',
      currentClassYear: '',
      employer: '',
      jobTitle: '',
      location: '',
      notes: '',
    };
    for (const field of profileFields) {
      const value = input[field];
      if (typeof value !== 'string' || value.length > 1000) {
        return NextResponse.json({ error: 'Please check your profile fields; each must be under 1,000 characters.' }, { status: 400 });
      }
      values[field] = value.trim();
    }
    if (!values.name || !values.currentStatus) {
      return NextResponse.json({ error: 'Name and current status are required.' }, { status: 400 });
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const graduate = await getGraduate();
      if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

      const profile: ProfessionalCareerProfile = {
        ...values,
        updatedAt: new Date().toISOString(),
      };
      const dossier = parseChildDossier(graduate.child.notes);
      const nextDossier = {
        ...dossier,
        professionalCareer: { ...graduate.careerData, profile },
      };
      const result = await prisma.child.updateMany({
        where: { id: graduate.child.id, notes: graduate.child.notes },
        data: { notes: JSON.stringify(nextDossier) },
      });
      if (result.count === 1) {
        return NextResponse.json({ success: true, profile });
      }
    }

    return NextResponse.json(
      { error: 'Your dossier changed while saving. Please try again.' },
      { status: 409 }
    );
  } catch (error) {
    console.error('Save professional career profile error:', error);
    return NextResponse.json({ error: 'Unable to save your profile.' }, { status: 500 });
  }
}
