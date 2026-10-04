import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';
import { t } from '~/test/helpers';

useAuthMocks();

describe('reset-password without a recovery link', () => {
  it('shows the expired state when there is no session', async () => {
    await renderApp('/reset-password');
    expect(
      await screen.findByRole('heading', { name: t.auth.linkExpired.title }),
    ).toBeInTheDocument();
  });

  it('shows the expired state for an ordinary signed-in session', async () => {
    await signInDirectly();
    await renderApp('/reset-password');
    expect(
      await screen.findByRole('heading', { name: t.auth.linkExpired.title }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(t.auth.fields.newPassword),
    ).not.toBeInTheDocument();
  });
});

describe('auth callback', () => {
  it('continues to /chat when the link produced a session', async () => {
    await signInDirectly();
    const { here } = await renderApp('/auth/callback');
    await waitFor(() => expect(here()).toBe('/chat'));
  });

  it('shows the expired state when there is no session', async () => {
    await renderApp('/auth/callback');
    expect(
      await screen.findByRole('heading', { name: t.auth.linkExpired.title }),
    ).toBeInTheDocument();
  });
});

describe('account-unavailable page', () => {
  it('explains a suspension with the brand name and contact options', async () => {
    await renderApp('/account-unavailable?reason=suspended');
    expect(
      await screen.findByRole('heading', {
        name: t.auth.accountUnavailable.suspendedTitle,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        t.auth.accountUnavailable.suspendedBody.replace(
          '{{brandName}}',
          'بيان',
        ),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: t.auth.accountUnavailable.back }),
    ).toHaveAttribute('href', '/sign-in');
  });

  it('explains a deleted account', async () => {
    await renderApp('/account-unavailable?reason=deleted');
    expect(
      await screen.findByRole('heading', {
        name: t.auth.accountUnavailable.deletedTitle,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t.auth.accountUnavailable.deletedBody),
    ).toBeInTheDocument();
  });

  it('falls back to the suspended copy for an unknown reason', async () => {
    await renderApp('/account-unavailable?reason=x');
    expect(
      await screen.findByRole('heading', {
        name: t.auth.accountUnavailable.suspendedTitle,
      }),
    ).toBeInTheDocument();
  });
});
