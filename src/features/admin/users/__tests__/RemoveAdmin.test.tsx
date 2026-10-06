import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import errors from '~/i18n/errors.ar.json';
import { adminCalls, adminMock, sara } from '~/mocks/admin';
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
describe('RemoveAdmin', () => {
  it('shows LAST_ADMIN when removing the admin role', async () => {
    adminMock.users = [{ ...sara, isAdmin: true }];
    await openUser('overview');
    await clickWhenReady(a.overview.removeAdmin);
    fireEvent.change(reasonField(), { target: { value: 'سبب كاف' } });
    adminMock.fail = { status: 409, code: 'LAST_ADMIN' };
    click(a.overview.removeAdmin);
    expect(await screen.findByText(errors.LAST_ADMIN)).toBeInTheDocument();
    expect(adminCalls('admin-role')[0]?.body).toEqual({
      reason: 'سبب كاف',
      isAdmin: false,
    });
  });
});
