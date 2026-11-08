import { createFileRoute } from '@tanstack/react-router';
import { OverviewPage } from '~/features/admin/ui';
import { validatePeriodSearch } from '~/lib/period';

export const Route = createFileRoute('/_authed/admin/overview')({
  validateSearch: validatePeriodSearch,
  component: OverviewPage,
});
