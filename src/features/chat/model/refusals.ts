import type { FieldErrorDto } from '~/api/generated/types.gen';
import { isApiError, type ApiError } from '~/api/errors';
import { StreamApiError } from '~/platform/stream';

// Why a send did not start, as typed state for the UI (F2_CHAT §2 table).
// The draft is kept for every refusal; DUPLICATE_REQUEST is not a refusal
// (the message was already sent, so the conversation is just reloaded).

export interface ModeAlternative {
  modeKey: string;
  estimatedCostUsd: string;
}

/** What a retry after a network failure resends, with the same clientRequestId. */
export interface RetryableSend {
  content: string;
  modeKey: string;
  clientRequestId: string;
}

export type Refusal =
  | {
      code: 'INSUFFICIENT_BALANCE';
      /**
       * The mode the refused message was sent with, to label the notice after
       * a switch. Always set by `toRefusal` (null only if unknown); optional so
       * hand-written fixtures without it still type-check.
       */
      modeKey?: string | null;
      /** What the message would hold, or null if the API sent none. */
      estimatedCostUsd: string | null;
      balanceUsd: string | null;
      /** Affordable modes, cheapest last. Switching only selects; never sends. Empty → request balance. */
      alternatives: ModeAlternative[];
    }
  | { code: 'NO_ACTIVE_SUBSCRIPTION' }
  | { code: 'MODE_NOT_AVAILABLE' }
  | { code: 'CONVERSATION_BUSY' }
  | {
      code: 'RATE_LIMITED';
      retryAfterSeconds: number;
      /** Epoch ms when sending is allowed again. */
      retryAt: number;
    }
  | { code: 'CONTEXT_TOO_LONG' }
  | { code: 'VALIDATION_FAILED'; details: FieldErrorDto[] }
  | { code: 'PROFILE_INCOMPLETE' }
  | { code: 'CONVERSATION_NOT_FOUND' }
  /** No answer reached us; `retry` resends with the same clientRequestId. */
  | { code: 'NETWORK'; retry: RetryableSend }
  /** Anything else (e.g. PROVIDER_UNAVAILABLE before the stream, 5xx). Shown by `errorCode`. */
  | { code: 'OTHER'; errorCode: string | null };

export type RefusalCode = Refusal['code'];

const DEFAULT_RETRY_AFTER_SECONDS = 60;

const isMoneyString = (value: unknown): value is string =>
  typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value);

/**
 * Seconds to wait from a `Retry-After` header (delta-seconds or HTTP date),
 * falling back to `data.retryAfterSeconds`. The API does not expose the header
 * to cross-origin scripts today, so the body value is what browsers usually get.
 */
export function retryAfterSeconds(
  header: string | null | undefined,
  data: Record<string, unknown> | undefined,
  now = Date.now(),
): number {
  if (header) {
    const trimmed = header.trim();
    if (/^\d+$/.test(trimmed)) return Math.max(1, parseInt(trimmed, 10));
    const date = Date.parse(trimmed);
    if (!Number.isNaN(date)) {
      return Math.max(1, Math.ceil((date - now) / 1000));
    }
  }
  const fromBody = data?.retryAfterSeconds;
  if (typeof fromBody === 'number' && Number.isFinite(fromBody)) {
    return Math.max(1, Math.ceil(fromBody));
  }
  return DEFAULT_RETRY_AFTER_SECONDS;
}

function alternatives(value: unknown): ModeAlternative[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (typeof item !== 'object' || item === null) return [];
    const { modeKey, estimatedCostUsd } = item as Record<string, unknown>;
    return typeof modeKey === 'string' && isMoneyString(estimatedCostUsd)
      ? [{ modeKey, estimatedCostUsd }]
      : [];
  });
}

/** Maps an API error to a refusal; `null` for DUPLICATE_REQUEST (not a refusal). */
export function toRefusal(
  error: ApiError,
  now = Date.now(),
  requestedMode: string | null = null,
): Refusal | null {
  const data = error.data;
  switch (error.code) {
    case 'DUPLICATE_REQUEST':
      return null;
    case 'INSUFFICIENT_BALANCE':
      return {
        code: 'INSUFFICIENT_BALANCE',
        modeKey: requestedMode,
        estimatedCostUsd: isMoneyString(data?.estimatedCostUsd)
          ? data.estimatedCostUsd
          : null,
        balanceUsd: isMoneyString(data?.balanceUsd) ? data.balanceUsd : null,
        alternatives: alternatives(data?.alternatives),
      };
    case 'RATE_LIMITED': {
      const header = error instanceof StreamApiError ? error.retryAfter : null;
      const seconds = retryAfterSeconds(header, data, now);
      return {
        code: 'RATE_LIMITED',
        retryAfterSeconds: seconds,
        retryAt: now + seconds * 1000,
      };
    }
    case 'VALIDATION_FAILED':
      return { code: 'VALIDATION_FAILED', details: error.details ?? [] };
    case 'NO_ACTIVE_SUBSCRIPTION':
    case 'MODE_NOT_AVAILABLE':
    case 'CONVERSATION_BUSY':
    case 'CONTEXT_TOO_LONG':
    case 'PROFILE_INCOMPLETE':
    case 'CONVERSATION_NOT_FOUND':
      return { code: error.code };
    default:
      return { code: 'OTHER', errorCode: error.code };
  }
}

/** Refusal for a non-API failure (network, protocol). */
export function unknownRefusal(error: unknown): Refusal {
  return { code: 'OTHER', errorCode: isApiError(error) ? error.code : null };
}
