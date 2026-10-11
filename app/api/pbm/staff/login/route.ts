import { NextResponse } from 'next/server';
import {
  PBM_SESSION_TTL_SECONDS,
  PBM_STAFF_COOKIE,
  signPbmSession,
  verifyPbmPassword,
} from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const username = typeof input.username === 'string' ? input.username.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    if (!username || !password) {
      return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 });
    }

    const client = await getPbmPrismaReady();
    const users = await client.$queryRaw<Array<{
      id: string;
      username: string;
      displayName: string;
      passwordHash: string;
      role: 'ADMIN' | 'STAFF';
    }>>`
      SELECT id, username, "displayName", "passwordHash", role
      FROM "PbmStaffUser"
      WHERE username = ${username} AND active = TRUE
      LIMIT 1
    `;
    const user = users[0];
    if (!user || !(await verifyPbmPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const { passwordHash: _passwordHash, ...session } = user;
    const response = NextResponse.json({ success: true, staff: session });
    response.cookies.set(PBM_STAFF_COOKIE, signPbmSession(session, 'staff'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: PBM_SESSION_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    console.error('PBM staff login error:', error);
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
