import { NextResponse } from 'next/server';
import {
  CHILD_PHOTO_MAX_BYTES,
  fetchChildPhoto,
  isPersistedChildPhotoUrl,
  removeChildPhoto,
  storeChildPhoto,
} from '@/lib/child-photo';
import { verifyPbmChildSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';
import { imageModerationFailure, moderateImage } from '@/lib/image-moderation';

function getPhotoUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const photo = (payload as Record<string, unknown>).photo;
  return typeof photo === 'string' && isPersistedChildPhotoUrl(photo) ? photo : null;
}

export async function GET(request: Request) {
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const photoUrl = getPhotoUrl(graduate.child.payload);
    if (new URL(request.url).searchParams.get('metadata') === '1') {
      return NextResponse.json({ success: true, hasProfilePhoto: Boolean(photoUrl) });
    }
    if (!photoUrl) return NextResponse.json({ error: 'No profile photo has been uploaded.' }, { status: 404 });

    const photo = await fetchChildPhoto(photoUrl);
    return new NextResponse(photo.stream, {
      headers: {
        'Content-Type': photo.blob.contentType || 'application/octet-stream',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Load PBM professional profile photo error:', error);
    return NextResponse.json({ error: 'Unable to load your profile photo.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let uploadedPhotoUrl: string | null = null;
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a profile photo to upload.' }, { status: 400 });
    if (file.size <= 0 || file.size > CHILD_PHOTO_MAX_BYTES) {
      return NextResponse.json({ error: 'Choose an image no larger than 4 MB.' }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    await moderateImage(bytes, file.type);
    const newPhotoUrl = await storeChildPhoto(file, graduate.child.id);
    uploadedPhotoUrl = newPhotoUrl;
    const client = await getPbmPrismaReady();
    const previousPhotoUrl = await client.$transaction(async (transaction) => {
      const rows = await transaction.$queryRaw<Array<{ photo: string | null }>>`
        SELECT payload->>'photo' AS photo
        FROM "PbmChildRecord"
        WHERE id = ${graduate.child.id} AND "careerUsername" = ${graduate.session.username}
        FOR UPDATE
      `;
      if (!rows[0]) throw new Error('PBM_CHILD_SESSION_EXPIRED');
      const previousPhoto = isPersistedChildPhotoUrl(rows[0].photo) ? rows[0].photo : null;
      const updated = await transaction.$executeRaw`
        UPDATE "PbmChildRecord"
        SET payload = jsonb_set(
              COALESCE(payload, '{}'::jsonb),
              '{photo}',
              to_jsonb(${newPhotoUrl}::text),
              true
            ),
            "updatedAt" = NOW()
        WHERE id = ${graduate.child.id}
          AND "careerUsername" = ${graduate.session.username}
      `;
      if (updated !== 1) throw new Error('PBM_CHILD_SESSION_EXPIRED');
      return previousPhoto;
    });

    uploadedPhotoUrl = null;
    if (previousPhotoUrl && previousPhotoUrl !== newPhotoUrl) await removeChildPhoto(previousPhotoUrl);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (uploadedPhotoUrl) await removeChildPhoto(uploadedPhotoUrl);
    const moderationFailure = imageModerationFailure(error);
    if (moderationFailure) return moderationFailure;
    if (error instanceof Error && error.message === 'PBM_CHILD_SESSION_EXPIRED') {
      return NextResponse.json({ error: 'Your session is no longer valid. Please sign in again.' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'CHILD_PHOTO_STORAGE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'PBM photo storage is not configured.' }, { status: 503 });
    }
    if (error instanceof Error && error.message === 'CHILD_PHOTO_TYPE_INVALID') {
      return NextResponse.json({ error: 'Only valid JPEG, PNG, or WebP photos are accepted.' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'CHILD_PHOTO_SIZE_INVALID') {
      return NextResponse.json({ error: 'Choose an image no larger than 4 MB.' }, { status: 400 });
    }
    console.error('Save PBM professional profile photo error:', error);
    return NextResponse.json({ error: 'Unable to save your profile photo.' }, { status: 500 });
  }
}
