import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminCalls, adminMock } from '~/mocks/admin';
import { useAdminSession, a, click, reasonField, openUser } from './harness';

useAdminSession();

// One dialog flow per file: Radix dialogs reopened in the same jsdom document hang the run.
describe('ActivatePlan', () => {
  it('activates a plan with reason and idempotency key, reusing the key on retry', async () => {
    await openUser('subscription');
    expect(
      await screen.findByText(a.subscription.historyEmptyTitle),
    ).toBeInTheDocument();
    click(a.subscription.activate);

    // The active plans only: the inactive one is not offered.
    const plan = await screen.findByRole('combobox');
    await waitFor(() =>
      expect(within(plan).getAllByRole('option')).toHaveLength(3),
    );
    fireEvent.change(plan, { target: { value: 'pro' } });
    fireEvent.change(reasonField(), { target: { value: 'ترقية بعد الدفع' } });

    adminMock.fail = { status: 409, code: 'PLAN_NOT_ACTIVE' };
    click(a.subscription.activateSubmit);
    expect(await screen.findByText(errors.PLAN_NOT_ACTIVE)).toBeInTheDocument();

    adminMock.fail = null;
    click(a.subscription.activateSubmit);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    const [first, second] = adminCalls('subscriptions:assign');
    expect(first?.body).toMatchObject({
      planKey: 'pro',
      reason: 'ترقية بعد الدفع',
    });
    expect(first?.body).not.toHaveProperty('currentPeriodEnd');
    const keyOf = (call: { body?: unknown } | undefined) =>
      (call!.body as { idempotencyKey: string }).idempotencyKey;
    const key = keyOf(first);
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
    expect(keyOf(second)).toBe(key);
  });
});
