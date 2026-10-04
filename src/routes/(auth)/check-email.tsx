import { createFileRoute } from '@tanstack/react-router';
import { CheckEmailPage, type CheckEmailReason } from '~/features/auth';

// The address is deliberately not in the URL; only the variant is.
export const Route = createFileRoute('/(auth)/check-email')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { reason: CheckEmailReason } => ({
    reason: search.reason === 'reset' ? 'reset' : 'signup',
  }),
  component: CheckEmailRoute,
});

function CheckEmailRoute() {
  const { reason } = Route.useSearch();
  return <CheckEmailPage reason={reason} />;
}
