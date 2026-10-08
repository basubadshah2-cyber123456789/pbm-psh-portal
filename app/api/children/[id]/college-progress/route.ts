import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { parseChildDossier } from '@/lib/professional-career';

const allowedRoles: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.CLERK];

const fields = [
  'collegeName',
  'classProgram',
  'groupSubjects',
  'boardUniversity',
  'admissionYear',
  'registrationNumber',
  'rollNumber',
  'currentStatus',
  'remarks',
] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized to add college progress' }, { status: 403 });
    }

    const { id } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Enter valid college progress details' }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const entryData = Object.fromEntries(
      fields.map((field) => [field, typeof payload[field] === 'string' ? payload[field].trim() : ''])
    ) as Record<(typeof fields)[number], string>;

    if (!entryData.collegeName || !entryData.classProgram) {
      return NextResponse.json({ error: 'College / institute and class / program are required' }, { status: 400 });
    }

    const child = await prisma.child.findUnique({
      where: { id },
      select: { id: true, fullName: true, childId: true, notes: true },
    });
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const dossier = parseChildDossier(child.notes);
    const currentEntries = Array.isArray(dossier.collegeProgress) ? dossier.collegeProgress : [];
    const entry = { id: crypto.randomUUID(), ...entryData, createdAt: new Date().toISOString() };
    const update = await prisma.child.updateMany({
      where: { id, notes: child.notes },
      data: {
        notes: JSON.stringify({ ...dossier, collegeProgress: [...currentEntries, entry] }),
      },
    });

    if (update.count !== 1) {
      return NextResponse.json(
        { error: 'The child dossier changed while saving. Please reload and try again.' },
        { status: 409 }
      );
    }

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE_CHILD_COLLEGE_PROGRESS',
      module: 'CHILDREN',
      recordId: entry.id,
      details: `Added college progress for ${child.fullName} (${child.childId})`,
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error('Add child college progress error:', error);
    return NextResponse.json({ error: 'Failed to save college progress' }, { status: 500 });
  }
}
