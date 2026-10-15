import { createFileRoute } from '@tanstack/react-router';
import { redirectFromHome } from '~/features/auth';

// No landing page yet (S13): `/` sends visitors to the app or to sign-in.
// The SPA shell build still renders `/`, so the route must exist; the guard
// does nothing outside the browser.
export const Route = createFileRoute('/')({
  beforeLoad: () => redirectFromHome(),
  component: () => null,
});
