import { NextResponse } from 'next/server';
import {
  PBM_CHILD_COOKIE,
  PBM_SESSION_TTL_SECONDS,
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
    const rows = await client.$queryRaw<Array<{
      id: string;
      careerUsername: string;
      careerPasswordHash: string;
    }>>`
      SELECT id, "careerUsername", "careerPasswordHash"
      FROM "PbmChildRecord"
      WHERE "careerUsername" = ${username} AND "careerPasswordHash" IS NOT NULL
      LIMIT 1
    `;
    const child = rows[0];
    if (!child || !(await verifyPbmPassword(password, child.careerPasswordHash))) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }
    const response = NextResponse.json({ success: true, nextPath: '/professional-career/profile' });
    response.cookies.set(PBM_CHILD_COOKIE, signPbmSession({
      childId: child.id,
      username: child.careerUsername,
    }, 'child'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: PBM_SESSION_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    console.error('PBM graduate login error:', error);
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
