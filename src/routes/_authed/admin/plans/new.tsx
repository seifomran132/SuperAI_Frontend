import { createFileRoute } from '@tanstack/react-router';
import { PlanNewPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/plans/new')({
  component: PlanNewPage,
});
