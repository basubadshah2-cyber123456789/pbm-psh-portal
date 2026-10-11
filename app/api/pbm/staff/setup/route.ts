import { randomBytes, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  assertPbmSessionConfiguration,
  createPbmPasswordHash,
  PBM_SESSION_TTL_SECONDS,
  signPbmSession,
  PBM_STAFF_COOKIE,
} from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

function secretMatches(provided: string, expected: string): boolean {
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes);
}

export async function GET() {
  try {
    const setupKeyConfigured = Boolean(
      process.env.PBM_SETUP_KEY?.trim() &&
      process.env.PBM_SETUP_KEY.trim().length >= 32
    );
    if (!setupKeyConfigured) return NextResponse.json({ success: true, available: false });

    const client = await getPbmPrismaReady();
    const rows = await client.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) AS count FROM "PbmStaffUser"
    `;
    return NextResponse.json({ success: true, available: Number(rows[0]?.count || 0) === 0 });
  } catch (error) {
    console.error('Check PBM first-time setup availability error:', error);
    return NextResponse.json({ error: 'Unable to check setup status.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const setupKey = process.env.PBM_SETUP_KEY?.trim();
    if (!setupKey || setupKey.length < 32) {
      return NextResponse.json({ error: 'Secure first-time setup is not configured.' }, { status: 503 });
    }
    assertPbmSessionConfiguration();

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter your setup key and administrator details.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const key = typeof input.setupKey === 'string' ? input.setupKey : '';
    const username = typeof input.username === 'string' ? input.username.trim().toLowerCase() : '';
    const displayName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
    const password = typeof input.password === 'string' ? input.password : '';

    if (!secretMatches(key, setupKey)) {
      return NextResponse.json({ error: 'Invalid setup key.' }, { status: 401 });
    }
    if (!/^[a-z0-9][a-z0-9._-]{3,31}$/.test(username)) {
      return NextResponse.json({ error: 'Username must be 4–32 characters using letters, numbers, dots, underscores, or hyphens.' }, { status: 400 });
    }
    if (!displayName || displayName.length > 120) {
      return NextResponse.json({ error: 'Enter your name (up to 120 characters).' }, { status: 400 });
    }
    if (password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 12 and 128 characters.' }, { status: 400 });
    }

    const client = await getPbmPrismaReady();
    const passwordHash = await createPbmPasswordHash(password);
    const admin = await client.$transaction(async (transaction) => {
      await transaction.$queryRaw<Array<{ acquired: boolean }>>`
        SELECT pg_advisory_xact_lock(741238910247) IS NOT NULL AS acquired
      `;
      const existing = await transaction.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) AS count FROM "PbmStaffUser"
      `;
      if (Number(existing[0]?.count || 0) > 0) return null;

      const rows = await transaction.$queryRaw<Array<{
        id: string;
        username: string;
        displayName: string;
        role: 'ADMIN';
      }>>`
        INSERT INTO "PbmStaffUser" (id, username, "displayName", "passwordHash", role)
        VALUES (${randomBytes(16).toString('hex')}, ${username}, ${displayName}, ${passwordHash}, 'ADMIN')
        RETURNING id, username, "displayName", role
      `;
      return rows[0] || null;
    });

    if (!admin) {
      return NextResponse.json({ error: 'Initial setup has already been completed. Ask a PBM administrator to create your account.' }, { status: 409 });
    }

    const response = NextResponse.json({ success: true, staff: admin });
    response.cookies.set(PBM_STAFF_COOKIE, signPbmSession(admin, 'staff'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: PBM_SESSION_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    console.error('PBM initial staff setup error:', error);
    return NextResponse.json({ error: 'Unable to complete staff setup.' }, { status: 500 });
  }
}
