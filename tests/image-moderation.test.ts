import assert from 'node:assert/strict';
import test from 'node:test';
import { moderateImage, parseImageModerationResult } from '../lib/image-moderation';

const validJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00]);

test('accepts an unflagged image and sends its bytes as a data URL', async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = 'test-key';
  let requestBody = '';
  globalThis.fetch = async (_input, init) => {
    requestBody = String(init?.body);
    return Response.json({ results: [{ flagged: false }] });
  };

  try {
    await moderateImage(validJpeg, 'image/jpeg');
    const payload = JSON.parse(requestBody);
    assert.equal(payload.model, 'omni-moderation-latest');
    assert.equal(
      payload.input[0].image_url.url,
      `data:image/jpeg;base64,${Buffer.from(validJpeg).toString('base64')}`,
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test('rejects flagged images', async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = 'test-key';
  globalThis.fetch = async () => Response.json({ results: [{ flagged: true }] });

  try {
    await assert.rejects(moderateImage(validJpeg, 'image/jpeg'), {
      message: 'IMAGE_MODERATION_REJECTED',
    });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test('fails closed when the moderation key is missing or service is unavailable', async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  delete process.env.OPENAI_API_KEY;

  try {
    await assert.rejects(moderateImage(validJpeg, 'image/jpeg'), {
      message: 'IMAGE_MODERATION_NOT_CONFIGURED',
    });

    process.env.OPENAI_API_KEY = 'test-key';
    globalThis.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(moderateImage(validJpeg, 'image/jpeg'), {
      message: 'IMAGE_MODERATION_UNAVAILABLE',
    });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test('treats malformed moderation responses as unavailable', () => {
  assert.throws(() => parseImageModerationResult({ results: [] }), {
    message: 'IMAGE_MODERATION_UNAVAILABLE',
  });
  assert.throws(() => parseImageModerationResult({ results: [{ flagged: 'false' }] }), {
    message: 'IMAGE_MODERATION_UNAVAILABLE',
  });
});

test('rejects image content with a mismatched MIME type', async () => {
  await assert.rejects(moderateImage(validJpeg, 'image/png'), {
    message: 'IMAGE_MODERATION_IMAGE_INVALID',
  });
});
