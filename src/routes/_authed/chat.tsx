import { createFileRoute } from '@tanstack/react-router';

// Intentionally empty: the post-sign-in destination until F2 builds the chat.
export const Route = createFileRoute('/_authed/chat')({
  component: () => null,
});
