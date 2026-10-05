import { createFileRoute } from '@tanstack/react-router';
import { ModesPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/modes/')({
  component: ModesPage,
});
