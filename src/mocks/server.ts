import { setupServer } from 'msw/node';
import { authHandlers } from './auth';

export const server = setupServer(...authHandlers);
