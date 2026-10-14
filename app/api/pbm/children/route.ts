import { randomUUID } from 'node:crypto';
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

export async function GET() {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const client = await getPbmPrismaReady();
    const children = await client.$queryRaw<Array<{
      id: string;
      admissionNo: string;
      fullName: string;
      payload: Record<string, unknown>;
      collegeProgress: unknown;
      universityProgress: unknown;
      professionalLifeEntries: unknown;
      careerUsername: string | null;
      documents: unknown;
    }>>`
      SELECT child.id, child."admissionNo", child."fullName", child.payload,
             child."collegeProgress", child."universityProgress",
             child."careerProfile"->'professionalLifeEntries' AS "professionalLifeEntries",
             child."careerUsername",
             COALESCE((
               SELECT jsonb_agg(jsonb_build_object(
                 'id', document.id,
                 'title', document.title,
                 'documentType', document."documentType",
                 'fileName', document."fileName",
                 'uploadedAt', document."createdAt"
               ) ORDER BY document."createdAt")
               FROM "PbmChildDocument" AS document
               WHERE document."childId" = child.id
             ), '[]'::jsonb) AS documents
      FROM "PbmChildRecord" AS child
      ORDER BY child."admissionNo" ASC
    `;
    return NextResponse.json({
      success: true,
      children: children.map((child) => ({
        ...child.payload,
        id: child.id,
        admissionNo: child.admissionNo,
        fullName: child.fullName,
        collegeProgress: child.collegeProgress,
        universityProgress: child.universityProgress,
        careerProfile: { professionalLifeEntries: child.professionalLifeEntries },
        careerUsername: child.careerUsername,
        documents: child.documents,
      })),
    });
  } catch (error) {
    console.error('Fetch PBM child records error:', error);
    return NextResponse.json({ error: 'Unable to load PBM child records.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const payload = validateChildPayload(await request.json());
    if (!payload) {
      return NextResponse.json({ error: 'Child name, admission number, and dossier details are required.' }, { status: 400 });
    }

    const id = randomUUID();
    const admissionNo = (payload.admissionNo as string).trim();
    const fullName = (payload.fullName as string).trim();
    const client = await getPbmPrismaReady();
    const rows = await client.$queryRaw<Array<{ id: string; payload: Record<string, unknown> }>>`
      INSERT INTO "PbmChildRecord" (id, "admissionNo", "fullName", payload)
      VALUES (${id}, ${admissionNo}, ${fullName}, ${JSON.stringify(payload)}::jsonb)
      ON CONFLICT ("admissionNo") DO NOTHING
      RETURNING id, payload
    `;
    const child = rows[0];
    if (!child) {
      return NextResponse.json({ error: 'A child with this admission number already exists.' }, { status: 409 });
    }
    return NextResponse.json({
      success: true,
      child: { ...child.payload, id: child.id, admissionNo, fullName },
    }, { status: 201 });
  } catch (error) {
    if (isPbmUniqueViolation(error)) {
      return NextResponse.json({ error: 'A child with this admission number already exists.' }, { status: 409 });
    }
    console.error('Create PBM child record error:', error);
    return NextResponse.json({ error: 'Unable to save the PBM child record.' }, { status: 500 });
  }
}
