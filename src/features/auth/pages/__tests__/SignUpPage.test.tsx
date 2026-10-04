import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { authMock, callsTo, firstCallBody } from '~/mocks/auth';
import { renderApp, useAuthMocks } from '~/test/render-app';
import { button, fill, t } from '~/test/helpers';

useAuthMocks();

async function open() {
  const app = await renderApp('/sign-up');
  await screen.findByRole('heading', { name: t.auth.signUp.title });
  return app;
}

function fillAll(
  overrides: Partial<Record<'name' | 'email' | 'password', string>> = {},
) {
  fill(t.auth.fields.fullName, overrides.name ?? 'سارة أحمد');
  fill(t.auth.fields.email, overrides.email ?? 'sara@test.local');
  fill(t.auth.fields.password, overrides.password ?? 'password123');
  fireEvent.click(button(t.auth.signUp.submit));
}

describe('sign-up page', () => {
  it('shows the Arabic validation messages for an empty form', async () => {
    await open();
    fireEvent.click(button(t.auth.signUp.submit));
    expect(
      await screen.findByText(t.auth.validation.nameRequired),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t.auth.validation.emailInvalid),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t.auth.validation.passwordTooShort),
    ).toBeInTheDocument();
    expect(callsTo('signup')).toHaveLength(0);
    expect(screen.getByLabelText(t.auth.fields.fullName)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('rejects an invalid email and a short password', async () => {
    await open();
    fillAll({ email: 'not-an-email', password: 'short' });
    expect(
      await screen.findByText(t.auth.validation.emailInvalid),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t.auth.validation.passwordTooShort),
    ).toBeInTheDocument();
    expect(callsTo('signup')).toHaveLength(0);
  });

  it('rejects a name over 100 characters', async () => {
    await open();
    fillAll({ name: 'ا'.repeat(101) });
    expect(
      await screen.findByText(t.auth.validation.nameTooLong),
    ).toBeInTheDocument();
  });

  it('maps weak_password onto the password field', async () => {
    authMock.signUp = 'weak_password';
    await open();
    fillAll();
    expect(
      await screen.findByText(t.authErrors.weakPassword),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t.auth.fields.password)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText(t.auth.fields.fullName)).toHaveValue(
      'سارة أحمد',
    );
  });

  it('shows the rate limit message', async () => {
    authMock.signUp = 'rate_limited';
    await open();
    fillAll();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.authErrors.rateLimited,
    );
  });

  it('shows a network error with retry', async () => {
    authMock.signUp = 'network_error';
    const { here } = await open();
    fillAll();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.common.networkError,
    );
    authMock.signUp = 'ok';
    fireEvent.click(button(t.common.retry));
    await waitFor(() => expect(here()).toBe('/check-email?reason=signup'));
  });

  it('sends full_name and continues to check-email without the address in the URL', async () => {
    const { here } = await open();
    fillAll();
    await waitFor(() => expect(here()).toBe('/check-email?reason=signup'));
    expect(here()).not.toContain('sara');
    expect(firstCallBody('signup')).toMatchObject({
      email: 'sara@test.local',
      data: { full_name: 'سارة أحمد' },
    });
    expect(
      await screen.findByText(t.auth.checkEmail.signupSentTo),
    ).toBeInTheDocument();
    expect(screen.getByText('sara@test.local')).toBeInTheDocument();
  });

  it('links back to sign-in', async () => {
    await open();
    expect(
      screen.getByRole('link', { name: t.auth.signUp.signInLink }),
    ).toHaveAttribute('href', '/sign-in');
  });
});
