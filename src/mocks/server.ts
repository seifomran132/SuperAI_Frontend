import { setupServer } from 'msw/node';
import { agentHandlers } from './agents';
import { adminHandlers } from './admin';
import { catalogHandlers } from './admin-catalog';
import { adminVoucherBatchHandlers } from './admin-voucher-batches';
import { adminVoucherHandlers } from './admin-vouchers';
import { authHandlers } from './auth';
import { brandKitHandlers } from './brand-kits';
import { chatHandlers } from './chat';
import { reportsHandlers } from './reports';
import { voucherHandlers } from './vouchers';

export const server = setupServer(
  ...authHandlers,
  // Before the chat handlers: agent conversations are created here.
  ...agentHandlers,
  ...brandKitHandlers,
  ...chatHandlers,
  ...adminHandlers,
  ...catalogHandlers,
  ...adminVoucherBatchHandlers,
  ...adminVoucherHandlers,
  ...reportsHandlers,
  ...voucherHandlers,
);
