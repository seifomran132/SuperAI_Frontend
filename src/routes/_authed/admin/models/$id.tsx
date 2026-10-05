import { createFileRoute } from '@tanstack/react-router';
import { ModelDetailPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/models/$id')({
  component: ModelDetailPage,
});
