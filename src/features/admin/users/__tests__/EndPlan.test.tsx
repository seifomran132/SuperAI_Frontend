import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { adminCalls, adminMock } from '~/mocks/admin';
import {
  useAdminSession,
  a,
  activeSub,
  click,
  clickWhenReady,
  reasonField,
  openUser,
} from './harness';

useAdminSession();

// One dialog flow per file: Radix dialogs reopened in the same jsdom document hang the run.
describe('EndPlan', () => {
  it('asks for confirmation with a warning before ending the plan', async () => {
    adminMock.subscriptions = [activeSub];
    await openUser('subscription');
    await clickWhenReady(a.subscription.end);
    expect(
      await screen.findByText(a.subscription.endWarning),
    ).toBeInTheDocument();

    fireEvent.change(reasonField(), { target: { value: 'ab' } });
    click(a.subscription.endSubmit);
    expect(await screen.findByText(a.dialog.reasonShort)).toBeInTheDocument();
    expect(adminCalls('subscriptions:end')).toHaveLength(0);

    fireEvent.change(reasonField(), { target: { value: 'طلب العميل' } });
    click(a.subscription.endSubmit);
    await waitFor(() =>
      expect(adminCalls('subscriptions:end')).toHaveLength(1),
    );
    expect(adminCalls('subscriptions:end')[0]?.body).toEqual({
      reason: 'طلب العميل',
    });
    // Focus returns to the page (the opener or the section heading), not to <body>.
  });
});
