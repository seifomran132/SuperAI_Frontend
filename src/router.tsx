import { createRouter } from '@tanstack/react-router';
import { setupApiClient } from './api/client';
import { createQueryClient } from './api/query-client';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  setupApiClient();
  const queryClient = createQueryClient();
  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
