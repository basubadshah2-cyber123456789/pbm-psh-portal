import { NextResponse } from 'next/server';
import {
  createPbmPasswordHash,
  getPbmStaffSession,
} from '@/lib/pbm-auth';
import { getPbmPrismaReady, isPbmUniqueViolation } from '@/lib/pbm-db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const { id } = await params;
    const client = await getPbmPrismaReady();
    const rows = await client.$queryRaw<Array<{
      id: string;
      fullName: string;
      careerUsername: string | null;
      updatedAt: Date;
    }>>`
      SELECT id, "fullName", "careerUsername", "updatedAt"
      FROM "PbmChildRecord" WHERE id = ${id} LIMIT 1
    `;
    const child = rows[0];
    if (!child) return NextResponse.json({ error: 'Child record not found.' }, { status: 404 });
    return NextResponse.json({
      success: true,
      child: { id: child.id, fullName: child.fullName },
      account: child.careerUsername ? { username: child.careerUsername, createdAt: child.updatedAt } : null,
    });
  } catch (error) {
    console.error('Load PBM child career account error:', error);
    return NextResponse.json({ error: 'Unable to load career account.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const username = typeof input.username === 'string' ? input.username.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    if (!/^[a-z0-9][a-z0-9._-]{3,31}$/.test(username)) {
      return NextResponse.json({ error: 'Username must be 4–32 characters and use letters, numbers, dots, underscores, or hyphens.' }, { status: 400 });
    }
    if (password.length < 10 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 10 and 128 characters.' }, { status: 400 });
    }

    const { id } = await params;
    const passwordHash = await createPbmPasswordHash(password);
    const client = await getPbmPrismaReady();
    const rows = await client.$queryRaw<Array<{ id: string; fullName: string; careerUsername: string }>>`
      UPDATE "PbmChildRecord"
      SET "careerUsername" = ${username},
          "careerPasswordHash" = ${passwordHash},
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id, "fullName", "careerUsername"
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Child record not found.' }, { status: 404 });
    return NextResponse.json({
      success: true,
      account: { username: rows[0].careerUsername, createdAt: new Date().toISOString() },
      loginPath: '/professional-career',
    });
  } catch (error) {
    if (isPbmUniqueViolation(error)) {
      return NextResponse.json({ error: 'That username is already assigned to another child.' }, { status: 409 });
    }
    console.error('Create PBM child career account error:', error);
    return NextResponse.json({ error: 'Unable to create the child career account.' }, { status: 500 });
  }
}
