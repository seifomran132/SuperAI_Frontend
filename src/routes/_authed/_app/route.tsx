import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '~/features/chat/ui';

// Sidebar and header shared by chat, balance and account.
export const Route = createFileRoute('/_authed/_app')({
  component: AppShell,
});
