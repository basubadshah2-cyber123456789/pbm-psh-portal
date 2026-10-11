import { NextResponse } from 'next/server';
import { verifyPbmChildSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

const fields = [
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

export async function GET() {
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    return NextResponse.json({
      success: true,
      name: graduate.child.fullName,
      profile: graduate.child.careerProfile || null,
    });
  } catch (error) {
    console.error('Load PBM career profile error:', error);
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
    if (fields.some((field) => typeof input[field] !== 'string' || input[field].length > 1000)) {
      return NextResponse.json({ error: 'Please check your profile fields; each must be under 1,000 characters.' }, { status: 400 });
    }
    const profile = Object.fromEntries(
      fields.map((field) => [field, typeof input[field] === 'string' ? (input[field] as string).trim() : ''])
    ) as Record<(typeof fields)[number], string>;
    if (!profile.name || !profile.currentStatus || fields.some((field) => profile[field].length > 1000)) {
      return NextResponse.json({ error: 'Name and current status are required; each field must be under 1,000 characters.' }, { status: 400 });
    }
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    const savedProfile = { ...profile, updatedAt: new Date().toISOString() };
    const client = await getPbmPrismaReady();
    const updated = await client.$executeRaw`
      UPDATE "PbmChildRecord"
      SET "careerProfile" = ${JSON.stringify(savedProfile)}::jsonb,
          "updatedAt" = NOW()
      WHERE id = ${graduate.child.id}
        AND "careerUsername" = ${graduate.session.username}
    `;
    if (updated !== 1) return NextResponse.json({ error: 'Your session is no longer valid. Please sign in again.' }, { status: 401 });
    return NextResponse.json({ success: true, profile: savedProfile });
  } catch (error) {
    console.error('Save PBM career profile error:', error);
    return NextResponse.json({ error: 'Unable to save your profile.' }, { status: 500 });
  }
}
