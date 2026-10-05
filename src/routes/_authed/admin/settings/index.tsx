import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '~/features/admin/ui';

export const Route = createFileRoute('/_authed/admin/settings/')({
  component: SettingsPage,
});
