import { createFileRoute } from '@tanstack/react-router';
import { type UnavailableReason } from '~/features/auth';
import { AccountUnavailablePage } from '~/features/auth/ui';

export const Route = createFileRoute('/(auth)/account-unavailable')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { reason: UnavailableReason } => ({
    reason: search.reason === 'deleted' ? 'deleted' : 'suspended',
  }),
  component: AccountUnavailableRoute,
});

function AccountUnavailableRoute() {
  const { reason } = Route.useSearch();
  return <AccountUnavailablePage reason={reason} />;
}
