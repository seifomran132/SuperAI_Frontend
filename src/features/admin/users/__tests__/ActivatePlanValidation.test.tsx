import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { adminCalls } from '~/mocks/admin';
import { useAdminSession, a, click, clickWhenReady, openUser } from './harness';

useAdminSession();

// One dialog flow per file: Radix dialogs reopened in the same jsdom document hang the run.
describe('ActivatePlanValidation', () => {
  it('requires a plan and a reason before calling the API', async () => {
    await openUser('subscription');
    await clickWhenReady(a.subscription.activate);
    await screen.findByRole('combobox');
    click(a.subscription.activateSubmit);
    expect(
      await screen.findByText(a.subscription.planRequired, { selector: 'p' }),
    ).toBeInTheDocument();
    expect(screen.getByText(a.dialog.reasonRequired)).toBeInTheDocument();
    expect(adminCalls('subscriptions:assign')).toHaveLength(0);
  });
});
