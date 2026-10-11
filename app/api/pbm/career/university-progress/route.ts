import { NextResponse } from 'next/server';
import { verifyPbmChildSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

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

export async function GET() {
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    return NextResponse.json({ success: true, entries: graduate.child.universityProgress });
  } catch (error) {
    console.error('Load PBM university progress error:', error);
    return NextResponse.json({ error: 'Unable to load university progress.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter valid university details.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    if (fields.some((field) => typeof input[field] !== 'string' || input[field].length > 1000)) {
      return NextResponse.json({ error: 'Please check your university fields; each must be under 1,000 characters.' }, { status: 400 });
    }
    const data = Object.fromEntries(
      fields.map((field) => [field, typeof input[field] === 'string' ? (input[field] as string).trim() : ''])
    ) as Record<(typeof fields)[number], string>;
    if (!data.universityName || !data.degreeProgram || fields.some((field) => data[field].length > 1000)) {
      return NextResponse.json({ error: 'University and degree / program are required; each field must be under 1,000 characters.' }, { status: 400 });
    }
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const entry = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
    const client = await getPbmPrismaReady();
    const updated = await client.$executeRaw`
      UPDATE "PbmChildRecord"
      SET "universityProgress" = COALESCE("universityProgress", '[]'::jsonb) || ${JSON.stringify([entry])}::jsonb,
          "updatedAt" = NOW()
      WHERE id = ${graduate.child.id}
        AND "careerUsername" = ${graduate.session.username}
    `;
    if (updated !== 1) return NextResponse.json({ error: 'Your session is no longer valid. Please sign in again.' }, { status: 401 });
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error('Save PBM university progress error:', error);
    return NextResponse.json({ error: 'Unable to save university progress.' }, { status: 500 });
  }
}
