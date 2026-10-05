import { createFileRoute } from '@tanstack/react-router';
import { BalancePage } from '~/features/balance';

export const Route = createFileRoute('/_authed/_app/balance')({
  component: BalancePage,
});
