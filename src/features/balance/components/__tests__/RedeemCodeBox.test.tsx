import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import ar from '~/i18n/ar.json';
import errorsAr from '~/i18n/errors.ar.json';
import { resetChatMock } from '~/mocks/chat';
import { server } from '~/mocks/server';
import { resetVoucherMock, voucherErrors, voucherMock } from '~/mocks/vouchers';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  resetVoucherMock();
  await signInDirectly();
  server.use(
    http.get('http://localhost:3000/api/v1/plans', () => HttpResponse.json([])),
    http.get('http://localhost:3000/api/v1/me/balance/activity', () =>
      HttpResponse.json({ items: [], nextBefore: null }),
    ),
  );
});

const r = ar.balance.redeem;

async function openBox(path = '/balance') {
  await renderApp(path);
  fireEvent.click(await screen.findByRole('button', { name: r.open }));
}

function typeCode(code: string) {
  fireEvent.change(screen.getByLabelText(r.label), { target: { value: code } });
}

function submit(code = 'ABCD') {
  typeCode(code);
  fireEvent.click(screen.getByRole('button', { name: r.submit }));
}

describe('RedeemCodeBox', () => {
  it('is collapsed, then opens to an LTR field', async () => {
    await renderApp('/balance');
    expect(await screen.findByRole('button', { name: r.open })).toBeVisible();
    expect(screen.queryByLabelText(r.label)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: r.open }));
    const field = screen.getByLabelText(r.label);
    expect(field).toHaveAttribute('dir', 'ltr');
    expect(field).toHaveAttribute('maxlength', '40');
  });

  it('rejects an empty code without calling the API', async () => {
    await openBox();
    fireEvent.click(screen.getByRole('button', { name: r.submit }));
    expect(await screen.findByText(r.empty)).toBeInTheDocument();
    expect(voucherMock.calls).toHaveLength(0);
  });

  it.each([
    'VOUCHER_NOT_FOUND',
    'VOUCHER_EXPIRED',
    'VOUCHER_USED_UP',
    'VOUCHER_ALREADY_REDEEMED',
    'VOUCHER_NOT_ELIGIBLE',
  ] as const)('shows %s under the field and keeps the code', async (code) => {
    voucherMock.outcome = voucherErrors[code];
    await openBox();
    submit('WELCOM5');
    expect(await screen.findByText(errorsAr[code])).toBeInTheDocument();
    const field = screen.getByLabelText(r.label);
    expect(field).toHaveValue('WELCOM5');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(voucherMock.calls).toEqual([{ code: 'WELCOM5' }]);
  });

  it('explains NO_ACTIVE_SUBSCRIPTION with plans and contact actions', async () => {
    voucherMock.outcome = voucherErrors.NO_ACTIVE_SUBSCRIPTION;
    await openBox();
    submit();
    expect(
      await screen.findByText(errorsAr.NO_ACTIVE_SUBSCRIPTION),
    ).toBeInTheDocument();
    expect(screen.getByText(r.needsPlanExtra)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: r.viewPlans })).toHaveAttribute(
      'href',
      '/plans',
    );
    expect(screen.getByLabelText(r.label)).toHaveValue('ABCD');
  });

  it('hides the plans link on /plans', async () => {
    voucherMock.outcome = voucherErrors.NO_ACTIVE_SUBSCRIPTION;
    await openBox('/plans');
    submit();
    expect(await screen.findByText(r.needsPlanExtra)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: r.viewPlans })).toBeNull();
    expect(
      screen.getByRole('button', { name: ar.balance.request }),
    ).toBeInTheDocument();
  });

  it('counts down a rate limit from retryAfterSeconds and disables the button', async () => {
    voucherMock.outcome = {
      ...voucherErrors.RATE_LIMITED,
      data: { retryAfterSeconds: 2 },
    };
    await openBox();
    submit();
    expect(await screen.findByText(r.rateLimited)).toBeInTheDocument();
    expect(screen.getByText(r.wait_two)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: r.submit })).toBeDisabled();
    expect(screen.getByLabelText(r.label)).toHaveValue('ABCD');
    await waitFor(
      () =>
        expect(screen.getByRole('button', { name: r.submit })).toBeEnabled(),
      { timeout: 4000 },
    );
    expect(screen.queryByText(r.rateLimited)).toBeNull();
    // The stale RATE_LIMITED error is cleared, so the usual hint is back.
    await waitFor(() => expect(screen.getByText(r.hint)).toBeInTheDocument());
  });

  it('offers a retry with the code kept after a server error', async () => {
    voucherMock.outcome = voucherErrors.INTERNAL_ERROR;
    await openBox();
    submit();
    expect(
      await screen.findByText(ar.common.unexpectedError),
    ).toBeInTheDocument();
    voucherMock.outcome = { kind: 'balance' };
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(await screen.findByText(/إلى رصيدك/)).toBeInTheDocument();
    expect(voucherMock.calls).toEqual([{ code: 'ABCD' }, { code: 'ABCD' }]);
  });

  it('shows the network message and keeps the code when offline', async () => {
    voucherMock.outcome = { kind: 'network-error' };
    await openBox();
    submit();
    expect(await screen.findByText(ar.common.networkError)).toBeInTheDocument();
    expect(screen.getByLabelText(r.label)).toHaveValue('ABCD');
    expect(
      screen.getByRole('button', { name: ar.common.retry }),
    ).toBeInTheDocument();
  });

  it('confirms a balance code with the signed amount, refreshes the balance and offers another code', async () => {
    let balanceCalls = 0;
    server.use(
      http.get('http://localhost:3000/api/v1/me/balance', () => {
        balanceCalls += 1;
        return HttpResponse.json({ balanceUsd: '9.750000000' });
      }),
    );
    await openBox();
    await waitFor(() => expect(balanceCalls).toBeGreaterThan(0));
    const before = balanceCalls;
    submit();
    expect(await screen.findByText('+5.00$')).toBeInTheDocument();
    expect(screen.getByText(/إلى رصيدك/)).toBeInTheDocument();
    await waitFor(() => expect(balanceCalls).toBeGreaterThan(before));
    expect(screen.queryByLabelText(r.label)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: r.another }));
    expect(await screen.findByLabelText(r.label)).toHaveValue('');
  });

  it('confirms a trial code with the plan name and a Western-digit date', async () => {
    voucherMock.outcome = {
      kind: 'trial',
      periodEnd: '2026-11-20T12:00:00.000Z',
    };
    await openBox();
    submit('TRIAL14');
    const message = await screen.findByText(/تم تفعيل باقة/);
    expect(message).toHaveTextContent('«احترافي»');
    expect(message).toHaveTextContent('20 نوفمبر 2026');
    expect(message.textContent).not.toMatch(/[٠-٩]/);
  });

  it('sends once on a double click', async () => {
    voucherMock.delayMs = 150;
    await openBox();
    typeCode('ABCD');
    const button = screen.getByRole('button', { name: r.submit });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(await screen.findByText(/إلى رصيدك/)).toBeInTheDocument();
    expect(voucherMock.calls).toHaveLength(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('closes the box and forgets the error', async () => {
    voucherMock.outcome = voucherErrors.VOUCHER_NOT_FOUND;
    await openBox();
    submit();
    await screen.findByText(errorsAr.VOUCHER_NOT_FOUND);
    fireEvent.click(screen.getByRole('button', { name: r.close }));
    expect(screen.getByRole('button', { name: r.open })).toBeInTheDocument();
    expect(screen.queryByText(errorsAr.VOUCHER_NOT_FOUND)).toBeNull();
  });

  it('keeps the box open while a request is pending', async () => {
    voucherMock.delayMs = 150;
    await openBox();
    typeCode('ABCD');
    fireEvent.click(screen.getByRole('button', { name: r.submit }));
    const close = screen.getByRole('button', { name: r.close });
    expect(close).toBeDisabled();
    fireEvent.click(close);
    expect(await screen.findByText(/إلى رصيدك/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: r.close })).toBeEnabled();
  });

  it('moves focus to the field on open and back to the toggle on close', async () => {
    await renderApp('/balance');
    const toggle = await screen.findByRole('button', { name: r.open });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    await waitFor(() => expect(screen.getByLabelText(r.label)).toHaveFocus());
    fireEvent.click(screen.getByRole('button', { name: r.close }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: r.open })).toHaveFocus(),
    );
  });

  it('shows the code in upper case', async () => {
    await openBox();
    typeCode('welcome5');
    expect(screen.getByLabelText(r.label)).toHaveValue('WELCOME5');
  });

  it('reads the wait with the right Arabic plural', async () => {
    voucherMock.outcome = {
      ...voucherErrors.RATE_LIMITED,
      data: { retryAfterSeconds: 5 },
    };
    await openBox();
    submit();
    expect(await screen.findByText(/بعد 5 ثوانٍ/)).toBeInTheDocument();
  });

  // Last: an open Radix dialog left behind stalls the next test in jsdom.
  it('opens the contact dialog from the needs-a-plan notice', async () => {
    voucherMock.outcome = voucherErrors.NO_ACTIVE_SUBSCRIPTION;
    await openBox();
    submit();
    await screen.findByText(r.needsPlanExtra);
    // jsdom stalls when Radix opens a dialog while an element has focus (the
    // field has it after the box opens), so drop focus first.
    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.click(screen.getAllByText(ar.balance.request).at(-1)!);
    expect(
      await screen.findByText(ar.chat.requestBalance.body),
    ).toBeInTheDocument();
  });
});
