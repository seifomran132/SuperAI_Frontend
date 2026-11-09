import { createFileRoute } from '@tanstack/react-router';
import { validateBatchSearch } from '~/features/admin';
import { BatchDetailPage } from '~/features/admin/ui';

export const Route = createFileRoute(
  '/_authed/admin/vouchers/batches/$batchId',
)({
  validateSearch: validateBatchSearch,
  component: BatchDetailPage,
});
