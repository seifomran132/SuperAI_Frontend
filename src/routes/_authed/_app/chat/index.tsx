import { createFileRoute } from '@tanstack/react-router';
import { ChatPage } from '~/features/chat/ui';

export const Route = createFileRoute('/_authed/_app/chat/')({
  component: () => <ChatPage />,
});
