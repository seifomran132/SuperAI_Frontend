import { createFileRoute } from '@tanstack/react-router';
import { ModeDetailPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/modes/$key')({
  component: ModeDetailPage,
});
