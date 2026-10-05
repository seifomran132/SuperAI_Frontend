import { createFileRoute } from '@tanstack/react-router';
import { ProvidersPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/providers/')({
  component: ProvidersPage,
});
