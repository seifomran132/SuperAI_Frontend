import { setupServer } from 'msw/node';
import { adminHandlers } from './admin';
import { catalogHandlers } from './admin-catalog';
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
  ...adminVoucherHandlers,
  ...reportsHandlers,
  ...voucherHandlers,
);
