import { createFileRoute } from '@tanstack/react-router';
import { BrandKitPage } from '~/features/brand-kits/ui';

export const Route = createFileRoute('/_authed/_app/brands/$brandKitId')({
  component: BrandKitRoute,
});

function BrandKitRoute() {
  const { brandKitId } = Route.useParams();
  return <BrandKitPage brandKitId={brandKitId} />;
}
