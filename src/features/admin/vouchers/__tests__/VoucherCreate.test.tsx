import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ar from '~/test/ar';
import errors from '~/i18n/errors.ar.json';
import { adminCalls, adminMock } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { click, reasonField, type, useVoucherSession, v } from './harness';

useVoucherSession();

const submit = () => click(v.createSubmit);

async function openForm() {
  const app = await renderApp('/admin/vouchers/new');
  await screen.findByRole('radio', { name: new RegExp(v.kind.trial) });
  return app;
}

function installClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
}

describe('VoucherCreate', () => {
  it('validates amount, limit, code and the required reason before sending', async () => {
    await openForm();
    type(v.amount, '0');
    type(v.maxRedemptions, '0');
    type(v.code, 'ab');
    submit();
    expect(await screen.findByText(v.errors.amountInvalid)).toBeInTheDocument();
    expect(screen.getByText(v.errors.limitInvalid)).toBeInTheDocument();
    expect(screen.getByText(v.errors.codeInvalid)).toBeInTheDocument();
    expect(
      screen.getByText(ar.admin.dialog.reasonRequired),
    ).toBeInTheDocument();

    type(v.amount, '1000.01');
    submit();
    expect(
      await screen.findByText(v.errors.amountTooLarge),
    ).toBeInTheDocument();
    expect(adminCalls('voucher:create')).toHaveLength(0);
  });

  it('validates the trial plan and day range, and the end after the start', async () => {
    await openForm();
    fireEvent.click(
      screen.getByRole('radio', { name: new RegExp(v.kind.trial) }),
    );
    type(v.trialDays, '366');
    type(v.startsAt, '2030-01-02T10:00');
    type(v.endsAt, '2030-01-01T10:00');
    type(v.maxRedemptions, '5');
    fireEvent.change(reasonField(), { target: { value: 'حملة' } });
    submit();
    expect(await screen.findByText(v.errors.planRequired)).toBeInTheDocument();
    expect(screen.getByText(v.errors.daysInvalid)).toBeInTheDocument();
    expect(screen.getByText(v.errors.endBeforeStart)).toBeInTheDocument();
    expect(adminCalls('voucher:create')).toHaveLength(0);
  });

  it('offers only active non-default plans', async () => {
    await openForm();
    fireEvent.click(
      screen.getByRole('radio', { name: new RegExp(v.kind.trial) }),
    );
    expect(
      await screen.findByRole('option', { name: 'باقة basic' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'باقة old' })).toBeNull();
  });

  it('creates a balance code and shows it large with a copy button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);
    await openForm();
    type(v.amount, '5.5');
    type(v.maxRedemptions, '10');
    type(v.note, 'حملة رمضان');
    fireEvent.change(reasonField(), { target: { value: 'هدية للمستخدمين' } });
    submit();

    expect(await screen.findByTestId('voucher-code')).toHaveTextContent(
      'LAM7A-7KQ2-XH9M',
    );
    const body = adminCalls('voucher:create')[0]?.body as Record<
      string,
      unknown
    >;
    expect(body).toMatchObject({
      kind: 'balance',
      amountUsd: '5.5',
      maxRedemptions: 10,
      note: 'حملة رمضان',
      reason: 'هدية للمستخدمين',
    });
    expect(body).not.toHaveProperty('idempotencyKey');
    expect(body).not.toHaveProperty('code');
    expect(body).not.toHaveProperty('planKey');

    fireEvent.click(screen.getByRole('button', { name: v.copyCode }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('LAM7A-7KQ2-XH9M'),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(v.copied);

    fireEvent.click(screen.getByRole('button', { name: v.createAnother }));
    expect(
      await screen.findByRole('button', { name: v.createSubmit }),
    ).toBeInTheDocument();
  });

  it('creates a trial code with a chosen code and local dates sent as UTC', async () => {
    await openForm();
    fireEvent.click(
      screen.getByRole('radio', { name: new RegExp(v.kind.trial) }),
    );
    fireEvent.change(await screen.findByLabelText(new RegExp(`^${v.plan}`)), {
      target: { value: 'pro' },
    });
    type(v.trialDays, '7');
    type(v.maxRedemptions, '2');
    type(v.code, 'ramadan-25');
    type(v.endsAt, '2030-06-01T12:00');
    fireEvent.click(
      screen.getByRole('checkbox', { name: new RegExp(v.newUsersOnly) }),
    );
    fireEvent.change(reasonField(), { target: { value: 'تجربة' } });
    submit();
    expect(await screen.findByTestId('voucher-code')).toHaveTextContent(
      'RAMADAN-25',
    );
    expect(adminCalls('voucher:create')[0]?.body).toMatchObject({
      kind: 'trial',
      planKey: 'pro',
      trialDays: 7,
      code: 'ramadan-25',
      endsAt: new Date('2030-06-01T12:00').toISOString(),
      newUsersOnly: true,
    });
  });

  it('says when the clipboard is blocked', async () => {
    installClipboard(() => Promise.reject(new Error('denied')));
    await openForm();
    type(v.amount, '1');
    fireEvent.change(reasonField(), { target: { value: 'سبب' } });
    submit();
    await screen.findByTestId('voucher-code');
    fireEvent.click(screen.getByRole('button', { name: v.copyCode }));
    expect(await screen.findByText(v.copyFailed)).toBeInTheDocument();
  });

  it('puts VOUCHER_CODE_TAKEN under the code field and keeps the input', async () => {
    adminMock.fail = { status: 409, code: 'VOUCHER_CODE_TAKEN' };
    await openForm();
    type(v.amount, '1');
    type(v.code, 'TAKEN-1');
    fireEvent.change(reasonField(), { target: { value: 'سبب' } });
    submit();
    expect(
      await screen.findByText(errors.VOUCHER_CODE_TAKEN),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(v.code, { exact: false })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText(v.code, { exact: false })).toHaveValue(
      'TAKEN-1',
    );
  });
});
