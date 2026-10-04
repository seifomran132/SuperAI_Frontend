import { createFileRoute } from '@tanstack/react-router';
import { ChatPage } from '~/features/chat/ui';

export const Route = createFileRoute('/_authed/_app/chat/$conversationId')({
  component: ChatRoute,
});

function ChatRoute() {
  const { conversationId } = Route.useParams();
  return <ChatPage conversationId={conversationId} />;
}
