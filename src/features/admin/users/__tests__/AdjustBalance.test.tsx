import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { adminCalls } from '~/mocks/admin';
import { useAdminSession, a, click, reasonField, openUser } from './harness';

useAdminSession();

// One dialog flow per file: Radix dialogs reopened in the same jsdom document hang the run.
describe('AdjustBalance', () => {
  it('validates amounts as text and sends the signed string untouched', async () => {
    await openUser('balance');
    click(a.balance.adjust);
    const amount = await screen.findByLabelText(/^المبلغ/);
    fireEvent.change(reasonField(), { target: { value: 'تصحيح' } });

    for (const [value, message] of [
      ['abc', a.balance.amountInvalidSigned],
      ['1e3', a.balance.amountInvalidSigned],
      ['-', a.balance.amountInvalidSigned],
      ['0.00', a.balance.amountZero],
      ['10000.01', a.balance.amountTooLarge],
    ] as const) {
      fireEvent.change(amount, { target: { value } });
      click(a.balance.adjustSubmit);
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(adminCalls('adjustments')).toHaveLength(0);

    // The trailing zeros would be lost by any number conversion.
    fireEvent.change(amount, { target: { value: '-5.500000000' } });
    click(a.balance.adjustSubmit);
    await waitFor(() => expect(adminCalls('adjustments')).toHaveLength(1));
    expect(adminCalls('adjustments')[0]?.body).toMatchObject({
      amountUsd: '-5.500000000',
      reason: 'تصحيح',
    });
  });
});
