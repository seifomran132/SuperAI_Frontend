import type {
  ApiErrorResponseDto,
  FieldErrorDto,
} from '~/api/generated/types.gen';

/**
 * A refusal before the stream started: the API answered with a JSON error
 * (API_CONTRACT §6.2). Shaped like `ApiErrorResponseDto`, so `isApiError` and
 * `errorMessageKey` from `~/api/errors` work on it.
 */
export class StreamApiError extends Error implements ApiErrorResponseDto {
  readonly statusCode: number;
  readonly code: ApiErrorResponseDto['code'];
  readonly details?: FieldErrorDto[];
  readonly data?: Record<string, unknown>;
  /** Raw `Retry-After` header, when the browser may read it (needs CORS exposure). */
  readonly retryAfter: string | null;

  constructor(body: ApiErrorResponseDto, retryAfter: string | null = null) {
    super(body.message);
    this.name = 'StreamApiError';
    this.statusCode = body.statusCode;
    this.code = body.code;
    this.details = body.details;
    this.data = body.data;
    this.retryAfter = retryAfter;
  }
}

/**
 * The connection failed. `phase: 'request'` means no response arrived: the
 * server may or may not have received the message, so a retry must reuse the
 * same `clientRequestId` (DUPLICATE_REQUEST then tells us it landed).
 * `phase: 'stream'` means the stream broke after it started.
 */
export class StreamNetworkError extends Error {
  readonly phase: 'request' | 'stream';

  constructor(phase: 'request' | 'stream', cause?: unknown) {
    super(`Chat stream network failure (${phase})`, { cause });
    this.name = 'StreamNetworkError';
    this.phase = phase;
  }
}

/** The response was not what the contract promises (wrong content type, bad JSON, non-JSON error). */
export class StreamProtocolError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'StreamProtocolError';
    this.status = status;
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}
