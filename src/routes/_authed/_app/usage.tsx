import { createFileRoute } from '@tanstack/react-router';
import { UsagePage } from '~/features/usage/ui';
import { validateMonthSearch } from '~/lib/months';

export const Route = createFileRoute('/_authed/_app/usage')({
  validateSearch: (search) => validateMonthSearch(search),
  component: UsagePage,
});
