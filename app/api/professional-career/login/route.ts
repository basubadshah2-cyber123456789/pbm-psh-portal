import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  getProfessionalCareerData,
  parseChildDossier,
  PROFESSIONAL_CAREER_COOKIE,
  signProfessionalCareerSession,
} from '@/lib/professional-career';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 });
    }

    const { username: rawUsername, password } = body as Record<string, unknown>;
    const username = typeof rawUsername === 'string' ? rawUsername.trim().toLowerCase() : '';
    if (!username || typeof password !== 'string') {
      return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 });
    }

    const candidates = await prisma.child.findMany({
      where: { notes: { contains: `"username":"${username}"` } },
      select: { id: true, notes: true },
    });
    const matched = candidates.find(({ notes }) =>
      getProfessionalCareerData(parseChildDossier(notes)).account?.username === username
    );
    const account = matched
      ? getProfessionalCareerData(parseChildDossier(matched.notes)).account
      : null;
    if (!matched || !account || !(await bcrypt.compare(password, account.passwordHash))) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, nextPath: '/professional-career/profile' });
    response.cookies.set(PROFESSIONAL_CAREER_COOKIE, signProfessionalCareerSession({
      childId: matched.id,
      username: account.username,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    console.error('Professional career login error:', error);
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
