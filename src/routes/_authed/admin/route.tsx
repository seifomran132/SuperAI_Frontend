import { createFileRoute } from '@tanstack/react-router';
import { requireAdmin } from '~/features/admin';
import { AdminShell } from '~/features/admin/ui';

// Admins only; anyone else gets not-found. The API is the real guard.
export const Route = createFileRoute('/_authed/admin')({
  beforeLoad: ({ context }) => requireAdmin(context.queryClient),
  component: AdminShell,
});
