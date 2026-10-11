import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getPbmStaffSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady, isPbmUniqueViolation } from '@/lib/pbm-db';

function validateChildPayload(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  if (
    typeof payload.fullName !== 'string' ||
    !payload.fullName.trim() ||
    typeof payload.admissionNo !== 'string' ||
    !payload.admissionNo.trim() ||
    typeof payload.notes !== 'string'
  ) return null;
  if (payload.fullName.length > 200 || payload.admissionNo.length > 100 || payload.notes.length > 1_000_000) return null;
  return payload;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const { id } = await params;
    const payload = validateChildPayload(await request.json());
    if (!payload) {
      return NextResponse.json({ error: 'Child name, admission number, and dossier details are required.' }, { status: 400 });
    }
    const client = await getPbmPrismaReady();
    const rows = await client.$queryRaw<Array<{ id: string }>>`
      UPDATE "PbmChildRecord"
      SET "admissionNo" = ${(payload.admissionNo as string).trim()},
          "fullName" = ${(payload.fullName as string).trim()},
          payload = ${JSON.stringify(payload)}::jsonb,
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Child record not found.' }, { status: 404 });
    return NextResponse.json({
      success: true,
      child: { ...payload, id: rows[0].id, admissionNo: (payload.admissionNo as string).trim() },
    });
  } catch (error) {
    if (isPbmUniqueViolation(error)) {
      return NextResponse.json({ error: 'That admission number is already assigned to another child.' }, { status: 409 });
    }
    console.error('Update PBM child record error:', error);
    return NextResponse.json({ error: 'Unable to update the PBM child record.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff || staff.role !== 'ADMIN') {
      return NextResponse.json({ error: staff ? 'Administrator access required.' : 'Sign in required.' }, { status: staff ? 403 : 401 });
    }
    const { id } = await params;
    const client = await getPbmPrismaReady();
    const associatedBlobs = await client.$queryRaw<Array<{ blobUrl: string }>>`
      SELECT "blobUrl" FROM "PbmChildDocument" WHERE "childId" = ${id}
      UNION
      SELECT payload->>'photo' AS "blobUrl"
      FROM "PbmChildRecord"
      WHERE id = ${id} AND payload->>'photo' IS NOT NULL
    `;
    const deleted = await client.$executeRaw`
      DELETE FROM "PbmChildRecord" WHERE id = ${id}
    `;
    if (deleted === 0) return NextResponse.json({ error: 'Child record not found.' }, { status: 404 });
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const cleanupResults = await Promise.allSettled(
        associatedBlobs.map(({ blobUrl }) => del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }))
      );
      cleanupResults.forEach((result) => {
        if (result.status === 'rejected') console.error('Clean up deleted PBM child file error:', result.reason);
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete PBM child record error:', error);
    return NextResponse.json({ error: 'Unable to delete the PBM child record.' }, { status: 500 });
  }
}
