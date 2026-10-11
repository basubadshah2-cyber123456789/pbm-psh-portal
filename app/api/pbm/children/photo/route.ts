import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  CHILD_PHOTO_MAX_BYTES,
  detectChildPhotoType,
  fetchChildPhoto,
  isPersistedChildPhotoUrl,
  storeChildPhoto,
} from '@/lib/child-photo';
import { getPbmStaffSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

export async function GET(request: Request) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const photoUrl = new URL(request.url).searchParams.get('url');
    if (!isPersistedChildPhotoUrl(photoUrl)) {
      return NextResponse.json({ error: 'Photo URL is invalid.' }, { status: 400 });
    }
    const client = await getPbmPrismaReady();
    const records = await client.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "PbmChildRecord" WHERE payload->>'photo' = ${photoUrl} LIMIT 1
    `;
    if (!records[0]) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });

    const image = await fetchChildPhoto(photoUrl);
    return new NextResponse(image.stream, {
      headers: {
        'Content-Type': image.blob.contentType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Fetch PBM child photo error:', error);
    return NextResponse.json({ error: 'Unable to load child photo.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const staff = await getPbmStaffSession();
    if (!staff) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'An image file is required.' }, { status: 400 });
    if (file.size <= 0 || file.size > CHILD_PHOTO_MAX_BYTES) {
      return NextResponse.json({ error: 'Photo must be greater than 0 bytes and no larger than 4 MB.' }, { status: 400 });
    }
    const signature = detectChildPhotoType(new Uint8Array(await file.arrayBuffer()));
    if (!signature) return NextResponse.json({ error: 'Only valid JPEG, PNG, or WebP images are allowed.' }, { status: 400 });
    const photoUrl = await storeChildPhoto(file, `pbm-${randomUUID()}`);
    return NextResponse.json({ success: true, url: photoUrl });
  } catch (error) {
    if (error instanceof Error && error.message === 'CHILD_PHOTO_STORAGE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'PBM photo storage is not configured.' }, { status: 503 });
    }
    console.error('Upload PBM child photo error:', error);
    return NextResponse.json({ error: 'Unable to save child photo.' }, { status: 500 });
  }
}
