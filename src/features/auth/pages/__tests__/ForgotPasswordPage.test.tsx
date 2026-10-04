import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { authMock, callsTo, firstCallBody } from '~/mocks/auth';
import { renderApp, useAuthMocks } from '~/test/render-app';
import { button, fill, t } from '~/test/helpers';

useAuthMocks();

async function open() {
  const app = await renderApp('/forgot-password');
  await screen.findByRole('heading', { name: t.auth.forgotPassword.title });
  return app;
}

describe('forgot-password page', () => {
  it('validates the email', async () => {
    await open();
    fill(t.auth.fields.email, 'nope');
    fireEvent.click(button(t.auth.forgotPassword.submit));
    expect(
      await screen.findByText(t.auth.validation.emailInvalid),
    ).toBeInTheDocument();
    expect(callsTo('recover')).toHaveLength(0);
  });

  it('ends on check-email (reset variant) with the address out of the URL', async () => {
    const { here } = await open();
    fill(t.auth.fields.email, 'sara@test.local');
    fireEvent.click(button(t.auth.forgotPassword.submit));
    await waitFor(() => expect(here()).toBe('/check-email?reason=reset'));
    expect(firstCallBody('recover')).toMatchObject({
      email: 'sara@test.local',
    });
    expect(
      await screen.findByText(t.auth.checkEmail.resetSentTo),
    ).toBeInTheDocument();
    expect(screen.getByText('sara@test.local')).toBeInTheDocument();
  });

  it('gives the same outcome for an address with no account', async () => {
    // GoTrue answers 200 for unknown addresses (see mocks/auth.ts), so the page
    // must not branch on anything but errors.
    const { here } = await open();
    fill(t.auth.fields.email, 'nobody-here@test.local');
    fireEvent.click(button(t.auth.forgotPassword.submit));
    await waitFor(() => expect(here()).toBe('/check-email?reason=reset'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the rate limit message and stays on the form', async () => {
    authMock.recover = 'rate_limited';
    const { here } = await open();
    fill(t.auth.fields.email, 'sara@test.local');
    fireEvent.click(button(t.auth.forgotPassword.submit));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.authErrors.rateLimited,
    );
    expect(here()).toBe('/forgot-password');
    expect(screen.getByLabelText(t.auth.fields.email)).toHaveValue(
      'sara@test.local',
    );
  });

  it('shows a network error with retry', async () => {
    authMock.recover = 'network_error';
    const { here } = await open();
    fill(t.auth.fields.email, 'sara@test.local');
    fireEvent.click(button(t.auth.forgotPassword.submit));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.common.networkError,
    );
    authMock.recover = 'ok';
    fireEvent.click(button(t.common.retry));
    await waitFor(() => expect(here()).toBe('/check-email?reason=reset'));
  });

  it('links back to sign-in', async () => {
    await open();
    expect(
      screen.getByRole('link', { name: t.auth.backToSignIn }),
    ).toHaveAttribute('href', '/sign-in');
  });
});
