import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const authorizedRoles: Role[] = [
  Role.INCHARGE,
  Role.ACCOUNT_ASSISTANT,
  Role.HR_REPRESENTATIVE,
  Role.CLERK,
];

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    if (!authorizedRoles.includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized to view login profiles.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        role: { in: authorizedRoles },
        employee: { isNot: null },
      },
      select: {
        email: true,
        role: true,
        employee: { select: { fullName: true } },
      },
      orderBy: { role: 'asc' },
    });

    return NextResponse.json({
      profiles: users.map((user) => ({
        name: user.employee?.fullName || user.email,
        email: user.email,
        role: user.role,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load active login profiles.' }, { status: 503 });
  }
}