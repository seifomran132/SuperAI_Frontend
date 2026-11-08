import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isApiError } from '~/api/errors';
import { adminReportsOverviewOptions } from '~/api/generated/@tanstack/react-query.gen';
import type { PeriodFieldError } from '~/components/reports';
import { periodToApi, type PeriodSearch } from '~/lib/period';

/** The overview for a period; the previous period stays on screen while a new one loads. */
export function useOverview(period: PeriodSearch) {
  return useQuery({
    ...adminReportsOverviewOptions({ query: periodToApi(period) }),
    placeholderData: keepPreviousData,
  });
}

/** `details` of a VALIDATION_FAILED answer, for the picker's fields. */
export function periodServerErrors(error: unknown): PeriodFieldError[] {
  if (!isApiError(error) || error.code !== 'VALIDATION_FAILED') return [];
  return error.details ?? [];
}

/** Sum of active subscriptions: integer addition, not money. */
export function totalActive(plans: { active: number }[]): number {
  return plans.reduce((sum, p) => sum + p.active, 0);
}
