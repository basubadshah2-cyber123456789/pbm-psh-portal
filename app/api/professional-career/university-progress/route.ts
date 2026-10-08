import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getProfessionalCareerData,
  parseChildDossier,
  PROFESSIONAL_CAREER_COOKIE,
  verifyProfessionalCareerSession,
} from '@/lib/professional-career';
import { prisma } from '@/lib/prisma';

const fields = [
  'universityName',
  'degreeProgram',
  'majorSubjects',
  'boardUniversity',
  'admissionYear',
  'registrationNumber',
  'rollNumber',
  'currentStatus',
  'remarks',
] as const;

async function getGraduate() {
  const token = (await cookies()).get(PROFESSIONAL_CAREER_COOKIE)?.value;
  const session = token ? verifyProfessionalCareerSession(token) : null;
  if (!session) return null;

  const child = await prisma.child.findUnique({
    where: { id: session.childId },
    select: { id: true, notes: true },
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

    const dossier = parseChildDossier(graduate.child.notes);
    const entries = Array.isArray(dossier.universityProgress) ? dossier.universityProgress : [];
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Load university progress error:', error);
    return NextResponse.json({ error: 'Unable to load university progress.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter valid university details.' }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const entryData = Object.fromEntries(
      fields.map((field) => {
        const value = payload[field];
        return [field, typeof value === 'string' ? value.trim() : ''];
      })
    ) as Record<(typeof fields)[number], string>;
    if (!entryData.universityName || !entryData.degreeProgram) {
      return NextResponse.json({ error: 'University and degree / program are required.' }, { status: 400 });
    }
    if (fields.some((field) => entryData[field].length > 1000)) {
      return NextResponse.json({ error: 'Each field must be under 1,000 characters.' }, { status: 400 });
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const graduate = await getGraduate();
      if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

      const dossier = parseChildDossier(graduate.child.notes);
      const currentEntries = Array.isArray(dossier.universityProgress) ? dossier.universityProgress : [];
      const entry = { id: crypto.randomUUID(), ...entryData, createdAt: new Date().toISOString() };
      const result = await prisma.child.updateMany({
        where: { id: graduate.child.id, notes: graduate.child.notes },
        data: { notes: JSON.stringify({ ...dossier, universityProgress: [...currentEntries, entry] }) },
      });
      if (result.count === 1) {
        return NextResponse.json({ success: true, entry }, { status: 201 });
      }
    }

    return NextResponse.json(
      { error: 'Your record changed while saving. Please try again.' },
      { status: 409 }
    );
  } catch (error) {
    console.error('Save university progress error:', error);
    return NextResponse.json({ error: 'Unable to save university progress.' }, { status: 500 });
  }
}
