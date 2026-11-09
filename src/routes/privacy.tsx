import { createFileRoute } from '@tanstack/react-router';
import { privacyHead } from '~/features/landing';
import { PrivacyPage } from '~/features/landing/ui';

// Public and prerendered. Interim notice until the full policy is published.
export const Route = createFileRoute('/privacy')({
  head: privacyHead,
  component: PrivacyPage,
});
