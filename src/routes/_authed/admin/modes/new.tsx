import { createFileRoute } from '@tanstack/react-router';
import { ModeNewPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/modes/new')({
  component: ModeNewPage,
});
