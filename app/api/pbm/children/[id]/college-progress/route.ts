import { NextResponse } from 'next/server';
import { getPbmStaffSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

const fields = [
  'collegeName',
  'classProgram',
  'groupSubjects',
  'boardUniversity',
  'admissionYear',
  'registrationNumber',
  'rollNumber',
  'currentStatus',
  'remarks',
] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter valid college progress details.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const entryData = Object.fromEntries(
      fields.map((field) => [field, typeof input[field] === 'string' ? (input[field] as string).trim() : ''])
    ) as Record<(typeof fields)[number], string>;
    if (!entryData.collegeName || !entryData.classProgram || fields.some((field) => entryData[field].length > 1000)) {
      return NextResponse.json({ error: 'College and program are required; each field must be under 1,000 characters.' }, { status: 400 });
    }

    const { id } = await params;
    const client = await getPbmPrismaReady();
    const entry = { id: crypto.randomUUID(), ...entryData, createdAt: new Date().toISOString() };
    const updated = await client.$queryRaw<Array<{ collegeProgress: unknown }>>`
      UPDATE "PbmChildRecord"
      SET "collegeProgress" = COALESCE("collegeProgress", '[]'::jsonb) || ${JSON.stringify([entry])}::jsonb,
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING "collegeProgress"
    `;
    if (!updated[0]) return NextResponse.json({ error: 'Child record not found.' }, { status: 404 });
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error('Save PBM college progress error:', error);
    return NextResponse.json({ error: 'Unable to save college progress.' }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const { id } = await params;
    const client = await getPbmPrismaReady();
    const rows = await client.$queryRaw<Array<{ collegeProgress: unknown }>>`
      SELECT "collegeProgress" FROM "PbmChildRecord" WHERE id = ${id} LIMIT 1
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Child record not found.' }, { status: 404 });
    return NextResponse.json({ success: true, entries: rows[0].collegeProgress });
  } catch (error) {
    console.error('Load PBM college progress error:', error);
    return NextResponse.json({ error: 'Unable to load college progress.' }, { status: 500 });
  }
}
