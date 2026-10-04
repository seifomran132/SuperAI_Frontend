import { isAuthError } from '@supabase/auth-js';

export const NETWORK_ERROR_KEY = 'common.networkError';

const keyByCode: Record<string, string> = {
  invalid_credentials: 'authErrors.invalidCredentials',
  email_not_confirmed: 'authErrors.emailNotConfirmed',
  weak_password: 'authErrors.weakPassword',
  over_email_send_rate_limit: 'authErrors.rateLimited',
  over_request_rate_limit: 'authErrors.rateLimited',
  otp_expired: 'authErrors.otpExpired',
  same_password: 'authErrors.samePassword',
};

/**
 * GoTrue error -> i18n key. Anything unknown (and network failures) maps to
 * the generic connection message; GoTrue's own `message` is never shown.
 */
export function authErrorKey(error: unknown): string {
  if (!isAuthError(error)) return NETWORK_ERROR_KEY;
  const byCode = error.code ? keyByCode[error.code] : undefined;
  if (byCode) return byCode;
  if (error.status === 429) return 'authErrors.rateLimited';
  return NETWORK_ERROR_KEY;
}

/** Codes a link error can carry that mean "request a new link". */
export function isExpiredLinkCode(code: string | null): boolean {
  return code === 'otp_expired';
}
