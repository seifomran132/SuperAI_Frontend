import { createFileRoute } from '@tanstack/react-router';
import { landingHead } from '~/features/landing';
import { LandingPage } from '~/features/landing/ui';

// Public and prerendered: signed-in visitors are redirected after mount.
export const Route = createFileRoute('/')({
  head: landingHead,
  component: LandingPage,
});
