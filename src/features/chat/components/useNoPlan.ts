import { useQuery } from '@tanstack/react-query';
import { meSubscriptionControllerGetOptions } from '~/api/generated/@tanstack/react-query.gen';

/**
 * True when `/me/subscription` says there is no active subscription. Sending
 * would be refused (NO_ACTIVE_SUBSCRIPTION) and would leave an empty
 * conversation behind, so the composer is disabled up front. While loading or
 * on error this is false: the API stays the real guard.
 */
export function useNoPlan(): boolean {
  const { data } = useQuery(meSubscriptionControllerGetOptions());
  return data !== undefined && data.subscription === null;
}
