import { createFileRoute } from '@tanstack/react-router';
import { validateUsersSearch } from '~/features/admin';
import { UsersPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/users/')({
  validateSearch: validateUsersSearch,
  component: UsersPage,
});
