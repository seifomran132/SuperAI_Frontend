import { createFileRoute } from '@tanstack/react-router';

// Intentionally empty: F3 builds the account page.
export const Route = createFileRoute('/_authed/_app/account')({
  component: () => null,
});
