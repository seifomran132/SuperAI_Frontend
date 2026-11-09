import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls, adminMock } from '~/mocks/admin';
import { renderApp } from '~/test/render-app';
import { click, reasonField, type, useVoucherSession, v } from './harness';

useVoucherSession();

const b = v.batches;

async function openForm() {
  const app = await renderApp('/admin/vouchers/batches/new');
  await screen.findByLabelText(new RegExp(`^${b.name}`));
  return app;
}

function fillValid() {
  type(b.name, 'حملة العيد');
  type(b.amount, '5');
  fireEvent.change(reasonField(), { target: { value: 'موزّع جديد' } });
}

const body = (index: number) =>
  adminCalls('batch:create')[index]?.body as Record<string, unknown>;

describe('BatchForm', () => {
  it('validates before sending', async () => {
    await openForm();
    type(b.quantity, '2');
    type(b.prefix, 'A-');
    click(b.createSubmit);
    expect(await screen.findByText(b.errors.nameRequired)).toBeInTheDocument();
    expect(screen.getByText(b.errors.quantityInvalid)).toBeInTheDocument();
    expect(screen.getByText(b.errors.prefixInvalid)).toBeInTheDocument();
    expect(adminCalls('batch:create')).toHaveLength(0);
  });

  it('shows the total and blocks above the limit', async () => {
    await openForm();
    type(b.amount, '5');
    expect(await screen.findByText('50.00$')).toBeInTheDocument();
    type(b.quantity, '11');
    type(b.amount, '1000');
    expect(
      await screen.findByText(new RegExp(b.overLimit)),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: b.createSubmit })).toBeDisabled();
  });

  it('updates the example as the prefix is typed', async () => {
    await openForm();
    expect(screen.getByText('LAM7A-7KQ2-XH9M')).toBeInTheDocument();
    type(b.prefix, 'eid');
    expect(await screen.findByText('EID-7KQ2-XH9M')).toBeInTheDocument();
  });

  it('keeps the key on a retry and changes it when the values change', async () => {
    await openForm();
    fillValid();
    adminMock.fail = { status: 500, code: 'INTERNAL_ERROR' };
    click(b.createSubmit);
    await waitFor(() => expect(adminCalls('batch:create')).toHaveLength(1));
    expect(await screen.findByText(b.createFailed)).toBeInTheDocument();
    click(b.createSubmit);
    await waitFor(() => expect(adminCalls('batch:create')).toHaveLength(2));
    expect(body(1).idempotencyKey).toBe(body(0).idempotencyKey);

    type(b.quantity, '20');
    click(b.createSubmit);
    await waitFor(() => expect(adminCalls('batch:create')).toHaveLength(3));
    expect(body(2).idempotencyKey).not.toBe(body(1).idempotencyKey);
  });

  it('opens the new batch with the live-codes notice', async () => {
    const { here } = await openForm();
    fillValid();
    type(b.prefix, 'eid');
    click(b.createSubmit);
    await waitFor(() => expect(here()).toContain('created=true'));
    expect(await screen.findByText(b.noticeTitle)).toBeInTheDocument();
    expect(body(0)).toMatchObject({
      name: 'حملة العيد',
      kind: 'balance',
      amountUsd: '5',
      quantity: 10,
      prefix: 'eid',
    });
  });

  it('makes a new key when the API refuses the old one', async () => {
    await openForm();
    fillValid();
    adminMock.fail = { status: 409, code: 'IDEMPOTENCY_KEY_REUSED' };
    click(b.createSubmit);
    await waitFor(() => expect(adminCalls('batch:create')).toHaveLength(1));
    adminMock.fail = null;
    click(b.createSubmit);
    await waitFor(() => expect(adminCalls('batch:create')).toHaveLength(2));
    expect(body(1).idempotencyKey).not.toBe(body(0).idempotencyKey);
  });
});
