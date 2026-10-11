import { NextResponse } from 'next/server';
import { PBM_STAFF_COOKIE, getPbmStaffSession } from '@/lib/pbm-auth';

export async function GET() {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Read PBM staff session error:', error);
    return NextResponse.json({ error: 'Unable to verify your session.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PBM_STAFF_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
