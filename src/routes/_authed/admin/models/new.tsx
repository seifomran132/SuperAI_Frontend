import { createFileRoute } from '@tanstack/react-router';
import { ModelNewPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/models/new')({
  component: ModelNewPage,
});
