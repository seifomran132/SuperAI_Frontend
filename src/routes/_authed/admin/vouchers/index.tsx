import { createFileRoute } from '@tanstack/react-router';
import { validateVouchersSearch } from '~/features/admin';
import { VouchersPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/vouchers/')({
  validateSearch: validateVouchersSearch,
  component: VouchersPage,
});
