import { AuthApiError, AuthRetryableFetchError } from '@supabase/auth-js';
import { describe, expect, it } from 'vitest';
import { hasLinkError, parseLinkParams } from '~/lib/auth/link-params';
import { authErrorKey, NETWORK_ERROR_KEY } from '../gotrue-errors';
import { isInternalPath, safeRedirect } from '../redirect';
import {
  completeProfileSchema,
  fieldErrorsFromDetails,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  toProfilePayload,
} from '../schemas';

describe('redirect', () => {
  it('accepts internal paths', () => {
    expect(isInternalPath('/chat')).toBe(true);
    expect(isInternalPath('/chat?x=1#y')).toBe(true);
    expect(safeRedirect('/account')).toBe('/account');
  });

  it('rejects external, protocol-relative and malformed values', () => {
    const backslash = String.fromCharCode(92);
    for (const bad of [
      'https://evil.example',
      '//evil.example',
      `/${backslash}evil.example`,
      'chat',
      '',
      '/a\nb',
      undefined,
      null,
      42,
    ]) {
      expect(isInternalPath(bad)).toBe(false);
    }
    expect(safeRedirect('//evil.example')).toBe('/chat');
    expect(safeRedirect(undefined, '/x')).toBe('/x');
  });
});

describe('authErrorKey', () => {
  const api = (code: string, status = 400) =>
    new AuthApiError('x', status, code);

  it('maps GoTrue codes to authErrors keys', () => {
    expect(authErrorKey(api('invalid_credentials'))).toBe(
      'authErrors.invalidCredentials',
    );
    expect(authErrorKey(api('email_not_confirmed'))).toBe(
      'authErrors.emailNotConfirmed',
    );
    expect(authErrorKey(api('weak_password', 422))).toBe(
      'authErrors.weakPassword',
    );
    expect(authErrorKey(api('over_email_send_rate_limit', 429))).toBe(
      'authErrors.rateLimited',
    );
    expect(authErrorKey(api('over_request_rate_limit', 429))).toBe(
      'authErrors.rateLimited',
    );
    expect(authErrorKey(api('otp_expired'))).toBe('authErrors.otpExpired');
    expect(authErrorKey(api('same_password', 422))).toBe(
      'authErrors.samePassword',
    );
  });

  it('treats a bare 429 as rate limited', () => {
    expect(authErrorKey(new AuthApiError('x', 429, undefined))).toBe(
      'authErrors.rateLimited',
    );
  });

  it('falls back to the network message for unknown and network errors', () => {
    expect(authErrorKey(api('something_new', 500))).toBe(NETWORK_ERROR_KEY);
    expect(authErrorKey(new AuthRetryableFetchError('x', 0))).toBe(
      NETWORK_ERROR_KEY,
    );
    expect(authErrorKey(new TypeError('Failed to fetch'))).toBe(
      NETWORK_ERROR_KEY,
    );
  });
});

describe('parseLinkParams', () => {
  it('reads an error from the hash', () => {
    const p = parseLinkParams(
      'http://x/auth/callback#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid',
    );
    expect(p.errorCode).toBe('otp_expired');
    expect(hasLinkError(p)).toBe(true);
  });

  it('reads an error from the query', () => {
    expect(
      hasLinkError(
        parseLinkParams('http://x/auth/callback?error=server_error'),
      ),
    ).toBe(true);
  });

  it('reads the type of a success link', () => {
    const p = parseLinkParams(
      'http://x/reset-password#access_token=a&refresh_token=b&type=recovery',
    );
    expect(p.type).toBe('recovery');
    expect(hasLinkError(p)).toBe(false);
  });
});

describe('schemas', () => {
  const errorKeys = (result: {
    success: boolean;
    error?: { issues: { message: string }[] };
  }) => result.error?.issues.map((i) => i.message) ?? [];

  it('sign-up validates name, email and password with i18n keys', () => {
    const bad = signUpSchema.safeParse({
      fullName: '  ',
      email: 'nope',
      password: 'short',
    });
    expect(errorKeys(bad).sort()).toEqual([
      'auth.validation.emailInvalid',
      'auth.validation.nameRequired',
      'auth.validation.passwordTooShort',
    ]);
    const ok = signUpSchema.parse({
      fullName: '  سارة  ',
      email: ' a@b.co ',
      password: '12345678',
    });
    expect(ok.fullName).toBe('سارة');
    expect(ok.email).toBe('a@b.co');
  });

  it('rejects names over 100 characters', () => {
    const r = signUpSchema.safeParse({
      fullName: 'ا'.repeat(101),
      email: 'a@b.co',
      password: '12345678',
    });
    expect(errorKeys(r)).toEqual(['auth.validation.nameTooLong']);
  });

  it('sign-in only requires a non-empty password', () => {
    expect(
      signInSchema.safeParse({ email: 'a@b.co', password: 'x' }).success,
    ).toBe(true);
    expect(
      errorKeys(signInSchema.safeParse({ email: 'a@b.co', password: '' })),
    ).toEqual(['auth.validation.passwordRequired']);
  });

  it('reset requires matching passwords', () => {
    const r = resetPasswordSchema.safeParse({
      password: '12345678',
      confirmPassword: '12345679',
    });
    expect(errorKeys(r)).toEqual(['auth.validation.passwordMismatch']);
    expect(
      resetPasswordSchema.safeParse({
        password: '12345678',
        confirmPassword: '12345678',
      }).success,
    ).toBe(true);
  });

  it('complete-profile sends null for an empty phone', () => {
    const values = completeProfileSchema.parse({
      fullName: ' Sara ',
      phoneNumber: '  ',
    });
    expect(toProfilePayload(values)).toEqual({
      fullName: 'Sara',
      phoneNumber: null,
    });
    expect(
      toProfilePayload({ fullName: 'Sara', phoneNumber: ' +966 50 123 4567 ' }),
    ).toEqual({ fullName: 'Sara', phoneNumber: '+966 50 123 4567' });
  });

  it('maps API details onto known fields only', () => {
    expect(
      fieldErrorsFromDetails([
        { field: 'phoneNumber', errors: ['bad'] },
        { field: 'other', errors: ['x'] },
      ]),
    ).toEqual({ phoneNumber: 'auth.validation.phoneInvalid' });
    expect(fieldErrorsFromDetails(undefined)).toEqual({});
  });
});
