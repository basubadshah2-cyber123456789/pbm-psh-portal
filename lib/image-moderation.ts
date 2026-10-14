import { detectChildPhotoType } from '@/lib/child-photo';

const MAX_MODERATION_IMAGE_BYTES = 20 * 1024 * 1024;

export type ImageModerationErrorCode =
  | 'IMAGE_MODERATION_NOT_CONFIGURED'
  | 'IMAGE_MODERATION_REJECTED'
  | 'IMAGE_MODERATION_UNAVAILABLE'
  | 'IMAGE_MODERATION_IMAGE_INVALID';

export class ImageModerationError extends Error {
  constructor(readonly code: ImageModerationErrorCode) {
    super(code);
    this.name = 'ImageModerationError';
  }
}

type ModerationResult = {
  flagged: boolean;
};

export function parseImageModerationResult(value: unknown): ModerationResult {
  if (!value || typeof value !== 'object' || !('results' in value) || !Array.isArray(value.results)) {
    throw new ImageModerationError('IMAGE_MODERATION_UNAVAILABLE');
  }

  const result = value.results[0];
  if (!result || typeof result !== 'object' || !('flagged' in result) || typeof result.flagged !== 'boolean') {
    throw new ImageModerationError('IMAGE_MODERATION_UNAVAILABLE');
  }

  return { flagged: result.flagged };
}

export async function moderateImage(bytes: Uint8Array, mimeType: string): Promise<void> {
  const signature = detectChildPhotoType(bytes);
  if (
    !signature ||
    signature.mimeType !== mimeType ||
    bytes.byteLength === 0 ||
    bytes.byteLength > MAX_MODERATION_IMAGE_BYTES
  ) {
    throw new ImageModerationError('IMAGE_MODERATION_IMAGE_INVALID');
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new ImageModerationError('IMAGE_MODERATION_NOT_CONFIGURED');

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: [{
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}` },
        }],
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ImageModerationError('IMAGE_MODERATION_UNAVAILABLE');
  }

  if (!response.ok) throw new ImageModerationError('IMAGE_MODERATION_UNAVAILABLE');

  let result: ModerationResult;
  try {
    result = parseImageModerationResult(await response.json());
  } catch (error) {
    if (error instanceof ImageModerationError) throw error;
    throw new ImageModerationError('IMAGE_MODERATION_UNAVAILABLE');
  }

  if (result.flagged) throw new ImageModerationError('IMAGE_MODERATION_REJECTED');
}

export function imageModerationFailure(error: unknown): Response | null {
  if (!(error instanceof ImageModerationError)) return null;

  const messages: Record<ImageModerationErrorCode, { status: number; message: string }> = {
    IMAGE_MODERATION_NOT_CONFIGURED: {
      status: 503,
      message: 'Image safety screening is not configured. Contact the portal administrator.',
    },
    IMAGE_MODERATION_REJECTED: {
      status: 422,
      message: 'This image did not pass the safety check. Please choose a different image.',
    },
    IMAGE_MODERATION_UNAVAILABLE: {
      status: 503,
      message: 'Image safety screening is temporarily unavailable. Please try again later.',
    },
    IMAGE_MODERATION_IMAGE_INVALID: {
      status: 400,
      message: 'The image is invalid or its file type does not match its contents.',
    },
  };
  const failure = messages[error.code];
  return Response.json({ error: failure.message }, { status: failure.status });
}
