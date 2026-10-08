import { NextResponse } from 'next/server';
import { PROFESSIONAL_CAREER_COOKIE } from '@/lib/professional-career';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PROFESSIONAL_CAREER_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
