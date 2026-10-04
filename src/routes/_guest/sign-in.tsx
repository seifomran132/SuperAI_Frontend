import { createFileRoute } from '@tanstack/react-router';
import { SignInPage, isInternalPath } from '~/features/auth';

export const Route = createFileRoute('/_guest/sign-in')({
  // Only internal paths survive; anything else is dropped (open-redirect guard).
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    isInternalPath(search.redirect) ? { redirect: search.redirect } : {},
  component: SignInRoute,
});

function SignInRoute() {
  const { redirect } = Route.useSearch();
  return <SignInPage redirect={redirect} />;
}
