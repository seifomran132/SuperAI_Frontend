import { setupServer } from 'msw/node';
import { adminHandlers } from './admin';
import { catalogHandlers } from './admin-catalog';
import { adminVoucherBatchHandlers } from './admin-voucher-batches';
import { adminVoucherHandlers } from './admin-vouchers';
import { authHandlers } from './auth';
import { chatHandlers } from './chat';
import { reportsHandlers } from './reports';
import { voucherHandlers } from './vouchers';

export const server = setupServer(
  ...authHandlers,
  ...chatHandlers,
  ...adminHandlers,
  ...catalogHandlers,
  ...adminVoucherBatchHandlers,
  ...adminVoucherHandlers,
  ...reportsHandlers,
  ...voucherHandlers,
);
