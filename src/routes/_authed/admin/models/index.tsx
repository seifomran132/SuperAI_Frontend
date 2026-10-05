import { createFileRoute } from '@tanstack/react-router';
import { ModelsPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/models/')({
  component: ModelsPage,
});
