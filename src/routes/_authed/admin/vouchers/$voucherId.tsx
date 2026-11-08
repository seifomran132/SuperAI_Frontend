import { createFileRoute } from '@tanstack/react-router';
import { VoucherDetailPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/vouchers/$voucherId')({
  component: VoucherDetailPage,
});
