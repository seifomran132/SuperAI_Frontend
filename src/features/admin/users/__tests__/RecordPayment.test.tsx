import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminCalls, adminMock } from '~/mocks/admin';
import { useAdminSession, a, click, reasonField, openUser } from './harness';

useAdminSession();

// One dialog flow per file: Radix dialogs reopened in the same jsdom document hang the run.
describe('RecordPayment', () => {
  it('shows the API error by code in the payment dialog and keeps the input', async () => {
    await openUser('balance');
    click(a.balance.recordPayment);
    fireEvent.change(await screen.findByLabelText(/^المبلغ/), {
      target: { value: '10.00' },
    });
    fireEvent.change(screen.getByLabelText(/^مرجع الدفعة/), {
      target: { value: 'INV-1' },
    });
    fireEvent.change(reasonField(), { target: { value: 'تحويل بنكي' } });

    adminMock.fail = { status: 409, code: 'PAYMENT_REFERENCE_REUSED' };
    click(a.balance.paymentSubmit);
    expect(
      await screen.findByText(errors.PAYMENT_REFERENCE_REUSED),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^مرجع الدفعة/)).toHaveValue('INV-1');
    // Payments are de-duplicated by reference: no idempotency key is sent.
    expect(adminCalls('purchases')[0]?.body).toEqual({
      amountUsd: '10.00',
      paymentReference: 'INV-1',
      reason: 'تحويل بنكي',
    });
  });
});
