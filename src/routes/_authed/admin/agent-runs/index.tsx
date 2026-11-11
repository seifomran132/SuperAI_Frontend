import { createFileRoute } from '@tanstack/react-router';
import { validateAgentRunsSearch } from '~/features/admin';
import { AgentRunsPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/agent-runs/')({
  validateSearch: validateAgentRunsSearch,
  component: AgentRunsPage,
});
