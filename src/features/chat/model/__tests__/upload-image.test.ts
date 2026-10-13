import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { authMock } from '~/mocks/auth';
import { chatCalls, resetChatMock } from '~/mocks/chat';
import { server } from '~/mocks/server';
import { signInDirectly, useAuthMocks } from '~/test/render-app';
import { ImageUploadError } from '../image-input';
import { uploadImage } from '../upload-image';

useAuthMocks();

const UPLOADS = 'http://localhost:3000/api/v1/uploads';
const file = () => new File(['png'], 'a.png', { type: 'image/png' });
const run = () => uploadImage(file(), () => {}, new AbortController().signal);

const apiError = (status: number, code: string) =>
  HttpResponse.json(
    { statusCode: status, code, message: 'dev message' },
    { status },
  );

async function failure(): Promise<ImageUploadError> {
  const error = await run().then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(ImageUploadError);
  return error as ImageUploadError;
}

beforeEach(async () => {
  resetChatMock();
  await signInDirectly();
});

describe('uploadImage', () => {
  it('returns the stored image with its processed size', async () => {
    const result = await run();
    expect(result.attachment).toMatchObject({
      id: result.uploadId,
      mimeType: 'image/webp',
      width: 1314,
      height: 876,
    });
    expect(chatCalls('upload')[0]!.authorization).toMatch(/^Bearer /);
  });

  it('treats a rate limit as retryable', async () => {
    server.use(http.post(UPLOADS, () => apiError(429, 'RATE_LIMITED')));
    expect(await failure()).toMatchObject({
      code: 'RATE_LIMITED',
      retryable: true,
    });
  });

  it("reads a proxy's bare 413 as too large", async () => {
    server.use(
      http.post(UPLOADS, () => new HttpResponse('<html>', { status: 413 })),
    );
    expect(await failure()).toMatchObject({
      code: 'ATTACHMENT_TOO_LARGE',
      retryable: false,
    });
  });

  it('refreshes the session once after a 401 and repeats the upload', async () => {
    let calls = 0;
    server.use(
      http.post(UPLOADS, () =>
        ++calls === 1 ? apiError(401, 'INVALID_TOKEN') : undefined,
      ),
    );
    await run();
    expect(calls).toBe(2);
    expect(authMock.calls.some((c) => c.name === 'token:refresh_token')).toBe(
      true,
    );
  });
});
