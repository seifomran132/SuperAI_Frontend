import type { CreateClientConfig } from './generated/client.gen';
import { env } from '~/lib/env';

// Runtime config for the generated client. Auth and error handling are
// attached in src/api/client.ts once the auth client exists.
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: env.apiOrigin,
});
