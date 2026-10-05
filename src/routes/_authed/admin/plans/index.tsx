import { createFileRoute } from '@tanstack/react-router';
import { PlansPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/plans/')({
  component: PlansPage,
});
