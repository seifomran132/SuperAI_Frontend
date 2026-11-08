import { createFileRoute } from '@tanstack/react-router';
import { validateAuditSearch } from '~/features/admin';
import { AuditPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/audit')({
  validateSearch: validateAuditSearch,
  component: AuditPage,
});
