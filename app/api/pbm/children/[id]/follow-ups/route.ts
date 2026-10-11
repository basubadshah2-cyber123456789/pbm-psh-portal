import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getPbmStaffSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

const followUpFields = [
  'name',
  'className',
  'instituteName',
  'passedFrom',
  'boardRegistrationNumber',
  'rollNumber',
  'passingYear',
  'totalMarks',
  'obtainedMarks',
  'pshRegistrationNumber',
  'passedFromPsh',
] as const;

function validateFollowUp(value: unknown): Record<(typeof followUpFields)[number], string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (followUpFields.some((field) => typeof input[field] !== 'string' || input[field].length > 500)) return null;
  if (!(input.name as string).trim()) return null;
  return Object.fromEntries(followUpFields.map((field) => [field, input[field]])) as Record<
    (typeof followUpFields)[number],
    string
  >;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const followUp = validateFollowUp(await request.json());
    if (!followUp) {
      return NextResponse.json({ error: 'Enter a student name and valid follow-up details.' }, { status: 400 });
    }

    const { id } = await params;
    const client = await getPbmPrismaReady();
    const saved = await client.$transaction(async (transaction) => {
      const rows = await transaction.$queryRaw<Array<{ payload: Record<string, unknown> }>>`
        SELECT payload FROM "PbmChildRecord" WHERE id = ${id} FOR UPDATE
      `;
      const payload = rows[0]?.payload;
      if (!payload) return null;

      let dossier: Record<string, unknown> = {};
      if (typeof payload.notes === 'string' && payload.notes.trim()) {
        try {
          const parsed: unknown = JSON.parse(payload.notes);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return { error: 'The child dossier notes are not in a valid format.' } as const;
          }
          dossier = parsed as Record<string, unknown>;
        } catch {
          return { error: 'The child dossier notes are not valid JSON.' } as const;
        }
      } else if (payload.notes && typeof payload.notes === 'object' && !Array.isArray(payload.notes)) {
        dossier = payload.notes as Record<string, unknown>;
      }

      const existingFollowUps = dossier.followUps ?? [];
      if (!Array.isArray(existingFollowUps)) {
        return { error: 'The saved follow-up records are not in a valid format.' } as const;
      }

      const savedFollowUp = { ...followUp, id: randomUUID() };
      const updatedPayload = {
        ...payload,
        notes: JSON.stringify({ ...dossier, followUps: [...existingFollowUps, savedFollowUp] }),
      };
      await transaction.$executeRaw`
        UPDATE "PbmChildRecord"
        SET payload = ${JSON.stringify(updatedPayload)}::jsonb, "updatedAt" = NOW()
        WHERE id = ${id}
      `;
      return { followUp: savedFollowUp, notes: updatedPayload.notes } as const;
    });

    if (!saved) return NextResponse.json({ error: 'Child record not found.' }, { status: 404 });
    if ('error' in saved) return NextResponse.json({ error: saved.error }, { status: 409 });

    return NextResponse.json({ success: true, followUp: saved.followUp, notes: saved.notes });
  } catch (error) {
    console.error('Save PBM child follow-up error:', error);
    return NextResponse.json({ error: 'Unable to save this child follow-up.' }, { status: 500 });
  }
}
