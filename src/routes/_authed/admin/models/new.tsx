import { createFileRoute } from '@tanstack/react-router';
import { validateModelNewSearch } from '~/features/admin';
import { ModelNewPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/models/new')({
  validateSearch: validateModelNewSearch,
  component: ModelNewPage,
});
