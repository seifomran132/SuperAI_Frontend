import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authMock, callsTo, firstCallBody } from '~/mocks/auth';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';
import { button, fill, t } from '~/test/helpers';

// The page treats a session plus type=recovery in the link as a recovery
// session. The type is captured at import (initialLink), so the hash is set
// before imports. No tokens are put in it: auth-js would fetch /user at import,
// before MSW is listening. The session comes from signInDirectly instead.
vi.hoisted(() => {
  window.history.replaceState(null, '', '/reset-password#type=recovery');
});

useAuthMocks();
// A test's sign-out clears the session; the recovery marker stays for the page
// load, so each test starts from a session like the one the link created.
beforeEach(async () => {
  await signInDirectly();
});

async function open() {
  const app = await renderApp('/reset-password');
  await screen.findByRole('heading', { name: t.auth.resetPassword.title });
  return app;
}

const submit = () => fireEvent.click(button(t.auth.resetPassword.submit));

describe('reset-password page (recovery link)', () => {
  it('shows the form for a recovery session', async () => {
    await open();
    expect(
      screen.getByLabelText(t.auth.fields.newPassword),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t.auth.fields.confirmPassword),
    ).toBeInTheDocument();
  });

  it('rejects mismatched passwords', async () => {
    await open();
    fill(t.auth.fields.newPassword, 'password123');
    fill(t.auth.fields.confirmPassword, 'password124');
    submit();
    expect(
      await screen.findByText(t.auth.validation.passwordMismatch),
    ).toBeInTheDocument();
    expect(callsTo('updateUser')).toHaveLength(0);
  });

  it('rejects a password under 8 characters', async () => {
    await open();
    fill(t.auth.fields.newPassword, 'short');
    fill(t.auth.fields.confirmPassword, 'short');
    submit();
    expect(
      await screen.findByText(t.auth.validation.passwordTooShort),
    ).toBeInTheDocument();
    expect(callsTo('updateUser')).toHaveLength(0);
  });

  it('saves the password, shows a toast and goes to /chat', async () => {
    const { here } = await open();
    fill(t.auth.fields.newPassword, 'new-password-1');
    fill(t.auth.fields.confirmPassword, 'new-password-1');
    submit();
    await waitFor(() => expect(here()).toBe('/chat'));
    expect(firstCallBody('updateUser')).toMatchObject({
      password: 'new-password-1',
    });
    expect(
      await screen.findByText(t.auth.resetPassword.saved),
    ).toBeInTheDocument();
  });

  it('maps same_password onto the password field', async () => {
    authMock.updateUser = 'same_password';
    await open();
    fill(t.auth.fields.newPassword, 'password123');
    fill(t.auth.fields.confirmPassword, 'password123');
    submit();
    expect(
      await screen.findByText(t.authErrors.samePassword),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t.auth.fields.newPassword)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('shows a network error with retry and keeps the typed passwords', async () => {
    authMock.updateUser = 'network_error';
    const { here } = await open();
    fill(t.auth.fields.newPassword, 'new-password-1');
    fill(t.auth.fields.confirmPassword, 'new-password-1');
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.common.networkError,
    );
    expect(screen.getByLabelText(t.auth.fields.newPassword)).toHaveValue(
      'new-password-1',
    );
    authMock.updateUser = 'ok';
    fireEvent.click(button(t.common.retry));
    await waitFor(() => expect(here()).toBe('/chat'));
  });
});
