import { createFileRoute } from '@tanstack/react-router';
import { BrandKitsPage } from '~/features/brand-kits/ui';

export const Route = createFileRoute('/_authed/_app/brands/')({
  component: BrandKitsPage,
});
