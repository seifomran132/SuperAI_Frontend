import { createFileRoute } from '@tanstack/react-router';
import { BatchNewPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/vouchers/batches/new')({
  component: BatchNewPage,
});
