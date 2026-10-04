import { act, render } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { setupApiClient } from '~/api/client';
import { createQueryClient } from '~/api/query-client';
import { auth } from '~/lib/auth/client';
import { installSessionSync } from '~/features/auth/model/session';
import { clearPendingEmail } from '~/features/auth/model/pending-email';
import '~/i18n';
import { resetAuthMock } from '~/mocks/auth';
import { server } from '~/mocks/server';
import { routeTree } from '~/routeTree.gen';

/** MSW lifecycle plus a clean session/mocks between tests. Call once per test file. */
export function useAuthMocks() {
  beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
  beforeEach(() => {
    resetAuthMock();
    clearPendingEmail();
  });
  afterEach(async () => {
    server.resetHandlers();
    // Drops the stored session (auth-js keeps it in storage between tests).
    await auth.signOut({ scope: 'local' });
  });
  afterAll(() => server.close());
}

/** Signs in through the mocked GoTrue so guards see a session. */
export async function signInDirectly() {
  const { error } = await auth.signInWithPassword({
    email: 'user@test.local',
    password: 'password123',
  });
  if (error) throw error;
}

/** The real route tree on an in-memory history, with the production client setup. */
export async function renderApp(path: string) {
  setupApiClient();
  const queryClient = createQueryClient();
  installSessionSync(queryClient);
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await act(async () => {
    render(<RouterProvider router={router} />);
  });
  const here = () =>
    router.state.location.pathname + router.state.location.searchStr;
  return { router, queryClient, here };
}
