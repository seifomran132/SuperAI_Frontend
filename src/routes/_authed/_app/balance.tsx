import { createFileRoute } from '@tanstack/react-router';

// Intentionally empty: F3 builds the balance page.
export const Route = createFileRoute('/_authed/_app/balance')({
  component: () => null,
});
