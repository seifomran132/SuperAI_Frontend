import { createRouter } from '@tanstack/react-router';
import { setupApiClient } from './api/client';
import { createQueryClient } from './api/query-client';
import { RouteError } from './components/RouteError';
import { installSessionSync } from '~/features/auth';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  setupApiClient();
  const queryClient = createQueryClient();
  installSessionSync(queryClient);
  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: ({ error }) => <RouteError error={error} />,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
