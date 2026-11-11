import { createFileRoute } from '@tanstack/react-router';
import { AgentRunPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/agent-runs/$runId')({
  component: AgentRunRoute,
});

function AgentRunRoute() {
  const { runId } = Route.useParams();
  return <AgentRunPage runId={runId} />;
}
