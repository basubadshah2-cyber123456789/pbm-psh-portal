import { NextResponse } from 'next/server';
import { PBM_CHILD_COOKIE } from '@/lib/pbm-auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PBM_CHILD_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
