import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createPbmPasswordHash, getPbmStaffSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady, isPbmUniqueViolation } from '@/lib/pbm-db';

export async function GET() {
  try {
    const current = await getPbmStaffSession();
    if (!current) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    if (current.role !== 'ADMIN') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });

    const client = await getPbmPrismaReady();
    const users = await client.$queryRaw<Array<{
      id: string;
      username: string;
      displayName: string;
      role: 'ADMIN' | 'STAFF';
      active: boolean;
      createdAt: Date;
    }>>`
      SELECT id, username, "displayName", role, active, "createdAt"
      FROM "PbmStaffUser"
      ORDER BY "createdAt" ASC
    `;
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('List PBM staff accounts error:', error);
    return NextResponse.json({ error: 'Unable to load staff accounts.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const current = await getPbmStaffSession();
    if (!current) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    if (current.role !== 'ADMIN') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter valid staff details.' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const username = typeof input.username === 'string' ? input.username.trim().toLowerCase() : '';
    const displayName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    if (!/^[a-z0-9][a-z0-9._-]{3,31}$/.test(username)) {
      return NextResponse.json({ error: 'Username must be 4–32 characters using letters, numbers, dots, underscores, or hyphens.' }, { status: 400 });
    }
    if (!displayName || displayName.length > 120) {
      return NextResponse.json({ error: 'Enter the staff member’s name (up to 120 characters).' }, { status: 400 });
    }
    if (password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 12 and 128 characters.' }, { status: 400 });
    }
    if (input.role !== undefined && input.role !== 'ADMIN' && input.role !== 'STAFF') {
      return NextResponse.json({ error: 'Choose a valid staff account type.' }, { status: 400 });
    }
    const requestedRole = input.role === 'ADMIN' ? 'ADMIN' : 'STAFF';
    const passwordHash = await createPbmPasswordHash(password);
    const client = await getPbmPrismaReady();
    const users = await client.$queryRaw<Array<{
      id: string;
      username: string;
      displayName: string;
      role: 'ADMIN' | 'STAFF';
      active: boolean;
      createdAt: Date;
    }>>`
      INSERT INTO "PbmStaffUser" (id, username, "displayName", "passwordHash", role)
      VALUES (${randomBytes(16).toString('hex')}, ${username}, ${displayName}, ${passwordHash}, ${requestedRole})
      RETURNING id, username, "displayName", role, active, "createdAt"
    `;
    if (!users[0]) throw new Error('PBM staff account insert returned no row.');
    return NextResponse.json({ success: true, user: users[0] }, { status: 201 });
  } catch (error) {
    if (isPbmUniqueViolation(error)) {
      return NextResponse.json({ error: 'That staff username is already in use.' }, { status: 409 });
    }
    console.error('Create PBM staff account error:', error);
    return NextResponse.json({ error: 'Unable to create staff account.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const current = await getPbmStaffSession();
    if (!current) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    if (current.role !== 'ADMIN') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter valid account details.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const id = typeof input.id === 'string' ? input.id : '';
    const active = input.active;
    if (!id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Staff account and active status are required.' }, { status: 400 });
    }
    if (!active && id === current.id) {
      return NextResponse.json({ error: 'You cannot disable your own account.' }, { status: 400 });
    }

    const client = await getPbmPrismaReady();
    const user = await client.$transaction(async (transaction) => {
      await transaction.$queryRaw<Array<{ acquired: boolean }>>`
        SELECT pg_advisory_xact_lock(741238910247) IS NOT NULL AS acquired
      `;
      const targets = await transaction.$queryRaw<Array<{ role: 'ADMIN' | 'STAFF' }>>`
        SELECT role FROM "PbmStaffUser" WHERE id = ${id} LIMIT 1
      `;
      if (!targets[0]) return { status: 'missing' as const };
      if (!active && targets[0].role === 'ADMIN') {
        const admins = await transaction.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) AS count FROM "PbmStaffUser" WHERE role = 'ADMIN' AND active = TRUE
        `;
        if (Number(admins[0]?.count || 0) <= 1) return { status: 'last-admin' as const };
      }
      const changed = await transaction.$queryRaw<Array<{
        id: string;
        username: string;
        displayName: string;
        role: 'ADMIN' | 'STAFF';
        active: boolean;
        createdAt: Date;
      }>>`
        UPDATE "PbmStaffUser" SET active = ${active}
        WHERE id = ${id}
        RETURNING id, username, "displayName", role, active, "createdAt"
      `;
      return changed[0] ? { status: 'updated' as const, user: changed[0] } : { status: 'missing' as const };
    });

    if (user.status === 'missing') return NextResponse.json({ error: 'Staff account not found.' }, { status: 404 });
    if (user.status === 'last-admin') return NextResponse.json({ error: 'At least one active PBM administrator is required.' }, { status: 409 });
    return NextResponse.json({ success: true, user: user.user });
  } catch (error) {
    console.error('Update PBM staff account error:', error);
    return NextResponse.json({ error: 'Unable to update staff account.' }, { status: 500 });
  }
}
