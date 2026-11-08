import { createFileRoute } from '@tanstack/react-router';
import { VoucherNewPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/vouchers/new')({
  component: VoucherNewPage,
});
