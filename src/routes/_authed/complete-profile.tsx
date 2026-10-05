import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasName, isInternalPath, safeRedirect } from '~/features/auth';
import { CompleteProfilePage } from '~/features/auth/ui';

export const Route = createFileRoute('/_authed/complete-profile')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    isInternalPath(search.redirect) ? { redirect: search.redirect } : {},
  beforeLoad: ({ context, search }) => {
    // Nothing to complete: don't leave users on a finished form.
    if (context.me && hasName(context.me)) {
      throw redirect({ href: safeRedirect(search.redirect) });
    }
  },
  component: CompleteProfileRoute,
});

function CompleteProfileRoute() {
  const { redirect } = Route.useSearch();
  return <CompleteProfilePage redirect={redirect} />;
}
