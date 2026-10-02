import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './errors';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Retry once after a 401 (the client refreshed the token) and on network
        // errors; never retry other API errors, which are final answers.
        retry: (failureCount, error) => {
          if (failureCount >= 1) return false;
          if (isApiError(error)) return error.statusCode === 401;
          return true;
        },
        refetchOnWindowFocus: true,
      },
      mutations: { retry: false },
    },
  });
}
