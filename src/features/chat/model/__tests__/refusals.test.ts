import { describe, expect, it } from 'vitest';
import type { ApiError } from '~/api/errors';
import { StreamApiError } from '~/platform/stream';
import { retryAfterSeconds, toRefusal } from '../refusals';

const NOW = Date.parse('2026-10-04T12:00:00.000Z');

const apiError = (
  code: ApiError['code'],
  data?: Record<string, unknown>,
): ApiError => ({
  statusCode: 409,
  code,
  message: 'dev',
  ...(data ? { data } : {}),
});

describe('retryAfterSeconds', () => {
  it('reads delta-seconds from the header first', () => {
    expect(retryAfterSeconds('17', { retryAfterSeconds: 99 }, NOW)).toBe(17);
  });

  it('reads an HTTP date from the header', () => {
    expect(
      retryAfterSeconds('Sun, 04 Oct 2026 12:00:30 GMT', undefined, NOW),
    ).toBe(30);
  });

  it('falls back to data.retryAfterSeconds when the header is missing or unreadable', () => {
    expect(retryAfterSeconds(null, { retryAfterSeconds: 42 }, NOW)).toBe(42);
    expect(retryAfterSeconds('soon', { retryAfterSeconds: 5.2 }, NOW)).toBe(6);
  });

  it('never returns less than one second, and defaults to 60', () => {
    expect(retryAfterSeconds('0', undefined, NOW)).toBe(1);
    expect(retryAfterSeconds(null, undefined, NOW)).toBe(60);
    expect(retryAfterSeconds(null, { retryAfterSeconds: 'x' }, NOW)).toBe(60);
  });
});

describe('toRefusal', () => {
  it('RATE_LIMITED uses the Retry-After header kept on the stream error', () => {
    const error = new StreamApiError(
      {
        statusCode: 429,
        code: 'RATE_LIMITED',
        message: 'dev',
        data: { retryAfterSeconds: 9 },
      },
      '3',
    );
    expect(toRefusal(error, NOW)).toEqual({
      code: 'RATE_LIMITED',
      retryAfterSeconds: 3,
      retryAt: NOW + 3000,
    });
  });

  it('INSUFFICIENT_BALANCE keeps money as the exact strings sent', () => {
    const refusal = toRefusal(
      apiError('INSUFFICIENT_BALANCE', {
        estimatedCostUsd: '0.012000000',
        balanceUsd: '0.004000000',
        alternatives: [
          { modeKey: 'fast', estimatedCostUsd: '0.003000000' },
          { modeKey: 'bad', estimatedCostUsd: 0.001 }, // not a decimal string: dropped
        ],
      }),
      NOW,
      'professional',
    );
    expect(refusal).toEqual({
      code: 'INSUFFICIENT_BALANCE',
      modeKey: 'professional',
      estimatedCostUsd: '0.012000000',
      balanceUsd: '0.004000000',
      alternatives: [{ modeKey: 'fast', estimatedCostUsd: '0.003000000' }],
    });
  });

  it('INSUFFICIENT_BALANCE without data still yields a refusal with no alternatives', () => {
    expect(toRefusal(apiError('INSUFFICIENT_BALANCE'))).toEqual({
      code: 'INSUFFICIENT_BALANCE',
      modeKey: null,
      estimatedCostUsd: null,
      balanceUsd: null,
      alternatives: [],
    });
  });

  it('DUPLICATE_REQUEST is not a refusal', () => {
    expect(toRefusal(apiError('DUPLICATE_REQUEST'))).toBeNull();
  });

  it('unlisted codes become OTHER with the code for the error catalog', () => {
    expect(toRefusal(apiError('PROVIDER_UNAVAILABLE'))).toEqual({
      code: 'OTHER',
      errorCode: 'PROVIDER_UNAVAILABLE',
    });
  });
});
