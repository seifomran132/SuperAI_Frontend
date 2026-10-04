import type { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import { isApiError } from '~/api/errors';
import { meControllerGetQueryKey } from '~/api/generated/@tanstack/react-query.gen';
import { meControllerGet } from '~/api/generated/sdk.gen';
import type { MeResponse } from '~/api/generated/types.gen';
import { auth } from '~/lib/auth/client';

export type UnavailableReason = 'suspended' | 'deleted';

/** `suspended`/`deleted` when the error is one of the two blocking account codes. */
export function unavailableReason(error: unknown): UnavailableReason | null {
  if (!isApiError(error)) return null;
  if (error.code === 'ACCOUNT_SUSPENDED') return 'suspended';
  if (error.code === 'ACCOUNT_DELETED') return 'deleted';
  return null;
}

export const hasName = (me: Pick<MeResponse, 'fullName'>) =>
  Boolean(me.fullName?.trim());

async function fetchMe(): Promise<MeResponse> {
  try {
    const { data } = await meControllerGet({ throwOnError: true });
    return data;
  } catch (error) {
    // A 401 makes the API client refresh the token before it returns; one
    // more try then succeeds if the refresh worked.
    if (isApiError(error) && error.statusCode === 401) {
      const { data } = await auth.getSession();
      if (data.session) {
        const retry = await meControllerGet({ throwOnError: true });
        return retry.data;
      }
    }
    throw error;
  }
}

/**
 * Loads `/me` for route guards: from the cache when present, otherwise
 * straight from the API. It deliberately bypasses the query's fetch, because
 * the API client signs out on a blocked account and the sign-out clears the
 * query cache, which would cancel a query in flight and hide the real reason.
 * A blocked account goes to the explanation page; a dead session to sign-in
 * (returning to `returnTo`). Other failures propagate to the route error state.
 */
export async function ensureMe(
  queryClient: QueryClient,
  returnTo?: string,
): Promise<MeResponse> {
  const key = meControllerGetQueryKey();
  const cached = queryClient.getQueryData<MeResponse>(key);
  if (cached) return cached;
  try {
    const me = await fetchMe();
    queryClient.setQueryData(key, me);
    return me;
  } catch (error) {
    const reason = unavailableReason(error);
    if (reason) {
      await auth.signOut({ scope: 'local' });
      throw redirect({ to: '/account-unavailable', search: { reason } });
    }
    if (isApiError(error) && error.statusCode === 401) {
      await auth.signOut({ scope: 'local' });
      throw redirect({
        to: '/sign-in',
        search: returnTo ? { redirect: returnTo } : {},
      });
    }
    throw error;
  }
}
