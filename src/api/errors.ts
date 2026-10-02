import type { ApiErrorResponseDto } from './generated/types.gen';

export type ApiError = ApiErrorResponseDto;

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { code?: unknown }).code === 'string' &&
    typeof (value as { statusCode?: unknown }).statusCode === 'number'
  );
}

/** i18n key for an error: errors:<CODE>, or a generic fallback for unknown errors. */
export function errorMessageKey(error: unknown): string {
  return isApiError(error) ? `errors:${error.code}` : 'common.unexpectedError';
}
