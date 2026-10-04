import { createFileRoute } from '@tanstack/react-router';
import {
  AccountUnavailablePage,
  type UnavailableReason,
} from '~/features/auth';

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
