import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp, useAuthMocks } from '~/test/render-app';
import { t } from '~/test/helpers';

// GoTrue reports a used or expired email link in the hash; it must be in place
// before the auth module is imported.
vi.hoisted(() => {
  window.history.replaceState(
    null,
    '',
    '/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
  );
});

useAuthMocks();

describe('expired email link (otp_expired)', () => {
  it('reset-password shows the expired state and offers a new reset link', async () => {
    await renderApp('/reset-password');
    expect(
      await screen.findByRole('heading', { name: t.auth.linkExpired.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(t.authErrors.otpExpired)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: t.auth.linkExpired.newLink }),
    ).toHaveAttribute('href', '/forgot-password');
    expect(
      screen.queryByLabelText(t.auth.fields.newPassword),
    ).not.toBeInTheDocument();
  });

  it('auth callback shows the expired state and sends the user to sign-in', async () => {
    await renderApp('/auth/callback');
    expect(
      await screen.findByRole('heading', { name: t.auth.linkExpired.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(t.auth.linkExpired.signupHint)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: t.auth.linkExpired.newLink }),
    ).toHaveAttribute('href', '/sign-in');
  });
});
