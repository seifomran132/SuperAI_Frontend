import { Outlet, createFileRoute } from '@tanstack/react-router';
import { redirectIfSignedIn } from '~/features/auth';

// Pages for signed-out visitors only; a signed-in user goes straight to the app.
export const Route = createFileRoute('/_guest')({
  beforeLoad: () => redirectIfSignedIn(),
  component: Outlet,
});
