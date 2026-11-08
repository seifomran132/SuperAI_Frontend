import { beforeEach } from 'vitest';
import ar from '~/test/ar';
import { resetVouchersMock } from '~/mocks/admin-vouchers';
import { useAdminSession } from '../../users/__tests__/harness';

export { click, reasonField } from '../../users/__tests__/harness';
export { type } from '../../catalog/__tests__/harness';

export const v = ar.admin.vouchers;

/** Admin session plus a fresh voucher mock; call once at the top of a test file. */
export function useVoucherSession() {
  useAdminSession();
  beforeEach(() => resetVouchersMock());
}
