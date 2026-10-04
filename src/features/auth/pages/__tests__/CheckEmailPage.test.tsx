import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authMock, callsTo, firstCallBody } from '~/mocks/auth';
import { setPendingEmail } from '../../model/pending-email';
import { renderApp, useAuthMocks } from '~/test/render-app';
import { t } from '~/test/helpers';

useAuthMocks();
afterEach(() => vi.useRealTimers());

// Only the clock and the countdown's interval are faked; Testing Library and
// MSW keep real timers so awaiting stays reliable.
function fakeClock() {
  vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
}
const advance = (ms: number) =>
  act(async () => {
    vi.advanceTimersByTime(ms);
  });
const countdown = (n: number) =>
  t.auth.checkEmail.resendIn.replace('{{seconds}}', String(n));

describe('check-email page', () => {
  it('shows generic copy and no resend button when the address is unknown (after a reload)', async () => {
    await renderApp('/check-email?reason=signup');
    expect(
      await screen.findByRole('heading', { name: t.auth.checkEmail.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(t.auth.checkEmail.signupSent)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /إعادة الإرسال/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: t.auth.backToSignIn }),
    ).toBeInTheDocument();
  });

  it('shows the generic reset copy for the reset variant', async () => {
    await renderApp('/check-email?reason=reset');
    expect(
      await screen.findByText(t.auth.checkEmail.resetSent),
    ).toBeInTheDocument();
    expect(screen.getByText(t.auth.checkEmail.resetNext)).toBeInTheDocument();
  });

  it('defaults an unknown reason to the sign-up variant', async () => {
    await renderApp('/check-email?reason=whatever');
    expect(
      await screen.findByText(t.auth.checkEmail.signupSent),
    ).toBeInTheDocument();
  });

  it('shows the address in an LTR bdi when known', async () => {
    setPendingEmail('sara@test.local');
    await renderApp('/check-email?reason=signup');
    const address = await screen.findByText('sara@test.local');
    expect(address.tagName).toBe('BDI');
    expect(address).toHaveAttribute('dir', 'ltr');
  });

  it('disables resend during the cooldown, then enables it and resends', async () => {
    fakeClock();
    setPendingEmail('sara@test.local');
    await renderApp('/check-email?reason=signup');
    const waiting = await screen.findByRole('button', { name: countdown(60) });
    expect(waiting).toBeDisabled();

    await advance(15_000);
    expect(screen.getByRole('button', { name: countdown(45) })).toBeDisabled();

    await advance(45_000);
    const resend = screen.getByRole('button', {
      name: t.auth.checkEmail.resend,
    });
    expect(resend).toBeEnabled();

    fireEvent.click(resend);
    expect(
      await screen.findByText(t.auth.checkEmail.resent),
    ).toBeInTheDocument();
    expect(callsTo('resend')).toHaveLength(1);
    expect(firstCallBody('resend')).toMatchObject({
      type: 'signup',
      email: 'sara@test.local',
    });
    // The countdown restarts after a resend.
    expect(screen.getByRole('button', { name: countdown(60) })).toBeDisabled();
  });

  it('uses the recovery endpoint to resend on the reset variant', async () => {
    fakeClock();
    setPendingEmail('sara@test.local');
    await renderApp('/check-email?reason=reset');
    await screen.findByRole('button', { name: countdown(60) });
    await advance(60_000);
    fireEvent.click(
      screen.getByRole('button', { name: t.auth.checkEmail.resend }),
    );
    await waitFor(() => expect(callsTo('recover')).toHaveLength(1));
    expect(callsTo('resend')).toHaveLength(0);
  });

  it('shows the rate limit message when resending fails', async () => {
    fakeClock();
    authMock.resend = 'rate_limited';
    setPendingEmail('sara@test.local');
    await renderApp('/check-email?reason=signup');
    await screen.findByRole('button', { name: countdown(60) });
    await advance(60_000);
    fireEvent.click(
      screen.getByRole('button', { name: t.auth.checkEmail.resend }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      t.authErrors.rateLimited,
    );
    expect(
      screen.queryByText(t.auth.checkEmail.resent),
    ).not.toBeInTheDocument();
  });
});
