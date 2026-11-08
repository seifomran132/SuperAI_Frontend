import { createFileRoute } from '@tanstack/react-router';
import { validateRequestsSearch } from '~/features/admin';
import { RequestsPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/requests')({
  validateSearch: validateRequestsSearch,
  component: RequestsPage,
});
