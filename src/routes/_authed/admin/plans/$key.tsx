import { createFileRoute } from '@tanstack/react-router';
import { PlanDetailPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/plans/$key')({
  component: PlanDetailPage,
});
