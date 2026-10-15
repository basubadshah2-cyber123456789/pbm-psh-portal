import { randomUUID } from 'node:crypto';
import { del, get, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getPbmStaffSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';
import { imageModerationFailure, moderateImage } from '@/lib/image-moderation';

const MAX_DOCUMENT_BYTES = 12 * 1024 * 1024;
const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

function validFileSignature(bytes: Uint8Array, contentType: string): boolean {
  if (contentType === 'application/pdf') {
    return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  }
  if (contentType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === 'image/png') return bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  return contentType === 'image/webp' &&
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let blobUrl: string | null = null;
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const { id: childId } = await params;
    const client = await getPbmPrismaReady();
    const child = await client.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "PbmChildRecord" WHERE id = ${childId} LIMIT 1
    `;
    if (!child[0]) return NextResponse.json({ error: 'Child record not found.' }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get('file');
    const title = String(formData.get('title') || '').trim();
    const documentType = String(formData.get('documentType') || '').trim();
    if (!(file instanceof File) || !title || !documentType) {
      return NextResponse.json({ error: 'Choose a document and provide its title and type.' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) {
      return NextResponse.json({ error: 'Documents must be smaller than 12 MB.' }, { status: 400 });
    }
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'Only PDF, JPEG, PNG, and WebP files are allowed.' }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validFileSignature(bytes, file.type)) {
      return NextResponse.json({ error: 'The selected file does not match its declared file type.' }, { status: 400 });
    }
    if (file.type.startsWith('image/')) await moderateImage(bytes, file.type);
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'PBM document storage is not configured.' }, { status: 503 });
    }

    const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    const blob = await put(`pbm/children/${childId}/${randomUUID()}.${extension}`, new Blob([bytes], { type: file.type }), {
      access: 'private',
      addRandomSuffix: false,
      contentType: file.type,
    });
    blobUrl = blob.url;
    const rows = await client.$queryRaw<Array<{
      id: string;
      title: string;
      documentType: string;
      fileName: string;
    }>>`
      INSERT INTO "PbmChildDocument" (id, "childId", title, "documentType", "blobUrl", "fileName", "contentType", "byteSize")
      VALUES (${randomUUID()}, ${childId}, ${title.slice(0, 120)}, ${documentType.slice(0, 80)}, ${blob.url}, ${file.name.slice(0, 255)}, ${file.type}, ${file.size})
      RETURNING id, title, "documentType", "fileName"
    `;
    if (!rows[0]) throw new Error('PBM document metadata insert returned no row.');
    return NextResponse.json({ success: true, document: rows[0] }, { status: 201 });
  } catch (error) {
    const moderationFailure = imageModerationFailure(error);
    if (moderationFailure) return moderationFailure;
    if (blobUrl && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch((cleanupError: unknown) => {
        console.error('Clean up unattached PBM document error:', cleanupError);
      });
    }
    console.error('Upload PBM child document error:', error);
    return NextResponse.json({ error: 'Unable to save child document.' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const { id: childId } = await params;
    const documentId = new URL(request.url).searchParams.get('documentId');
    if (!documentId) return NextResponse.json({ error: 'Document identifier is required.' }, { status: 400 });
    const client = await getPbmPrismaReady();
    const documents = await client.$queryRaw<Array<{
      blobUrl: string;
      fileName: string;
      contentType: string;
    }>>`
      SELECT "blobUrl", "fileName", "contentType"
      FROM "PbmChildDocument"
      WHERE id = ${documentId} AND "childId" = ${childId}
      LIMIT 1
    `;
    const document = documents[0];
    if (!document) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    const blob = await get(document.blobUrl, { access: 'private' });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json({ error: 'Stored document is unavailable.' }, { status: 404 });
    }
    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': document.contentType,
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Read PBM child document error:', error);
    return NextResponse.json({ error: 'Unable to load child document.' }, { status: 500 });
  }
}
