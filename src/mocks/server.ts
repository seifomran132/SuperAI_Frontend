import { setupServer } from 'msw/node';
import { adminHandlers } from './admin';
import { catalogHandlers } from './admin-catalog';
import { authHandlers } from './auth';
import { chatHandlers } from './chat';

export const server = setupServer(
  ...authHandlers,
  ...chatHandlers,
  ...adminHandlers,
  ...catalogHandlers,
);
