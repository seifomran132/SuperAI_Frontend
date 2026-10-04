import { Outlet, createFileRoute } from '@tanstack/react-router';
import { requireProfile } from '~/features/auth';

// Session + profile guard. The API is the real guard; this keeps users out of
// pages they cannot use. /complete-profile skips the name check (see guards).
export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) =>
    requireProfile(context.queryClient, location),
  component: Outlet,
});
