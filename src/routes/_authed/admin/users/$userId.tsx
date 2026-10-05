import { createFileRoute } from '@tanstack/react-router';
import { validateUserDetailSearch } from '~/features/admin';
import { UserDetailPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/users/$userId')({
  validateSearch: validateUserDetailSearch,
  component: UserDetailPage,
});
