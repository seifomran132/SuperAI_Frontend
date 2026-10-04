import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { authMock, callsTo, defaultProfile, firstCallBody } from '~/mocks/auth';
import { renderApp, useAuthMocks } from '~/test/render-app';
import { button, fill, t } from '~/test/helpers';

useAuthMocks();

async function submit(email = 'sara@test.local', password = 'wrong-pass-1') {
  fill(t.auth.fields.email, email);
  fill(t.auth.fields.password, password);
  fireEvent.click(button(t.auth.signIn.submit));
}

describe('sign-in page', () => {
  it('renders in Arabic RTL with the form', async () => {
    await renderApp('/sign-in');
    expect(
      await screen.findByRole('heading', { name: t.auth.signIn.title }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(document.documentElement).toHaveAttribute('lang', 'ar');
  });

  it('validates empty fields without calling GoTrue', async () => {
    await renderApp('/sign-in');
    fireEvent.click(
      await screen.findByRole('button', { name: t.auth.signIn.submit }),
    );
    expect(
      await screen.findByText(t.auth.validation.emailInvalid),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t.auth.validation.passwordRequired),
    ).toBeInTheDocument();
    expect(callsTo('token:password')).toHaveLength(0);
  });

  it('shows the generic message for wrong credentials and keeps the values', async () => {
    authMock.signIn = 'invalid_credentials';
    await renderApp('/sign-in');
    await screen.findByRole('heading', { name: t.auth.signIn.title });
    await submit();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t.authErrors.invalidCredentials);
    expect(alert).not.toHaveTextContent('Invalid login credentials');
    expect(screen.getByLabelText(t.auth.fields.email)).toHaveValue(
      'sara@test.local',
    );
    expect(screen.getByLabelText(t.auth.fields.password)).toHaveValue(
      'wrong-pass-1',
    );
  });

  it('offers to resend the confirmation when the email is not confirmed', async () => {
    authMock.signIn = 'email_not_confirmed';
    const { here } = await renderApp('/sign-in');
    await screen.findByRole('heading', { name: t.auth.signIn.title });
    await submit('sara@test.local', 'password123');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.authErrors.emailNotConfirmed,
    );
    fireEvent.click(button(t.auth.signIn.resendConfirmation));
    await waitFor(() => expect(here()).toBe('/check-email?reason=signup'));
    expect(callsTo('resend')).toHaveLength(1);
    expect(firstCallBody('resend')).toMatchObject({
      type: 'signup',
      email: 'sara@test.local',
    });
    // The address is kept in memory, never in the URL.
    expect(here()).not.toContain('sara');
    expect(await screen.findByText('sara@test.local')).toBeInTheDocument();
  });

  it('shows the rate limit message', async () => {
    authMock.signIn = 'rate_limited';
    await renderApp('/sign-in');
    await screen.findByRole('heading', { name: t.auth.signIn.title });
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.authErrors.rateLimited,
    );
  });

  it('shows a network error with retry that re-runs the submit and keeps values', async () => {
    authMock.signIn = 'network_error';
    const { here } = await renderApp('/sign-in');
    await screen.findByRole('heading', { name: t.auth.signIn.title });
    await submit('sara@test.local', 'password123');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.common.networkError,
    );
    expect(screen.getByLabelText(t.auth.fields.email)).toHaveValue(
      'sara@test.local',
    );

    authMock.signIn = 'ok';
    fireEvent.click(button(t.common.retry));
    await waitFor(() => expect(here()).toBe('/chat'));
    expect(callsTo('token:password')).toHaveLength(2);
  });

  it('goes to /chat after success', async () => {
    const { here } = await renderApp('/sign-in');
    await screen.findByRole('heading', { name: t.auth.signIn.title });
    await submit('sara@test.local', 'password123');
    await waitFor(() => expect(here()).toBe('/chat'));
  });

  it('follows an internal ?redirect= after success', async () => {
    const { here } = await renderApp('/sign-in?redirect=%2Fcomplete-profile');
    await screen.findByRole('heading', { name: t.auth.signIn.title });
    authMock.me = {
      kind: 'ok',
      profile: {
        ...defaultProfile,
        fullName: null,
      },
    };
    await submit('sara@test.local', 'password123');
    await waitFor(() => expect(here()).toBe('/complete-profile'));
  });

  it.each(['https://evil.example', '//evil.example'])(
    'drops an external ?redirect= (%s) and goes to /chat',
    async (target) => {
      const { here } = await renderApp(
        `/sign-in?redirect=${encodeURIComponent(target)}`,
      );
      await screen.findByRole('heading', { name: t.auth.signIn.title });
      await submit('sara@test.local', 'password123');
      await waitFor(() => expect(here()).toBe('/chat'));
    },
  );

  it('links to forgot-password and sign-up', async () => {
    await renderApp('/sign-in');
    expect(
      await screen.findByRole('link', { name: t.auth.signIn.forgotPassword }),
    ).toHaveAttribute('href', '/forgot-password');
    expect(
      screen.getByRole('link', { name: t.auth.signIn.signUpLink }),
    ).toHaveAttribute('href', '/sign-up');
  });

  it('toggles password visibility with a named button', async () => {
    await renderApp('/sign-in');
    const input = await screen.findByLabelText(t.auth.fields.password);
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(button(t.common.showPassword));
    expect(input).toHaveAttribute('type', 'text');
    expect(button(t.common.hidePassword)).toBeInTheDocument();
  });
});
