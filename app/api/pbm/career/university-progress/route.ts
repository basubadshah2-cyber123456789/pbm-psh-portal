import { randomUUID } from 'node:crypto';
import { del, get, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifyPbmChildSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

const MAX_DOCUMENT_BYTES = 12 * 1024 * 1024;
const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const allowedPrograms = new Set(['Medical', 'Engineering', 'BS / General', 'Commerce']);
const allowedCollegeTypes = new Set(['Government', 'Private']);

interface SubjectMark {
  id: string;
  subject: string;
  totalMarks: string;
  obtainedMarks: string;
}

function validFileSignature(bytes: Uint8Array, contentType: string): boolean {
  if (contentType === 'application/pdf') return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  if (contentType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === 'image/png') return bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  return contentType === 'image/webp' &&
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
}

function readText(formData: FormData, key: string, maxLength: number): string | null {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.length > maxLength) return null;
  return value.trim();
}

function validateSubjects(value: FormDataEntryValue | null): SubjectMark[] | null {
  if (typeof value !== 'string') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 100) return null;
  const subjects: SubjectMark[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const subject = item as Record<string, unknown>;
    if (
      typeof subject.subject !== 'string' || !subject.subject.trim() || subject.subject.length > 100 ||
      typeof subject.totalMarks !== 'string' || typeof subject.obtainedMarks !== 'string'
    ) return null;
    const totalMarks = Number(subject.totalMarks);
    const obtainedMarks = Number(subject.obtainedMarks);
    if (!Number.isFinite(totalMarks) || totalMarks <= 0 || !Number.isFinite(obtainedMarks) || obtainedMarks < 0 || obtainedMarks > totalMarks) {
      return null;
    }
    subjects.push({
      id: randomUUID(),
      subject: subject.subject.trim(),
      totalMarks: String(totalMarks),
      obtainedMarks: String(obtainedMarks),
    });
  }
  return subjects;
}

export async function GET(request: Request) {
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const documentId = new URL(request.url).searchParams.get('documentId');
    if (documentId) {
      const client = await getPbmPrismaReady();
      const documents = await client.$queryRaw<Array<{
        blobUrl: string;
        fileName: string;
        contentType: string;
      }>>`
        SELECT "blobUrl", "fileName", "contentType"
        FROM "PbmChildDocument"
        WHERE id = ${documentId} AND "childId" = ${graduate.child.id}
        LIMIT 1
      `;
      const document = documents[0];
      if (!document) return NextResponse.json({ error: 'Result document not found.' }, { status: 404 });
      const blob = await get(document.blobUrl, { access: 'private' });
      if (!blob || blob.statusCode !== 200 || !blob.stream) {
        return NextResponse.json({ error: 'Stored result document is unavailable.' }, { status: 404 });
      }
      return new NextResponse(blob.stream, {
        headers: {
          'Content-Type': document.contentType,
          'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    return NextResponse.json({
      success: true,
      student: { fullName: graduate.child.fullName },
      entries: Array.isArray(graduate.child.universityProgress) ? graduate.child.universityProgress : [],
    });
  } catch (error) {
    console.error('Load PBM university progress error:', error);
    return NextResponse.json({ error: 'Unable to load College Life history.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let blobUrl: string | null = null;
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const formData = await request.formData();
    const data = {
      studentName: readText(formData, 'studentName', 200),
      fatherName: readText(formData, 'fatherName', 200),
      pshRegistrationNumber: readText(formData, 'pshRegistrationNumber', 100),
      collegeType: readText(formData, 'collegeType', 30),
      collegeName: readText(formData, 'collegeName', 200),
      program: readText(formData, 'program', 50),
      classYear: readText(formData, 'classYear', 100),
      rollNumber: readText(formData, 'rollNumber', 100),
      academicPeriod: readText(formData, 'academicPeriod', 100),
      passingYear: readText(formData, 'passingYear', 4),
    };
    if (Object.values(data).some((value) => value === null || value === '')) {
      return NextResponse.json({ error: 'Complete all required College Life fields.' }, { status: 400 });
    }
    if (
      !allowedCollegeTypes.has(data.collegeType!) ||
      !allowedPrograms.has(data.program!) ||
      !/^\d{4}$/.test(data.passingYear!) ||
      Number(data.passingYear) < 1900 ||
      Number(data.passingYear) > 2100
    ) {
      return NextResponse.json({ error: 'Select a valid college type and program, and enter a valid passing year.' }, { status: 400 });
    }
    const subjects = validateSubjects(formData.get('subjects'));
    if (!subjects) {
      return NextResponse.json({ error: 'Enter valid subject names and marks. Obtained marks cannot exceed total marks.' }, { status: 400 });
    }

    const file = formData.get('resultFile');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Upload the semester or year result.' }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) {
      return NextResponse.json({ error: 'Result files must be smaller than 12 MB.' }, { status: 400 });
    }
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'Only PDF, JPEG, PNG, and WebP result files are allowed.' }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validFileSignature(bytes, file.type)) {
      return NextResponse.json({ error: 'The selected result file does not match its declared file type.' }, { status: 400 });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'PBM document storage is not configured.' }, { status: 503 });
    }

    const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    const blob = await put(`pbm/children/${graduate.child.id}/${randomUUID()}.${extension}`, new Blob([bytes], { type: file.type }), {
      access: 'private',
      addRandomSuffix: false,
      contentType: file.type,
    });
    blobUrl = blob.url;

    const client = await getPbmPrismaReady();
    const entryId = randomUUID();
    const documentId = randomUUID();
    const resultDocument = { id: documentId, fileName: file.name.slice(0, 255) };
    const entry = {
      id: entryId,
      ...data,
      collegeType: data.collegeType!,
      collegeName: data.collegeName!,
      program: data.program!,
      subjects,
      totalMarks: String(subjects.reduce((sum, subject) => sum + Number(subject.totalMarks), 0)),
      obtainedMarks: String(subjects.reduce((sum, subject) => sum + Number(subject.obtainedMarks), 0)),
      resultDocument,
      createdAt: new Date().toISOString(),
    };

    await client.$transaction(async (transaction) => {
      await transaction.$executeRaw`
        INSERT INTO "PbmChildDocument" (id, "childId", title, "documentType", "blobUrl", "fileName", "contentType", "byteSize")
        VALUES (
          ${documentId},
          ${graduate.child.id},
          ${`College Life Result - ${data.academicPeriod}`.slice(0, 120)},
          'College Life Result',
          ${blob.url},
          ${file.name.slice(0, 255)},
          ${file.type},
          ${file.size}
        )
      `;
      const updated = await transaction.$executeRaw`
        UPDATE "PbmChildRecord"
        SET "universityProgress" = COALESCE("universityProgress", '[]'::jsonb) || ${JSON.stringify([entry])}::jsonb,
            "updatedAt" = NOW()
        WHERE id = ${graduate.child.id}
          AND "careerUsername" = ${graduate.session.username}
      `;
      if (updated !== 1) throw new Error('PBM_CHILD_SESSION_EXPIRED');
    });
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    if (blobUrl && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch((cleanupError: unknown) => {
        console.error('Clean up unattached College Life result error:', cleanupError);
      });
    }
    if (error instanceof Error && error.message === 'PBM_CHILD_SESSION_EXPIRED') {
      return NextResponse.json({ error: 'Your session is no longer valid. Please sign in again.' }, { status: 401 });
    }
    console.error('Save PBM university progress error:', error);
    return NextResponse.json({ error: 'Unable to save your College Life record.' }, { status: 500 });
  }
}
