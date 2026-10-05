import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { adminCalls, adminMock } from '~/mocks/admin';
import { a, click, openUser, reasonField, useAdminSession } from './harness';

useAdminSession();

describe('IDEMPOTENCY_KEY_REUSED', () => {
  it('shows admin text and retries with a fresh key', async () => {
    await openUser('balance');
    click(a.balance.adjust);
    fireEvent.change(await screen.findByLabelText(/^المبلغ/), {
      target: { value: '5.00' },
    });
    fireEvent.change(reasonField(), { target: { value: 'تصحيح' } });

    adminMock.fail = { status: 409, code: 'IDEMPOTENCY_KEY_REUSED' };
    click(a.balance.adjustSubmit);
    expect(await screen.findByText(a.dialog.keyReused)).toBeInTheDocument();

    adminMock.fail = null;
    click(a.balance.adjustSubmit);
    await waitFor(() => expect(adminCalls('adjustments')).toHaveLength(2));
    const [first, second] = adminCalls('adjustments').map(
      (c) => (c.body as { idempotencyKey: string }).idempotencyKey,
    );
    expect(second).not.toBe(first);
  });
});
