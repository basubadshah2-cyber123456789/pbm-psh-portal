import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import {
  getProfessionalCareerData,
  parseChildDossier,
  type ProfessionalCareerAccount,
} from '@/lib/professional-career';
import { prisma } from '@/lib/prisma';

const accountManagerRoles: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.CLERK];

async function authorizeAccountManager() {
  const user = await getCurrentUser();
  return user && accountManagerRoles.includes(user.role) ? user : null;
}

async function findUsernameOwner(username: string) {
  const candidates = await prisma.child.findMany({
    where: { notes: { contains: `"username":"${username}"` } },
    select: { id: true, notes: true },
  });

  return candidates.find(({ notes }) =>
    getProfessionalCareerData(parseChildDossier(notes)).account?.username === username
  )?.id || null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeAccountManager();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await params;
    const child = await prisma.child.findUnique({
      where: { id },
      select: { id: true, fullName: true, notes: true },
    });
    if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 });

    const account = getProfessionalCareerData(parseChildDossier(child.notes)).account;
    return NextResponse.json({
      success: true,
      child: { id: child.id, fullName: child.fullName },
      account: account
        ? { username: account.username, createdAt: account.createdAt }
        : null,
    });
  } catch (error) {
    console.error('Fetch professional career account error:', error);
    return NextResponse.json({ error: 'Failed to load career account' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeAccountManager();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const { username: rawUsername, password } = body as Record<string, unknown>;
    const username = typeof rawUsername === 'string' ? rawUsername.trim().toLowerCase() : '';
    if (!/^[a-z0-9][a-z0-9._-]{3,31}$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 4–32 characters and use letters, numbers, dots, underscores, or hyphens.' },
        { status: 400 }
      );
    }
    if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 10 and 128 characters.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const child = await prisma.child.findUnique({
        where: { id },
        select: { id: true, fullName: true, notes: true },
      });
      if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 });

      const dossier = parseChildDossier(child.notes);
      const careerData = getProfessionalCareerData(dossier);
      const ownerId = await findUsernameOwner(username);
      if (ownerId && ownerId !== child.id) {
        return NextResponse.json({ error: 'That username is already in use. Choose another username.' }, { status: 409 });
      }

      const account: ProfessionalCareerAccount = {
        username,
        passwordHash,
        createdAt: careerData.account?.createdAt || new Date().toISOString(),
      };
      const nextDossier = {
        ...dossier,
        professionalCareer: { ...careerData, account },
      };
      const result = await prisma.child.updateMany({
        where: { id, notes: child.notes },
        data: { notes: JSON.stringify(nextDossier) },
      });

      if (result.count === 1) {
        return NextResponse.json({
          success: true,
          account: { username: account.username, createdAt: account.createdAt },
          loginPath: '/professional-career',
        });
      }
    }

    return NextResponse.json(
      { error: 'The child dossier changed while saving. Please try again.' },
      { status: 409 }
    );
  } catch (error) {
    console.error('Save professional career account error:', error);
    return NextResponse.json({ error: 'Failed to create the career account' }, { status: 500 });
  }
}
