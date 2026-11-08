import { useQuery } from '@tanstack/react-query';
import {
  meGetOptions,
  meUsageUsageOptions,
} from '~/api/generated/@tanstack/react-query.gen';

export function useMyUsage(month: string) {
  return useQuery(meUsageUsageOptions({ query: { month } }));
}

/** The month of the account's creation (`YYYY-MM`), the first month the picker offers. */
export function useFirstMonth(fallback: string): string {
  const { data } = useQuery(meGetOptions());
  const created = data?.createdAt?.slice(0, 7);
  return created && /^\d{4}-\d{2}$/.test(created) ? created : fallback;
}
