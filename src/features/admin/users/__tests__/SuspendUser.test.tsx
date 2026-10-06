import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminCalls, adminMock } from '~/mocks/admin';
import {
  useAdminSession,
  a,
  click,
  clickWhenReady,
  reasonField,
  openUser,
} from './harness';

useAdminSession();

// One dialog flow per file: Radix dialogs reopened in the same jsdom document hang the run.
describe('SuspendUser', () => {
  it('shows CANNOT_MODIFY_SELF when suspending, and the status after success', async () => {
    await openUser('overview');
    await clickWhenReady(a.overview.suspend);
    fireEvent.change(reasonField(), { target: { value: 'سبب كاف' } });

    adminMock.fail = { status: 409, code: 'CANNOT_MODIFY_SELF' };
    click(a.overview.suspend);
    expect(
      await screen.findByText(errors.CANNOT_MODIFY_SELF),
    ).toBeInTheDocument();

    adminMock.fail = null;
    click(a.overview.suspend);
    expect(
      await screen.findByRole('button', { name: a.overview.reactivate }),
    ).toBeInTheDocument();
    expect(adminCalls('status')[1]?.body).toEqual({
      reason: 'سبب كاف',
      status: 'suspended',
    });
  });
});
