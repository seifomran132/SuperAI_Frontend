import { createFileRoute } from '@tanstack/react-router';

// Intentionally empty: the SPA shell build renders `/`, so the route must exist.
// The landing page (S13) replaces this once it is designed and approved.
export const Route = createFileRoute('/')({
  component: () => null,
});
