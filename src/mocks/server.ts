import { setupServer } from 'msw/node';
import { authHandlers } from './auth';
import { chatHandlers } from './chat';

export const server = setupServer(...authHandlers, ...chatHandlers);
