import { createFileRoute } from '@tanstack/react-router';
import { AgentsPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/agents')({
  component: AgentsPage,
});
