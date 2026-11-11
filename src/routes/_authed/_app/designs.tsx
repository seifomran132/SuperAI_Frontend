import { createFileRoute } from '@tanstack/react-router';
import { DesignsPage } from '~/features/designs/ui';

export const Route = createFileRoute('/_authed/_app/designs')({
  component: DesignsPage,
});
