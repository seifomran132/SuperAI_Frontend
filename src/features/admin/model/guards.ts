import type { QueryClient } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { ensureMe } from '~/features/auth';

const inBrowser = () => typeof window !== 'undefined';

/**
 * `/admin` guard: admins only; everyone else gets not-found rather than
 * "forbidden" so the area is not advertised. The API is the real guard.
 */
export async function requireAdmin(queryClient: QueryClient) {
  if (!inBrowser()) return;
  const me = await ensureMe(queryClient);
  if (!me.isAdmin) throw notFound();
}
