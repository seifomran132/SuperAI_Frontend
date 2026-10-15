import { createFileRoute } from '@tanstack/react-router';
import { validatePriceUpdatesSearch } from '~/features/admin';
import { PriceUpdatesPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/price-updates/')({
  validateSearch: validatePriceUpdatesSearch,
  component: PriceUpdatesPage,
});
